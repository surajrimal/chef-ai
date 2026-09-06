function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function getRecipeMarkup({ ingredients, recipeHtml }) {
  const ingredientsMarkup = ingredients
    .map(ingredient => `<li>${escapeHtml(ingredient)}</li>`)
    .join("")

  return `<article class="saved-recipe">
    <h1>Chef AI Recommended Recipe</h1>
    <section class="section">
      <h2>Ingredients and notes</h2>
      <ul>${ingredientsMarkup}</ul>
    </section>
    <section class="section">${recipeHtml}</section>
  </article>`
}

export function getRecipeHistoryId(markup) {
  let hash = 2166136261

  for (let index = 0; index < markup.length; index += 1) {
    hash ^= markup.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `recipe-${(hash >>> 0).toString(16).padStart(8, "0")}`
}

export function getRecipeTopic(markup) {
  if (typeof DOMParser === "undefined") return "Saved recipe"

  const document = new DOMParser().parseFromString(markup, "text/html")
  const ignoredTopics = new Set([
    "Chef AI Recommended Recipe",
    "Ingredients and notes",
    "Ingredients",
    "Instructions",
    "Directions",
    "Method",
    "Preparation",
  ])
  const recipeSection = document.querySelector(".saved-recipe > .section:last-child")
  const heading = [...(recipeSection || document).querySelectorAll("h1, h2, h3, h4")]
    .find(candidate => {
      const topic = candidate.textContent?.trim() || ""
      const normalizedTopic = topic.toLowerCase()
      return !ignoredTopics.has(topic)
        && !["ingredients", "instructions", "directions", "method", "preparation"].some(prefix => normalizedTopic.startsWith(prefix))
    })
  return heading?.textContent?.trim() || "Saved recipe"
}

function getPrintRecipeMarkup({ date, ingredients, recipeHtml, recipeMarkup }) {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>chef-ai-recipe-${date}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; color: #171311; margin: 40px; line-height: 1.6; }
          h1, h2, h3, h4 { color: #141413; margin-bottom: 0.5rem; }
          ul, ol { padding-left: 1.5rem; }
          .meta { color: #6f655d; margin-bottom: 1.5rem; }
          .section { margin-top: 2rem; }
          @media print { body { margin: 24px; } }
        </style>
      </head>
      <body>
        <p class="meta">Saved on ${date}</p>
        ${recipeMarkup || getRecipeMarkup({ ingredients, recipeHtml })}
      </body>
    </html>`
}

export default function printRecipe({ ingredients = [], recipeHtml = "", recipeMarkup = "" }) {
  if (!recipeHtml && !recipeMarkup) return

  const iframe = document.createElement("iframe")
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"

  iframe.onload = () => {
    const printWindow = iframe.contentWindow
    if (!printWindow) {
      iframe.remove()
      return
    }

    printWindow.onafterprint = () => window.setTimeout(() => iframe.remove(), 250)
    printWindow.focus()
    printWindow.print()
  }

  iframe.srcdoc = getPrintRecipeMarkup({
    date: new Date().toISOString().slice(0, 10),
    ingredients,
    recipeHtml,
    recipeMarkup,
  })
  document.body.appendChild(iframe)
}
