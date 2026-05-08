export default function IngredientsList(props) {
    const ingredientsListItems = props.ingredients.map((ingredient, index) => (
        <li key={`${ingredient}-${index}`}>
            <span>{ingredient}</span>
            <button
                className="remove-ingredient-button"
                onClick={() => props.onRemoveIngredient(index)}
                aria-label={`Remove ${ingredient}`}
                title={`Remove ${ingredient}`}
                type="button"
            >
                Remove
            </button>
        </li>
    ))
    return (
        <section className={`ingredients-panel${props.recipeShown ? " ingredients-panel-compact" : ""}`}>
            <div className="panel-heading">
                <p className="panel-eyebrow">Kitchen Notes</p>
                <h2>Your ingredients and instructions</h2>
            </div>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length < 3 && (
                <p className="recipe-hint">Add at least 3 ingredients or instructions before generating a recipe.</p>
            )}
            <div className="ingredients-panel-actions">
                <button className="clear-list-button" onClick={props.onRemoveAllIngredients} type="button">
                    Clear List
                </button>
            </div>
            {props.ingredients.length > 2 && <div className="get-recipe-container">
                <div>
                    <h3>{props.recipeShown ? "Want another version?" : "Ready for a recipe?"}</h3>
                    <p>Use your ingredients and instructions to generate a recipe suggestion.</p>
                </div>
                <button onClick={props.getRecipe}> {props.recipeShown ? "Generate Again" : "Generate Recipe"}</button>
            </div>}
        </section>
    )
}
