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
        <section>
            <h2>Ingredient Details on hand:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length > 3 && <div className="get-recipe-container">
                <div>
                    <h3>Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button onClick={props.getRecipe}> {props.recipeShown ? "Hide Recipe" : "Get a recipe"}</button>
            </div>}
        </section>
    )
}
