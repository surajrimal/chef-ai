// More refined, categorized, and scalable ingredient suggestions
// Covers global cuisines, proteins, pantry items, herbs, spices, sauces, and aromatics

export const COMMON_INGREDIENT_SUGGESTIONS = [
  // Aromatics & Vegetables
  "Garlic",
  "Ginger",
  "Onions",
  "Yellow onion",
  "Red onion",
  "Shallots",
  "Green onions",
  "Leeks",
  "Tomatoes",
  "Cherry tomatoes",
  "Potatoes",
  "Sweet potatoes",
  "Carrots",
  "Bell peppers",
  "Green chilies",
  "Jalapeños",
  "Spinach",
  "Kale",
  "Cabbage",
  "Broccoli",
  "Cauliflower",
  "Mushrooms",
  "Zucchini",
  "Eggplant",
  "Cucumber",
  "Peas",
  "Corn",
  "Avocado",

  // Fresh Herbs
  "Cilantro",
  "Parsley",
  "Basil",
  "Mint",
  "Rosemary",
  "Thyme",
  "Oregano",
  "Dill",

  // Proteins
  "Chicken breast",
  "Chicken thighs",
  "Ground chicken",
  "Eggs",
  "Beef",
  "Ground beef",
  "Steak",
  "Pork",
  "Bacon",
  "Salmon",
  "Shrimp",
  "Tuna",
  "Tofu",
  "Paneer",
  "Tempeh",
  "Chickpeas",
  "Black beans",
  "Lentils",

  // Dairy
  "Milk",
  "Heavy cream",
  "Butter",
  "Greek yogurt",
  "Cheddar cheese",
  "Mozzarella",
  "Parmesan",
  "Feta cheese",

  // Grains & Carbs
  "Rice",
  "Basmati rice",
  "Brown rice",
  "Quinoa",
  "Pasta",
  "Spaghetti",
  "Noodles",
  "Bread",
  "Tortillas",
  "Flour",
  "Breadcrumbs",
  "Oats",

  // Oils & Fats
  "Olive oil",
  "Vegetable oil",
  "Sesame oil",
  "Coconut oil",
  "Ghee",

  // Pantry Essentials
  "Salt",
  "Sea salt",
  "Black pepper",
  "Sugar",
  "Brown sugar",
  "Honey",
  "Maple syrup",
  "Cornstarch",
  "Baking powder",
  "Baking soda",

  // Spices
  "Turmeric",
  "Paprika",
  "Smoked paprika",
  "Cumin seeds",
  "Ground cumin",
  "Coriander powder",
  "Garam masala",
  "Curry powder",
  "Cayenne pepper",
  "Red chili flakes",
  "Cinnamon",
  "Nutmeg",
  "Cardamom",
  "Cloves",
  "Mustard seeds",
  "Fenugreek",
  "Italian seasoning",

  // Sauces & Condiments
  "Soy sauce",
  "Fish sauce",
  "Oyster sauce",
  "Hot sauce",
  "Tomato paste",
  "Ketchup",
  "Mayonnaise",
  "Mustard",
  "Sriracha",
  "Vinegar",
  "Rice vinegar",
  "Balsamic vinegar",
  "Lemon juice",
  "Lime juice",
  "Coconut milk",

  // Nuts & Garnishes
  "Cashews",
  "Almonds",
  "Peanuts",
  "Sesame seeds",
  "Raisins"
]



// More natural cooking actions for AI autocomplete and recipe generation

export const COMMON_STEP_SUGGESTIONS = [
  // Prep
  "Wash and prepare all ingredients",
  "Peel and finely chop the onions",
  "Mince the garlic and ginger",
  "Slice the vegetables evenly",
  "Pat the chicken dry with paper towels",
  "Marinate for at least 30 minutes",

  // Heating & Cooking
  "Heat oil in a large pan over medium heat",
  "Add onions and saute until translucent",
  "Cook until golden brown",
  "Stir continuously to avoid burning",
  "Add garlic and cook until fragrant",
  "Bring the mixture to a gentle boil",
  "Reduce heat and simmer for 10 minutes",
  "Cook covered until tender",
  "Bake in a preheated oven at 375°F",
  "Grill for 4–5 minutes on each side",
  "Pan-fry until crispy and golden",
  "Roast until caramelized",

  // Combining & Texture
  "Mix well to combine all ingredients",
  "Fold gently until evenly incorporated",
  "Whisk until smooth",
  "Add water gradually while stirring",
  "Adjust consistency as needed",
  "Season to taste with salt and pepper",

  // Finishing
  "Garnish with freshly chopped cilantro",
  "Drizzle with olive oil before serving",
  "Let it rest for 5 minutes before serving",
  "Serve hot with rice or bread",
  "Top with grated cheese",
  "Squeeze fresh lemon juice before serving"
]



