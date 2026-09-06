import { useCallback, useState } from "react"
import { DEFAULT_INGREDIENTS } from "../constants/recipe"

const VALID_INGREDIENT_PATTERN = /^[a-z0-9][a-z0-9 &'()/%.+-]*$/i
const INVALID_ENTRY_MESSAGE = "Please enter at least one valid ingredient or instruction."

function normalizeIngredient(value) {
  return value.trim().replace(/\s+/g, " ")
}

function getIngredientKey(value) {
  return normalizeIngredient(value).toLowerCase()
}

function isValidIngredient(value) {
  return VALID_INGREDIENT_PATTERN.test(value) && /[a-z]/i.test(value)
}

export function useIngredientList({ showNotice }) {
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS)

  function showInvalidEntryNotice() {
    showNotice(INVALID_ENTRY_MESSAGE, "error")
  }

  function addIngredients(rawInput) {
    if (typeof rawInput !== "string") {
      showInvalidEntryNotice()
      return false
    }

    const candidates = rawInput.split(",").map(normalizeIngredient).filter(Boolean)
    if (candidates.length === 0) {
      showInvalidEntryNotice()
      return false
    }

    const invalidEntry = candidates.find(candidate => !isValidIngredient(candidate))
    if (invalidEntry) {
      showNotice(`"${invalidEntry}" is not a valid entry. Use words, numbers, and simple cooking punctuation only.`, "error")
      return false
    }

    const existingKeys = new Set(ingredients.map(getIngredientKey))
    const nextIngredients = [...ingredients]
    let duplicateCount = 0

    candidates.forEach(candidate => {
      const key = getIngredientKey(candidate)
      if (existingKeys.has(key)) {
        duplicateCount += 1
        return
      }

      existingKeys.add(key)
      nextIngredients.push(candidate)
    })

    const addedCount = nextIngredients.length - ingredients.length
    if (addedCount === 0) {
      showNotice("That item is already in your list.", "error")
      return false
    }

    setIngredients(nextIngredients)
    const pluralize = count => (count === 1 ? "" : "s")
    const message = duplicateCount
      ? `Added ${addedCount} item${pluralize(addedCount)}. Skipped ${duplicateCount} duplicate${pluralize(duplicateCount)}.`
      : `Added ${addedCount} item${pluralize(addedCount)}.`
    showNotice(message, duplicateCount ? "info" : "success")
    return true
  }

  function updateIngredient(indexToUpdate, rawValue) {
    if (typeof rawValue !== "string") {
      showInvalidEntryNotice()
      return false
    }

    const nextValue = normalizeIngredient(rawValue)
    if (!nextValue) {
      showInvalidEntryNotice()
      return false
    }

    if (!isValidIngredient(nextValue)) {
      showNotice(`"${nextValue}" is not a valid entry. Use words, numbers, and simple cooking punctuation only.`, "error")
      return false
    }

    const nextKey = getIngredientKey(nextValue)
    const isDuplicate = ingredients.some((ingredient, index) => index !== indexToUpdate && getIngredientKey(ingredient) === nextKey)
    if (isDuplicate) {
      showNotice("That item is already in your list.", "error")
      return false
    }

    if (getIngredientKey(ingredients[indexToUpdate] ?? "") === nextKey) {
      showNotice("No changes made.")
      return true
    }

    setIngredients(currentIngredients => currentIngredients.map((ingredient, index) => (
      index === indexToUpdate ? nextValue : ingredient
    )))
    showNotice("Item updated.", "success")
    return true
  }

  function removeIngredient(indexToRemove) {
    setIngredients(currentIngredients => currentIngredients.filter((_, index) => index !== indexToRemove))
  }

  function clearIngredients() {
    setIngredients([])
  }

  const replaceIngredients = useCallback(nextIngredients => {
    setIngredients(nextIngredients)
  }, [])

  return { ingredients, addIngredients, updateIngredient, removeIngredient, clearIngredients, replaceIngredients }
}
