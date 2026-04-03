import { apiRequest } from './client';

/**
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {{ access_token, token_type, user_id, name, email }}
 */
export async function signup(payload) {
  return apiRequest('/auth/signup', { method: 'POST', body: payload, auth: false });
}

/**
 * @param {{ email: string, password: string }} payload
 * @returns {{ access_token, token_type, user_id, name, email }}
 */
export async function login(payload) {
  return apiRequest('/auth/login', { method: 'POST', body: payload, auth: false });
}