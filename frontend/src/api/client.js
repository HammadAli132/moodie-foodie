const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Central fetch wrapper.
 * - Injects Bearer token from localStorage if present.
 * - Throws a structured { status, message } error on non-2xx responses.
 * - All API modules use this — never call fetch() directly in components.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('fm_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // FastAPI validation errors have a detail array
    const message =
      Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(', ')
        : data.detail || `Request failed with status ${response.status}`;

    throw { status: response.status, message };
  }

  return data;
}