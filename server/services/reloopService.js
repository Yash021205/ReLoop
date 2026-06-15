const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const repo = require('../db/repository');
const gemini = require('./geminiService');

const USER_ID = 'u1';

function today() {
  return new Date().toISOString().split('T')[0];
}

const simulateDelay = (min = 1000, max = 2500) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

async function getConfig(id, fallback = null) {
  return repo.getItem('Config', id).then(item => item || fallback);
}

async function getProductOrThrow(id) {
  const product = await repo.getItem('Products', id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return product;
}

async function getReturnOrThrow(id) {
  const item = await repo.getItem('Returns', id);
  if (!item) {
    const error = new Error('Return not found');
    error.status = 404;
    throw error;
  }
  return item;
}

async function getOrderOrThrow(id) {
  const order = await repo.getItem('Orders', id);
  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }
  return order;
}

async function listProducts(category) {
  const products = await repo.scanTable('Products');
  return category ? products.filter(product => product.category === category) : products;
}

async function getProductGuidance(productId, context = {}) {
  const product = await getProductOrThrow(productId);
  const riskLevel = product.returnRate > 10 ? 'elevated' : product.returnRate > 7 ? 'moderate' : 'low';

  try {
    const systemPrompt = `You are the Re:Loop Smart Guidance Assistant. Your job is to analyze a product and a customer's specific use case to assess return risk and provide compatibility suggestions.

Respond with ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "sizeRecommendation": "A short advice on size, variants, or fitting if the product is a Wearable/Clothing/Accessories (otherwise null)",
  "useCaseMatch": "A 1-sentence analysis of how well this product fits the customer's use case: '${context.useCase || 'General use'}'",
  "returnRiskLevel": "low" | "moderate" | "elevated",
  "returnRiskReason": "The primary potential reason why this product might be returned based on its return rate or common complaints",
  "relevantReviews": [
    { "text": "A simulated positive customer review showing how it fits the use case", "rating": 5, "author": "Verified Buyer" },
    { "text": "A simulated constructive customer review mentioning things to check before buying", "rating": 4, "author": "Verified Buyer" }
  ],
  "recommendation": "A 1-2 sentence final buying advice highlighting return risks and tips."
}`;

    const userMessage = `PRODUCT NAME: ${product.name}
CATEGORY: ${product.category}
BRAND: ${product.brand}
DESCRIPTION: ${product.description}
FEATURES: ${product.features?.join(', ') || 'None'}
SPECS: ${JSON.stringify(product.specs || {})}
RETURN RATE: ${product.returnRate}%
COMMON RETURN REASONS: ${product.commonReturnReasons?.join(', ') || 'None'}
CUSTOMER USE CASE: ${context.useCase || 'General use'}`;

    const raw = await gemini.converse(systemPrompt, userMessage, true);
    const result = JSON.parse(raw);

    if (result.recommendation && result.relevantReviews) {
      return {
        sizeRecommendation: result.sizeRecommendation || null,
        useCaseMatch: result.useCaseMatch || null,
        returnRiskLevel: result.returnRiskLevel || riskLevel,
        returnRiskReason: result.returnRiskReason || product.commonReturnReasons?.[0] || null,
        relevantReviews: result.relevantReviews,
        recommendation: result.recommendation
      };
    }
  } catch (err) {
    console.warn('[Guidance] Gemini call failed, falling back to deterministic guidance:', err.message);
  }

  return {
    sizeRecommendation: product.category === 'Wearables' ? 'Based on similar customers, confirm case size and strap fit before checkout.' : null,
    useCaseMatch: context.useCase ? `This product is well-suited for ${context.useCase}.` : null,
    returnRiskLevel: riskLevel,
    returnRiskReason: product.commonReturnReasons?.[0] || null,
    relevantReviews: [
      { text: `Great product for daily use. ${product.features?.[0] || 'Core features'} works reliably.`, rating: 5, author: 'Verified Buyer' },
      { text: `Good value overall. Main thing to check: ${product.commonReturnReasons?.[0] || 'fit for your needs'}.`, rating: 4, author: 'Verified Buyer' },
    ],
    recommendation: riskLevel === 'elevated'
      ? `${product.returnRate}% return rate. Common concern: "${product.commonReturnReasons?.[0]}". Review fit before buying.`
      : `Low return risk (${product.returnRate}%). Most customers keep this product.`,
  };
}

