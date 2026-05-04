import { InferenceClient } from "@huggingface/inference"

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

const hf = new InferenceClient(process.env.HF_ACCESS_TOKEN)

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

function sendJson(res, statusCode, payload) {
    res.status(statusCode).json(payload)
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST")
        return sendJson(res, 405, { error: "Method not allowed." })
    }

    if (!process.env.HF_ACCESS_TOKEN) {
        return sendJson(res, 500, { error: "Server is missing HF_ACCESS_TOKEN." })
    }

    const { ingredients } = req.body ?? {}

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return sendJson(res, 400, { error: "Ingredients are required." })
    }

    const cleanedIngredients = ingredients
        .filter(ingredient => typeof ingredient === "string")
        .map(ingredient => ingredient.trim())
        .filter(Boolean)

    if (cleanedIngredients.length === 0) {
        return sendJson(res, 400, { error: "Ingredients are required." })
    }

    const ingredientsString = cleanedIngredients.join(", ")
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
    ]

    try {
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
                return sendJson(res, 200, { recipe: fullRecipe })
            }

            messages.push({ role: "assistant", content: text })
            messages.push({
                role: "user",
                content: "Continue exactly where you left off. Do not restart the recipe or repeat earlier lines.",
            })
        }

        return sendJson(res, 200, {
            recipe: `${fullRecipe}\n\n_Recipe may be truncated because the API stopped multiple times._`,
        })
    } catch (err) {
        console.error(err)
        const status = err?.httpResponse?.status
        const body = err?.httpResponse?.body
        const details = [status ? `status ${status}` : null, typeof body === "string" ? body : null]
            .filter(Boolean)
            .join(": ")

        return sendJson(res, 500, {
            error: details || err.message || "Hugging Face request failed.",
        })
    }
}
