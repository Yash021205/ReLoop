const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

function getAuthHeaders(headers = {}) {
  const storedUser = localStorage.getItem('reloop_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.id) {
        return {
          ...headers,
          'x-user-id': user.id
        };
      }
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }
  return headers;
}


export async function fetchProducts(category) {
  const url = category ? `${API_BASE}/products?category=${category}` : `${API_BASE}/products`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchProductCategories() {
  const res = await fetch(`${API_BASE}/products/categories`);
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return res.json();
}

export async function fetchGuidance(productId, context) {
  const res = await fetch(`${API_BASE}/products/${productId}/guidance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function fetchReturnReasons() {
  const res = await fetch(`${API_BASE}/returns/reasons`);
  return res.json();
}

export async function initiateReturn(orderId, data) {
  const res = await fetch(`${API_BASE}/returns/initiate`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ orderId, ...data }),
  });
  return res.json();
}

export async function classifyReturn(returnId) {
  const res = await fetch(`${API_BASE}/returns/${returnId}/classify`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function decideReturn(returnId, decision) {
  const res = await fetch(`${API_BASE}/returns/${returnId}/decide`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ decision }),
  });
  return res.json();
}

export async function uploadImages(returnId, files) {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  const res = await fetch(`${API_BASE}/inspection/${returnId}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getInspectionRequirements(returnId) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/requirements`);
  return res.json();
}

export async function validateImage(returnId, imageUrl) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/validate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  return res.json();
}

export async function runVisionInspection(returnId) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/vision`, { method: 'POST' });
  return res.json();
}

export async function getFollowUpQuestions(returnId) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/questions`, { method: 'POST' });
  return res.json();
}

export async function submitAnswers(returnId, answers) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return res.json();
}

export async function verifyClaim(returnId) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/verify-claim`, { method: 'POST' });
  return res.json();
}

export async function getProductProfile(returnId) {
  const res = await fetch(`${API_BASE}/inspection/${returnId}/profile`);
  return res.json();
}

export async function runTriage(returnId) {
  const res = await fetch(`${API_BASE}/triage/${returnId}/evaluate`, { method: 'POST' });
  return res.json();
}

export async function reRunTriage(returnId) {
  const res = await fetch(`${API_BASE}/triage/${returnId}/evaluate?rerun=true`, { method: 'POST' });
  return res.json();
}

export async function getTriageResult(returnId) {
  const res = await fetch(`${API_BASE}/triage/${returnId}/result`);
  return res.json();
}

export async function getTriagePathways() {
  const res = await fetch(`${API_BASE}/triage/pathways`);
  return res.json();
}

export async function getUserReturns() {
  const res = await fetch(`${API_BASE}/returns`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getMarketplaceListings(filters) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/marketplace/listings?${params}`);
  return res.json();
}

export async function getMarketplaceFilters() {
  const res = await fetch(`${API_BASE}/marketplace/filters`);
  return res.json();
}

export async function getMarketplaceListing(id) {
  const res = await fetch(`${API_BASE}/marketplace/listings/${id}`);
  return res.json();
}

export async function buyMarketplaceListing(id) {
  const res = await fetch(`${API_BASE}/marketplace/listings/${id}/buy`, { method: 'POST' });
  return res.json();
}

export async function getGreenWallet() {
  const res = await fetch(`${API_BASE}/credits/wallet`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getBadges() {
  const res = await fetch(`${API_BASE}/credits/badges`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getCreditRewards() {
  const res = await fetch(`${API_BASE}/credits/rewards`);
  return res.json();
}

export async function redeemCredits(amount, rewardType) {
  const res = await fetch(`${API_BASE}/credits/redeem`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ amount, rewardType }),
  });
  return res.json();
}

export async function getAdminDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`);
  return res.json();
}

export async function getAdminReturns() {
  const res = await fetch(`${API_BASE}/admin/returns`);
  return res.json();
}