async function initiateReturn({ orderId, reason, explanation }, userId = USER_ID) {
  const order = await getOrderOrThrow(orderId);
  if (!order.canReturn) {
    const error = new Error('This order is not eligible for return yet');
    error.status = 400;
    throw error;
  }
  const product = await getProductOrThrow(order.productId);
  const returnDoc = {
    id: `RET-${Date.now()}`,
    userId: userId,
    orderId,
    productId: product.id,
    product: product.name.split(' ').slice(0, 4).join(' '),
    productName: product.name,
    emoji: product.emoji,
    category: product.category,
    price: order.price || product.price,
    reason,
    explanation,
    status: 'Initiated',
    pathway: null,
    selectedPathway: null,
    score: null,
    date: today(),
    createdAt: new Date().toISOString(),
  };
  await repo.putItem('Returns', returnDoc);
  return { returnId: returnDoc.id, ...returnDoc };
}

async function classifyReturn(returnId) {
  await simulateDelay(1000, 2000);
  const returnDoc = await getReturnOrThrow(returnId);
  const config = await getConfig('classificationRules', { rules: {} });
  const base = config.rules[returnDoc.reason] || config.rules.Other || {
    category: 'External Circumstance',
    emoji: '📝',
    color: 'var(--gray-600)',
    action: 'continue',
    msg: 'We will review your return request.',
    sentiment: 'Neutral',
    confidence: 75,
    suggestion: 'return',
  };
  const text = `${returnDoc.reason || ''} ${returnDoc.explanation || ''}`.toLowerCase();
  const defectBoost = ['broken', 'defect', 'not working', 'damaged', 'missing'].some(word => text.includes(word)) ? 4 : 0;
  const classification = {
    ...base,
    confidence: clamp((base.confidence || 80) + defectBoost),
  };
  await repo.updateItem('Returns', returnId, {
    classification,
    status: classification.action === 'keep' || classification.action === 'exchange' ? 'Intercepted' : 'Classified',
  });
  return classification;
}

async function awardCredits(userId, ruleKey, overrideAction = null, overrideCredits = 10, overrideIcon = '♻️') {
  const config = await getConfig('creditRules', { rules: {} });
  let rule = config.rules[ruleKey];
  if (!rule) {
    if (!overrideAction) return { creditsAwarded: 0 };
    rule = { action: overrideAction, credits: overrideCredits, icon: overrideIcon };
  }
  let user = await repo.getItem('Users', userId || USER_ID);
  if (!user) {
    user = {
      id: userId || USER_ID,
      totalCredits: 0,
      tier: 'New',
      sustainabilityScore: 0,
      history: [],
      badges: [
        { id: 1, name: 'Eco Explorer', emoji: '🌍', desc: 'First sustainable purchase', earned: false },
        { id: 2, name: 'Green Guardian', emoji: '🛡️', desc: '5 sustainable actions', earned: false },
        { id: 3, name: 'Eco Champion', emoji: '👑', desc: 'Earn 500 Green Credits', earned: false, progress: 0, target: 500 },
      ]
    };
    await repo.putItem('Users', user);
  }
  const history = [
    { id: randomUUID(), action: overrideAction || rule.action, credits: rule.credits, date: today(), icon: rule.icon },
    ...(user.history || []),
  ];
  const totalCredits = (user.totalCredits || 0) + rule.credits;
  const sustainabilityScore = clamp((user.sustainabilityScore || 0) + Math.ceil(rule.credits / 10));
  const tier = totalCredits >= 500 ? 'Eco Champion' : totalCredits >= 250 ? 'Green Guardian' : totalCredits >= 100 ? 'Eco Explorer' : 'New';
  const badges = (user.badges || []).map(badge => {
    if (badge.target) return { ...badge, progress: totalCredits, earned: totalCredits >= badge.target };
    return badge;
  });
  await repo.updateItem('Users', user.id, { totalCredits, sustainabilityScore, tier, history, badges });
  return { creditsAwarded: rule.credits };
}

async function decideReturn(returnId, decision) {
  const returnDoc = await getReturnOrThrow(returnId);
  const ruleKey = decision === 'keep' ? 'keep' : decision === 'exchange' ? 'exchange' : null;
  const creditResult = ruleKey ? await awardCredits(returnDoc.userId, ruleKey) : { creditsAwarded: 0 };
  const status = decision === 'return' ? 'Inspecting' : decision === 'exchange' ? 'Exchange Initiated' : 'Kept';
  await repo.updateItem('Returns', returnId, { decision, status, creditsAwarded: creditResult.creditsAwarded });
  return { decision, ...creditResult };
}

