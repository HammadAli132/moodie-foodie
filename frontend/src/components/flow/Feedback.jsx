import React, { useState } from 'react';
import styles from '../styles/FeedbackScreen.module.css';

export default function Feedback({ onReset }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!rating) return;
    // Store feedback in localStorage for persistence
    try {
      const prev = JSON.parse(localStorage.getItem('foodiemoodie_feedback') || '[]');
      prev.push({ rating, comment, timestamp: new Date().toISOString() });
      localStorage.setItem('foodiemoodie_feedback', JSON.stringify(prev));
    } catch {
      // localStorage unavailable — silently continue
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.screen}>
        <div className={styles.thankWrap}>
          <div className={styles.thankIcon}>✦</div>
          <h1 className={styles.thankHeading}>Thank you for the love</h1>
          <p className={styles.thankSub}>
            Your feedback helps us serve better moods,<br />
            one rainy night at a time.
          </p>
          <button className={styles.btn} onClick={onReset}>
            Order Again
            <span className={styles.arrow}>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>one last thing</div>
      <h1 className={styles.heading}>
        How did we <em>do?</em>
      </h1>
      <p className={styles.sub}>
        Was it the right kind of comfort? Tell us.
      </p>

      <div className={styles.card}>
        <p className={styles.label}>Rate your experience</p>
        <div
          className={styles.stars}
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`${styles.star} ${n <= (hovered || rating) ? styles.lit : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              aria-label={`Rate ${n} out of 5`}
            >
              ★
            </button>
          ))}
        </div>

        <p className={styles.label} style={{ marginTop: '1.2rem' }}>
          Tell us more <span className={styles.optional}>(optional)</span>
        </p>
        <textarea
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What were you craving? Was the suggestion spot on?"
          rows={4}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${!rating ? styles.btnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!rating}
        >
          Submit Feedback
        </button>
        <button className={styles.resetLink} onClick={onReset}>
          Skip &amp; start over
        </button>
      </div>
    </div>
  );
}
