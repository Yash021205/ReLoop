# Amazon Re:Loop

## HackOn 6.0 Project Specification

### Problem Statement

Returns are traditionally processed using a binary decision system:

* Accept Return
* Reject Return

This leads to significant value loss because many returned products still possess recoverable value.

Amazon Re:Loop is an AI-powered Return Intelligence Platform that determines the highest-value next lifecycle path for every returned product.

---

# Objective

Maximize value recovery from returned products by intelligently routing them into the most suitable destination:

* Verified Like-New
* Open Box
* Certified Refurbished
* Parts Recovery
* Donation
* Recycling

---

# Hackathon MVP Goal

Build a working end-to-end system that:

1. Collects return information from a customer.
2. Analyzes customer intent and return reason.
3. Inspects uploaded product images.
4. Generates adaptive follow-up questions.
5. Computes product condition scores.
6. Routes product to the best next-life category.
7. Displays an explainable recommendation dashboard.

---

# User Flow

Customer submits return request

↓

Return Reason Analysis

↓

Image Upload

↓

AI Inspection

↓

Adaptive Questions

↓

Condition Assessment

↓

Triage Engine

↓

Recommended Next Life

↓

Decision Dashboard

---

# Core Modules

## Module 1: Return Interception

### Input

* Product Name
* Return Reason
* Customer Explanation

### Processing

Use Claude via Amazon Bedrock to classify return intent.

### Output Categories

* Genuine Defect
* Preference Mismatch
* Wrong Variant
* Accidental Purchase
* Impulse Regret
* External Circumstance

### API

POST /api/intercept

---

## Module 2: Visual Inspection

### Input

Product images uploaded by customer.

### Processing

Claude Vision analyzes:

* Physical damage
* Scratches
* Cracks
* Missing components
* Packaging quality

### Output

{
"damage_detected": true,
"damage_summary": "...",
"condition_score": 82
}

### API

POST /api/inspect

---

## Module 3: Adaptive Question Generation

### Input

* Product Category
* Return Reason
* Inspection Result

### Processing

Claude generates targeted diagnostic questions.

### Example

For earbuds:

* Does the left earbud function?
* Does charging work normally?

For laptop:

* Does the battery charge?
* Is the display functioning?

### API

POST /api/questions

---

## Module 4: Claim Verification

### Input

* Customer Claim
* Inspection Findings
* Question Responses

### Processing

Determine consistency between claim and evidence.

### Output

{
"consistency_score": 88,
"verification_summary": "..."
}

### API

POST /api/verify

---

## Module 5: Triage Engine

### Purpose

Determine the highest-value next-life path.

### Inputs

* Condition Score
* Consistency Score
* Packaging Score
* Accessory Completeness
* Product Category

### IMPORTANT

Use deterministic scoring logic.

Do NOT allow AI to directly make the final routing decision.

AI should only explain the result.

### Candidate Outcomes

* Verified Like-New
* Open Box
* Certified Refurbished
* Parts Recovery
* Donation
* Recycling

### Output

{
"recommended_path": "Verified Like-New",
"confidence": 94,
"reasoning": "..."
}

### API

POST /api/triage

---

## Module 6: Recommendation Dashboard

Display:

* Return Intent
* Inspection Results
* Condition Score
* Verification Score
* Recommended Path
* AI Explanation

---

# Technical Architecture

## Frontend

React

Vite

Tailwind CSS

React Router

---

## Backend

Node.js

Express.js

AWS SDK v3

---

## AI Layer

Amazon Bedrock

Claude Sonnet

Claude Vision

---

## Storage

Amazon S3

### Purpose

Store uploaded product images.

---

## Database

Amazon DynamoDB

### Table

Returns

### Partition Key

returnId

---

# DynamoDB Item Example

{
"returnId": "RET-001",
"productName": "Wireless Earbuds",
"conditionScore": 88,
"consistencyScore": 91,
"recommendedPath": "Open Box"
}

---

# Folder Structure

reloop/

frontend/

backend/

docs/

prompts/

---

backend/

routes/

controllers/

services/

prompts/

middleware/

utils/

---

frontend/

pages/

components/

services/

hooks/

---

# Bedrock Prompt Files

emotion-analysis.txt

inspection.txt

adaptive-questions.txt

claim-verification.txt

triage-explanation.txt

---

# Success Criteria

The MVP is successful if a user can:

1. Submit a return.
2. Upload images.
3. Receive AI analysis.
4. Answer adaptive questions.
5. View a triage recommendation.
6. Understand why that recommendation was chosen.

---

# Hackathon Priorities

Priority 1

* Bedrock Integration
* Visual Inspection
* Triage Engine

Priority 2

* Adaptive Questions
* Claim Verification

Priority 3

* Analytics
* Marketplace Features
* Sustainability Features

---

# Out of Scope For MVP

* Real Amazon Integration
* Payment Processing
* Reverse Logistics Optimization
* Warehouse Systems
* Live Inventory Management
* Production Authentication Systems

Focus on delivering a complete, polished, explainable AI-powered return intelligence workflow.
