import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import { getRecipeFromMistral } from "./ai"

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")
}

export default function Main() {
    const [ingredients, setIngredients] = React.useState(
        ["All the main spices", "Chicken", "Onions", "Vegetable oil"]
    )
    const [recipeShown, setRecipeShown] = React.useState(false)
    const [recipe, setRecipe] = React.useState("")
    const [recipeError, setRecipeError] = React.useState("")
    const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(false)

    async function getRecipe() {
        if (recipeShown) {
            setRecipeShown(false)
            return
        }

        setRecipeShown(true)
        setRecipeError("")
        setIsLoadingRecipe(true)

        try {
            const nextRecipe = await getRecipeFromMistral(ingredients)
            setRecipe(nextRecipe)
        } catch (err) {
            setRecipeError(err.message || "Recipe request failed.")
        } finally {
            setIsLoadingRecipe(false)
        }
    }

    function addIngredient(formData) {
        const newIngredient = formData.get("ingredient")
        setIngredients(prevIngredients => [...prevIngredients, newIngredient])
    }

    function removeIngredient(indexToRemove) {
        setIngredients(prevIngredients =>
            prevIngredients.filter((_, index) => index !== indexToRemove)
        )
    }

    function saveRecipe(recipeHtml) {
        if (!recipe || !recipeHtml) {
            return
        }

        const today = new Date().toISOString().slice(0, 10)
        const ingredientsMarkup = ingredients
            .map(ingredient => `<li>${escapeHtml(ingredient)}</li>`)
            .join("")
        const iframe = document.createElement("iframe")

        iframe.style.position = "fixed"
        iframe.style.right = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.border = "0"

        iframe.onload = () => {
            const printWindow = iframe.contentWindow

            if (!printWindow) {
                document.body.removeChild(iframe)
                return
            }

            const cleanup = () => {
                window.setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe)
                    }
                }, 250)
            }

            printWindow.onafterprint = cleanup
            printWindow.focus()
            printWindow.print()
        }

        iframe.srcdoc = `
            <!doctype html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <title>chef-ai-recipe-${today}</title>
                    <style>
                        body {
                            font-family: Inter, Arial, sans-serif;
                            color: #171311;
                            margin: 40px;
                            line-height: 1.6;
                        }

                        h1, h2, h3, h4 {
                            color: #141413;
                            margin-bottom: 0.5rem;
                        }

                        ul, ol {
                            padding-left: 1.5rem;
                        }

                        .meta {
                            color: #6f655d;
                            margin-bottom: 1.5rem;
                        }

                        .section {
                            margin-top: 2rem;
                        }

                        @media print {
                            body {
                                margin: 24px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Chef AI Recipe</h1>
                    <p class="meta">Saved on ${today}</p>

                    <section class="section">
                        <h2>Ingredients on hand</h2>
                        <ul>${ingredientsMarkup}</ul>
                    </section>

                    <section class="section">
                        <h2>Recipe</h2>
                        ${recipeHtml}
                    </section>
                </body>
            </html>
        `

        document.body.appendChild(iframe)
    }

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. Tomatoes, Garlic, Chicken broth ingredient"
                    aria-label="Add Ingredients or Instructions"
                    name="ingredient"
                />
                <button>Add New Ingredient or Instruction</button>
            </form>

            {ingredients.length > 0 &&
                <IngredientsList
                    ingredients={ingredients}
                    onRemoveIngredient={removeIngredient}
                    getRecipe={getRecipe}
                    recipeShown={recipeShown}
                />
            }

            {recipeShown && (
                <ClaudeRecipe
                    recipe={recipe}
                    error={recipeError}
                    isLoading={isLoadingRecipe}
                    onSaveRecipe={saveRecipe}
                />
            )}
        </main>
    )
}
