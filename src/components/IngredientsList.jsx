import React from "react"
import { MINIMUM_INGREDIENTS_FOR_RECIPE } from "../constants/recipe"

export default function IngredientsList({
    ingredients,
    onUpdateIngredient,
    onRemoveIngredient,
    onRemoveAllIngredients,
    getRecipe,
    recipeShown,
    isLoading = false,
}) {
    const [editingIndex, setEditingIndex] = React.useState(null)
    const [editingValue, setEditingValue] = React.useState("")

    function startEditing(index, ingredient) {
        setEditingIndex(index)
        setEditingValue(ingredient)
    }

    function stopEditing() {
        setEditingIndex(null)
        setEditingValue("")
    }

    function saveEditing() {
        if (editingIndex === null) {
            return
        }

        const didUpdate = onUpdateIngredient(editingIndex, editingValue)

        if (didUpdate) {
            stopEditing()
        }
    }

    function handleClearList() {
        if (window.confirm("Clear all ingredients? This cannot be undone.")) {
            onRemoveAllIngredients()
        }
    }

    const remainingCount = MINIMUM_INGREDIENTS_FOR_RECIPE - ingredients.length
    const isReady = ingredients.length >= MINIMUM_INGREDIENTS_FOR_RECIPE

    const ingredientsListItems = ingredients.map((ingredient, index) => (
        <li key={`${ingredient}-${index}`}>
            {editingIndex === index ? (
                <input
                    className="ingredient-inline-input"
                    type="text"
                    value={editingValue}
                    onChange={event => setEditingValue(event.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            event.preventDefault()
                            saveEditing()
                        }

                        if (event.key === "Escape") {
                            stopEditing()
                        }
                    }}
                    autoFocus
                    aria-label={`Edit ${ingredient}`}
                />
            ) : (
                <button
                    className="ingredient-edit-trigger"
                    onClick={() => startEditing(index, ingredient)}
                    type="button"
                >
                    {ingredient}
                </button>
            )}
            <button
                className="remove-ingredient-button"
                onClick={() => onRemoveIngredient(index)}
                aria-label={`Remove ${ingredient}`}
                title={`Remove ${ingredient}`}
                type="button"
            >
                Remove
            </button>
        </li>
    ))

    return (
        <section className={`ingredients-panel${recipeShown ? " ingredients-panel-compact" : ""}`}>
            <div className="panel-heading">
                <p className="panel-eyebrow">Kitchen Notes</p>
                <h2>Your ingredients and instructions</h2>
            </div>
            <div className="ingredient-count-bar">
                <span className="ingredient-count-text">
                    {ingredients.length} {ingredients.length === 1 ? "item" : "items"}
                </span>
                {isReady ? (
                    <span className="ingredient-count-ready">Ready to generate</span>
                ) : (
                    <span className="ingredient-count-hint">{remainingCount} more needed</span>
                )}
            </div>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            <div className="ingredients-panel-actions">
                <button className="clear-list-button" onClick={handleClearList} type="button">
                    Clear List
                </button>
            </div>
            {isReady && (
                <div className="get-recipe-container">
                    <div>
                        <h3>{recipeShown ? "Want another version?" : "Ready for a recipe?"}</h3>
                        <p>Use your ingredients and instructions to generate a recipe suggestion.</p>
                    </div>
                    <button onClick={getRecipe} disabled={isLoading}>
                        {isLoading ? "Generating..." : recipeShown ? "Generate Again" : "Generate Recipe"}
                    </button>
                </div>
            )}
        </section>
    )
}
