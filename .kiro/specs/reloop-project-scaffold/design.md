# Design Document: Re:Loop Project Scaffold

## Overview

This design defines the complete project scaffold for Amazon Re:Loop — an AI-powered Return Intelligence Platform for HackOn 6.0. The scaffold produces the directory structure, configuration files, and placeholder/stub files necessary for a developer to begin implementing feature logic immediately.

The scaffold targets a monorepo layout with two workspaces (`frontend/` and `backend/`), plus a `docs/` directory for architecture documentation. No business logic is implemented; every module file contains only the minimum boilerplate to establish purpose and pass a startup check.

### Design Decisions

1. **Monorepo with npm workspaces** — simplifies dependency management and allows a single `npm install` at root level while keeping frontend and backend codebases separate.
2. **Stub chain pattern (route → controller → service)** — each API endpoint has three corresponding files wired together so the call chain executes without errors, returning HTTP 501 to signal "not implemented."
3. **Pinned dependency versions** — all `package.json` files use exact versions to ensure reproducible installs across team members during the hackathon.
4. **Memory-storage multer** — avoids filesystem configuration complexity during scaffolding; production implementation will switch to S3 streaming.
5. **Deterministic triage** — the Triage Engine uses rule-based scoring logic; AI is only used for analysis (intent classification, inspection, verification) and explanation, never for the final routing decision.

## Architecture

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

### Data Flow Between Services

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  React   │  HTTP    │ Express  │  SDK     │   AWS    │
│ Frontend │ ──────→  │ Backend  │ ──────→  │  Cloud   │
│          │ ◄──────  │          │ ◄──────  │          │
└──────────┘  JSON    └──────────┘  API     └──────────┘

Flow:
1. Frontend → Backend: User submits return form data (JSON)
2. Backend → Bedrock: Sends prompt + data for AI analysis
3. Bedrock → Backend: Returns AI classification/analysis
4. Frontend → Backend: User uploads image (multipart)
5. Backend → S3: Stores image, gets object key
6. Backend → Bedrock (Vision): Sends image for inspection
7. Backend → DynamoDB: Persists return record with scores
8. Backend → Frontend: Returns triage result + explanation
```

### Module Data Flow Diagram

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

## Components and Interfaces

### Backend Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Routes | `backend/routes/` | Map HTTP endpoints to controller functions |
| Controllers | `backend/controllers/` | Parse request, call service, format response |
| Services | `backend/services/` | Business logic and AWS SDK interactions |
| Middleware | `backend/middleware/` | Cross-cutting concerns (error handling, file upload) |
| Utils | `backend/utils/` | AWS client factories (Bedrock, S3, DynamoDB) |
| Prompts | `backend/prompts/` | Text templates for Bedrock invocations |

### Frontend Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| Pages | `frontend/src/pages/` | Route-level React components for each step |
| Components | `frontend/src/components/` | Reusable UI elements |
| Services | `frontend/src/services/` | HTTP client wrappers (axios) |
| Hooks | `frontend/src/hooks/` | Shared stateful logic |

### Route → Controller → Service Wiring

Each module follows an identical pattern in the scaffold:

```
routes/{module}Routes.js
  └─ imports controller from controllers/{module}Controller.js
       └─ imports service from services/{module}Service.js
            └─ returns {} (placeholder)
```

The route registers a POST handler, the controller calls the service, the service returns an empty object, and the controller responds with HTTP 501.

---

## API Contracts

### POST /api/intercept — Return Intent Classification

Classifies the customer's return intent using Amazon Bedrock (Claude Sonnet text model).

**Request:**
```json
POST /api/intercept
Content-Type: application/json

