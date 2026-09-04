import { useState } from "react"
import { getRecipeFromMistral } from "../ai"

export function useRecipeGeneration(ingredients) {
  const [recipe, setRecipe] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isShown, setIsShown] = useState(false)

  async function generateRecipe() {
    setIsShown(true)
    setError("")
    setIsLoading(true)

    try {
      setRecipe(await getRecipeFromMistral(ingredients))
    } catch (requestError) {
      setError(requestError.message || "Recipe request failed.")
    } finally {
      setIsLoading(false)
    }
  }

  function hideRecipe() {
    setIsShown(false)
  }

  function resetRecipe() {
    setRecipe("")
    setError("")
    setIsLoading(false)
    setIsShown(false)
  }

  return { recipe, error, isLoading, isShown, generateRecipe, hideRecipe, resetRecipe }
}
