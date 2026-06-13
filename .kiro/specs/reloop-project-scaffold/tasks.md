# Implementation Plan: Re:Loop Project Scaffold

## Overview

This plan creates the complete project scaffold for Amazon Re:Loop — an AI-powered Return Intelligence Platform. The scaffold generates the monorepo directory structure, configuration files, placeholder files for all six core modules, and technical design documentation. No business logic is implemented; every file contains only the minimum boilerplate to establish purpose and pass startup checks.

Tasks are ordered so that root-level setup happens first, then backend and frontend scaffolding can proceed in parallel, followed by documentation.

## Tasks

- [x] 1. Set up root-level project files
  - [x] 1.1 Create root package.json with npm workspaces
    - Create `package.json` at project root with `name` field set to `"reloop"`
    - Include `workspaces` field listing `["frontend", "backend"]`
    - Add scripts: `dev:frontend` (runs frontend dev server) and `dev:backend` (runs backend server)
    - _Requirements: 11.2, 11.5_

  - [x] 1.2 Create root .gitignore
    - Create `.gitignore` at project root excluding `node_modules/`, `.env`, `dist/`, `.DS_Store`, and `Thumbs.db`
    - _Requirements: 11.1, 11.5_

- [x] 2. Set up backend directory structure and server
  - [x] 2.1 Create backend directory structure with .gitkeep files
    - Create `backend/` directory with subdirectories: `routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, `prompts/`
    - Place an empty `.gitkeep` file inside each subdirectory
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Create backend package.json
    - Create `backend/package.json` with `name` field set to `"reloop-backend"`
    - Add `start` script set to `node server.js`
    - List exact (pinned) versions for dependencies: `express`, `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `cors`, `dotenv`, `multer`
    - _Requirements: 1.4_

  - [x] 2.3 Create backend server.js
    - Import `express`, `cors`, and `dotenv`
    - Call `dotenv.config()`
    - Initialize Express app and register `cors()` middleware
    - Define `PORT` variable reading from `process.env.PORT` with fallback of `3000`
    - Add `app.listen(PORT)` call with console log confirming port
    - _Requirements: 1.3, 1.5_

- [x] 3. Set up backend configuration files
  - [x] 3.1 Create backend .env.example
    - List all required environment variables with placeholder values: `PORT`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `DYNAMODB_TABLE_NAME`, `BEDROCK_MODEL_ID`
    - Include comments indicating expected format for each variable
    - _Requirements: 4.1_

  - [x] 3.2 Create backend .gitignore
    - Exclude `node_modules/`, `.env`, and `dist/`
    - _Requirements: 4.2_

  - [x] 3.3 Create backend .eslintrc.json
    - Configure with `eslint:recommended` extends
    - Set `env.node` to `true` and `env.es2021` to `true`
    - _Requirements: 4.3_

- [x] 4. Create backend API route, controller, and service stubs
  - [x] 4.1 Create intercept module stubs (route, controller, service)
    - Create `backend/routes/interceptRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/interceptController.js` exporting async handler `(req, res)` that calls service and returns 501
    - Create `backend/services/interceptService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Create inspect module stubs (route, controller, service)
    - Create `backend/routes/inspectRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/inspectController.js` exporting async handler that calls service and returns 501
    - Create `backend/services/inspectService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.3 Create questions module stubs (route, controller, service)
    - Create `backend/routes/questionsRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/questionsController.js` exporting async handler that calls service and returns 501
    - Create `backend/services/questionsService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.4 Create verify module stubs (route, controller, service)
    - Create `backend/routes/verifyRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/verifyController.js` exporting async handler that calls service and returns 501
    - Create `backend/services/verifyService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.5 Create triage module stubs (route, controller, service)
    - Create `backend/routes/triageRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/triageController.js` exporting async handler that calls service and returns 501
    - Create `backend/services/triageService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.6 Create explain module stubs (route, controller, service)
    - Create `backend/routes/explainRoutes.js` exporting an Express Router with `POST /` route
    - Create `backend/controllers/explainController.js` exporting async handler that calls service and returns 501
    - Create `backend/services/explainService.js` exporting async function accepting input object, returning `{}`
    - Wire route → controller → service chain
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Create backend middleware and utility placeholders
  - [x] 5.1 Create middleware placeholders
    - Create `backend/middleware/errorHandler.js` exporting function with signature `(err, req, res, next)` that returns 500 with `{ error: "Internal Server Error" }`
    - Create `backend/middleware/upload.js` exporting a multer instance configured with memory storage
    - _Requirements: 9.1, 9.2_

  - [x] 5.2 Create utility client placeholders
    - Create `backend/utils/bedrockClient.js` exporting `getBedrockClient` function that returns `null`
    - Create `backend/utils/s3Client.js` exporting `getS3Client` function that returns `null`
    - Create `backend/utils/dynamoClient.js` exporting `getDynamoClient` function that returns `null`
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 6. Create backend prompt template files
  - [x] 6.1 Create all prompt template files
    - Create `backend/prompts/emotion-analysis.txt` for Return Interception module
    - Create `backend/prompts/inspection.txt` for Visual Inspection module
    - Create `backend/prompts/adaptive-questions.txt` for Adaptive Question Generation module
    - Create `backend/prompts/claim-verification.txt` for Claim Verification module
    - Create `backend/prompts/triage-explanation.txt` for Explanation Layer module
    - Each file must have a header section with `#` comment prefix containing: module name, expected input variable names (each on its own line), and expected output format description
    - Separate header from body with a blank line
    - Include placeholder text in body indicating where developer writes the prompt
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Wire backend routes into server.js
  - [x] 7.1 Register all route modules in server.js
    - Import all 6 route modules into `server.js`
    - Mount each route at its respective path: `/api/intercept`, `/api/inspect`, `/api/questions`, `/api/verify`, `/api/triage`, `/api/explain`
    - Register the error handler middleware after all routes
    - _Requirements: 5.2, 5.5, 1.3_