{
  "productName": "Wireless Earbuds Pro",
  "returnReason": "Product not working properly",
  "customerExplanation": "Left earbud stopped producing sound after 2 weeks of normal use. Right earbud works fine."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productName` | string | Yes | Name of the product being returned |
| `returnReason` | string | Yes | Short reason selected or typed by customer |
| `customerExplanation` | string | Yes | Detailed free-text explanation from customer |

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

{
  "intentCategory": "Genuine Defect",
  "confidence": 92,
  "analysis": "Customer describes a specific hardware failure (left earbud audio loss) with a clear timeline. The claim is consistent with a manufacturing defect rather than preference or misuse.",
  "returnId": "RET-20250115-001"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `intentCategory` | string | One of: "Genuine Defect", "Preference Mismatch", "Wrong Variant", "Accidental Purchase", "Impulse Regret", "External Circumstance" |
| `confidence` | number | 0-100 confidence score |
| `analysis` | string | Brief AI explanation of classification |
| `returnId` | string | Generated unique return identifier |

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Missing required field: productName" }` | Missing or empty required field |
| 500 | `{ "error": "Bedrock service unavailable" }` | AI service failure |
| 501 | `{ "message": "/api/intercept not yet implemented" }` | Scaffold stub response |

---

### POST /api/inspect — Visual Inspection via Claude Vision

Analyzes uploaded product images using Amazon Bedrock (Claude Sonnet Vision model).

**Request:**
```
POST /api/inspect
Content-Type: multipart/form-data

Fields:
  image: (binary file - JPEG/PNG, max 5MB)
  productName: "Wireless Earbuds Pro"
  returnId: "RET-20250115-001"
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Yes | Product image (JPEG or PNG, max 5MB) |
| `productName` | string | Yes | Product name for context |
| `returnId` | string | Yes | Associated return ID |

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

{
  "damage_detected": true,
  "damage_summary": "Minor scratch on charging case exterior. Both earbuds appear physically intact. No visible cracks or deformation. Packaging shows normal wear.",
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
| `condition_score` | number | 0-100 overall condition score |
| `packaging_score` | number | 0-100 packaging condition score |
| `accessory_completeness` | number | 0-100 completeness of accessories |
| `details` | object | Granular inspection findings |
| `imageKey` | string | S3 object key where image was stored |

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "No image file provided" }` | Missing image in form data |
| 400 | `{ "error": "Image exceeds 5MB limit" }` | File too large |
| 400 | `{ "error": "Invalid image format. Use JPEG or PNG" }` | Wrong file type |
| 500 | `{ "error": "S3 upload failed" }` | Storage failure |
| 500 | `{ "error": "Vision analysis failed" }` | Bedrock Vision failure |
| 501 | `{ "message": "/api/inspect not yet implemented" }` | Scaffold stub |

---

### POST /api/questions — Adaptive Question Generation

Generates targeted follow-up questions using Amazon Bedrock (Claude Sonnet text model) based on product category and inspection context.

**Request:**
```json
POST /api/questions
Content-Type: application/json

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

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

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
| `questions` | string[] | 3-5 targeted diagnostic questions |
| `questionCount` | number | Number of questions generated |
| `category` | string | Echo of product category |

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Missing required field: productCategory" }` | Missing required field |
| 500 | `{ "error": "Question generation failed" }` | Bedrock failure |
| 501 | `{ "message": "/api/questions not yet implemented" }` | Scaffold stub |

---

### POST /api/verify — Claim Verification

Cross-references customer claims against inspection evidence and question responses using Amazon Bedrock (Claude Sonnet text model).

**Request:**
```json
POST /api/verify
Content-Type: application/json

{
  "customerClaim": "Left earbud stopped producing sound after 2 weeks of normal use",
  "inspectionFindings": {
    "condition_score": 82,
    "damage_detected": true,
    "damage_summary": "Minor scratch on charging case exterior"
  },
  "questionResponses": [
    { "question": "Does the right earbud still produce sound normally?", "answer": "Yes, right side works perfectly" },
    { "question": "Does the charging case charge both earbuds?", "answer": "Yes, both charge fine" },
    { "question": "Have you tried resetting the earbuds?", "answer": "Yes, reset didn't fix the issue" },
    { "question": "Any Bluetooth connectivity issues?", "answer": "No, Bluetooth connects fine on both" }
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

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

{
  "consistency_score": 88,
  "verification_summary": "Customer claim of left earbud failure is consistent with the evidence. The product is physically intact (minor cosmetic scratch only), charging works, and the specific failure pattern (one side only) aligns with a manufacturing defect rather than physical damage.",
  "flags": [],
  "claim_status": "consistent"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `consistency_score` | number | 0-100 consistency between claim and evidence |
| `verification_summary` | string | AI-generated verification analysis |
| `flags` | string[] | Any inconsistencies detected (empty if none) |
| `claim_status` | string | "consistent", "partially_consistent", or "inconsistent" |

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Missing required field: customerClaim" }` | Missing required field |
| 400 | `{ "error": "questionResponses must be a non-empty array" }` | Invalid responses |
| 500 | `{ "error": "Verification analysis failed" }` | Bedrock failure |
| 501 | `{ "message": "/api/verify not yet implemented" }` | Scaffold stub |

---

### POST /api/triage — Deterministic Triage Routing

Routes the product to its highest-value next-life category using **deterministic, rule-based scoring logic**. This endpoint does NOT use AI for the routing decision.

**Request:**
```json
POST /api/triage
Content-Type: application/json

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
| `conditionScore` | number | Yes | 0-100 from visual inspection |
| `consistencyScore` | number | Yes | 0-100 from claim verification |
| `packagingScore` | number | Yes | 0-100 from inspection |
| `accessoryCompleteness` | number | Yes | 0-100 from inspection |
| `productCategory` | string | Yes | Product category |
| `returnId` | string | Yes | Associated return ID |

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

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
  "reasoning": "Condition score (82) and consistency (88) are strong but packaging score (75) falls below Verified Like-New threshold. All accessories present. Best fit: Open Box."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `recommended_path` | string | One of: "Verified Like-New", "Open Box", "Certified Refurbished", "Parts Recovery", "Donation", "Recycling" |
| `confidence` | number | 0-100 confidence in the selected path |
| `scores` | object | Individual pathway scores for transparency |
| `reasoning` | string | Rule-based explanation of why this path was selected |

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "All score fields must be numbers between 0 and 100" }` | Invalid scores |
| 400 | `{ "error": "Missing required field: conditionScore" }` | Missing required field |
| 501 | `{ "message": "/api/triage not yet implemented" }` | Scaffold stub |

---

### POST /api/explain — AI Explanation of Triage Decision

Generates a human-readable explanation of the triage result using Amazon Bedrock (Claude Sonnet text model). This runs AFTER the deterministic triage decision.

**Request:**
```json
POST /api/explain
Content-Type: application/json

{
  "triageResult": {
    "recommended_path": "Open Box",
    "confidence": 85,
    "scores": {
      "verified_like_new": 62,
      "open_box": 85,
      "certified_refurbished": 70,
      "parts_recovery": 20,
      "donation": 15,
      "recycling": 5
    }
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

**Success Response:**
```json
HTTP 200 OK
Content-Type: application/json

{
  "explanation": "Your Wireless Earbuds Pro have been routed to the Open Box pathway. While the product is in good overall condition (82/100) with all accessories present, the minor cosmetic wear on the charging case means it doesn't meet Verified Like-New standards. The left earbud audio issue you reported is consistent with the evidence and will be noted for the buyer. Open Box products are fully functional items with minor cosmetic imperfections.",
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

**Error Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Missing required field: triageResult" }` | Missing required field |
| 500 | `{ "error": "Explanation generation failed" }` | Bedrock failure |
| 501 | `{ "message": "/api/explain not yet implemented" }` | Scaffold stub |

---

## DynamoDB Schema Design

### Table: Returns

| Setting | Value |
|---------|-------|
| Table Name | `Returns` (configurable via `DYNAMODB_TABLE_NAME` env var) |
| Partition Key | `returnId` (String) |
| Sort Key | None (single-table design, one item per return) |
| Billing Mode | On-Demand (PAY_PER_REQUEST) for hackathon simplicity |
| Region | Configurable via `AWS_REGION` |

### Attribute Definitions

| Attribute | DynamoDB Type | Description | Example |
|-----------|--------------|-------------|---------|
| `returnId` | S (String) | Unique ID, partition key | `"RET-20250115-001"` |
| `productName` | S (String) | Name of returned product | `"Wireless Earbuds Pro"` |
| `productCategory` | S (String) | Product category | `"Electronics - Audio"` |
| `returnReason` | S (String) | Customer-provided reason | `"Product not working"` |
| `customerExplanation` | S (String) | Detailed explanation | `"Left earbud stopped..."` |
| `intentCategory` | S (String) | AI-classified intent | `"Genuine Defect"` |
| `conditionScore` | N (Number) | 0-100 from visual inspection | `82` |
| `consistencyScore` | N (Number) | 0-100 from claim verification | `88` |
| `packagingScore` | N (Number) | 0-100 for packaging | `75` |
| `accessoryCompleteness` | N (Number) | 0-100 for accessories | `100` |
| `recommendedPath` | S (String) | Final triage decision | `"Open Box"` |
| `confidence` | N (Number) | 0-100 triage confidence | `85` |
| `imageKeys` | L (List of S) | S3 object keys for images | `["returns/RET-001/img1.jpg"]` |
| `questionResponses` | L (List of M) | Question/answer pairs | See below |
| `triageScores` | M (Map) | Per-pathway scores | See below |
| `status` | S (String) | Return processing status | `"completed"` |
| `createdAt` | S (String) | ISO 8601 timestamp | `"2025-01-15T10:30:00Z"` |
| `updatedAt` | S (String) | ISO 8601 last update | `"2025-01-15T10:45:00Z"` |

### Example Records

**Record 1: Genuine Defect → Certified Refurbished**
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
  "recommendedPath": "Certified Refurbished",
  "confidence": 88,
  "imageKeys": ["returns/RET-20250115-001/img1.jpg", "returns/RET-20250115-001/img2.jpg"],
  "questionResponses": [
    { "question": "Does the right earbud work?", "answer": "Yes, works perfectly" },
    { "question": "Does charging work?", "answer": "Yes, both charge fine" }
  ],
  "triageScores": {
    "verified_like_new": 45,
    "open_box": 62,
    "certified_refurbished": 88,
    "parts_recovery": 20,
    "donation": 15,
    "recycling": 5
  },
  "status": "completed",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:45:00Z"
}
```

**Record 2: Preference Mismatch → Verified Like-New**
```json
{
  "returnId": "RET-20250115-002",
  "productName": "Smart Watch Elite",
  "productCategory": "Electronics - Wearables",
  "returnReason": "Does not match expectations",
  "customerExplanation": "Watch face is smaller than I expected from the photos",
  "intentCategory": "Preference Mismatch",
  "conditionScore": 98,
  "consistencyScore": 95,
  "packagingScore": 96,
  "accessoryCompleteness": 100,
  "recommendedPath": "Verified Like-New",
  "confidence": 97,
  "imageKeys": ["returns/RET-20250115-002/img1.jpg"],
  "questionResponses": [
    { "question": "Is the watch fully functional?", "answer": "Yes, everything works" },
    { "question": "Are all bands and charger included?", "answer": "Yes, everything is in the box" }
  ],
  "triageScores": {
    "verified_like_new": 97,
    "open_box": 85,
    "certified_refurbished": 60,
    "parts_recovery": 5,
    "donation": 5,
    "recycling": 2
  },
  "status": "completed",
  "createdAt": "2025-01-15T14:00:00Z",
  "updatedAt": "2025-01-15T14:12:00Z"
}
```

### Future Extensibility Considerations

- **GSI (Global Secondary Index)**: Add `status-createdAt-index` for querying returns by status and date range (e.g., "all pending returns this week").
- **GSI on productCategory**: Enables analytics queries like "all Electronics returns in January."
- **TTL attribute**: Add `expiresAt` for automatic cleanup of old records if needed.
- **Versioning**: Add a `version` attribute to support optimistic locking during concurrent updates.
- **Re-triage history**: Add a `triageHistory` list attribute to track score changes over time when dynamic re-triage is implemented.

---

## S3 Storage Design

### Bucket Configuration

| Setting | Value |
|---------|-------|
| Bucket Name Convention | `reloop-images-{environment}` (e.g., `reloop-images-dev`, `reloop-images-prod`) |
| Region | Same as DynamoDB (configured via `AWS_REGION`) |
| Access | Private (no public access) |
| Versioning | Disabled for MVP (enable in production) |
| Encryption | SSE-S3 (server-side encryption with Amazon S3 managed keys) |

### Object Key Pattern

```
{bucket}/returns/{returnId}/{filename}

Examples:
  reloop-images-dev/returns/RET-20250115-001/img1.jpg
  reloop-images-dev/returns/RET-20250115-001/img2.jpg
  reloop-images-dev/returns/RET-20250115-002/img1.jpg
```

### Image Upload Flow

```
┌──────────┐     multipart/form-data      ┌──────────┐
│  Browser │ ──────────────────────────→   │  Express │
│ (React)  │                               │ Backend  │
└──────────┘                               └────┬─────┘
                                                 │
                                                 │ 1. multer receives file into memory buffer
                                                 │ 2. Validate file type (JPEG/PNG) and size (<5MB)
                                                 │ 3. Generate S3 key: returns/{returnId}/{uuid}.{ext}
                                                 │
                                                 ▼
                                           ┌──────────┐
                                           │    S3    │
                                           │  Bucket  │
                                           └────┬─────┘
                                                │
                                                │ 4. PutObject with ContentType header
                                                │ 5. Return object key to backend
                                                │
                                                ▼
                                           ┌──────────┐
                                           │ Backend  │
                                           │ stores   │
                                           │ key in   │
                                           │ DynamoDB │
                                           └──────────┘
```

### Expected Object Structure

| Property | Value |
|----------|-------|
| Content-Type | `image/jpeg` or `image/png` |
| Max Size | 5 MB |
| Key Format | `returns/{returnId}/{uuid}.{ext}` |
| Metadata | `x-amz-meta-return-id: {returnId}` |

### Accessing Images for Vision Analysis

When the `/api/inspect` endpoint needs to send an image to Bedrock Vision:
1. The image is already in memory (from multer's memory storage)
2. The raw buffer is base64-encoded and sent directly to Bedrock
3. The same buffer is simultaneously uploaded to S3 for persistence
4. No need to re-download from S3 for analysis

---

## Amazon Bedrock Integration Design

### Model Selection

| Model | Use Case | Modules |
|-------|----------|---------|
| Claude Sonnet (text) | Text analysis, classification, generation | Return Interception, Adaptive Questions, Claim Verification, Explanation Layer |
| Claude Sonnet Vision | Image analysis with visual reasoning | Visual Inspection |

### Module-to-Model Mapping

| Module | API Endpoint | Bedrock Model | Prompt File |
|--------|-------------|---------------|-------------|
| Return Interception | POST /api/intercept | Claude Sonnet (text) | `backend/prompts/emotion-analysis.txt` |
| Visual Inspection | POST /api/inspect | Claude Sonnet (vision) | `backend/prompts/inspection.txt` |
| Adaptive Questions | POST /api/questions | Claude Sonnet (text) | `backend/prompts/adaptive-questions.txt` |
| Claim Verification | POST /api/verify | Claude Sonnet (text) | `backend/prompts/claim-verification.txt` |
| Explanation Layer | POST /api/explain | Claude Sonnet (text) | `backend/prompts/triage-explanation.txt` |
| Triage Engine | POST /api/triage | **None** (deterministic) | N/A |

### Prompt File Structure

All prompts live in `backend/prompts/` with consistent formatting:

```
backend/prompts/
├── emotion-analysis.txt       # Return intent classification
├── inspection.txt             # Visual damage detection
├── adaptive-questions.txt     # Follow-up question generation
├── claim-verification.txt     # Claim vs evidence consistency
└── triage-explanation.txt     # Human-readable decision explanation
```

**Prompt Template Format:**
```
# Module: {module_name}
# Input Variables: {var1}, {var2}, ...
# Expected Output: {format_description}

[Prompt body placeholder — developer writes actual prompt here]
```

### Service Abstraction Layer Pattern

```javascript
// backend/utils/bedrockClient.js — Factory pattern

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Singleton client instance
let client = null;

function getBedrockClient() {
  if (!client) {
    client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }
  return client;
}

// Text invocation helper
async function invokeText(prompt, options = {}) {
  const client = getBedrockClient();
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: options.maxTokens || 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const response = await client.send(command);
  return JSON.parse(new TextDecoder().decode(response.body));
}

// Vision invocation helper
async function invokeVision(prompt, imageBase64, mediaType = 'image/jpeg') {
  const client = getBedrockClient();
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });
  const response = await client.send(command);
  return JSON.parse(new TextDecoder().decode(response.body));
}

