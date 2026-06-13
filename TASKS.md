# TASKS.md

# Amazon Re:Loop - HackOn 6.0 Build Plan

## Project Status

Current Phase: Setup

Goal: Deliver a complete end-to-end MVP within 48 hours.

---

# Day 0 (Before Hackathon)

## AWS Setup

* [ ] AWS account accessible
* [ ] Credits verified
* [ ] Bedrock enabled
* [ ] Claude Sonnet access granted
* [ ] AWS CLI configured
* [ ] S3 bucket created
* [ ] DynamoDB table created

---

## Development Setup

* [ ] Install Node.js
* [ ] Install Git
* [ ] Install Kiro
* [ ] Create GitHub repository
* [ ] Clone repository locally

---

## Frontend Setup

* [ ] Create Vite React project
* [ ] Install Tailwind CSS
* [ ] Install React Router
* [ ] Verify local development server

---

## Backend Setup

* [ ] Create Express server
* [ ] Configure environment variables
* [ ] Install AWS SDK
* [ ] Verify server startup

---

# Day 1 - Foundation

## Task 1: Create Project Structure

### Backend

* [ ] routes/
* [ ] controllers/
* [ ] services/
* [ ] middleware/
* [ ] prompts/
* [ ] utils/

### Frontend

* [ ] pages/
* [ ] components/
* [ ] services/
* [ ] hooks/

---

## Task 2: Build Landing Page

### Features

* [ ] Project branding
* [ ] Product overview
* [ ] Start return button

### Deliverable

User can start a return process.

---

## Task 3: Build Return Form

### Inputs

* [ ] Product Name
* [ ] Product Category
* [ ] Return Reason
* [ ] Customer Explanation

### Deliverable

Return request successfully submitted.

---

## Task 4: Bedrock Integration

### Goal

Connect backend to Claude.

### Deliverables

* [ ] Bedrock client initialized
* [ ] Test prompt succeeds
* [ ] Claude response displayed

API:

POST /api/test

Success:

Claude returns response.

---

## Task 5: Return Interception Module

### API

POST /api/intercept

### Inputs

* Product Name
* Return Reason
* Customer Explanation

### Claude Tasks

Classify:

* Genuine Defect
* Preference Mismatch
* Wrong Variant
* Accidental Purchase
* Impulse Regret
* External Circumstance

### Deliverable

Return intent shown on UI.

---

# Day 1 Evening

## Task 6: Image Upload

### Frontend

* [ ] Drag and drop upload
* [ ] Image preview

### Backend

* [ ] Receive image
* [ ] Upload image to S3

### Deliverable

Images stored in S3.

---

## Task 7: Visual Inspection Module

### API

POST /api/inspect

### Input

Image URL

### Claude Vision Tasks

Detect:

* Damage
* Scratches
* Cracks
* Packaging quality
* Missing components

### Output

Condition Score

### Deliverable

Inspection result displayed.

---

# Day 2 Morning

## Task 8: Adaptive Question Generator

### API

POST /api/questions

### Input

* Product Category
* Return Reason
* Inspection Result

### Claude Tasks

Generate 3-5 targeted questions.

### Example

Earbuds:

* Does charging work?
* Does left earbud function?

Laptop:

* Does battery charge?
* Does screen work?

### Deliverable

Dynamic questions displayed.

---

## Task 9: Customer Response Collection

### Frontend

* [ ] Render dynamic questions
* [ ] Capture answers

### Deliverable

Answers saved successfully.

---

## Task 10: Claim Verification

### API

POST /api/verify

### Inputs

* Customer Claim
* Inspection Results
* Question Responses

### Output

* Consistency Score
* Verification Summary

### Deliverable

Verification result displayed.

---

# Day 2 Afternoon

## Task 11: Triage Engine

### IMPORTANT

Do NOT use AI to make final routing decision.

Use deterministic rules.

---

### Inputs

* Condition Score
* Consistency Score
* Packaging Score
* Accessory Score

---

### Output Categories

* Verified Like-New
* Open Box
* Certified Refurbished
* Parts Recovery
* Donation
* Recycling

---

### Example Rule

Condition > 90

AND

Consistency > 80

→ Verified Like-New

---

### Deliverable

Recommendation generated.

---

## Task 12: AI Explanation Layer

### API

POST /api/explain

### Goal

Claude explains triage decision.

### Example

"This item was routed to Open Box because condition remains high but packaging quality is reduced."

### Deliverable

Human-readable explanation shown.

---

# Day 2 Evening

## Task 13: Dashboard

### Sections

* Return Details
* Inspection Results
* Condition Score
* Verification Score
* Recommended Path
* AI Explanation

### Deliverable

Complete decision dashboard.

---

## Task 14: UI Polish

### Tasks

* [ ] Responsive layout
* [ ] Better spacing
* [ ] Loading states
* [ ] Error handling
* [ ] Success messages

---

## Task 15: Demo Dataset

Create 5 sample returns.

Examples:

* Wireless Earbuds
* Laptop
* Phone Case
* Smart Watch
* Bluetooth Speaker

### Deliverable

Reliable demo scenarios.

---

# Final Submission Checklist

## Functional

* [ ] Return submission works
* [ ] Image upload works
* [ ] Bedrock works
* [ ] Vision analysis works
* [ ] Adaptive questions work
* [ ] Verification works
* [ ] Triage works
* [ ] Dashboard works

---

## Technical

* [ ] GitHub repository updated
* [ ] Environment variables secured
* [ ] No hardcoded secrets
* [ ] API errors handled

---

## Presentation

* [ ] Architecture diagram
* [ ] Problem statement slide
* [ ] Solution slide
* [ ] Demo flow slide
* [ ] Business impact slide
* [ ] Sustainability impact slide

---

# Stretch Goals (Only If Time Remains)

* [ ] Sustainability Score
* [ ] Carbon Savings Estimate
* [ ] Marketplace Module
* [ ] Green Credits
* [ ] Analytics Dashboard
* [ ] Return Trend Insights

Ignore stretch goals until MVP is complete.
