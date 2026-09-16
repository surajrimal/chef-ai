import printRecipe, { getRecipeTopic } from "./printRecipe"
import { useState } from "react"

function formatDate(value) {
  if (!value) return "Date unavailable"
  // If the server sends a UTC timestamp without an explicit timezone marker
  // (no trailing Z, no +HH:MM / -HH:MM offset), append Z so the browser
  // parses it as UTC and toLocaleString() converts it to the user's local time.
  const normalized =
    typeof value === "string" && !value.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(value)
      ? `${value}Z`
      : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString()
}

export default function SavedRecipes({ recipes, error, onDeleteRecipe }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState(null)
  const [deletingRecipeId, setDeletingRecipeId] = useState(null)
  const [deleteError, setDeleteError] = useState("")
  const uniqueRecipes = recipes
    .filter((recipe, index, allRecipes) => (
      allRecipes.findIndex(candidate => candidate.id === recipe.id || candidate.htmlPage === recipe.htmlPage) === index
    ))
    .sort((first, second) => {
      const firstTime = Date.parse(first.lastModified || "")
      const secondTime = Date.parse(second.lastModified || "")
      if (Number.isNaN(firstTime)) return 1
      if (Number.isNaN(secondTime)) return -1
      return secondTime - firstTime
    })
  const selectedRecipe = uniqueRecipes.find(recipe => recipe.id === selectedRecipeId)

  async function deleteRecipe() {
    if (!selectedRecipe || !window.confirm(`Delete "${getRecipeTopic(selectedRecipe.htmlPage)}" from your saved recipes?`)) return

    setDeletingRecipeId(selectedRecipe.id)
    setDeleteError("")
    try {
      await onDeleteRecipe(selectedRecipe.id)
      setSelectedRecipeId(null)
    } catch (requestError) {
      setDeleteError(requestError.message || "Recipe could not be deleted.")
    } finally {
      setDeletingRecipeId(null)
    }
  }

  return (
    <section className="saved-recipes-panel" aria-labelledby="saved-recipes-title">
      <div className="panel-heading">
        <p className="panel-eyebrow">Your kitchen archive</p>
        <h2 id="saved-recipes-title">Saved recipes</h2>
      </div>
      {error ? <p className="history-message history-message-error">{error}</p> : recipes.length === 0 ? (
        <p className="saved-recipes-empty">Recipes you save will appear here.</p>
      ) : (
        <div className="saved-recipes-browser">
          <div className="saved-recipes-list" role="listbox" aria-label="Saved recipes">
            {uniqueRecipes.map(recipe => (
              <button
                className={`saved-recipe-list-item${recipe.id === selectedRecipeId ? " saved-recipe-list-item-selected" : ""}`}
                key={recipe.id || recipe.htmlPage}
                type="button"
                role="option"
                aria-selected={recipe.id === selectedRecipeId}
                onClick={() => setSelectedRecipeId(recipe.id)}
              >
                <span>{getRecipeTopic(recipe.htmlPage)}</span>
                <small>Saved {formatDate(recipe.lastModified)}</small>
              </button>
            ))}
          </div>
          {selectedRecipe && (
            <article className="saved-recipe-card">
              <div className="saved-recipe-card-header">
                <p className="saved-recipe-date">Saved {formatDate(selectedRecipe.lastModified)}</p>
                <button
                  className="print-recipe-button"
                  type="button"
                  onClick={() => printRecipe({ recipeMarkup: selectedRecipe.htmlPage })}
                >
                  Print
                </button>
                <button
                  className="delete-recipe-button"
                  type="button"
                  disabled={deletingRecipeId === selectedRecipe.id}
                  onClick={deleteRecipe}
                >
                  {deletingRecipeId === selectedRecipe.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <div className="saved-recipe-content" dangerouslySetInnerHTML={{ __html: selectedRecipe.htmlPage }} />
            </article>
          )}
          {deleteError && <p className="history-message history-message-error" role="alert">{deleteError}</p>}
        </div>
      )}
    </section>
  )
}