async function getInspectionRequirements(returnId) {
  const returnDoc = await getReturnOrThrow(returnId);
  const config = await getConfig('inspectionRequirements', { default: [], byCategory: {} });
  const angles = config.byCategory?.[returnDoc.category] || config.default || [];
  return { category: returnDoc.category, angles };
}

async function recordUploadedImages(returnId, files, req) {
  const returnDoc = await getReturnOrThrow(returnId);
  const uploadedImages = [
    ...(returnDoc.uploadedImages || []),
    ...files.map(file => ({
      id: randomUUID(),
      name: file.originalname,
      filename: file.filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${returnId}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    })),
  ];
  await repo.updateItem('Returns', returnId, { uploadedImages, status: 'Inspecting' });
  return { uploaded: true, imageCount: uploadedImages.length, images: uploadedImages };
}

async function validateImage(returnId, imageUrl) {
  const returnDoc = await getReturnOrThrow(returnId);
  const uploadedImages = returnDoc.uploadedImages || [];
  const imageCount = uploadedImages.length;
  const requirements = await getInspectionRequirements(returnId);
  const enoughCoverage = imageCount >= Math.min(2, requirements.angles.length || 2);
  const validation = {
    valid: enoughCoverage,
    imageUrl,
    feedback: enoughCoverage ? 'Good quality image. Coverage is sufficient for AI inspection.' : 'Upload at least two required views before inspection.',
  };
  await repo.updateItem('Returns', returnId, { imageValidations: [...(returnDoc.imageValidations || []), validation] });
  return validation;
}

function computeVision(returnDoc) {
  const hasDefectClaim = /damaged|defect|missing|not working|quality/i.test(`${returnDoc.reason || ''} ${returnDoc.explanation || ''}`);
  const imageCount = (returnDoc.uploadedImages || []).length;
  const randomJitter = () => Math.floor(Math.random() * 7) - 3;
  const visual = clamp((hasDefectClaim ? 74 + imageCount : 92 + imageCount) + randomJitter());
  const packaging = clamp((returnDoc.reason === 'Missing parts / accessories' ? 68 : 84 + Math.min(imageCount, 6)) + randomJitter());
  const functionality = clamp((hasDefectClaim ? 72 : 90) + randomJitter());
  return {
    visual_score: visual,
    damage_detected: visual < 80,
    packaging_score: packaging,
    functionality_score: functionality,
    accessories_present: packaging >= 75,
    confidence: clamp(82 + imageCount * 3),
    details: [
      { area: 'Body', status: visual >= 85 ? 'No damage detected' : 'Possible cosmetic issue requires review', severity: visual >= 85 ? 'none' : 'minor' },
      { area: 'Surface', status: visual >= 80 ? 'Normal handling marks only' : 'Visible wear or claim-related marks detected', severity: visual >= 80 ? 'minimal' : 'minor' },
      { area: 'Functional Areas', status: functionality >= 85 ? 'No functional risk from available evidence' : 'Customer claim indicates functional risk', severity: functionality >= 85 ? 'none' : 'minor' },
      { area: 'Packaging', status: packaging >= 80 ? 'Packaging acceptable for resale' : 'Packaging/accessory check needed', severity: packaging >= 80 ? 'minor' : 'medium' },
    ],
  };
}

