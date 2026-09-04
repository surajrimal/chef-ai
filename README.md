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
HF_ACCESS_TOKEN=your_hugging_face_token
```

Notes:

- `HF_ACCESS_TOKEN` is read only by the Vercel serverless function in [`api/recipe.js`](/Users/suraj/CCI/chef-ai-auth/chef-ai/api/recipe.js).
- Do not prefix private secrets with `VITE_`; Vite injects those into the browser bundle.
- For Vercel, add `HF_ACCESS_TOKEN` in Project Settings -> Environment Variables instead of committing it to the repo.

### Authentication API

The frontend expects the Spring backend to expose `/api/v1`. For production, configure the public backend base URL at build time:

```env
VITE_AUTH_API_URL=https://your-backend.example.com/api/v1
```

The backend must also include the frontend’s deployed origin in `CORS_ALLOWED_ORIGINS`; otherwise browser authentication requests will be blocked. Local Vite development uses `VITE_AUTH_PROXY_TARGET` (default: `http://localhost:8080`) and proxies `/auth-api` to `/api/v1`.

### Run Locally

```bash
npm run dev
```

For local frontend-only work, that starts the Vite app. To exercise the serverless endpoint locally, run the project through Vercel dev so `/api/recipe` is available with your environment variables.

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
  Main.jsx                 Recipe workspace composition
  ai.js                    Browser helper that calls the serverless API
  auth.js                  Authentication API and session helpers
  components/
    AddIngredientForm.jsx  Ingredient input and suggestions
    IngredientsList.jsx    Ingredient list and recipe trigger
    ClaudeRecipe.jsx       Recipe rendering
    printRecipe.js         Print-window helper
    AuthScreen.jsx         Sign-in and registration form
    VerificationScreen.jsx Email verification states
  constants/
    recipe.js              Shared recipe defaults and limits
  hooks/
    useIngredientList.js   Ingredient validation and mutations
    useIngredientNotice.js Temporary status-message behavior
    useRecipeGeneration.js Recipe request state and actions
api/
  recipe.js                Vercel serverless function for LLM requests
```

## How It Works

1. The user adds ingredients in the main form.
2. Once the list is large enough, the app shows a recipe generation button.
3. The app posts the ingredient list to [`api/recipe.js`](/Users/suraj/CCI/chef-ai-auth/chef-ai/api/recipe.js).
4. The serverless function calls the model with `HF_ACCESS_TOKEN`.
5. The app renders that markdown in [`src/components/ClaudeRecipe.jsx`](/Users/suraj/CCI/chef-ai-auth/chef-ai/src/components/ClaudeRecipe.jsx).

`Main.jsx` only composes the recipe workspace. The three hooks own ingredient-list rules, temporary notices, and recipe-generation state respectively.

The current Hugging Face request logic also checks whether the response ended because of token length and asks the model to continue if needed.

## Build Status

Production build succeeds with:

```bash
npm run build
```

Vite currently reports a large bundle warning during build. That warning does not block the app, but it is worth addressing later with code-splitting if the project grows.

## Future Improvements

- Add ingredient validation and duplicate handling
- Let users choose recipe style or cuisine
- Save recent recipes locally
- Add tests for the request and rendering flow