module.exports = { getBedrockClient, invokeText, invokeVision };
```

Each module service imports `invokeText` or `invokeVision` from this utility, reads its corresponding prompt template from `backend/prompts/`, interpolates variables, and calls Bedrock. This keeps AI integration logic centralized and testable.

---

## Module Boundaries

### Module 1: Return Interception

| Aspect | Detail |
|--------|--------|
| **Purpose** | Classify customer return intent before processing begins |
| **Entry Point** | `POST /api/intercept` |
| **Files** | `routes/interceptRoutes.js`, `controllers/interceptController.js`, `services/interceptService.js` |
| **AI Model** | Claude Sonnet (text) |
| **Prompt** | `backend/prompts/emotion-analysis.txt` |
| **Inputs** | productName, returnReason, customerExplanation |
| **Outputs** | intentCategory, confidence, analysis, returnId |
| **Side Effects** | Creates initial DynamoDB record |
| **Depends On** | None (first in pipeline) |

### Module 2: Visual Inspection

| Aspect | Detail |
|--------|--------|
| **Purpose** | Analyze product images for damage, wear, and condition scoring |
| **Entry Point** | `POST /api/inspect` |
| **Files** | `routes/inspectRoutes.js`, `controllers/inspectController.js`, `services/inspectService.js` |
| **AI Model** | Claude Sonnet Vision |
| **Prompt** | `backend/prompts/inspection.txt` |
| **Inputs** | image (file), productName, returnId |
| **Outputs** | condition_score, damage_summary, packaging_score, accessory_completeness, imageKey |
| **Side Effects** | Uploads image to S3, updates DynamoDB record with scores |
| **Depends On** | Module 1 (needs returnId) |

### Module 3: Adaptive Question Generation

| Aspect | Detail |
|--------|--------|
| **Purpose** | Generate targeted diagnostic questions to fill information gaps |
| **Entry Point** | `POST /api/questions` |
| **Files** | `routes/questionsRoutes.js`, `controllers/questionsController.js`, `services/questionsService.js` |
| **AI Model** | Claude Sonnet (text) |
| **Prompt** | `backend/prompts/adaptive-questions.txt` |
| **Inputs** | productCategory, returnReason, inspectionResult, returnId |
| **Outputs** | questions (array of 3-5 strings) |
| **Side Effects** | None (read-only) |
| **Depends On** | Module 1 (returnReason), Module 2 (inspectionResult) |

### Module 4: Claim Verification

| Aspect | Detail |
|--------|--------|
| **Purpose** | Cross-reference customer claims against inspection evidence and responses |
| **Entry Point** | `POST /api/verify` |
| **Files** | `routes/verifyRoutes.js`, `controllers/verifyController.js`, `services/verifyService.js` |
| **AI Model** | Claude Sonnet (text) |
| **Prompt** | `backend/prompts/claim-verification.txt` |
| **Inputs** | customerClaim, inspectionFindings, questionResponses, returnId |
| **Outputs** | consistency_score, verification_summary, claim_status |
| **Side Effects** | Updates DynamoDB record with consistencyScore |
| **Depends On** | Module 2 (inspectionFindings), Module 3 (questionResponses from user) |

### Module 5: Triage Engine

| Aspect | Detail |
|--------|--------|
| **Purpose** | Determine highest-value next-life path using DETERMINISTIC RULES |
| **Entry Point** | `POST /api/triage` |
| **Files** | `routes/triageRoutes.js`, `controllers/triageController.js`, `services/triageService.js` |
| **AI Model** | **None** — purely rule-based |
| **Prompt** | N/A |
| **Inputs** | conditionScore, consistencyScore, packagingScore, accessoryCompleteness, productCategory |
| **Outputs** | recommended_path, confidence, scores (per-pathway), reasoning |
| **Side Effects** | Updates DynamoDB record with recommendedPath and triageScores |
| **Depends On** | Module 2 (conditionScore, packagingScore, accessoryCompleteness), Module 4 (consistencyScore) |

### Module 6: Explanation Layer

| Aspect | Detail |
|--------|--------|
| **Purpose** | Generate human-readable explanation AFTER the deterministic routing decision |
| **Entry Point** | `POST /api/explain` |
| **Files** | `routes/explainRoutes.js`, `controllers/explainController.js`, `services/explainService.js` |
| **AI Model** | Claude Sonnet (text) |
| **Prompt** | `backend/prompts/triage-explanation.txt` |
| **Inputs** | triageResult, allModuleOutputs, returnId |
| **Outputs** | explanation, factors, summary |
| **Side Effects** | None (read-only) |
| **Depends On** | Module 5 (triageResult), all prior modules (allModuleOutputs) |

---

## Triage Engine Decision Logic

### Critical Design Principle

> **The Triage Engine uses DETERMINISTIC, RULE-BASED scoring logic.**
> AI is used for analysis (classification, inspection, verification) and explanation only.
> **AI does NOT directly determine the final routing category.**

This is a deliberate architectural decision:
1. **Transparency** — stakeholders can audit exactly why a product was routed to a specific path
2. **Predictability** — same inputs always produce same outputs
3. **Testability** — deterministic logic is straightforward to unit test
4. **Accountability** — no "black box" AI decisions for the final routing

### Scoring Algorithm

Each of the 6 destination pathways receives a score (0-100) computed from the input metrics. The pathway with the highest score is selected.

### Pathway Scoring Rules

#### Verified Like-New (highest value)
```
Requirements: ALL of the following must be true
  - conditionScore >= 95
  - consistencyScore >= 85
  - packagingScore >= 90
  - accessoryCompleteness >= 95

