import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ClaudeRecipe(props) {
    return (
        <section className="suggested-recipe-container">
            <h2>Recommended Recipe:</h2>
            {props.error ? (
                <p>{props.error}</p>
            ) : props.recipe ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} >
                    {props.recipe}
                </ReactMarkdown>
            ) : props.isLoading ? (
                <p>Generating recipe...</p>
            ) : (
                <p>Click "Get a recipe" to generate one.</p>
            )}
        </section>
    )
}