async function runVision(returnId) {
  const returnDoc = await getReturnOrThrow(returnId);
  const images = [];

  if (returnDoc.uploadedImages && returnDoc.uploadedImages.length > 0) {
    for (const img of returnDoc.uploadedImages) {
      try {
        const filePath = path.join(__dirname, '../uploads', returnId, img.filename);
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath).toString('base64');
          images.push({ mimeType: img.mimetype, data });
        }
      } catch (err) {
        console.warn('Failed to read image file:', img.filename, err);
      }
    }
  }

  if (images.length > 0) {
    try {
      const systemPrompt = `You are the Re:Loop AI Vision Inspector. You are analyzing images of a returned product.
RULES:
- Evaluate the product's visual condition, packaging, and functionality based ONLY on the images.
- CRITICAL DEMO RULE: If the images are low quality, blurry, or ambiguous, you MUST give the product the benefit of the doubt and assume it matches the customer's claim. Do NOT hallucinate defects that are not clearly visible.
- Output JSON ONLY in this format:
{
  "visual_score": <0-100>,
  "damage_detected": <boolean>,
  "packaging_score": <0-100>,
  "functionality_score": <0-100>,
  "accessories_present": <boolean>,
  "confidence": <0-100>,
  "details": [
    { "area": "Body", "status": "description", "severity": "none/minor/medium/severe" }
  ]
}`;
      const userMessage = `PRODUCT: ${returnDoc.productName}
CUSTOMER RETURN REASON: ${returnDoc.reason}
CUSTOMER EXPLANATION: ${returnDoc.explanation}

Analyze the provided images and score the condition. Remember the Demo Rule: if unsure, assume the product is in good condition unless the customer claimed otherwise.`;

      console.log(`[Vision] Calling Gemini with ${images.length} images for return ${returnId}...`);
      const raw = await gemini.converse(systemPrompt, userMessage, true, images);
      const vision = JSON.parse(raw);
      
      const finalVision = {
        visual_score: clamp(vision.visual_score || 90),
        damage_detected: !!vision.damage_detected,
        packaging_score: clamp(vision.packaging_score || 90),
        functionality_score: clamp(vision.functionality_score || 90),
        accessories_present: !!vision.accessories_present,
        confidence: clamp(vision.confidence || 85),
        details: vision.details || []
      };

      await repo.updateItem('Returns', returnId, { visionResult: finalVision, status: 'Vision Complete' });
      return finalVision;
    } catch (aiError) {
      console.warn(`[Vision] Gemini call failed, falling back to simulated algorithm:`, aiError.message);
    }
  } else {
    await simulateDelay(1500, 3000);
  }

  // Fallback
  const vision = computeVision(returnDoc);
  await repo.updateItem('Returns', returnId, { visionResult: vision, status: 'Vision Complete' });
  return vision;
}

async function getFollowUpQuestions(returnId) {
  const returnDoc = await getReturnOrThrow(returnId);
  const questionsByCategory = {
    Headphones: [
      { id: 'battery', text: 'How long does the battery last?', options: ['< 2 hrs', '2-5 hrs', '> 5 hrs'] },
      { id: 'speakers', text: 'Do both speakers work?', options: ['Yes', 'One side quieter', 'Not working'] },
    ],
    Laptops: [
      { id: 'boot', text: 'Does the laptop boot normally?', options: ['Yes', 'Slow boot', 'Does not boot'] },
      { id: 'charger', text: 'Is the original charger included?', options: ['Yes', 'No', 'Third-party charger'] },
    ],
    Smartphones: [
      { id: 'screen', text: 'Is the touchscreen working?', options: ['Yes', 'Partially', 'No'] },
      { id: 'camera', text: 'Do the cameras work?', options: ['Yes', 'Rear only', 'Issues noticed'] },
    ],
  };
  const questions = questionsByCategory[returnDoc.category] || [
    { id: 'functionality', text: 'Does the product function normally?', options: ['Yes', 'Partially', 'No'] },
    { id: 'accessories', text: 'Are all accessories included?', options: ['Yes', 'Some missing', 'No accessories'] },
  ];
  await repo.updateItem('Returns', returnId, { questions });
  return { questions };
}

async function submitAnswers(returnId, answers) {
  await getReturnOrThrow(returnId);
  await repo.updateItem('Returns', returnId, { answers, status: 'Answers Submitted' });
  return { received: true, answers };
}

async function verifyClaim(returnId) {
  await simulateDelay(1000, 2000);
  const returnDoc = await getReturnOrThrow(returnId);
  const vision = returnDoc.visionResult || computeVision(returnDoc);
  const hasNegativeAnswer = Object.values(returnDoc.answers || {}).some(value => /no|not|< 2|partially|missing|issues/i.test(String(value)));
  const randomJitter = Math.floor(Math.random() * 5) - 2;
  const consistency = clamp((vision.damage_detected ? 78 : 90) - (hasNegativeAnswer ? 8 : 0) + randomJitter);
  const claim = {
    claim_consistency: consistency,
    customer_claim: returnDoc.reason || 'Customer return request',
    observed_evidence: vision.damage_detected
      ? 'Uploaded evidence indicates possible cosmetic or functional concern.'
      : 'Uploaded evidence indicates the product is in strong resale condition.',
    verdict: consistency >= 85 ? 'Claim is mostly consistent with observed evidence.' : 'Claim is partially consistent and should be reviewed with inspection results.',
  };
  await repo.updateItem('Returns', returnId, { claimResult: claim });
  return claim;
}

