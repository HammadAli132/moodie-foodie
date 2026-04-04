import { apiRequest } from './client';

/** @returns {{ user_id, name, email, has_preferences }} */
export async function getProfile() {
  return apiRequest('/users/me');
}

/**
 * @param {{ name?: string, current_password?: string, new_password?: string }} payload
 * @returns {{ user_id, name, email, has_preferences }}
 */
export async function updateProfile(payload) {
  return apiRequest('/users/me', { method: 'PATCH', body: payload });
}

/** @returns {{ user_id, dietary_flags, allergens }} */
export async function getPreferences() {
  return apiRequest('/users/me/preferences');
}

/**
 * @param {{ dietary_flags: string[], allergens: string[] }} payload
 * @returns {{ user_id, dietary_flags, allergens }}
 */
export async function updatePreferences(payload) {
  return apiRequest('/users/me/preferences', { method: 'PUT', body: payload });
}