// Expanded cooking verbs and hint words
// Useful for NLP tagging, autocomplete, prompt engineering, and AI parsing

export const STEP_HINT_WORDS = [
  // Prep
  "wash",
  "rinse",
  "peel",
  "slice",
  "dice",
  "cube",
  "julienne",
  "chop",
  "mince",
  "grate",
  "crush",
  "trim",

  // Mixing
  "mix",
  "stir",
  "whisk",
  "blend",
  "fold",
  "combine",
  "knead",
  "toss",

  // Heat & Cooking
  "heat",
  "cook",
  "saute",
  "sauté",
  "sear",
  "fry",
  "deep-fry",
  "boil",
  "simmer",
  "steam",
  "poach",
  "grill",
  "roast",
  "bake",
  "broil",
  "toast",
  "smoke",

  // Liquids & Reduction
  "pour",
  "drizzle",
  "reduce",
  "deglaze",

  // Flavoring
  "season",
  "marinate",
  "garnish",

  // Structure
  "cover",
  "uncover",
  "flip",
  "turn",

  // Finishing
  "serve",
  "plate",
  "rest",
  "cool",
  "chill"
]

const MIN_SUGGESTION_QUERY_LENGTH = 2

function normalizeIngredient(value) {
    return value.trim().replace(/\s+/g, " ")
}

function getIngredientKey(value) {
    return normalizeIngredient(value).toLowerCase()
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getCurrentToken(value) {
    const segments = value.split(",")
    return normalizeIngredient(segments[segments.length - 1] ?? "")
}

function isLikelyStep(token) {
    const normalizedToken = token.toLowerCase()

    if (!normalizedToken) {
        return false
    }

    return STEP_HINT_WORDS.some(word => normalizedToken.startsWith(word)) ||
        /\b(minute|minutes|hour|hours|until|degrees|boil|simmer|stir)\b/.test(normalizedToken) ||
        /\d/.test(normalizedToken)
}

function scoreSuggestion(suggestion, query) {
    const suggestionText = suggestion.toLowerCase()
    const queryText = query.toLowerCase()

    if (!queryText) {
        return 1
    }

    if (suggestionText.startsWith(queryText)) {
        return 4
    }

    if (suggestionText.split(" ").some(word => word.startsWith(queryText))) {
        return 3
    }

    if (suggestionText.includes(queryText)) {
        return 2
    }

    const compactPattern = new RegExp(queryText.split(/\s+/).map(escapeRegExp).join(".*"))
    return compactPattern.test(suggestionText) ? 1 : 0
}

export function getMatchingSuggestions({ inputValue, ingredients }) {
    const currentToken = getCurrentToken(inputValue)

    if (currentToken.replace(/\s+/g, "").length < MIN_SUGGESTION_QUERY_LENGTH) {
        return []
    }

    const existingKeys = new Set(ingredients.map(getIngredientKey))
    const preferredSuggestions = isLikelyStep(currentToken)
        ? COMMON_STEP_SUGGESTIONS
        : COMMON_INGREDIENT_SUGGESTIONS
    const fallbackSuggestions = isLikelyStep(currentToken)
        ? COMMON_INGREDIENT_SUGGESTIONS
        : COMMON_STEP_SUGGESTIONS

    return [...preferredSuggestions, ...fallbackSuggestions]
        .filter((suggestion, index, allSuggestions) => allSuggestions.indexOf(suggestion) === index)
        .filter(suggestion => !existingKeys.has(getIngredientKey(suggestion)))
        .map(suggestion => ({
            suggestion,
            score: scoreSuggestion(suggestion, currentToken)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.suggestion.localeCompare(b.suggestion))
        .slice(0, 6)
        .map(item => item.suggestion)
}

export function applySuggestionToInput(inputValue, suggestion) {
    const segments = inputValue.split(",")
    const hasTrailingComma = inputValue.trimEnd().endsWith(",")

    if (segments.length === 0 || hasTrailingComma) {
        return `${normalizeIngredient(inputValue)}${inputValue.trim() ? " " : ""}${suggestion}`
    }

    segments[segments.length - 1] = ` ${suggestion}`.trimStart()
    return segments
        .map((segment, index) => index === 0 ? normalizeIngredient(segment) : ` ${normalizeIngredient(segment)}`)
        .join(",")
}
