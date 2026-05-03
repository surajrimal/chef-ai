# Chef AI

Chef AI is a small React + Vite app that turns a short ingredient list into a recipe suggestion using an LLM. You add ingredients, remove what you do not want, and generate a markdown-formatted recipe rendered directly in the UI.

## Features

- Add and remove ingredients from the working list
- Generate a recipe once you have enough ingredients
- Render recipe output with Markdown and GitHub Flavored Markdown support
- Show loading and error states during API requests
- Continue fetching output when the model response is cut off by token limits

## Tech Stack

- React 19
- Vite 8
- `react-markdown`
- `remark-gfm`
- Hugging Face Inference API
- Anthropic SDK included in the project source

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm
- A Hugging Face access token with inference access

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

```env
VITE_HF_ACCESS_TOKEN=your_hugging_face_token
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

Notes:

- The current UI flow uses `VITE_HF_ACCESS_TOKEN`.
- `VITE_ANTHROPIC_API_KEY` is only needed if you switch the app back to the Anthropic helper in [`src/ai.js`](/Users/suraj/CCI/suraj-chef/src/ai.js).
- Because this is a client-side app, any key exposed here is available in the browser. For a real deployment, move API calls behind a backend or serverless function.

### Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Project Structure

```text
src/
  App.jsx                  App shell
  Header.jsx               Top header
  Main.jsx                 Main app state and actions
  ai.js                    LLM request helpers
  components/
    IngredientsList.jsx    Ingredient list and recipe trigger
    ClaudeRecipe.jsx       Recipe rendering
```

## How It Works

1. The user adds ingredients in the main form.
2. Once the list is large enough, the app shows a recipe generation button.
3. The app sends the ingredient list to the model in [`src/ai.js`](/Users/suraj/CCI/suraj-chef/src/ai.js).
4. The model returns markdown content.
5. The app renders that markdown in [`src/components/ClaudeRecipe.jsx`](/Users/suraj/CCI/suraj-chef/src/components/ClaudeRecipe.jsx).

The current Hugging Face request logic also checks whether the response ended because of token length and asks the model to continue if needed.

## Build Status

Production build succeeds with:

```bash
npm run build
```

Vite currently reports a large bundle warning during build. That warning does not block the app, but it is worth addressing later with code-splitting if the project grows.

## Future Improvements

- Move API calls to a backend to avoid exposing tokens
- Add ingredient validation and duplicate handling
- Let users choose recipe style or cuisine
- Save recent recipes locally
- Add tests for the request and rendering flow
