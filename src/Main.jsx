import { useEffect, useState } from "react"
import AddIngredientForm from "./components/AddIngredientForm"
import ClaudeRecipe from "./components/ClaudeRecipe"
import IngredientsList from "./components/IngredientsList"
import SavedRecipes from "./components/SavedRecipes"
import { deleteRecipeHistory, getSavedRecipes, saveRecipeHistory } from "./auth"
import { useIngredientList } from "./hooks/useIngredientList"
import { useIngredientNotice } from "./hooks/useIngredientNotice"
import { useRecipeGeneration } from "./hooks/useRecipeGeneration"

export default function Main({ onSessionExpired }) {
  const [savedRecipes, setSavedRecipes] = useState([])
  const [recommendedIngredients, setRecommendedIngredients] = useState([])
  const [historyError, setHistoryError] = useState("")
  const [saveState, setSaveState] = useState({ status: "idle", message: "" })
  const { notice, isVisible, showNotice, clearNotice } = useIngredientNotice()
  const { ingredients, addIngredients, updateIngredient, removeIngredient, clearIngredients, replaceIngredients } = useIngredientList({ showNotice })
  const recipe = useRecipeGeneration(ingredients)

  async function loadSavedRecipes() {
    try {
      setSavedRecipes(await getSavedRecipes())
      setHistoryError("")
    } catch (error) {
      if (error.message === "Your session has ended. Please sign in again.") {
        onSessionExpired()
        return
      }
      setHistoryError(error.message || "Saved recipes could not be loaded.")
    }
  }

  function getFrequentIngredients(recipes, limit = 6) {
    const counts = new Map()
    const labels = new Map()

    recipes.forEach(recipe => {
      if (!Array.isArray(recipe.ingredients)) return

      recipe.ingredients.forEach(ingredient => {
        if (typeof ingredient !== "string" || !ingredient.trim()) return
        const label = ingredient.trim().replace(/\s+/g, " ")
        const key = label.toLowerCase()
        counts.set(key, (counts.get(key) || 0) + 1)
        if (!labels.has(key)) labels.set(key, label)
      })
    })

    return [...counts.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, limit)
      .map(([key]) => labels.get(key))
  }

  useEffect(() => {
    let isCurrent = true
    getSavedRecipes()
      .then(recipes => {
        if (!isCurrent) return
        setSavedRecipes(recipes)
        setHistoryError("")
        const frequentIngredients = getFrequentIngredients(recipes)
        if (frequentIngredients.length > 0) {
          replaceIngredients(frequentIngredients.slice(0, 3))
          setRecommendedIngredients(frequentIngredients.slice(3))
        }
      })
      .catch(error => {
        if (!isCurrent) return
        if (error.message === "Your session has ended. Please sign in again.") {
          onSessionExpired()
          return
        }
        setHistoryError(error.message || "Saved recipes could not be loaded.")
      })

    return () => { isCurrent = false }
  }, [onSessionExpired, replaceIngredients])

  async function saveRecipe(id, html, recipeIngredients) {
    setSaveState({ status: "saving", message: "Saving recipe..." })
    try {
      await saveRecipeHistory(id, html, recipeIngredients)
      await loadSavedRecipes()
      setSaveState({ status: "saved", message: "Recipe saved to your history." })
    } catch (error) {
      setSaveState({ status: "error", message: error.message || "Recipe could not be saved." })
    }
  }

  async function deleteRecipe(id) {
    await deleteRecipeHistory(id)
    await loadSavedRecipes()
  }

  function generateRecipe() {
    setSaveState({ status: "idle", message: "" })
    recipe.generateRecipe()
  }

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
    getRecipe: generateRecipe,
    recipeShown: recipe.isShown,
  }

  return (
    <main>
      <AddIngredientForm
        ingredients={ingredients}
        onAddIngredient={addIngredients}
        recommendedIngredients={recommendedIngredients}
      />
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
              onSaveRecipe={saveRecipe}
              saveStatus={saveState.status}
              saveMessage={saveState.message}
            />
          </div>
        </section>
      ) : ingredients.length > 0 ? (
        <IngredientsList {...ingredientListProps} />
      ) : null}
      <SavedRecipes recipes={savedRecipes} error={historyError} onDeleteRecipe={deleteRecipe} />
    </main>
  )
}
