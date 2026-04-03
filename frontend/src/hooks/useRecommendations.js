import { useState, useCallback } from 'react';
import { generateQuestions, getRecommendations, submitFeedback } from '../api/recommendations';

/**
 * Manages the entire recommendation flow as a state machine.
 *
 * Steps:
 *  0 — mood picker
 *  1 — follow-up questions (LLM-generated)
 *  2 — recommendations
 *  3 — feedback
 */
export function useRecommendations() {
  const [step, setStep]                   = useState(0);
  const [selectedMood, setSelectedMood]   = useState(null);
  const [questions, setQuestions]         = useState([]);    // [{question, options:[{label,value}]}]
  const [answers, setAnswers]             = useState([]);    // [{question, answer}]
  const [sessionId, setSessionId]         = useState(null);
  const [refinedMood, setRefinedMood]     = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const reset = useCallback(() => {
    setStep(0);
    setSelectedMood(null);
    setQuestions([]);
    setAnswers([]);
    setSessionId(null);
    setRefinedMood('');
    setRecommendations([]);
    setLoading(false);
    setError(null);
  }, []);

  /** Step 0 → 1: user picked a mood, fetch questions */
  const submitMood = useCallback(async (mood) => {
    setError(null);
    setLoading(true);
    setSelectedMood(mood);
    try {
      const data = await generateQuestions(mood);
      setQuestions(data.questions);
      // Initialise answers array with nulls matching question count
      setAnswers(data.questions.map(() => null));
      setStep(1);
    } catch (err) {
      setError(err.message || 'Could not load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Step 1 → 2: user answered questions, fetch recommendations */
  const submitAnswers = useCallback(async (filledAnswers) => {
    setError(null);
    setLoading(true);
    try {
      // filledAnswers: [{question: string, answer: string}]
      const data = await getRecommendations({
        initial_mood: selectedMood,
        answers: filledAnswers,
      });
      setSessionId(data.session_id);
      setRefinedMood(data.refined_mood);
      setRecommendations(data.recommendations);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Could not get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedMood]);

  /** Step 2 → 3: user clicked to leave feedback */
  const goToFeedback = useCallback(() => setStep(3), []);

  /** Step 3: submit thumbs up/down */
  const submitThumbsFeedback = useCallback(async (thumbsUp) => {
    if (!sessionId) return;
    try {
      await submitFeedback({ session_id: sessionId, thumbs_up: thumbsUp });
    } catch {
      // Feedback failure is non-critical — swallow silently
    }
  }, [sessionId]);

  return {
    step, selectedMood, questions, answers, setAnswers,
    sessionId, refinedMood, recommendations,
    loading, error,
    submitMood, submitAnswers, goToFeedback, submitThumbsFeedback, reset,
  };
}