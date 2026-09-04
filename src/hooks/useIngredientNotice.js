import { useEffect, useState } from "react"

const DISMISS_DELAY_MS = 2200
const FADE_DURATION_MS = 260

export function useIngredientNotice() {
  const [notice, setNotice] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  function showNotice(message, type = "info") {
    setNotice({ message, type })
    setIsVisible(true)
  }

  function clearNotice() {
    setNotice(null)
    setIsVisible(false)
  }

  useEffect(() => {
    if (!notice || notice.type === "error") return undefined

    const fadeTimer = window.setTimeout(() => setIsVisible(false), DISMISS_DELAY_MS)
    const clearTimer = window.setTimeout(() => setNotice(null), DISMISS_DELAY_MS + FADE_DURATION_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(clearTimer)
    }
  }, [notice])

  return { notice, isVisible, showNotice, clearNotice }
}
