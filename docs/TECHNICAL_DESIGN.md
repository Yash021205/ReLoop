# Amazon Re:Loop — Technical Design Document

## Introduction

Amazon Re:Loop is an AI-powered Return Intelligence Platform built for HackOn 6.0. The system transforms the e-commerce return process by combining Amazon Bedrock's generative AI capabilities with deterministic rule-based logic to classify return intent, inspect product condition, verify claims, and route returned products to their highest-value next-life pathway.

This document describes the system architecture, API contracts, data models, module interactions, and technology choices.

---

## 1. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTP (axios)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND (Vite + Tailwind CSS)                │
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  Pages   │  │  Components  │  │   Services    │  │    Hooks     │  │
│  │(5 views) │  │ (reusable UI)│  │(API wrappers) │  │(shared state)│  │
│  └──────────┘  └──────────────┘  └───────────────┘  └──────────────┘  │
│                                                                          │
│  Tech: React 18 · React Router 6 · Tailwind CSS 3 · Axios              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ REST API (JSON + multipart/form-data)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (Node.js)                            │
│                                                                          │
│  ┌─────────┐   ┌─────────────┐   ┌───────────┐   ┌─────────────────┐  │
│  │ Routes  │ → │ Controllers │ → │  Services │ → │ AWS SDK Clients │  │
│  │(6 POST) │   │  (6 files)  │   │ (6 files) │   │ (3 utilities)   │  │
│  └─────────┘   └─────────────┘   └───────────┘   └────────┬────────┘  │
│  ┌──────────────┐   ┌──────────────┐                       │           │
│  │  Middleware  │   │   Prompts    │                       │           │
│  │(error, upload)│   │ (5 .txt files)│                       │           │
│  └──────────────┘   └──────────────┘                       │           │
│                                                             │           │
│  Tech: Express 4 · AWS SDK v3 · multer · cors · dotenv     │           │
└─────────────────────────────────────────────────────────────┼───────────┘
                                                              │
                  ┌───────────────────────────────────────────┼───────────┐
                  │                  AWS CLOUD                 │           │
                  │                                            │           │
                  │   ┌────────────────────┐                  │           │
                  │   │   Amazon Bedrock   │◄─────────────────┤           │
                  │   │                    │                  │           │
                  │   │ • Claude Sonnet    │  (Text analysis) │           │
                  │   │   - Intent class.  │                  │           │
                  │   │   - Questions gen  │                  │           │
                  │   │   - Verification   │                  │           │
                  │   │   - Explanation    │                  │           │
                  │   │                    │                  │           │
                  │   │ • Claude Vision    │  (Image inspect) │           │
                  │   │   - Damage detect  │                  │           │
                  │   │   - Condition score│                  │           │
                  │   └────────────────────┘                  │           │
                  │                                            │           │
                  │   ┌────────────────────┐                  │           │
                  │   │    Amazon S3       │◄─────────────────┤           │
                  │   │  (Product Images)  │                  │           │
                  │   │                    │                  │           │
                  │   │  Bucket:           │                  │           │
                  │   │  reloop-images-dev │                  │           │
                  │   └────────────────────┘                  │           │
                  │                                            │           │
                  │   ┌────────────────────┐                  │           │
                  │   │  Amazon DynamoDB   │◄─────────────────┘           │
                  │   │  Table: Returns    │                              │
                  │   │  PK: returnId      │                              │
                  │   └────────────────────┘                              │
                  │                                                        │
                  └────────────────────────────────────────────────────────┘
```

### Data Flow Summary

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  React   │  HTTP    │ Express  │  SDK     │   AWS    │
│ Frontend │ ──────→  │ Backend  │ ──────→  │  Cloud   │
│          │ ◄──────  │          │ ◄──────  │          │
└──────────┘  JSON    └──────────┘  API     └──────────┘

1. Frontend → Backend: User submits return form data (JSON)
2. Backend → Bedrock: Sends prompt + data for AI analysis
3. Bedrock → Backend: Returns AI classification/analysis
4. Frontend → Backend: User uploads image (multipart)
5. Backend → S3: Stores image, gets object key
6. Backend → Bedrock (Vision): Sends image for inspection
7. Backend → DynamoDB: Persists return record with scores
8. Backend → Frontend: Returns triage result + explanation
```

