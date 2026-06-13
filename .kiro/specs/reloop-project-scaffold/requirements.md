# Requirements Document

## Introduction

This document defines the requirements for scaffolding the Amazon Re:Loop project — an AI-powered Return Intelligence Platform for HackOn 6.0. The scope is strictly limited to generating the complete project folder structure, configuration files, and placeholder files for all six core modules. No feature implementation is included; only the architectural skeleton and technical design documentation are produced.

## Glossary

- **Scaffold**: The complete set of directories, configuration files, and minimal placeholder files that define the project structure without implementing business logic.
- **Frontend_App**: The React + Vite + Tailwind CSS client application.
- **Backend_App**: The Express.js (Node.js) server application.
- **Module**: A logical unit of functionality within Re:Loop (Return Interception, Visual Inspection, Adaptive Question Generation, Claim Verification, Triage Engine, Recommendation Dashboard).
- **Placeholder_File**: A file containing only the minimum boilerplate (e.g., empty export, stub function signature, or comment header) sufficient to establish the file's purpose without implementing logic.
- **Configuration_File**: A file that defines build, lint, format, or runtime settings (e.g., vite.config.js, tailwind.config.js, .eslintrc, package.json, .env.example).
- **Technical_Design_Document**: A markdown file describing the system architecture, module boundaries, API contracts, data models, and technology choices.
- **Prompt_Template**: A text file containing a placeholder or skeleton for an Amazon Bedrock prompt used by a specific module.
- **DynamoDB_Table**: The Returns table in Amazon DynamoDB with partition key returnId.
- **API_Route**: An Express.js route definition mapping an HTTP method and path to a controller function.

## Requirements

### Requirement 1: Backend Directory Structure

**User Story:** As a developer, I want a complete backend folder structure with all necessary subdirectories, so that I can immediately begin implementing module logic without first creating directories.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `backend/` directory at the project root containing the subdirectories `routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, and `prompts/`.
2. THE Scaffold SHALL create a file named `.gitkeep` with empty content inside each backend subdirectory to prevent empty-directory issues in version control.
3. WHEN the backend folder structure is generated, THE Scaffold SHALL include a `backend/server.js` file that contains Express import, app initialization, `cors` middleware registration, `dotenv` configuration invocation, a port variable reading from `process.env.PORT` with a fallback of `3000`, and an `app.listen` call binding to that port.
4. THE Scaffold SHALL create a `backend/package.json` file that includes a `name` field, a `start` script set to run `server.js`, and lists `express`, `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `cors`, `dotenv`, and `multer` as dependencies with pinned (exact) version numbers.
5. WHEN a developer runs `npm install` followed by `npm start` inside the `backend/` directory, THE Scaffold-generated files SHALL allow the Express server to start without errors and listen on the configured port.

### Requirement 2: Frontend Directory Structure

**User Story:** As a developer, I want a complete frontend folder structure with all necessary subdirectories, so that I can immediately begin building UI components without setup overhead.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `frontend/` directory at the project root containing the subdirectories `src/pages/`, `src/components/`, `src/services/`, and `src/hooks/`.
2. THE Scaffold SHALL create a file named `.gitkeep` with empty content inside each frontend subdirectory to establish the directory in version control.
3. THE Scaffold SHALL create a `frontend/package.json` file listing `react`, `react-dom`, `react-router-dom`, `axios`, and `tailwindcss` as dependencies, and `vite`, `@vitejs/plugin-react`, `postcss`, and `autoprefixer` as dev dependencies.
4. THE Scaffold SHALL create a minimal `frontend/src/App.jsx` file containing a React Router `BrowserRouter` with `Routes` and one `Route` element per page (Landing, Return Form, Image Upload, Questions, Results/Dashboard).

### Requirement 3: Frontend Configuration Files

