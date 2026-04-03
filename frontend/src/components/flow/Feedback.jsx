import React, { useState } from 'react';
import styles from '../../styles/FeedbackScreen.module.css';

/**
 * onSubmit: (thumbsUp: boolean) => Promise<void>
 * onReset:  () => void
 */
export default function Feedback({ onSubmit, onReset }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleVote(thumbsUp) {
    setLoading(true);
    await onSubmit(thumbsUp);
    setSubmitted(true);
    setLoading(false);
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
        Did this match your <em>mood?</em>
      </h1>
      <p className={styles.sub}>
        Your answer helps us recommend better next time.
      </p>

      <div className={styles.thumbsRow}>
        <button
          className={`${styles.thumbBtn} ${styles.thumbUp}`}
          onClick={() => handleVote(true)}
          disabled={loading}
          aria-label="Yes, it matched"
        >
          👍
          <span>Yes!</span>
        </button>
        <button
          className={`${styles.thumbBtn} ${styles.thumbDown}`}
          onClick={() => handleVote(false)}
          disabled={loading}
          aria-label="No, it didn't match"
        >
          👎
          <span>Not quite</span>
        </button>
      </div>

      <button className={styles.resetLink} onClick={onReset} disabled={loading}>
        Skip &amp; start over
      </button>
    </div>
  );
}