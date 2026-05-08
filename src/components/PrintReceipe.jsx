function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")
}

function getPrintRecipeMarkup({ date, ingredients, recipeHtml }) {
    const ingredientsMarkup = ingredients
        .map(ingredient => `<li>${escapeHtml(ingredient)}</li>`)
        .join("")

    return `<!doctype html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>chef-ai-recipe-${date}</title>
                <style>
                    body {
                        font-family: Inter, Arial, sans-serif;
                        color: #171311;
                        margin: 40px;
                        line-height: 1.6;
                    }

                    h1, h2, h3, h4 {
                        color: #141413;
                        margin-bottom: 0.5rem;
                    }

                    ul, ol {
                        padding-left: 1.5rem;
                    }

                    .meta {
                        color: #6f655d;
                        margin-bottom: 1.5rem;
                    }

                    .section {
                        margin-top: 2rem;
                    }

                    @media print {
                        body {
                            margin: 24px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Chef AI Recommended Recipe</h1>
                <p class="meta">Saved on ${date}</p>

                <section class="section">
                    <h2>Your ingredients and instructions</h2>
                    <ul>${ingredientsMarkup}</ul>
                </section>

                <section class="section">
                    <h2>Recommended recipe</h2>
                    ${recipeHtml}
                </section>
            </body>
        </html>`
}

export default function printReceipe({ ingredients, recipeHtml }) {
    if (!recipeHtml) {
        return
    }

    const today = new Date().toISOString().slice(0, 10)
    const iframe = document.createElement("iframe")

    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"

    iframe.onload = () => {
        const printWindow = iframe.contentWindow

        if (!printWindow) {
            document.body.removeChild(iframe)
            return
        }

        const cleanup = () => {
            window.setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe)
                }
            }, 250)
        }

        printWindow.onafterprint = cleanup
        printWindow.focus()
        printWindow.print()
    }

    iframe.srcdoc = getPrintRecipeMarkup({
        date: today,
        ingredients,
        recipeHtml,
    })

    document.body.appendChild(iframe)
}