- [x] 8. Checkpoint - Backend verification
  - Ensure all backend files are created and syntactically valid. Verify `npm install` and `npm start` would succeed. Ask the user if questions arise.

- [x] 9. Set up frontend directory structure and configuration
  - [x] 9.1 Create frontend directory structure with .gitkeep files
    - Create `frontend/` directory with subdirectories: `src/pages/`, `src/components/`, `src/services/`, `src/hooks/`
    - Place an empty `.gitkeep` file inside each subdirectory
    - _Requirements: 2.1, 2.2_

  - [x] 9.2 Create frontend package.json
    - Create `frontend/package.json` with `name` field set to `"reloop-frontend"`
    - List dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `tailwindcss`
    - List devDependencies: `vite`, `@vitejs/plugin-react`, `postcss`, `autoprefixer`
    - Add `dev` script for Vite dev server and `build` script for production build
    - _Requirements: 2.3_

  - [x] 9.3 Create frontend configuration files
    - Create `frontend/vite.config.js` importing `@vitejs/plugin-react` and exporting config with React plugin
    - Create `frontend/tailwind.config.js` with content paths `./index.html` and `./src/**/*.{js,jsx}`
    - Create `frontend/postcss.config.js` with `tailwindcss` and `autoprefixer` plugins
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 9.4 Create frontend entry point files
    - Create `frontend/index.html` with `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`
    - Create `frontend/src/main.jsx` importing React, ReactDOM, App component, and index.css, rendering App into root element
    - Create `frontend/src/index.css` with the three Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
    - _Requirements: 3.4, 3.5, 3.6_

- [ ] 10. Create frontend page placeholders
  - [x] 10.1 Create all page components
    - Create `frontend/src/pages/LandingPage.jsx` — default export React functional component rendering `<h1>Landing Page</h1>`
    - Create `frontend/src/pages/ReturnFormPage.jsx` — default export rendering `<h1>Return Form</h1>`
    - Create `frontend/src/pages/ImageUploadPage.jsx` — default export rendering `<h1>Image Upload</h1>`
    - Create `frontend/src/pages/QuestionsPage.jsx` — default export rendering `<h1>Questions</h1>`
    - Create `frontend/src/pages/ResultsDashboardPage.jsx` — default export rendering `<h1>Results Dashboard</h1>`
    - Each component must render without props, context, or external state
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 10.2 Create App.jsx with routing
    - Create `frontend/src/App.jsx` with `BrowserRouter`, `Routes`, and one `Route` per page
    - Routes: `/` → LandingPage, `/return` → ReturnFormPage, `/upload` → ImageUploadPage, `/questions` → QuestionsPage, `/results` → ResultsDashboardPage
    - _Requirements: 2.4_

- [x] 11. Create frontend service and hook placeholders
  - [x] 11.1 Create API service file
    - Create `frontend/src/services/api.js` with named export stub functions: `intercept`, `inspect`, `questions`, `verify`, `triage`, `explain`
    - Each function accepts a single object parameter and returns `Promise.resolve({})`
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Create useReturnFlow hook
    - Create `frontend/src/hooks/useReturnFlow.js` exporting a named `useReturnFlow` function that returns `{}`
    - _Requirements: 8.3_

- [x] 12. Checkpoint - Frontend verification
  - Ensure all frontend files are created and syntactically valid. Verify the build would succeed. Ask the user if questions arise.

- [x] 13. Create technical design document
  - [x] 13.1 Create docs/TECHNICAL_DESIGN.md
    - Create `docs/` directory at project root
    - Write `docs/TECHNICAL_DESIGN.md` including:
      - System architecture section with text-based diagram showing Frontend, Backend, Bedrock, S3, DynamoDB connections
      - API contracts for all 6 endpoints (request/response schemas with field names and types)
      - DynamoDB schema (partition key `returnId`, all attributes with types, example JSON record)
      - Module dependency diagram with labeled data-flow arrows between 6 core modules
      - Folder structure as ASCII directory tree with one-sentence descriptions
      - Technology stack section listing each dependency and its role
      - Environment variables section (variable names and purposes, no secret values)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 14. Final checkpoint - Full scaffold verification
  - Ensure all files are created, all JSON is valid, all JS/JSX is syntactically correct. Verify the complete scaffold matches requirements. Ask the user if questions arise.

## Notes

- No property-based tests are included — the scaffold generates static files with no pure functions to test with randomized inputs
- Each task references specific requirements for traceability
- Backend and frontend setup (tasks 2-7 and 9-11) can execute in parallel after root files (task 1) are created
- Checkpoints ensure incremental validation at backend-complete and frontend-complete milestones
- All dependencies use pinned (exact) version numbers per design decision

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "9.1", "9.2"] },
    { "id": 2, "tasks": ["2.3", "3.1", "3.2", "3.3", "9.3", "9.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "5.1", "5.2", "6.1", "10.1", "10.2"] },
    { "id": 4, "tasks": ["7.1", "11.1", "11.2"] },
    { "id": 5, "tasks": ["13.1"] }
  ]
}
```