---

## 2. API Contracts

All endpoints accept POST requests and return JSON responses.

### POST /api/intercept — Return Intent Classification

Classifies the customer's return intent using Amazon Bedrock (Claude Sonnet text model).

**Request:**
```json
{
  "productName": "Wireless Earbuds Pro",
  "returnReason": "Product not working properly",
  "customerExplanation": "Left earbud stopped producing sound after 2 weeks of normal use."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productName` | string | Yes | Name of the product being returned |
| `returnReason` | string | Yes | Short reason selected or typed by customer |
| `customerExplanation` | string | Yes | Detailed free-text explanation from customer |

**Response (200 OK):**
```json
{
  "intentCategory": "Genuine Defect",
  "confidence": 92,
  "analysis": "Customer describes a specific hardware failure with a clear timeline.",
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `intentCategory` | string | One of: "Genuine Defect", "Preference Mismatch", "Wrong Variant", "Accidental Purchase", "Impulse Regret", "External Circumstance" |
| `confidence` | number | 0–100 confidence score |
| `analysis` | string | Brief AI explanation of classification |
| `returnId` | string | Generated unique return identifier |

---

### POST /api/inspect — Visual Inspection via Claude Vision

Analyzes uploaded product images using Amazon Bedrock (Claude Sonnet Vision model).

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Product image (JPEG or PNG, max 5 MB) |
| `productName` | string | Yes | Product name for context |
| `returnId` | string | Yes | Associated return ID |

**Response (200 OK):**
```json
{
  "damage_detected": true,
  "damage_summary": "Minor scratch on charging case exterior. Both earbuds physically intact.",
  "condition_score": 82,
  "packaging_score": 75,
  "accessory_completeness": 100,
  "details": {
    "scratches": true,
    "cracks": false,
    "missing_components": false,
    "packaging_quality": "good",
    "visible_wear": "minimal"
  },
  "imageKey": "returns/RET-20250115-001/img1.jpg"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `damage_detected` | boolean | Whether any damage was found |
| `damage_summary` | string | Human-readable damage description |
| `condition_score` | number | 0–100 overall condition score |
| `packaging_score` | number | 0–100 packaging condition score |
| `accessory_completeness` | number | 0–100 completeness of accessories |
| `details` | object | Granular inspection findings |
| `imageKey` | string | S3 object key where image was stored |

---

### POST /api/questions — Adaptive Question Generation

Generates targeted follow-up questions based on product category and inspection context.

**Request:**
```json
{
  "productCategory": "Electronics - Audio",
  "returnReason": "Product not working properly",
  "inspectionResult": {
    "condition_score": 82,
    "damage_detected": true,
    "damage_summary": "Minor scratch on charging case"
  },
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productCategory` | string | Yes | Product category for context-aware questions |
| `returnReason` | string | Yes | The return reason from interception |
| `inspectionResult` | object | Yes | Output from /api/inspect |
| `returnId` | string | Yes | Associated return ID |

**Response (200 OK):**
```json
{
  "questions": [
    "Does the right earbud still produce sound normally?",
    "Does the charging case charge both earbuds when placed inside?",
    "Have you tried resetting the earbuds by holding the button for 10 seconds?",
    "Are there any issues with Bluetooth connectivity on either earbud?"
  ],
  "questionCount": 4,
  "category": "Electronics - Audio"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `questions` | string[] | 3–5 targeted diagnostic questions |
| `questionCount` | number | Number of questions generated |
| `category` | string | Echo of product category |

---

### POST /api/verify — Claim Verification

Cross-references customer claims against inspection evidence and question responses.

**Request:**
```json
{
  "customerClaim": "Left earbud stopped producing sound after 2 weeks of normal use",
  "inspectionFindings": {
    "condition_score": 82,
    "damage_detected": true,
    "damage_summary": "Minor scratch on charging case exterior"
  },
  "questionResponses": [
    { "question": "Does the right earbud still produce sound?", "answer": "Yes, right side works perfectly" },
    { "question": "Does the charging case charge both earbuds?", "answer": "Yes, both charge fine" }
  ],
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerClaim` | string | Yes | The customer's original claim |
| `inspectionFindings` | object | Yes | Output from /api/inspect |
| `questionResponses` | array | Yes | Array of question/answer pairs |
| `returnId` | string | Yes | Associated return ID |

**Response (200 OK):**
```json
{
  "consistency_score": 88,
  "verification_summary": "Customer claim of left earbud failure is consistent with the evidence.",
  "flags": [],
  "claim_status": "consistent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `consistency_score` | number | 0–100 consistency between claim and evidence |
| `verification_summary` | string | AI-generated verification analysis |
| `flags` | string[] | Any inconsistencies detected (empty if none) |
| `claim_status` | string | "consistent", "partially_consistent", or "inconsistent" |

---

### POST /api/triage — Deterministic Triage Routing

Routes the product to its highest-value next-life category using **deterministic, rule-based scoring logic**. This endpoint does NOT use AI for the routing decision.

**Request:**
```json
{
  "conditionScore": 82,
  "consistencyScore": 88,
  "packagingScore": 75,
  "accessoryCompleteness": 100,
  "productCategory": "Electronics - Audio",
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conditionScore` | number | Yes | 0–100 from visual inspection |
| `consistencyScore` | number | Yes | 0–100 from claim verification |
| `packagingScore` | number | Yes | 0–100 from inspection |
| `accessoryCompleteness` | number | Yes | 0–100 from inspection |
| `productCategory` | string | Yes | Product category |
| `returnId` | string | Yes | Associated return ID |

**Response (200 OK):**
```json
{
  "recommended_path": "Open Box",
  "confidence": 85,
  "scores": {
    "verified_like_new": 62,
    "open_box": 85,
    "certified_refurbished": 70,
    "parts_recovery": 20,
    "donation": 15,
    "recycling": 5
  },
  "reasoning": "Condition score (82) and consistency (88) are strong but packaging score (75) falls below Verified Like-New threshold."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `recommended_path` | string | One of: "Verified Like-New", "Open Box", "Certified Refurbished", "Parts Recovery", "Donation", "Recycling" |
| `confidence` | number | 0–100 confidence in the selected path |
| `scores` | object | Individual pathway scores for transparency |
| `reasoning` | string | Rule-based explanation of why this path was selected |

---

### POST /api/explain — AI Explanation of Triage Decision

Generates a human-readable explanation of the triage result. Runs AFTER the deterministic triage decision.

**Request:**
```json
{
  "triageResult": {
    "recommended_path": "Open Box",
    "confidence": 85,
    "scores": { "verified_like_new": 62, "open_box": 85, "certified_refurbished": 70 }
  },
  "allModuleOutputs": {
    "interception": { "intentCategory": "Genuine Defect", "confidence": 92 },
    "inspection": { "condition_score": 82, "damage_summary": "Minor scratch on case" },
    "verification": { "consistency_score": 88, "claim_status": "consistent" }
  },
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `triageResult` | object | Yes | Complete output from /api/triage |
| `allModuleOutputs` | object | Yes | Outputs from all prior modules |
| `returnId` | string | Yes | Associated return ID |

**Response (200 OK):**
```json
{
  "explanation": "Your Wireless Earbuds Pro have been routed to the Open Box pathway. The product is in good condition with all accessories present, but minor cosmetic wear prevents Verified Like-New status.",
  "factors": [
    { "factor": "Condition Score", "value": 82, "impact": "positive" },
    { "factor": "Claim Consistency", "value": 88, "impact": "positive" },
    { "factor": "Packaging Condition", "value": 75, "impact": "limiting" },
    { "factor": "Accessory Completeness", "value": 100, "impact": "positive" }
  ],
  "summary": "Good condition with minor cosmetic wear → Open Box"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `explanation` | string | Customer-friendly explanation paragraph |
| `factors` | array | Scored factors with impact classification |
| `summary` | string | One-line summary of the decision |

---

## 3. DynamoDB Schema

### Table: Returns

| Setting | Value |
|---------|-------|
| Table Name | `Returns` (configurable via `DYNAMODB_TABLE_NAME`) |
| Partition Key | `returnId` (String) |
| Sort Key | None (single-table design, one item per return) |
| Billing Mode | On-Demand (PAY_PER_REQUEST) |
| Region | Configurable via `AWS_REGION` |

### Attribute Definitions

| Attribute | DynamoDB Type | Description |
|-----------|--------------|-------------|
| `returnId` | S (String) | Unique ID, partition key |
| `productName` | S (String) | Name of returned product |
| `productCategory` | S (String) | Product category |
| `returnReason` | S (String) | Customer-provided reason |
| `customerExplanation` | S (String) | Detailed explanation |
| `intentCategory` | S (String) | AI-classified intent |
| `conditionScore` | N (Number) | 0–100 from visual inspection |
| `consistencyScore` | N (Number) | 0–100 from claim verification |
| `packagingScore` | N (Number) | 0–100 for packaging |
| `accessoryCompleteness` | N (Number) | 0–100 for accessories |
| `recommendedPath` | S (String) | Final triage decision |
| `confidence` | N (Number) | 0–100 triage confidence |
| `imageKeys` | L (List of S) | S3 object keys for images |
| `questionResponses` | L (List of M) | Question/answer pairs |
| `triageScores` | M (Map) | Per-pathway scores |
| `status` | S (String) | Return processing status |
| `createdAt` | S (String) | ISO 8601 timestamp |
| `updatedAt` | S (String) | ISO 8601 last update |

### Example Record

```json
{
  "returnId": "RET-20250115-001",
  "productName": "Wireless Earbuds Pro",
  "productCategory": "Electronics - Audio",
  "returnReason": "Product not working properly",
  "customerExplanation": "Left earbud stopped producing sound after 2 weeks of normal use",
  "intentCategory": "Genuine Defect",
  "conditionScore": 82,
  "consistencyScore": 88,
  "packagingScore": 75,
  "accessoryCompleteness": 100,
  "recommendedPath": "Open Box",
  "confidence": 85,
  "imageKeys": ["returns/RET-20250115-001/img1.jpg", "returns/RET-20250115-001/img2.jpg"],
  "questionResponses": [
    { "question": "Does the right earbud work?", "answer": "Yes, works perfectly" },
    { "question": "Does charging work?", "answer": "Yes, both charge fine" }
  ],
  "triageScores": {
    "verified_like_new": 62,
    "open_box": 85,
    "certified_refurbished": 70,
    "parts_recovery": 20,
    "donation": 15,
    "recycling": 5
  },
  "status": "completed",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:45:00Z"
}
```

---

## 4. Module Dependency Diagram

The six core modules form a pipeline where each module's output feeds into subsequent stages:

```
Customer Input
      │
      ▼
┌─────────────────┐    returnReason, explanation
│ Return          │────────────────────────────────┐
│ Interception    │                                │
│ POST /api/      │                                │
│ intercept       │                                │
└────────┬────────┘                                │
         │ intentCategory                          │
         ▼                                         ▼
┌─────────────────┐                     ┌─────────────────┐
│ Visual          │                     │ Adaptive        │
│ Inspection      │                     │ Question Gen    │
│ POST /api/      │                     │ POST /api/      │
│ inspect         │                     │ questions       │
└────────┬────────┘                     └────────┬────────┘
         │ conditionScore, damageSummary          │ questions[]
         │                                        │
         ▼                                        ▼
┌─────────────────────────────────────────────────────────┐
│              Claim Verification                           │
│              POST /api/verify                             │
│  Inputs: claim + inspectionResult + questionResponses    │
└────────────────────────────┬────────────────────────────┘
                             │ consistencyScore
                             ▼
┌─────────────────────────────────────────────────────────┐
│        Triage Engine (DETERMINISTIC RULES)                │
│              POST /api/triage                             │
│  Inputs: conditionScore, consistencyScore,               │
│          packagingScore, accessoryCompleteness,           │
│          productCategory                                 │
│                                                          │
│  ⚠️  AI does NOT make the final routing decision.        │
│  Final category is computed by scoring rules.            │
└────────────────────────────┬────────────────────────────┘
                             │ recommendedPath, confidence
                             ▼
┌─────────────────────────────────────────────────────────┐
│              AI Explanation Layer                         │
│              POST /api/explain                            │
│  AI generates human-readable explanation AFTER           │
│  the deterministic decision has been made.               │
└────────────────────────────┬────────────────────────────┘
                             │ explanation
                             ▼
                    Results Dashboard (Frontend)
```

### Module Dependencies Summary

| Module | Depends On | Data Received |
|--------|-----------|---------------|
| Return Interception | None (entry point) | Customer form input |
| Visual Inspection | Return Interception | returnId |
| Adaptive Questions | Interception + Inspection | returnReason, inspectionResult |
| Claim Verification | Inspection + Questions | inspectionFindings, questionResponses |
| Triage Engine | Inspection + Verification | conditionScore, consistencyScore, packagingScore, accessoryCompleteness |
| Explanation Layer | All prior modules | triageResult, allModuleOutputs |

---

## 5. Folder Structure

```
reloop/
├── package.json                  # Root workspace config (npm workspaces)
├── .gitignore                    # Root git exclusions
├── README.md                     # Project overview and setup instructions
│
├── backend/                      # Express.js API server
│   ├── package.json              # Backend dependencies (pinned versions)
│   ├── server.js                 # Express app entry point and route registration
│   ├── .env.example              # Environment variable template (no secrets)
│   ├── .gitignore                # Backend-specific git exclusions
│   ├── .eslintrc.json            # ESLint configuration for Node.js
│   ├── routes/                   # Express Router definitions (one per endpoint)
│   │   ├── interceptRoutes.js
│   │   ├── inspectRoutes.js
│   │   ├── questionsRoutes.js
│   │   ├── verifyRoutes.js
│   │   ├── triageRoutes.js
│   │   └── explainRoutes.js
│   ├── controllers/              # Request parsing and response formatting
│   │   ├── interceptController.js
│   │   ├── inspectController.js
│   │   ├── questionsController.js
│   │   ├── verifyController.js
│   │   ├── triageController.js
│   │   └── explainController.js
│   ├── services/                 # Business logic and AWS SDK interactions
│   │   ├── interceptService.js
│   │   ├── inspectService.js
│   │   ├── questionsService.js
│   │   ├── verifyService.js
│   │   ├── triageService.js
│   │   └── explainService.js
│   ├── middleware/               # Cross-cutting concerns
│   │   ├── errorHandler.js       # Global error handler (500 responses)
│   │   └── upload.js             # Multer configuration for image uploads
│   ├── utils/                    # AWS SDK client factories
│   │   ├── bedrockClient.js      # Amazon Bedrock client wrapper
│   │   ├── s3Client.js           # Amazon S3 client wrapper
│   │   └── dynamoClient.js       # Amazon DynamoDB client wrapper
│   └── prompts/                  # Bedrock prompt templates
│       ├── emotion-analysis.txt  # Return intent classification prompt
│       ├── inspection.txt        # Visual damage detection prompt
│       ├── adaptive-questions.txt # Follow-up question generation prompt
│       ├── claim-verification.txt # Claim vs evidence consistency prompt
│       └── triage-explanation.txt # Decision explanation prompt
│
├── frontend/                     # React + Vite client application
│   ├── package.json              # Frontend dependencies
│   ├── index.html                # HTML entry point with root mount
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS content paths
│   ├── postcss.config.js         # PostCSS plugin registration
│   └── src/
│       ├── main.jsx              # React DOM render entry point
│       ├── App.jsx               # Router and page route definitions
│       ├── index.css             # Tailwind CSS directives
│       ├── pages/                # Route-level page components
│       │   ├── LandingPage.jsx
│       │   ├── ReturnFormPage.jsx
│       │   ├── ImageUploadPage.jsx
│       │   ├── QuestionsPage.jsx
│       │   └── ResultsDashboardPage.jsx
│       ├── components/           # Reusable UI components
│       ├── services/             # HTTP API client wrappers (axios)
│       │   └── api.js
│       └── hooks/                # Shared stateful logic
│           └── useReturnFlow.js
│
└── docs/                         # Architecture documentation
    └── TECHNICAL_DESIGN.md       # This document
```

---

## 6. Technology Stack

| Technology | Version | Role |
|-----------|---------|------|
| **Node.js** | 18+ | Server runtime for backend |
| **Express.js** | 4.x | HTTP framework for REST API |
| **React** | 18.x | Frontend UI library |
| **Vite** | 5.x | Frontend build tool and dev server |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.x | HTTP client for frontend API calls |
| **AWS SDK v3 (Bedrock Runtime)** | 3.x | Amazon Bedrock model invocation |
| **AWS SDK v3 (S3)** | 3.x | Amazon S3 image storage |
| **AWS SDK v3 (DynamoDB)** | 3.x | Amazon DynamoDB data persistence |
| **AWS SDK v3 (lib-dynamodb)** | 3.x | DynamoDB document client abstraction |
| **multer** | 1.x | Multipart form-data parsing (image uploads) |
| **cors** | 2.x | Cross-Origin Resource Sharing middleware |
| **dotenv** | 16.x | Environment variable loading from .env files |
| **Amazon Bedrock (Claude Sonnet)** | — | Text analysis: intent classification, question generation, verification, explanation |
| **Amazon Bedrock (Claude Vision)** | — | Image analysis: damage detection, condition scoring |
| **Amazon S3** | — | Object storage for product images |
| **Amazon DynamoDB** | — | NoSQL database for return records |

---

## 7. Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Express server listening port (default: 3001) |
| `AWS_REGION` | AWS region for all service clients (e.g., us-east-1) |
| `AWS_ACCESS_KEY_ID` | IAM access key for AWS authentication |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for AWS authentication |
| `S3_BUCKET_NAME` | S3 bucket name for storing product images |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name for return records |
| `BEDROCK_MODEL_ID` | Bedrock model identifier for AI invocations |

> **Note:** Never commit actual secret values. Use the `backend/.env.example` file as a template and create a local `.env` file with real credentials.

---

## 8. Key Design Decisions

1. **Deterministic Triage** — AI is used for analysis (classification, inspection, verification, explanation) but the final routing decision is made by rule-based scoring logic. This ensures transparency, predictability, and testability.

2. **Monorepo with npm workspaces** — Simplifies dependency management with a single `npm install` at root level while keeping frontend and backend codebases separate.

3. **Route → Controller → Service pattern** — Each API endpoint follows a three-layer architecture for clear separation of concerns and easy unit testing.

4. **Pinned dependency versions** — All `package.json` files use exact versions for reproducible installs across team members.

5. **Memory-storage multer** — Avoids filesystem configuration complexity; images are buffered in memory, sent to Bedrock for analysis, and uploaded to S3 in parallel.
