import React from "react"
import { MINIMUM_INGREDIENTS_FOR_RECIPE } from "../constants/recipe"

export default function IngredientsList({
    ingredients,
    onUpdateIngredient,
    onRemoveIngredient,
    onRemoveAllIngredients,
    getRecipe,
    recipeShown,
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
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {ingredients.length < MINIMUM_INGREDIENTS_FOR_RECIPE && (
                <p className="recipe-hint">Add at least 3 ingredients or instructions before generating a recipe.</p>
            )}
            <div className="ingredients-panel-actions">
                <button className="clear-list-button" onClick={onRemoveAllIngredients} type="button">
                    Clear List
                </button>
            </div>
            {ingredients.length >= MINIMUM_INGREDIENTS_FOR_RECIPE && <div className="get-recipe-container">
                <div>
                    <h3>{recipeShown ? "Want another version?" : "Ready for a recipe?"}</h3>
                    <p>Use your ingredients and instructions to generate a recipe suggestion.</p>
                </div>
                <button onClick={getRecipe}> {recipeShown ? "Generate Again" : "Generate Recipe"}</button>
            </div>}
        </section>
    )
}