async function getProductProfile(returnId) {
  const returnDoc = await getReturnOrThrow(returnId);
  if (returnDoc.profile) return returnDoc.profile;
  const vision = returnDoc.visionResult || computeVision(returnDoc);
  const claim = returnDoc.claimResult || await verifyClaim(returnId);
  const accessoryScore = vision.accessories_present ? 100 : 70;
  const condition = clamp((vision.visual_score * 0.35) + (vision.functionality_score * 0.35) + (accessoryScore * 0.15) + (claim.claim_consistency * 0.15));
  const profile = {
    condition_score: condition,
    visual_score: vision.visual_score,
    functionality_score: vision.functionality_score,
    accessory_score: accessoryScore,
    claim_consistency: claim.claim_consistency,
    confidence_score: vision.confidence,
    grade: condition >= 90 ? 'A' : condition >= 82 ? 'A-' : condition >= 72 ? 'B+' : condition >= 60 ? 'B' : 'C',
    customer_claim: claim.customer_claim,
    observed_evidence: claim.observed_evidence,
    verdict: claim.verdict,
  };
  await repo.updateItem('Returns', returnId, { profile });
  return profile;
}

async function runTriage(returnId, rerun = false) {
  const returnDoc = await getReturnOrThrow(returnId);
  const profile = returnDoc.profile || await getProductProfile(returnId);
  const pathwaysConfig = await getConfig('triagePathways', { pathways: [] });
  const product = await getProductOrThrow(returnDoc.productId);

  const factors = {
    condition: profile.condition_score,
    visual: profile.visual_score,
    functionality: profile.functionality_score,
    accessories: profile.accessory_score,
    claimConsistency: profile.claim_consistency,
  };

  let scores = {};
  let selectedPathway;
  let reasoning;
  let confidence;

  try {
    // ── Build the AI prompt ──
    const systemPrompt = `You are the Re:Loop AI Triage Engine. Your job is to evaluate a returned product and decide its optimal recovery pathway.

You will receive product details, inspection profile scores, and a list of available pathways with their minimum score thresholds and recovery rates.

RULES:
- Evaluate EACH pathway independently and assign a score (0-100) based on how well the product fits.
- Mark a pathway as eligible only if your score meets or exceeds its minScore.
- Among eligible pathways, select the one with the LOWEST priority number (highest priority).
- "restock-original" requires pristine condition (grade A, visual >= 95, accessories = 100) AND product price > 50000.
- Provide clear reasoning for your decision.

Respond with ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "scores": {
    "<pathway-id>": { "eligible": true/false, "score": <number>, "reason": "<brief reason>" }
  },
  "selectedPathway": "<pathway-id>",
  "reasoning": "<2-3 sentence explanation of why this pathway was chosen>",
  "confidence": <number 0-100>
}`;

    const userMessage = `PRODUCT: ${product.name} (${product.category})
PRICE: ₹${(returnDoc.price || product.price).toLocaleString()}
RETURN REASON: ${returnDoc.reason || 'Not specified'}
CUSTOMER EXPLANATION: ${returnDoc.explanation || 'None'}
${rerun ? 'NOTE: This is a RE-EVALUATION with updated inspection data.\n' : ''}
INSPECTION PROFILE:
- Condition Score: ${profile.condition_score}/100
- Visual Score: ${profile.visual_score}/100
- Functionality Score: ${profile.functionality_score}/100
- Accessory Score: ${profile.accessory_score}/100
- Claim Consistency: ${profile.claim_consistency}/100
- Confidence: ${profile.confidence_score}/100
- Grade: ${profile.grade}

AVAILABLE PATHWAYS:
${pathwaysConfig.pathways.map(p => `- ${p.id} (name: "${p.name}", priority: ${p.priority}, minScore: ${p.minScore}, recoveryRate: ${p.recoveryRate}): ${p.desc}`).join('\n')}`;

    console.log(`[Triage] Calling Gemini (${gemini.MODEL_ID}) for return ${returnId}...`);
    const raw = await gemini.converse(systemPrompt, userMessage, true);

    // Parse the AI response
    const aiResult = JSON.parse(raw);

    // Build scores map with factors included
    for (const pathway of pathwaysConfig.pathways) {
      const aiScore = aiResult.scores?.[pathway.id];
      if (aiScore) {
        scores[pathway.id] = {
          eligible: aiScore.eligible,
          score: clamp(aiScore.score),
          reason: aiScore.reason,
          factors,
        };
      } else {
        scores[pathway.id] = { eligible: false, reason: 'Not evaluated by AI', factors };
      }
    }

    selectedPathway = aiResult.selectedPathway;
    reasoning = aiResult.reasoning;
    confidence = clamp(aiResult.confidence || 80);

    // Validate AI picked a real pathway
    if (!pathwaysConfig.pathways.find(p => p.id === selectedPathway)) {
      throw new Error(`AI returned invalid pathway: ${selectedPathway}`);
    }

    console.log(`[Triage] AI selected pathway: ${selectedPathway} (confidence: ${confidence})`);

  } catch (aiError) {
    // ── Fallback to deterministic logic if Gemini call fails ──
    console.warn(`[Triage] Gemini call failed, falling back to deterministic logic:`, aiError.message);

    const base = profile.condition_score;
    for (const pathway of pathwaysConfig.pathways) {
      if (pathway.id === 'restock-original') {
        const isHighValue = (returnDoc.price || product.price) > 50000;
        const isPristine = profile.grade === 'A' && profile.accessory_score === 100 && profile.visual_score >= 95;
        const score = clamp(base + (isPristine ? 5 : -20));
        scores[pathway.id] = (score >= pathway.minScore && isHighValue && isPristine)
          ? { eligible: true, score, factors }
          : { eligible: false, reason: 'Does not meet pristine/high-value criteria for retail restock', factors };
      } else if (pathway.id === 'verified-new') {
        const score = clamp(base + (profile.grade === 'A' ? 4 : -6));
        scores[pathway.id] = score >= pathway.minScore
          ? { eligible: true, score, factors }
          : { eligible: false, reason: 'Condition is below Verified Like-New threshold', factors };
      } else if (pathway.id === 'open-box') {
        const score = clamp(base - (profile.accessory_score < 90 ? 6 : 0));
        scores[pathway.id] = score >= pathway.minScore
          ? { eligible: true, score, factors }
          : { eligible: false, reason: 'Open-box resale confidence is too low', factors };
      } else if (pathway.id === 'refurbished') {
        const needsRepair = profile.functionality_score < 82 || profile.visual_score < 76;
        const score = clamp(78 - Math.max(0, profile.functionality_score - 80) / 2);
        scores[pathway.id] = needsRepair
          ? { eligible: true, score, factors }
          : { eligible: false, reason: 'No repair required', factors };
      } else if (pathway.id === 'donation') {
        const score = clamp(55 - (product.price > 20000 ? 15 : 0) + (profile.condition_score < 70 ? 12 : 0));
        scores[pathway.id] = score >= pathway.minScore
          ? { eligible: true, score, factors }
          : { eligible: false, reason: 'Commercial recovery value is higher', factors };
      } else if (pathway.id === 'recycling') {
        const recycle = profile.condition_score < 45 || profile.functionality_score < 45;
        scores[pathway.id] = recycle
          ? { eligible: true, score: clamp(100 - profile.condition_score), factors }
          : { eligible: false, reason: 'Product remains functional', factors };
      }
    }

    const fallbackMeta = pathwaysConfig.pathways
      .filter(p => scores[p.id]?.eligible)
      .sort((a, b) => a.priority - b.priority)[0] || pathwaysConfig.pathways[pathwaysConfig.pathways.length - 1];
    selectedPathway = fallbackMeta.id;
    reasoning = rerun
      ? `(Fallback) Re-evaluated with inspection data. Condition ${profile.condition_score}, grade ${profile.grade}. ${fallbackMeta.name} is the best match.`
      : `(Fallback) Product grade ${profile.grade}, condition ${profile.condition_score}/100. ${fallbackMeta.name} selected as optimal recovery path.`;
    confidence = clamp((profile.confidence_score + (scores[selectedPathway]?.score || 0)) / 2);
  }

  // ── Build final payload ──
  const selectedMeta = pathwaysConfig.pathways.find(p => p.id === selectedPathway) || pathwaysConfig.pathways[0];
  const selectedScore = scores[selectedPathway]?.score || 0;
  const recovered = Math.round((returnDoc.price || product.price || 0) * selectedMeta.recoveryRate);
  const estimatedRecovery = {
    original: returnDoc.price || product.price,
    recovered,
    percentage: Math.round((recovered / (returnDoc.price || product.price)) * 100),
  };

  const requiresExpert = (returnDoc.price || product.price || 0) > 50000 || 
                         confidence < 80 || 
                         profile.functionality_score < 80 || 
                         profile.visual_score < 70;

  const payload = {
    selectedPathway,
    pathway: selectedMeta.name,
    pathways: pathwaysConfig.pathways,
    scores,
    reasoning,
    estimatedRecovery,
    confidence,
    requiresExpert,
  };

  await repo.updateItem('Returns', returnId, {
    selectedPathway,
    pathway: selectedMeta.name,
    pathwayScores: scores,
    triageResult: payload,
    score: selectedScore,
    status: 'Triaged',
  });

  if (['verified-new', 'open-box', 'refurbished'].includes(selectedPathway)) {
    await upsertMarketplaceListing(returnDoc, product, profile, payload);
  } else if (['recycling', 'donation'].includes(selectedPathway)) {
    await awardCredits(returnDoc.userId, 'sustainable_triage', `Sustainable Routing: ${selectedMeta.name}`, 20, '🌱');
  } else if (selectedPathway === 'restock-original') {
    // Restock to original Amazon inventory, no ReLoop marketplace listing needed.
  }
  return payload;
}

