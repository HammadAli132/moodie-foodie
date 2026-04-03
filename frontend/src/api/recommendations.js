import { apiRequest } from './client';

/**
 * Step 1: Get LLM-generated follow-up questions for a given mood.
 * @param {string} mood - one of VALID_MOODS
 * @returns {{ mood: string, questions: Array<{ question, options: [{label, value}] }> }}
 */
export async function generateQuestions(mood) {
  return apiRequest('/recommendations/generate-questions', {
    method: 'POST',
    body: { mood },
  });
}

/**
 * Step 2: Run the full recommendation pipeline.
 * Token is injected automatically by apiRequest if the user is logged in,
 * which causes the backend to load their dietary profile.
 *
 * @param {{
 *   initial_mood: string,
 *   answers: Array<{ question: string, answer: string }>,
 *   dietary_override?: { dietary_flags: string[], allergens: string[] }
 * }} payload
 * @returns {{
 *   session_id, refined_mood, refined_tags,
 *   dietary_filters_applied,
 *   recommendations: Array<{ dish, restaurant, tags, reasoning, foodpanda_link, price_range }>
 * }}
 */
export async function getRecommendations(payload) {
  return apiRequest('/recommendations/get-recommendations', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Step 3: Submit thumbs up/down for a completed session.
 * @param {{ session_id: string, thumbs_up: boolean }} payload
 * @returns {{ success: boolean, message: string }}
 */
export async function submitFeedback(payload) {
  return apiRequest('/feedback/submit', {
    method: 'POST',
    body: payload,
  });
}