Score formula:
  base = min(conditionScore, consistencyScore, packagingScore, accessoryCompleteness)
  penalty = max(0, 95 - conditionScore) * 2
  score = base - penalty
  
  If ANY requirement not met → score = 0
```

#### Open Box
```
Requirements: ALL of the following must be true
  - conditionScore >= 75
  - consistencyScore >= 70
  - accessoryCompleteness >= 80

Score formula:
  base = (conditionScore * 0.4) + (consistencyScore * 0.2) + 
         (packagingScore * 0.2) + (accessoryCompleteness * 0.2)
  
  If conditionScore >= 95 AND packagingScore >= 90 → reduce score by 10 
    (prefer Verified Like-New when eligible)
  
  If ANY requirement not met → score = 0
```

#### Certified Refurbished
```
Requirements: ALL of the following must be true
  - conditionScore >= 50
  - conditionScore < 95 (if >= 95, prefer higher pathways)
  - accessoryCompleteness >= 60

Score formula:
  base = (conditionScore * 0.5) + (accessoryCompleteness * 0.3) + 
         (consistencyScore * 0.2)
  
  If conditionScore >= 75 → reduce score by 5 (prefer Open Box)
  
  If ANY requirement not met → score = 0
```

#### Parts Recovery
```
Requirements:
  - conditionScore >= 20
  - conditionScore < 50