async function upsertMarketplaceListing(returnDoc, product, profile, triage) {
  const label = triage.pathway;
  const priceFactor = label === 'Verified Like-New' ? 0.88 : label === 'Open Box' ? 0.82 : 0.7;
  const listing = {
    id: `ML-${returnDoc.id}`,
    sourceReturnId: returnDoc.id,
    name: product.name,
    emoji: product.emoji,
    label,
    grade: profile.grade,
    originalPrice: product.price,
    reloopPrice: Math.round(product.price * priceFactor),
    conditionScore: profile.condition_score,
    visualScore: profile.visual_score,
    functionalityScore: profile.functionality_score,
    accessoryScore: profile.accessory_score,
    confidence: triage.confidence,
    verified: true,
    category: product.category,
    inspectionDate: today(),
    report: {
      functionality: profile.functionality_score >= 85 ? 'Verified - all major functions working' : 'Verified with minor functional caveats',
      accessories: profile.accessory_score >= 90 ? 'Complete' : 'Accessory check required',
      packaging: profile.accessory_score >= 90 ? 'Original/opened packaging acceptable' : 'Replacement packaging may be used',
      cosmetic: profile.visual_score >= 85 ? 'Excellent cosmetic condition' : 'Visible wear disclosed',
      inspectionType: 'AI + customer evidence verification',
    },
  };
  await repo.putItem('Marketplace', listing);
}

