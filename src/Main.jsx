import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import { getRecipeFromMistral } from "./ai"

const VALID_INGREDIENT_PATTERN = /^[a-z0-9][a-z0-9 &'()/%.+-]*$/i

function normalizeIngredient(value) {
    return value.trim().replace(/\s+/g, " ")
}

function getIngredientKey(value) {
    return normalizeIngredient(value).toLowerCase()
}

function isValidIngredient(value) {
    return VALID_INGREDIENT_PATTERN.test(value) && /[a-z]/i.test(value)
}

export default function Main() {
    const [ingredients, setIngredients] = React.useState(
        ["All the main spices", "Chicken", "Onions", "Vegetable oil"]
    )
    const [recipeShown, setRecipeShown] = React.useState(false)
    const [recipe, setRecipe] = React.useState("")
    const [recipeError, setRecipeError] = React.useState("")
    const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(false)
    const [ingredientMessage, setIngredientMessage] = React.useState("")
    const [ingredientMessageType, setIngredientMessageType] = React.useState("info")
    const formRef = React.useRef(null)

    async function getRecipe() {

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
    function hideRecipe() {
        setRecipeShown(false)
    }

    function addIngredient(formData) {
        const rawInput = formData.get("ingredient")

        if (typeof rawInput !== "string") {
            setIngredientMessageType("error")
            setIngredientMessage("Please enter at least one valid ingredient or instruction.")
            return
        }

        const candidates = rawInput
            .split(",")
            .map(normalizeIngredient)
            .filter(Boolean)

        if (candidates.length === 0) {
            setIngredientMessageType("error")
            setIngredientMessage("Please enter at least one valid ingredient or instruction.")
            return
        }

        const invalidEntries = candidates.filter(candidate => !isValidIngredient(candidate))

        if (invalidEntries.length > 0) {
            setIngredientMessageType("error")
            setIngredientMessage(`"${invalidEntries[0]}" is not a valid entry. Use words, numbers, and simple cooking punctuation only.`)
            return
        }

        const existingKeys = new Set(ingredients.map(getIngredientKey))
        const nextIngredients = [...ingredients]
        let addedCount = 0
        let duplicateCount = 0

        for (const candidate of candidates) {
            const key = getIngredientKey(candidate)

            if (existingKeys.has(key)) {
                duplicateCount += 1
                continue
            }

            existingKeys.add(key)
            nextIngredients.push(candidate)
            addedCount += 1
        }

        if (addedCount === 0) {
            setIngredientMessageType("error")
            setIngredientMessage("That item is already in your list.")
            return
        }

        setIngredients(nextIngredients)
        formRef.current?.reset()

        if (duplicateCount > 0) {
            setIngredientMessageType("info")
            setIngredientMessage(`Added ${addedCount} item${addedCount === 1 ? "" : "s"}. Skipped ${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"}.`)
            return
        }

        setIngredientMessageType("success")
        setIngredientMessage(`Added ${addedCount} item${addedCount === 1 ? "" : "s"}.`)
    }

    function removeIngredient(indexToRemove) {
        setIngredients(prevIngredients =>
            prevIngredients.filter((_, index) => index !== indexToRemove)
        )
    }

    function removeAllIngredients() {
        setIngredients([])
        setRecipe("")
        setRecipeError("")
        setRecipeShown(false)
        setIsLoadingRecipe(false)
        setIngredientMessage("")
    }

    return (
        <main>
            <form ref={formRef} action={addIngredient} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. tomatoes, garlic, simmer for 10 minutes"
                    aria-label="Add ingredients or instructions"
                    name="ingredient"
                />
                <button>Add Item</button>
            </form>
            {ingredientMessage && (
                <p className={`ingredient-message ingredient-message-${ingredientMessageType}`} aria-live="polite">
                    {ingredientMessage}
                </p>
            )}

            {recipeShown ? (
                <section className="recipe-layout">
                    <aside className="recipe-layout-sidebar">
                        <IngredientsList
                            ingredients={ingredients}
                            onRemoveIngredient={removeIngredient}
                            onRemoveAllIngredients={removeAllIngredients}
                            getRecipe={getRecipe}
                            recipeShown={recipeShown}
                        />
                    </aside>

                    <div className="recipe-layout-main">
                        <ClaudeRecipe
                            recipe={recipe}
                            error={recipeError}
                            isLoading={isLoadingRecipe}
                            ingredients={ingredients}
                            onHideRecipe={hideRecipe}
                        />
                    </div>
                </section>
            ) : (
                ingredients.length > 0 &&
                <IngredientsList
                    ingredients={ingredients}
                    onRemoveIngredient={removeIngredient}
                    onRemoveAllIngredients={removeAllIngredients}
                    getRecipe={getRecipe}
                    recipeShown={recipeShown}
                />
            )}
        </main>
    )
}
