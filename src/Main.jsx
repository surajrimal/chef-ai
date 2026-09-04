import AddIngredientForm from "./components/AddIngredientForm"
import ClaudeRecipe from "./components/ClaudeRecipe"
import IngredientsList from "./components/IngredientsList"
import { useIngredientList } from "./hooks/useIngredientList"
import { useIngredientNotice } from "./hooks/useIngredientNotice"
import { useRecipeGeneration } from "./hooks/useRecipeGeneration"

export default function Main() {
  const { notice, isVisible, showNotice, clearNotice } = useIngredientNotice()
  const { ingredients, addIngredients, updateIngredient, removeIngredient, clearIngredients } = useIngredientList({ showNotice })
  const recipe = useRecipeGeneration(ingredients)

  function clearWorkspace() {
    clearIngredients()
    clearNotice()
    recipe.resetRecipe()
  }

  const ingredientListProps = {
    ingredients,
    onUpdateIngredient: updateIngredient,
    onRemoveIngredient: removeIngredient,
    onRemoveAllIngredients: clearWorkspace,
    getRecipe: recipe.generateRecipe,
    recipeShown: recipe.isShown,
  }

  return (
    <main>
      <AddIngredientForm ingredients={ingredients} onAddIngredient={addIngredients} />
      {notice && (
        <p
          className={`ingredient-message ingredient-message-${notice.type}${isVisible ? " ingredient-message-visible" : ""}`}
          aria-live="polite"
        >
          {notice.message}
        </p>
      )}

      {recipe.isShown ? (
        <section className="recipe-layout">
          <aside className="recipe-layout-sidebar">
            <IngredientsList {...ingredientListProps} />
          </aside>
          <div className="recipe-layout-main">
            <ClaudeRecipe
              recipe={recipe.recipe}
              error={recipe.error}
              isLoading={recipe.isLoading}
              ingredients={ingredients}
              onHideRecipe={recipe.hideRecipe}
            />
          </div>
        </section>
      ) : ingredients.length > 0 ? (
        <IngredientsList {...ingredientListProps} />
      ) : null}
    </main>
  )
}