**User Story:** As a developer, I want all frontend build and styling configuration files pre-created, so that the development server starts without manual configuration.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `frontend/vite.config.js` file that imports `@vitejs/plugin-react` and exports a configuration object with the React plugin included in the plugins array.
2. THE Scaffold SHALL create a `frontend/tailwind.config.js` file with content paths pointing to `./index.html` and `./src/**/*.{js,jsx}`.
3. THE Scaffold SHALL create a `frontend/postcss.config.js` file with tailwindcss and autoprefixer plugins.
4. THE Scaffold SHALL create a `frontend/src/index.css` file containing the three Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) in that order and no other style rules.
5. THE Scaffold SHALL create a `frontend/index.html` file that contains a `<div id="root"></div>` mount element in the body and a `<script type="module" src="/src/main.jsx"></script>` entry point tag.
6. THE Scaffold SHALL create a `frontend/src/main.jsx` file that imports React, ReactDOM, the `App` component, and `index.css`, then renders the App component into the root DOM element.

### Requirement 4: Backend Configuration Files

**User Story:** As a developer, I want backend configuration files pre-created, so that I can start the server and connect to AWS services without additional setup steps.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `backend/.env.example` file listing all required environment variables (`PORT`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `DYNAMODB_TABLE_NAME`, `BEDROCK_MODEL_ID`) with placeholder values indicating expected format for each variable.
2. THE Scaffold SHALL create a `backend/.gitignore` file that excludes `node_modules/`, `.env`, and `dist/`.
3. WHEN the backend configuration is generated, THE Scaffold SHALL include a `.eslintrc.json` file configured with `eslint:recommended` rules and `env.node` set to `true`.

### Requirement 5: API Route Placeholders

**User Story:** As a developer, I want all six API route files pre-created with stub endpoints, so that I can see the full API surface area and begin implementing handlers individually.

#### Acceptance Criteria

1. THE Scaffold SHALL create one route file per API endpoint inside the `backend/routes/` directory for each of the following: `POST /api/intercept`, `POST /api/inspect`, `POST /api/questions`, `POST /api/verify`, `POST /api/triage`, and `POST /api/explain`.
2. WHEN a route Placeholder_File is created, THE Scaffold SHALL export an Express Router instance with the POST route path registered, the handler delegating to the corresponding controller stub function, and the route returning an HTTP 501 status with a JSON body containing a `message` field indicating the endpoint is not yet implemented.
3. THE Scaffold SHALL create one controller Placeholder_File per module inside the `backend/controllers/` directory, each exporting an async function that accepts `(req, res)` parameters and calls the corresponding service stub before returning the placeholder response.
4. THE Scaffold SHALL create one service Placeholder_File per module inside the `backend/services/` directory, each exporting an async function that accepts an input object parameter and returns an empty object.
5. WHEN any stub endpoint is called, THE Scaffold SHALL ensure the route-controller-service chain executes without throwing errors and responds within 200 milliseconds.

### Requirement 6: Prompt Template Files

**User Story:** As a developer, I want prompt template files pre-created for each AI-powered module, so that I can iteratively develop prompts without creating files from scratch.

#### Acceptance Criteria

1. THE Scaffold SHALL create the following Prompt_Template files inside `backend/prompts/`: `emotion-analysis.txt`, `inspection.txt`, `adaptive-questions.txt`, `claim-verification.txt`, and `triage-explanation.txt`.
2. WHEN a Prompt_Template file is created, THE Scaffold SHALL include a header section at the top of the file containing: the module name it serves, a list of expected input variable names each on its own line, and the expected output format description.
3. WHEN a Prompt_Template file is created, THE Scaffold SHALL separate the header section from the prompt body section using a blank line, and SHALL include placeholder text in the body section indicating where the developer should write the prompt.
4. THE Scaffold SHALL use a consistent header format across all Prompt_Template files, where each header line is prefixed with a `#` comment marker.

### Requirement 7: Frontend Page Placeholders

**User Story:** As a developer, I want placeholder page components for the full user flow, so that routing works end-to-end and I can implement one page at a time.

#### Acceptance Criteria

1. THE Scaffold SHALL create Placeholder_Files in the `frontend/src/pages/` directory for the following pages: Landing Page, Return Form Page, Image Upload Page, Questions Page, Results/Dashboard Page.
2. WHEN a page Placeholder_File is created, THE Scaffold SHALL export a default React functional component that renders the page name as an `<h1>` heading element and no other content.
3. WHEN a page Placeholder_File is created, THE Scaffold SHALL ensure the component renders without requiring any props, context providers, or external state.

### Requirement 8: Frontend Service and Hook Placeholders

