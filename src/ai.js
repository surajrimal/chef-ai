function extractErrorMessage(payload) {
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
        return payload.error
    }

    return "Recipe request failed."
}

export async function getRecipeFromMistral(ingredientsArr) {
    const response = await fetch("/api/recipe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsArr }),
    })

    let payload = null

    try {
        payload = await response.json()
    } catch {
        if (!response.ok) {
            throw new Error("Recipe request failed.")
        }
    }

    if (!response.ok) {
        throw new Error(extractErrorMessage(payload))
    }

    if (!payload || typeof payload.recipe !== "string" || !payload.recipe.trim()) {
        throw new Error("Recipe response was empty.")
    }

    return payload.recipe
}