Score formula:
  base = 50 + (conditionScore * 0.3) + (accessoryCompleteness * 0.2)
  
  If conditionScore >= 50 → score = 0 (prefer higher pathways)
```

#### Donation
```
Requirements:
  - conditionScore >= 30
  - conditionScore < 60

Score formula:
  base = 40 + (conditionScore * 0.2) + (packagingScore * 0.1)
  
  If conditionScore >= 60 → score = 0 (prefer higher pathways)
```

#### Recycling (lowest value — fallback)
```
Requirements: None (always eligible as fallback)

Score formula:
  base = max(10, 50 - conditionScore)
  
  This ensures recycling always has a non-zero score as the safety net.
```

### Example Scoring Walkthrough

**Input:** conditionScore=82, consistencyScore=88, packagingScore=75, accessoryCompleteness=100

| Pathway | Eligible? | Score | Reasoning |
|---------|-----------|-------|-----------|
| Verified Like-New | No | 0 | conditionScore (82) < 95 threshold |
| Open Box | Yes | 82.6 | (82×0.4)+(88×0.2)+(75×0.2)+(100×0.2) = 32.8+17.6+15+20 |
| Certified Refurbished | Yes | 76.6 | (82×0.5)+(100×0.3)+(88×0.2) - 5 = 41+30+17.6-5 (penalty for score≥75) |
| Parts Recovery | No | 0 | conditionScore (82) ≥ 50 |
| Donation | No | 0 | conditionScore (82) ≥ 60 |
| Recycling | Yes | 10 | max(10, 50-82) = max(10, -32) = 10 |

**Result:** Open Box (score 82.6) — highest eligible pathway score.

### Confidence Calculation

```
confidence = (highestScore - secondHighestScore) + 50
capped at 99