**User Story:** As a developer, I want placeholder service and hook files, so that the data-fetching and state-management layer is architecturally visible from the start.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `frontend/src/services/api.js` file containing named export stub functions for each backend API endpoint: `intercept`, `inspect`, `questions`, `verify`, `triage`, and `explain`.
2. WHEN a stub function in `api.js` is called, THE function SHALL accept a single object parameter and return a resolved Promise with an empty object.
3. THE Scaffold SHALL create a `frontend/src/hooks/useReturnFlow.js` file exporting a named `useReturnFlow` function that returns an empty object.

### Requirement 9: Middleware and Utility Placeholders

**User Story:** As a developer, I want middleware and utility files pre-created, so that cross-cutting concerns have designated locations from the start.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `backend/middleware/errorHandler.js` Placeholder_File exporting a function with the Express error-handling signature `(err, req, res, next)` that returns a JSON response with a `500` status code and an `error` message field.
2. THE Scaffold SHALL create a `backend/middleware/upload.js` Placeholder_File exporting a multer instance configured with memory storage.
3. THE Scaffold SHALL create a `backend/utils/bedrockClient.js` Placeholder_File exporting a function named `getBedrockClient` that returns `null` as a placeholder.
4. THE Scaffold SHALL create a `backend/utils/s3Client.js` Placeholder_File exporting a function named `getS3Client` that returns `null` as a placeholder.
5. THE Scaffold SHALL create a `backend/utils/dynamoClient.js` Placeholder_File exporting a function named `getDynamoClient` that returns `null` as a placeholder.

### Requirement 10: Technical Design Document

**User Story:** As a developer and hackathon judge, I want a comprehensive technical design document, so that the architecture, module boundaries, data flow, and technology choices are clearly documented.

#### Acceptance Criteria

1. THE Scaffold SHALL create a `docs/TECHNICAL_DESIGN.md` file at the project root.
2. THE Technical_Design_Document SHALL describe the system architecture including Frontend_App, Backend_App, Amazon Bedrock, Amazon S3, and DynamoDB_Table, with a text-based architecture diagram showing the connections between these components.
3. THE Technical_Design_Document SHALL define the API contract for each backend endpoint (POST /api/intercept, POST /api/inspect, POST /api/questions, POST /api/verify, POST /api/triage, POST /api/explain) including request body schema with field names and types, and response body schema with field names and types.
4. THE Technical_Design_Document SHALL describe the DynamoDB_Table schema including partition key (returnId), expected attributes with their data types, and at least one example item in JSON format.
5. THE Technical_Design_Document SHALL include a text-based module dependency diagram showing data flow between the six core modules (Return Interception, Visual Inspection, Adaptive Question Generation, Claim Verification, Triage Engine, Recommendation Dashboard) with labeled arrows indicating what data passes between them.
6. THE Technical_Design_Document SHALL document the folder structure with an ASCII directory tree covering both frontend/ and backend/ directories, and a one-sentence description of each directory's purpose.
7. THE Technical_Design_Document SHALL include a technology stack section listing each dependency (React, Vite, Tailwind CSS, React Router, Node.js, Express.js, AWS SDK v3, Amazon Bedrock with Claude Sonnet) along with its role in the system.
8. THE Technical_Design_Document SHALL document the environment variables required to run the system, listing each variable name and its purpose without including actual secret values.

### Requirement 11: Root-Level Project Files

**User Story:** As a developer, I want root-level configuration and documentation files, so that the project is immediately recognizable and manageable as a monorepo.

#### Acceptance Criteria

1. THE Scaffold SHALL create a root `.gitignore` file that excludes `node_modules/`, `.env`, `dist/`, `.DS_Store`, and `Thumbs.db`.
2. THE Scaffold SHALL create a root `package.json` that includes a `name` field, a `workspaces` field listing the `frontend` and `backend` directories, and workspace scripts named `dev:frontend` and `dev:backend` for starting each application.
3. IF a `README.md` already exists at the project root, THEN THE Scaffold SHALL preserve the existing file without modification.
4. IF no `README.md` exists at the project root, THEN THE Scaffold SHALL create a `README.md` containing the project name and a brief description of the monorepo structure.
5. IF a `.gitignore` or `package.json` already exists at the project root, THEN THE Scaffold SHALL overwrite the existing file with the generated content.