async function getTriageResult(returnId) {
  const returnDoc = await getReturnOrThrow(returnId);
  return returnDoc.triageResult || await runTriage(returnId);
}

async function redeemCredits({ amount, rewardType }, userId = USER_ID) {
  const rewardConfig = await getConfig('creditRewards', { rewards: [] });
  const reward = rewardConfig.rewards.find(item => item.id === rewardType || item.name === rewardType || item.cost === Number(amount));
  if (!reward) {
    const error = new Error('Reward not found');
    error.status = 404;
    throw error;
  }
  const user = await repo.getItem('Users', userId);
  if (!user || (user.totalCredits || 0) < reward.cost) {
    const error = new Error('Insufficient Green Credits');
    error.status = 400;
    throw error;
  }
  const history = [
    { id: randomUUID(), action: `Redeemed ${reward.name}`, credits: -reward.cost, date: today(), icon: reward.icon },
    ...(user.history || []),
  ];
  const totalCredits = user.totalCredits - reward.cost;
  const updated = await repo.updateItem('Users', user.id, { totalCredits, history });
  return toWallet(updated, { redeemed: reward });
}

function toWallet(user, extra = {}) {
  return {
    balance: user?.totalCredits || 0,
    tier: user?.tier || 'New',
    sustainabilityScore: user?.sustainabilityScore || 0,
    history: user?.history || [],
    badges: user?.badges || [],
    ...extra,
  };
}

