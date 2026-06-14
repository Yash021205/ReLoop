const products = [
  { id: '1', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', emoji: '🎧', price: 24990, originalPrice: 29990, rating: 4.5, reviewCount: 12543, category: 'Headphones', brand: 'Sony', description: 'Industry-leading noise cancellation. 30-hour battery. Crystal-clear calls.', features: ['30-hour battery life', 'Multipoint connection', 'Speak-to-Chat', 'Adaptive Sound Control', 'Hi-Res Audio'], specs: { 'Driver Size': '30mm', 'Frequency Response': '4Hz-40kHz', Weight: '250g', Connectivity: 'Bluetooth 5.2' }, returnRate: 8, commonReturnReasons: ['Expected stronger bass', 'Comfort issues during long use', 'Wrong color ordered'], reloopAvailable: true, returnRisk: 'low' },
  { id: '2', name: 'Apple MacBook Air M3 15-inch Laptop', emoji: '💻', price: 134900, originalPrice: 149900, rating: 4.8, reviewCount: 8721, category: 'Laptops', brand: 'Apple', description: 'Strikingly thin design. Supercharged by M3 chip. Up to 18 hours battery.', features: ['M3 chip', '15.3" Liquid Retina display', '18-hour battery', '8GB RAM', '256GB SSD'], specs: { Processor: 'Apple M3', RAM: '8GB', Storage: '256GB SSD', Display: '15.3" Liquid Retina' }, returnRate: 4, commonReturnReasons: ['Expected more storage', 'Preferred smaller size'], reloopAvailable: true, returnRisk: 'low' },
  { id: '3', name: 'Samsung Galaxy S24 Ultra 256GB', emoji: '📱', price: 119999, originalPrice: 134999, rating: 4.6, reviewCount: 15234, category: 'Smartphones', brand: 'Samsung', description: 'Galaxy AI is here. Most powerful Galaxy experience yet.', features: ['200MP Camera', 'Galaxy AI', 'S Pen built-in', '5000mAh battery', 'Titanium frame'], specs: { Processor: 'Snapdragon 8 Gen 3', RAM: '12GB', Storage: '256GB' }, returnRate: 5, commonReturnReasons: ['Battery drain issues', 'Camera not meeting expectations'], reloopAvailable: true, returnRisk: 'low' },
  { id: '4', name: 'Apple Watch Series 9 GPS 45mm', emoji: '⌚', price: 41900, originalPrice: 47900, rating: 4.7, reviewCount: 6543, category: 'Wearables', brand: 'Apple', description: 'Powerful health and safety features. Double tap gesture.', features: ['S9 SiP chip', 'Double Tap gesture', 'Always-On Retina', 'Blood Oxygen', 'ECG'], specs: { 'Case Size': '45mm', 'Water Resistance': '50m', Battery: 'Up to 18 hours' }, returnRate: 12, commonReturnReasons: ['Wrong size', 'Battery life shorter than expected', 'Comfort issues'], reloopAvailable: true, returnRisk: 'high' },
  { id: '5', name: 'JBL Flip 6 Portable Bluetooth Speaker', emoji: '🔊', price: 8999, originalPrice: 12999, rating: 4.4, reviewCount: 21345, category: 'Electronics', brand: 'JBL', description: 'Bold JBL Original Pro Sound, IP67 waterproof, 12 hours playtime.', features: ['IP67 Waterproof', '12-hour battery', 'PartyBoost', 'JBL Pro Sound'], specs: { Output: '30W', Battery: '4800mAh', Bluetooth: '5.1' }, returnRate: 6, commonReturnReasons: ['Bass not strong enough', 'Size smaller than expected'], reloopAvailable: true, returnRisk: 'low' },
  { id: '6', name: 'Logitech MX Master 3S Wireless Mouse', emoji: '🖱️', price: 8995, originalPrice: 10995, rating: 4.6, reviewCount: 9876, category: 'Accessories', brand: 'Logitech', description: 'Quiet clicks. MagSpeed scrolling. Ergonomic design.', features: ['8K DPI sensor', 'Quiet Clicks', 'MagSpeed Scroll', 'USB-C'], specs: { DPI: '200-8000', Battery: 'Up to 70 days', Buttons: '7' }, returnRate: 3, commonReturnReasons: ['Too heavy', 'Scroll wheel preference'], reloopAvailable: false, returnRisk: 'low' },
  { id: '7', name: 'boAt Rockerz 450 Bluetooth On-Ear Headphones', emoji: '🎧', price: 1299, originalPrice: 2990, rating: 4.1, reviewCount: 45678, category: 'Headphones', brand: 'boAt', description: 'HD immersive sound. 15 hours battery. Padded cushions.', features: ['40mm drivers', '15-hour battery', 'Padded ear cushions', 'Lightweight'], specs: { 'Driver Size': '40mm', Battery: '300mAh', Weight: '185g' }, returnRate: 14, commonReturnReasons: ['Sound quality below expectations', 'Build quality concerns', 'Wrong color'], reloopAvailable: true, returnRisk: 'high' },
  { id: '8', name: 'HP Pavilion x360 14" Convertible Laptop', emoji: '💻', price: 59990, originalPrice: 69990, rating: 4.3, reviewCount: 3456, category: 'Laptops', brand: 'HP', description: 'Convertible 2-in-1. Intel Core i5. Full HD touchscreen.', features: ['Intel Core i5', '14" FHD Touch', '8GB RAM', '512GB SSD', '360° hinge'], specs: { Processor: 'Intel Core i5-1335U', RAM: '8GB DDR4', Storage: '512GB SSD' }, returnRate: 7, commonReturnReasons: ['Fan noise too loud', 'Trackpad sensitivity'], reloopAvailable: true, returnRisk: 'low' },
  { id: '9', name: 'OnePlus Nord Buds 2 TWS Earbuds', emoji: '🎵', price: 2299, originalPrice: 2999, rating: 4.2, reviewCount: 32100, category: 'Headphones', brand: 'OnePlus', description: '12.4mm drivers, 36 hours playback, IP55 rated.', features: ['12.4mm drivers', '36-hour battery', 'IP55', 'ANC'], specs: { Driver: '12.4mm', Bluetooth: '5.3', Weight: '4.8g per bud' }, returnRate: 9, commonReturnReasons: ['ANC not strong enough', 'Ear fit issues'], reloopAvailable: true, returnRisk: 'low' },
  { id: '10', name: 'Kindle Paperwhite 16GB (2024)', emoji: '📖', price: 14999, originalPrice: 16999, rating: 4.7, reviewCount: 5680, category: 'Electronics', brand: 'Amazon', description: '6.8" display, adjustable warm light, waterproof.', features: ['6.8" Glare-free display', 'Waterproof IPX8', 'Adjustable warm light', 'Up to 10 weeks battery'], specs: { Storage: '16GB', Display: '6.8" 300ppi', Weight: '205g' }, returnRate: 3, commonReturnReasons: ['Screen too small', 'Prefer tablet'], reloopAvailable: true, returnRisk: 'low' },
];

const orders = [
  { id: 'ORD-1001', userId: 'u1', productId: '1', productName: products[0].name, emoji: '🎧', price: 24990, orderDate: '2026-06-01', deliveryDate: '2026-06-04', status: 'Delivered', canReturn: true },
  { id: 'ORD-1002', userId: 'u1', productId: '2', productName: products[1].name, emoji: '💻', price: 134900, orderDate: '2026-06-05', deliveryDate: '2026-06-08', status: 'Delivered', canReturn: true },
  { id: 'ORD-1003', userId: 'u1', productId: '4', productName: products[3].name, emoji: '⌚', price: 41900, orderDate: '2026-06-08', deliveryDate: '2026-06-10', status: 'Delivered', canReturn: true },
  { id: 'ORD-1004', userId: 'u1', productId: '5', productName: products[4].name, emoji: '🔊', price: 8999, orderDate: '2026-06-10', deliveryDate: '2026-06-12', status: 'Delivered', canReturn: true },
  { id: 'ORD-1005', userId: 'u1', productId: '7', productName: products[6].name, emoji: '🎧', price: 1299, orderDate: '2026-06-12', deliveryDate: '2026-06-14', status: 'Delivered', canReturn: true },
  { id: 'ORD-1006', userId: 'u1', productId: '3', productName: products[2].name, emoji: '📱', price: 119999, orderDate: '2026-06-13', status: 'In Transit', canReturn: false },
];

const marketplace = [
  { id: 'ML-1', sourceReturnId: 'RET-1001', name: 'Sony WH-1000XM5 Headphones', emoji: '🎧', label: 'Verified Like-New', grade: 'A', originalPrice: 24990, reloopPrice: 21990, conditionScore: 96, visualScore: 94, functionalityScore: 90, accessoryScore: 100, confidence: 92, verified: true, category: 'Headphones', inspectionDate: '2026-06-12', report: { functionality: 'Verified - all features working correctly', accessories: 'Complete - cable, case, and manual included', packaging: 'Opened - original packaging slightly worn', cosmetic: 'Excellent - no visible scratches or damage', inspectionType: 'AI + physical verification' } },
  { id: 'ML-2', name: 'Apple MacBook Air M3 Laptop', emoji: '💻', label: 'Open Box', grade: 'A-', originalPrice: 134900, reloopPrice: 114900, conditionScore: 88, visualScore: 85, functionalityScore: 100, accessoryScore: 90, confidence: 94, verified: true, category: 'Laptops', inspectionDate: '2026-06-13', report: { functionality: 'Verified', accessories: 'Box opened, minor scuffs', packaging: 'Worn', cosmetic: 'Good', inspectionType: 'AI verification' } },
  { id: 'ML-3', name: 'Samsung Galaxy S24 Ultra', emoji: '📱', label: 'Certified Refurbished', grade: 'B+', originalPrice: 119999, reloopPrice: 89999, conditionScore: 78, visualScore: 72, functionalityScore: 100, accessoryScore: 100, confidence: 88, verified: true, category: 'Smartphones', inspectionDate: '2026-06-10', report: { functionality: 'Fully restored', accessories: 'Complete', packaging: 'Generic box', cosmetic: 'Minor scratches on back glass', inspectionType: 'Factory refurbished' } },
  { id: 'ML-4', name: 'Apple Watch Series 9', emoji: '⌚', label: 'Verified Like-New', grade: 'A', originalPrice: 41900, reloopPrice: 37900, conditionScore: 94, visualScore: 95, functionalityScore: 100, accessoryScore: 100, confidence: 95, verified: true, category: 'Wearables', inspectionDate: '2026-06-14', report: { functionality: 'Verified', accessories: 'Complete', packaging: 'Opened', cosmetic: 'Pristine', inspectionType: 'AI verification' } },
];

const users = [
  { id: 'u1', totalCredits: 250, tier: 'Green Guardian', sustainabilityScore: 78, history: [
    { id: 'hist-1', action: 'Kept product after AI guidance', credits: 25, date: '2026-06-14', icon: '💚' },
    { id: 'hist-2', action: 'Purchased Open Box - JBL Flip 6', credits: 15, date: '2026-06-12', icon: '📦' },
  ], badges: [
    { id: 1, name: 'Eco Explorer', emoji: '🌍', desc: 'First sustainable purchase', earned: true },
    { id: 2, name: 'Green Guardian', emoji: '🛡️', desc: '5 sustainable actions', earned: true },
    { id: 3, name: 'Eco Champion', emoji: '👑', desc: 'Earn 500 Green Credits', earned: false, progress: 250, target: 500 },
  ] },
];

const returns = [
  { id: 'RET-1001', userId: 'u1', orderId: 'ORD-1001', productId: '1', product: 'Sony WH-1000XM5', productName: products[0].name, emoji: '🎧', category: 'Headphones', price: 24990, reason: 'Product not as expected', explanation: 'Expected stronger bass but the product is otherwise fine.', status: 'Triaged', pathway: 'Verified Like-New', selectedPathway: 'verified-new', score: 96, date: '2026-06-14', createdAt: '2026-06-14T09:00:00.000Z', classification: { category: 'Preference Mismatch', emoji: '🤔', color: 'var(--warning)', action: 'guidance', msg: 'We are sorry the product did not meet your expectations. Let us help you find a better match.', sentiment: 'Neutral', confidence: 87, suggestion: 'guidance' }, profile: { condition_score: 92, visual_score: 94, functionality_score: 90, accessory_score: 100, claim_consistency: 88, confidence_score: 91, grade: 'A' } },
  { id: 'RET-1002', userId: 'u1', orderId: 'ORD-1002', productId: '2', product: 'Apple MacBook Air M3', productName: products[1].name, emoji: '💻', category: 'Laptops', price: 134900, reason: 'Changed my mind', explanation: 'Prefer a smaller laptop.', status: 'Inspecting', pathway: null, selectedPathway: null, score: null, date: '2026-06-14', createdAt: '2026-06-14T10:00:00.000Z', triageResult: { requiresExpert: true } },
];

const config = [
  { id: 'returnReasons', reasons: ['Product not as expected', 'Wrong size / variant', 'Product damaged / defective', 'Changed my mind', 'Found better price elsewhere', 'Quality not satisfactory', 'Missing parts / accessories', 'Other'] },
  { id: 'classificationRules', rules: {
    'Product damaged / defective': { category: 'Genuine Defect', emoji: '🔧', color: 'var(--error)', action: 'continue', msg: 'We understand your concern. Let us proceed with inspection and route it correctly.', sentiment: 'Concerned', confidence: 91, suggestion: 'return' },
    'Wrong size / variant': { category: 'Wrong Variant', emoji: '🔄', color: 'var(--info)', action: 'exchange', msg: 'It seems like you received or selected the wrong variant. An exchange may solve this faster than a return.', sentiment: 'Neutral', confidence: 89, suggestion: 'exchange' },
    'Product not as expected': { category: 'Preference Mismatch', emoji: '🤔', color: 'var(--warning)', action: 'guidance', msg: 'We are sorry it did not meet your expectations. We can help you find a better fit or continue the return.', sentiment: 'Neutral', confidence: 86, suggestion: 'guidance' },
    'Changed my mind': { category: 'Impulse Regret', emoji: '💭', color: 'var(--teal-500)', action: 'keep', msg: 'Many customers find more value after a short setup period. Keeping it earns Green Credits and avoids waste.', sentiment: 'Neutral', confidence: 82, suggestion: 'keep' },
    'Found better price elsewhere': { category: 'External Circumstance', emoji: '💰', color: 'var(--gray-600)', action: 'price', msg: 'We want you to get the best value. We can check alternatives before completing the return.', sentiment: 'Neutral', confidence: 84, suggestion: 'exchange' },
    'Quality not satisfactory': { category: 'Preference Mismatch', emoji: '📉', color: 'var(--warning)', action: 'guidance', msg: 'Thanks for the detail. Inspection helps us separate preference issues from product defects.', sentiment: 'Concerned', confidence: 85, suggestion: 'guidance' },
    'Missing parts / accessories': { category: 'Genuine Defect', emoji: '📦', color: 'var(--error)', action: 'continue', msg: 'Missing accessories are eligible for inspection and resolution.', sentiment: 'Concerned', confidence: 90, suggestion: 'return' },
    Other: { category: 'External Circumstance', emoji: '📝', color: 'var(--gray-600)', action: 'continue', msg: 'We will review your request and route it to the best next step.', sentiment: 'Neutral', confidence: 78, suggestion: 'return' },
  } },
  { id: 'inspectionRequirements', default: ['Front View', 'Back View', 'Close-up Detail', 'Packaging'], byCategory: {
    Headphones: ['Front View', 'Left Earcup', 'Right Earcup', 'Headband', 'Charging Port'],
    Laptops: ['Lid Closed', 'Screen On', 'Keyboard', 'Ports (Left)', 'Ports (Right)', 'Bottom'],
    Smartphones: ['Front Screen', 'Back Panel', 'Charging Port', 'Side Buttons'],
    Wearables: ['Front View', 'Back Sensor', 'Strap', 'Charging Area'],
    Electronics: ['Front View', 'Back View', 'Ports', 'Packaging'],
    Accessories: ['Front View', 'Back View', 'Functional Area', 'Packaging'],
  } },
  { id: 'triagePathways', pathways: [
    { id: 'restock-original', name: 'Restock Original', icon: '⭐', color: 'var(--blue-600)', bgColor: '#E3F2FD', borderColor: '#90CAF9', desc: 'Pristine condition and high value. Sent back to primary fulfillment center for original retail.', priority: 0, minScore: 95, recoveryRate: 1.0 },
    { id: 'verified-new', name: 'Verified Like-New', icon: '✅', color: 'var(--green-700)', bgColor: 'var(--green-50)', borderColor: 'var(--green-300)', desc: 'Near-new condition. Relisted on ReLoop Marketplace.', priority: 1, minScore: 88, recoveryRate: 0.95 },
    { id: 'open-box', name: 'Open Box', icon: '📦', color: '#E65100', bgColor: '#FFF3E0', borderColor: '#FFE0B2', desc: 'Fully functional. Packaging opened or replaced.', priority: 2, minScore: 70, recoveryRate: 0.82 },
    { id: 'refurbished', name: 'Certified Refurbished', icon: '🔧', color: 'var(--info)', bgColor: '#E3F2FD', borderColor: '#BBDEFB', desc: 'Repair completed. Quality testing passed.', priority: 3, minScore: 58, recoveryRate: 0.7 },
    { id: 'donation', name: 'Donation', icon: '❤️', color: '#7B1FA2', bgColor: '#F3E5F5', borderColor: '#CE93D8', desc: 'Social value exceeds resale value.', priority: 4, minScore: 35, recoveryRate: 0.25 },
    { id: 'recycling', name: 'Recycling', icon: '♻️', color: 'var(--gray-600)', bgColor: 'var(--gray-100)', borderColor: 'var(--gray-300)', desc: 'Responsible end-of-life handling.', priority: 5, minScore: 0, recoveryRate: 0.05 },
  ] },
  { id: 'creditRules', rules: { exchange: { credits: 20, icon: '🔄', action: 'Exchange instead of return' }, keep: { credits: 25, icon: '💚', action: 'Kept product after AI guidance' }, marketplaceOpenBox: { credits: 15, icon: '📦', action: 'Buy Open Box' }, marketplaceRefurbished: { credits: 20, icon: '🔧', action: 'Buy Refurbished' }, recycle: { credits: 30, icon: '♻️', action: 'Recycle' } } },
  { id: 'creditRewards', rewards: [
    { id: 'reward-100-off', name: '₹100 Off Next Purchase', cost: 100, icon: '🎫' },
    { id: 'reward-open-box-250', name: '₹250 Off Open Box Products', cost: 200, icon: '📦' },
    { id: 'reward-free-shipping', name: 'Free Shipping on Next Order', cost: 50, icon: '🚚' },
    { id: 'reward-early-access', name: 'Early Access to Re:Loop Deals', cost: 150, icon: '⚡' },
  ] },
  { id: 'marketplaceFilters', filters: ['All', 'Verified Like-New', 'Open Box', 'Certified Refurbished'] },
  { id: 'productCategories', categories: ['All', 'Electronics', 'Headphones', 'Laptops', 'Smartphones', 'Wearables', 'Accessories'] },
];

module.exports = { products, orders, marketplace, users, returns, config };
