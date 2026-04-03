// Auth API utilities
// Replace these mock functions with real API calls once backend is ready

const API_BASE_URL = 'http://localhost:8000/api'; // Update with your backend URL

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // const data = await response.json();
  // return data;

  // Mock implementation for MVP
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    token: btoa(JSON.stringify({ email, timestamp: Date.now() })),
    user: { email }
  };
}

/**
 * Signup user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string, user: object}>}
 */
export async function signup(username, email, password) {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/signup`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, email, password }),
  // });
  // const data = await response.json();
  // return data;

  // Mock implementation for MVP
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    token: btoa(JSON.stringify({ email, username, timestamp: Date.now() })),
    user: { email, username }
  };
}

/**
 * Verify if token is still valid
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
export async function verifyToken(token) {
  // TODO: Replace with real API call
  // const response = await fetch(`${API_BASE_URL}/verify`, {
  //   method: 'GET',
  //   headers: { 'Authorization': `Bearer ${token}` },
  // });
  // return response.ok;

  // Mock implementation for MVP
  return !!token;
}

/**
 * Get authorization header for authenticated requests
 * @returns {object}
 */
export function getAuthHeader() {
  const token = sessionStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
