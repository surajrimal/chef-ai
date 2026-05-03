import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import { getRecipeFromMistral } from "./ai"


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

    return (
        <main>
            <form action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. Tomatoes, Garlic, Chicken broth ingredient"
                    aria-label="Add ingredient"
                    name="ingredient"
                />
                <button>Add ingredient</button>
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
                />
            )}
        </main>
    )
}
