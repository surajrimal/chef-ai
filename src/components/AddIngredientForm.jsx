import React from "react"
import {
    applySuggestionToInput,
    getMatchingSuggestions
} from "../utils/ingredientSuggestions"

export default function AddIngredientForm(props) {
    const [ingredientInput, setIngredientInput] = React.useState("")
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [highlightedSuggestion, setHighlightedSuggestion] = React.useState(0)
    const inputRef = React.useRef(null)

    const suggestions = React.useMemo(
        () => getMatchingSuggestions({ inputValue: ingredientInput, ingredients: props.ingredients }),
        [ingredientInput, props.ingredients]
    )

    function handleSubmit(event) {
        event.preventDefault()

        const didAddItem = props.onAddIngredient(ingredientInput)

        if (didAddItem) {
            setIngredientInput("")
            setShowSuggestions(false)
            setHighlightedSuggestion(0)
        }
    }

    function handleSuggestionSelect(suggestion) {
        setIngredientInput(currentValue => applySuggestionToInput(currentValue, suggestion))
        setShowSuggestions(false)
        setHighlightedSuggestion(0)
        inputRef.current?.focus()
    }

    function handleInputKeyDown(event) {
        if (!showSuggestions || suggestions.length === 0) {
            return
        }

        if (event.key === "ArrowDown") {
            event.preventDefault()
            setHighlightedSuggestion(prevIndex => (prevIndex + 1) % suggestions.length)
            return
        }

        if (event.key === "ArrowUp") {
            event.preventDefault()
            setHighlightedSuggestion(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length)
            return
        }

        if (event.key === "Enter" && suggestions[highlightedSuggestion]) {
            event.preventDefault()
            handleSuggestionSelect(suggestions[highlightedSuggestion])
            return
        }

        if (event.key === "Escape") {
            setShowSuggestions(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="add-ingredient-form">
            <div className="ingredient-input-shell">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. tomatoes, garlic, simmer for 10 minutes"
                    aria-label="Add ingredients or instructions"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-controls="ingredient-suggestions"
                    name="ingredient"
                    value={ingredientInput}
                    onChange={event => {
                        setIngredientInput(event.target.value)
                        setShowSuggestions(true)
                        setHighlightedSuggestion(0)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                        window.setTimeout(() => {
                            setShowSuggestions(false)
                        }, 120)
                    }}
                    onKeyDown={handleInputKeyDown}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="ingredient-suggestions" id="ingredient-suggestions" role="listbox">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion}
                                className={`ingredient-suggestion${index === highlightedSuggestion ? " ingredient-suggestion-active" : ""}`}
                                type="button"
                                role="option"
                                aria-selected={index === highlightedSuggestion}
                                onMouseDown={event => {
                                    event.preventDefault()
                                    handleSuggestionSelect(suggestion)
                                }}
                                onMouseEnter={() => setHighlightedSuggestion(index)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button className="add-ingredient-button" type="submit">
                <span className="add-ingredient-button-icon" aria-hidden="true">+</span>
                <span>Add Item</span>
            </button>
        </form>
    )
}
