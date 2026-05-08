import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRef } from "react"
import printReceipe from "./PrintReceipe"

export default function ClaudeRecipe(props) {
    const recipeContentRef = useRef(null)

    return (
        <section className="suggested-recipe-container">
            <div className="recipe-header">
                <div>
                    <p className="panel-eyebrow">Chef AI Suggestion</p>
                    <h2>Recommended Recipe</h2>
                </div>
                <div className="recipe-header-actions">
                    {props.recipe && !props.error && !props.isLoading && (
                        <button
                            className="save-recipe-button"
                            onClick={() => printReceipe({
                                ingredients: props.ingredients,
                                recipeHtml: recipeContentRef.current?.innerHTML ?? "",
                            })}
                            type="button"
                        >
                            Print Recipe
                        </button>
                    )}
                    <button className="hide-recipe-button" onClick={props.onHideRecipe} type="button">
                        Hide Recipe
                    </button>
                </div>
            </div>
            <div ref={recipeContentRef}>
                {props.isLoading ? (
                    <p>Generating your recipe...</p>
                ) : props.error ? (
                    <p>{props.error}</p>
                ) : props.recipe ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {props.recipe}
                    </ReactMarkdown>
                ) : (
                    <p>Add at least 3 ingredients or instructions, then click "Generate Recipe."</p>
                )}
            </div>
        </section>
    )
}