Example: 82.6 - 76.6 + 50 = 56 → confidence = 56
```

A wider gap between top two scores means higher confidence in the decision.

---

## Environment Configuration

### Required Environment Variables

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `PORT` | Express server port | `3001` |
| `AWS_REGION` | AWS region for all services | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJal...` |
| `S3_BUCKET_NAME` | S3 bucket for product images | `reloop-images-dev` |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name | `Returns` |
| `BEDROCK_MODEL_ID` | Bedrock model identifier | `anthropic.claude-3-sonnet-20240229-v1:0` |

### .env.example File

```env
# Server Configuration
PORT=3001

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# AWS Services
S3_BUCKET_NAME=reloop-images-dev
DYNAMODB_TABLE_NAME=Returns
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### Local Development Setup

1. **Prerequisites:**
   - Node.js 18+ installed
   - AWS CLI configured with valid credentials
   - AWS account with Bedrock, S3, and DynamoDB access

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with real credentials
   npm install
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **AWS Resources Required Before First Run:**
   - S3 bucket created with the name matching `S3_BUCKET_NAME`
   - DynamoDB table `Returns` created with partition key `returnId` (String)
   - Bedrock model access enabled for Claude Sonnet in the configured region
   - IAM user/role with permissions for S3, DynamoDB, and Bedrock

### AWS IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::reloop-images-dev/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Returns"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet*"
    }
  ]
}
```

