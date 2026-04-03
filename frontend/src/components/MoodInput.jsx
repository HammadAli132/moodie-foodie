import React, { useRef } from 'react';
import styles from '../styles/MoodScreen.module.css';

export default function MoodInput({ moodText, setMoodText, onNext }) {
  const taRef = useRef();

  function handleSubmit() {
    if (!moodText.trim()) {
      taRef.current?.focus();
      taRef.current?.classList.add(styles.shake);
      setTimeout(() => taRef.current?.classList.remove(styles.shake), 500);
      return;
    }
    onNext();
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>tell us your mood</div>

      <h1 className={styles.heading}>
        What are you <em>craving</em> tonight?
      </h1>

      <p className={styles.sub}>
        Describe your evening, your feeling, the weather —<br />
        we'll find the food that fits.
      </p>

      <textarea
        ref={taRef}
        className={styles.textarea}
        value={moodText}
        onChange={(e) => setMoodText(e.target.value)}
        placeholder="It's raining outside and I want something that feels like a warm hug, a snuggle in a blanket..."
        rows={5}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
      />

      <p className={styles.hint}>tip: be as poetic or specific as you like</p>

      <button className={styles.btn} onClick={handleSubmit}>
        Find My Food
        <span className={styles.arrow}>→</span>
      </button>
    </div>
  );
}
