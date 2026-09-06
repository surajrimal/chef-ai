import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRef } from "react"
import printRecipe, { getRecipeHistoryId, getRecipeMarkup } from "./printRecipe"

export default function ClaudeRecipe({ recipe, error, isLoading, ingredients, onHideRecipe, onSaveRecipe, saveStatus, saveMessage }) {
    const recipeContentRef = useRef(null)

    return (
        <section className="suggested-recipe-container">
            <div className="recipe-header">
                <div>
                    <p className="panel-eyebrow">Chef AI Suggestion</p>
                    <h2>Recommended Recipe</h2>
                </div>
                <div className="recipe-header-actions">
                    {recipe && !error && !isLoading && (
                        <>
                            <button
                                className={`save-recipe-button${saveStatus === "saved" ? " save-recipe-button-saved" : ""}`}
                                onClick={() => {
                                const recipeHtml = recipeContentRef.current?.innerHTML ?? ""
                                const markup = getRecipeMarkup({ ingredients, recipeHtml })
                                onSaveRecipe(getRecipeHistoryId(markup), markup, ingredients)
                                }}
                                disabled={saveStatus === "saving"}
                                type="button"
                            >
                                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save Recipe"}
                            </button>
                            <button className="print-recipe-button" onClick={() => printRecipe({
                                ingredients,
                                recipeHtml: recipeContentRef.current?.innerHTML ?? "",
                            })} type="button">
                                Print Recipe
                            </button>
                        </>
                    )}
                    {saveMessage && <p className={`save-recipe-status save-recipe-status-${saveStatus}`} role="status">{saveMessage}</p>}
                    <button className="hide-recipe-button" onClick={onHideRecipe} type="button">
                        Hide Recipe
                    </button>
                </div>
            </div>
            <div ref={recipeContentRef} className="recipe-content">
                {isLoading ? (
                    <p>Generating your recipe...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : recipe ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {recipe}
                    </ReactMarkdown>
                ) : (
                    <p>Add at least 3 ingredients or instructions, then click "Generate Recipe."</p>
                )}
            </div>
        </section>
    )
}
