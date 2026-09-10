const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('opsflow_token') || '';
}

export function setToken(token) {
  if (token) localStorage.setItem('opsflow_token', token);
  else localStorage.removeItem('opsflow_token');
}

/**
 * GET requests: plain query string, cheap and cacheable by the browser.
 */
async function apiGet(action, params = {}) {
  if (!API_URL) throw new Error('VITE_API_URL is not set. Copy .env.example to .env and paste your Apps Script URL.');
  const qs = new URLSearchParams({ action, token: getToken(), ...params });
  const res = await fetch(`${API_URL}?${qs.toString()}`, { method: 'GET' });
  return parseResponse(res);
}

/**
 * POST requests: sent as text/plain to avoid a CORS preflight, which
 * Apps Script Web Apps do not handle. The Apps Script side still parses
 * the body as JSON.
 */
async function apiPost(action, payload = {}) {
  if (!API_URL) throw new Error('VITE_API_URL is not set. Copy .env.example to .env and paste your Apps Script URL.');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token: getToken(), ...payload })
  });
  return parseResponse(res);
}

async function parseResponse(res) {
  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error('The server returned an unexpected response. Please try again.');
  }
  if (!json.ok) {
    const err = new Error(json.error || 'Something went wrong.');
    if (/unauthor|not.*logged|log in/i.test(json.error || '')) err.isAuthError = true;
    throw err;
  }
  return json.data;
}

export const api = { get: apiGet, post: apiPost };
