import Anthropic from "@anthropic-ai/sdk"
import { InferenceClient } from "@huggingface/inference"

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

// 🚨👉 ALERT: Read message below! You've been warned! 👈🚨
// If you're following along on your local machine instead of
// here on Scrimba, make sure you don't commit your API keys
// to any repositories and don't deploy your project anywhere
// live online. Otherwise, anyone could inspect your source
// and find your API keys/tokens. If you want to deploy
// this project, you'll need to create a backend of some kind,
// either your own or using some serverless architecture where
// your API calls can be made. Doing so will keep your
// API keys private.

const anthropic = new Anthropic({
    // Make sure you set an environment variable in Scrimba 
    // for ANTHROPIC_API_KEY
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
})

export async function getRecipeFromChefClaude(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
        ],
    });
    return msg.content[0].text
}


const hf = new InferenceClient(import.meta.env.VITE_HF_ACCESS_TOKEN)

function extractChatText(choice) {
    const content = choice?.message?.content

    if (typeof content === "string") {
        return content
    }

    if (Array.isArray(content)) {
        return content
            .map(part => {
                if (typeof part === "string") {
                    return part
                }

                if (part?.type === "text" && typeof part.text === "string") {
                    return part.text
                }

                return ""
            })
            .join("")
    }

    return ""
}

export async function getRecipeFromMistral(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")
    try {
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
        ]
        let fullRecipe = ""

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const response = await hf.chatCompletion({
                model: "openai/gpt-oss-20b:fastest",
                messages,
                max_tokens: 1200,
            })
            const choice = response.choices?.[0]
            const text = extractChatText(choice).trim()

            if (!text) {
                throw new Error("Recipe response was empty.")
            }

            fullRecipe = fullRecipe ? `${fullRecipe}\n${text}` : text

            if (choice?.finish_reason !== "length") {
                return fullRecipe
            }

            messages.push({ role: "assistant", content: text })
            messages.push({
                role: "user",
                content: "Continue exactly where you left off. Do not restart the recipe or repeat earlier lines.",
            })
        }

        return `${fullRecipe}\n\n_Recipe may be truncated because the API stopped multiple times._`
    } catch (err) {
        console.error(err)
        const status = err?.httpResponse?.status
        const body = err?.httpResponse?.body
        const details = [status ? `status ${status}` : null, typeof body === "string" ? body : null]
            .filter(Boolean)
            .join(": ")
        throw new Error(
            details || err.message || "Hugging Face request failed. Verify your HF token has Inference Providers permission and that the model is available.",
            { cause: err }
        )
    }
}