---

## Deployment Considerations

> **Note:** Deployment is out of scope for the MVP hackathon build. These are documented for future reference and presentation purposes.

### Frontend Hosting

| Option | Service | Rationale |
|--------|---------|-----------|
| Recommended | AWS Amplify Hosting | Auto-deploys from Git, handles Vite builds, free tier available |
| Alternative | Amazon S3 + CloudFront | Static site hosting with CDN, more configuration required |

### Backend Hosting

| Option | Service | Rationale |
|--------|---------|-----------|
| Recommended | AWS App Runner | Container-based, auto-scaling, minimal config |
| Alternative | AWS Elastic Beanstalk | Full Express.js support, more control |
| Alternative | AWS Lambda + API Gateway | Serverless, pay-per-request, requires refactoring Express to Lambda handlers |

### AWS Resources Required for Production

| Resource | Configuration |
|----------|--------------|
| S3 Bucket | Versioning enabled, lifecycle policies, CORS configured |
| DynamoDB Table | On-demand billing, point-in-time recovery enabled |
| Bedrock | Model access in target region, usage quotas configured |
| IAM Roles | Least-privilege roles for each service |
| CloudWatch | Logging and monitoring for all services |
| VPC | Private subnets for backend if using App Runner/ECS |

### Production Architecture (Future)

```
Route 53 → CloudFront → S3 (Frontend)
                      → ALB → App Runner (Backend) → Bedrock / S3 / DynamoDB
```

---

## Data Models

### DynamoDB Table: Returns

(Detailed above in DynamoDB Schema Design section)

### S3 Bucket Structure

(Detailed above in S3 Storage Design section)

### Frontend Route Model

| Path | Page Component | Purpose |
|------|---------------|---------|
| `/` | LandingPage | Entry point, project overview |
| `/return` | ReturnFormPage | Collect product name, reason, explanation |
| `/upload` | ImageUploadPage | Upload product images |
| `/questions` | QuestionsPage | Display and answer adaptive questions |
| `/results` | ResultsDashboardPage | Show triage recommendation and explanation |

---

## Error Handling

Since this is a scaffold, error handling is minimal but structurally sound:

1. **Global Error Handler Middleware** (`backend/middleware/errorHandler.js`):
   - Catches all unhandled errors in the Express pipeline
   - Returns HTTP 500 with `{ "error": "Internal Server Error" }`
   - Logs the error to console in the stub implementation

