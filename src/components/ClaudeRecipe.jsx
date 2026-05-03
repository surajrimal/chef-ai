import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRef } from "react"

export default function ClaudeRecipe(props) {
    const recipeContentRef = useRef(null)

    return (
        <section className="suggested-recipe-container">
            <h2>Recommended Recipe:</h2>
            <div ref={recipeContentRef}>
                {props.error ? (
                    <p>{props.error}</p>
                ) : props.recipe ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {props.recipe}
                    </ReactMarkdown>
                ) : props.isLoading ? (
                    <p>Generating recipe...</p>
                ) : (
                    <p>Click "Get a recipe" to generate one.</p>
                )}
            </div>
            {props.recipe && !props.error && !props.isLoading && (
                <button
                    className="save-recipe-button"
                    onClick={() => props.onSaveRecipe(recipeContentRef.current?.innerHTML ?? "")}
                    type="button"
                >
                    Print recipe
                </button>
            )}
        </section>
    )
}