async function getWallet(userId = USER_ID) {
  let user = await repo.getItem('Users', userId);
  if (!user) {
    user = {
      id: userId,
      totalCredits: 0,
      tier: 'New',
      sustainabilityScore: 0,
      history: [],
      badges: [
        { id: 1, name: 'Eco Explorer', emoji: '🌍', desc: 'First sustainable purchase', earned: false },
        { id: 2, name: 'Green Guardian', emoji: '🛡️', desc: '5 sustainable actions', earned: false },
        { id: 3, name: 'Eco Champion', emoji: '👑', desc: 'Earn 500 Green Credits', earned: false, progress: 0, target: 500 },
      ]
    };
    await repo.putItem('Users', user);
  }
  return toWallet(user);
}

async function getAdminDashboard() {
  const [returns, users, marketplace, orders] = await Promise.all([
    repo.scanTable('Returns'),
    repo.scanTable('Users'),
    repo.scanTable('Marketplace'),
    repo.scanTable('Orders'),
  ]);
  const todayValue = today();
  const triaged = returns.filter(item => item.status === 'Triaged');
  const totalReturnValue = returns.reduce((sum, item) => sum + (item.price || 0), 0);
  const recoveredValue = triaged.reduce((sum, item) => {
    const listing = marketplace.find(entry => entry.sourceReturnId === item.id || entry.id === `ML-${item.id}`);
    return sum + (listing?.reloopPrice || item.triageResult?.estimatedRecovery?.recovered || 0);
  }, 0);
  const pathwayCounts = countPercent(returns.map(item => item.pathway).filter(Boolean), ['Verified Like-New', 'Open Box', 'Certified Refurbished', 'Donation', 'Recycling']);
  const classificationCounts = countPercent(returns.map(item => item.classification?.category).filter(Boolean), ['Genuine Defect', 'Wrong Variant', 'Preference Mismatch', 'Impulse Regret', 'External Circumstance']);
  return {
    totalReturns: returns.length,
    processedToday: returns.filter(item => item.date === todayValue || item.status === 'Triaged').length,
    avgConditionScore: average(returns.map(item => item.profile?.condition_score).filter(Number.isFinite)),
    recoveryRate: totalReturnValue ? Math.round((recoveredValue / totalReturnValue) * 100) : 0,
    valueRecovered: recoveredValue,
    valueSaved: returns.filter(item => ['Kept', 'Exchange Initiated', 'Intercepted'].includes(item.status)).reduce((sum, item) => sum + (item.price || 0), 0),
    returnsPrevented: returns.filter(item => ['Kept', 'Exchange Initiated'].includes(item.status)).length,
    greenCreditsIssued: users.reduce((sum, user) => sum + (user.history || []).filter(h => h.credits > 0).reduce((inner, h) => inner + h.credits, 0), 0),
    pathwayDistribution: pathwayCounts,
    returnClassification: classificationCounts,
    orderCount: orders.length,
  };
}

function countPercent(values, labels) {
  const total = values.length || 1;
  return labels.reduce((acc, label) => {
    acc[label] = Math.round((values.filter(value => value === label).length / total) * 100);
    return acc;
  }, {});
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function seedDefaultOrdersForUser(userId) {
  const defaultOrders = [
    { id: `ORD-${userId}-1`, userId: userId, productId: '1', productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', emoji: '🎧', price: 24990, orderDate: '2026-06-01', deliveryDate: '2026-06-04', status: 'Delivered', canReturn: true },
    { id: `ORD-${userId}-2`, userId: userId, productId: '2', productName: 'Apple MacBook Air M3 15-inch Laptop', emoji: '💻', price: 134900, orderDate: '2026-06-05', deliveryDate: '2026-06-08', status: 'Delivered', canReturn: true },
    { id: `ORD-${userId}-3`, userId: userId, productId: '4', productName: 'Apple Watch Series 9 GPS 45mm', emoji: '⌚', price: 41900, orderDate: '2026-06-08', deliveryDate: '2026-06-10', status: 'Delivered', canReturn: true },
  ];
  for (const order of defaultOrders) {
    await repo.putItem('Orders', order);
  }
  return defaultOrders;
}

module.exports = {
  USER_ID,
  getConfig,
  listProducts,
  getProductOrThrow,
  getProductGuidance,
  initiateReturn,
  classifyReturn,
  decideReturn,
  getInspectionRequirements,
  recordUploadedImages,
  validateImage,
  runVision,
  getFollowUpQuestions,
  submitAnswers,
  verifyClaim,
  getProductProfile,
  runTriage,
  getTriageResult,
  redeemCredits,
  getWallet,
  getAdminDashboard,
  seedDefaultOrdersForUser,
};