2. **Route-Level 501 Responses**:
   - Every stub endpoint returns HTTP 501 (Not Implemented)
   - Response body: `{ "message": "{endpoint} not yet implemented" }`
   - This signals to API consumers that the endpoint exists but has no logic

3. **Validation Errors (400)**:
   - Missing required fields return 400 with specific field name
   - Invalid data types return 400 with format guidance
   - Pattern: `{ "error": "Missing required field: {fieldName}" }`

4. **Service Errors (500)**:
   - AWS SDK failures return 500 with service-specific message
   - Pattern: `{ "error": "{ServiceName} service unavailable" }`

5. **Frontend**:
   - Service stubs return `Promise.resolve({})` — no error states in scaffold
   - Error boundaries and loading states are implementation concerns

---

## Testing Strategy

### Approach

Property-based testing is **not applicable** for this feature. The scaffold produces static files and directory structures — there is no pure logic, data transformation, or algorithm to test with generated inputs. The correct testing approach is:

1. **Example-based integration tests** — verify that specific files exist at expected paths with expected content patterns.
2. **Smoke tests** — verify that `npm install && npm start` succeeds in both frontend and backend directories.
3. **Snapshot tests** — capture file content and compare against expected baselines.

**Why PBT does not apply:** The scaffold is declarative file generation. There are no pure functions with variable inputs to test — every generated file has a fixed, known-in-advance structure. There is no input space to explore with randomized inputs.

### Test Categories

| Category | What it verifies | Examples |
|----------|-----------------|----------|
| File existence | Required files are created | `backend/server.js` exists, `frontend/vite.config.js` exists |
| File content | Files contain required boilerplate | `server.js` includes `express()`, `app.listen` |
| Startup smoke | Applications start without errors | `npm start` in backend exits cleanly or listens |
| Route chain | Stub endpoints respond correctly | `POST /api/intercept` returns 501 with expected JSON |
| Config validity | Config files parse without errors | `package.json` is valid JSON, `vite.config.js` is valid JS |

### Tools

- **Test runner**: Vitest (already in the Vite ecosystem)
- **HTTP testing**: supertest (for Express route verification)
- **File assertions**: Node.js `fs` module with standard assertions

### Test Execution

```bash
# Backend route tests
cd backend && npm test

# Frontend build verification
cd frontend && npm run build
```

Tests should be added as a follow-up task after the scaffold is complete, verifying the structural integrity of generated files.

## Correctness Properties

Since the scaffold feature generates static files and directories without runtime logic, traditional property-based testing does not apply. However, the following structural correctness properties must hold:

### Property 1: Directory Completeness

Every directory listed in the requirements document exists after scaffold generation. All backend subdirectories (`routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, `prompts/`) and all frontend subdirectories (`src/pages/`, `src/components/`, `src/services/`, `src/hooks/`) are present.

**Validates:** Requirement 1.1, Requirement 2.1

### Property 2: File Presence

Every file specified in the requirements exists at its expected path. This includes all configuration files, placeholder files, prompt templates, and documentation files.

**Validates:** Requirement 1.2, Requirement 2.2, Requirement 6.1, Requirement 7.1

### Property 3: Valid JSON

All generated `.json` files (`package.json`, `.eslintrc.json`) parse without errors using `JSON.parse()`.

**Validates:** Requirement 1.4, Requirement 2.3, Requirement 4.3

### Property 4: Valid JavaScript

All generated `.js` and `.jsx` files are syntactically valid and produce no parse errors when loaded by Node.js or the Vite bundler.

**Validates:** Requirement 3.1, Requirement 5.2, Requirement 7.2

### Property 5: Dependency Integrity

All dependencies listed in `package.json` files resolve during `npm install` without version conflicts or missing package errors.

**Validates:** Requirement 1.4, Requirement 2.3

### Property 6: Server Startup

The backend server starts and listens on the configured port without errors after `npm install` and `npm start`.

**Validates:** Requirement 1.5

### Property 7: Frontend Build

The frontend builds successfully via `npm run build` after `npm install`, producing output in a `dist/` directory.

**Validates:** Requirement 3.1, Requirement 3.5, Requirement 3.6

### Property 8: Route Chain Execution

Every stub endpoint responds with HTTP 501 and a JSON body containing a `message` field when called via POST request.

**Validates:** Requirement 5.2, Requirement 5.5

### Property 9: No Secrets Committed

No `.env` file or hardcoded credentials exist in generated files; only `.env.example` with placeholder values is present.

**Validates:** Requirement 4.1, Requirement 4.2

### Property 10: Triage Determinism

Given identical input scores, the triage engine always produces the same recommended path — no randomness, no AI involvement in the routing decision.

**Validates:** Requirement 10.5
