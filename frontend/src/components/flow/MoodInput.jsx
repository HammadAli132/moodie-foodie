import React, { useState } from 'react';
import styles from '../../styles/MoodScreen.module.css';

const MOODS = [
  { value: 'stressed',     label: 'Stressed',     emoji: '😤' },
  { value: 'happy',        label: 'Happy',        emoji: '😊' },
  { value: 'tired',        label: 'Tired',        emoji: '😴' },
  { value: 'celebratory',  label: 'Celebratory',  emoji: '🎉' },
  { value: 'sad',          label: 'Sad',          emoji: '😔' },
  { value: 'neutral',      label: 'Neutral',      emoji: '😐' },
  { value: 'anxious',      label: 'Anxious',      emoji: '😰' },
  { value: 'bored',        label: 'Bored',        emoji: '🥱' },
  { value: 'excited',      label: 'Excited',      emoji: '🤩' },
  { value: 'romantic',     label: 'Romantic',     emoji: '🥰' },
];

export default function MoodInput({ onSubmit, loading }) {
  const [selected, setSelected] = useState(null);

  function handleNext() {
    if (!selected || loading) return;
    onSubmit(selected);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>tell us your mood</div>
      <h1 className={styles.heading}>
        How are you <em>feeling</em> right now?
      </h1>
      <p className={styles.sub}>
        Pick the mood that fits — we'll take it from here.
      </p>

      <div className={styles.moodGrid}>
        {MOODS.map(({ value, label, emoji }) => (
          <button
            key={value}
            className={`${styles.moodCard} ${selected === value ? styles.selected : ''}`}
            onClick={() => setSelected(value)}
            disabled={loading}
            type="button"
          >
            <span className={styles.moodEmoji}>{emoji}</span>
            <span className={styles.moodLabel}>{label}</span>
          </button>
        ))}
      </div>

      <button
        className={`${styles.btn} ${!selected || loading ? styles.btnDisabled : ''}`}
        onClick={handleNext}
        disabled={!selected || loading}
      >
        {loading ? 'Loading questions…' : 'Next'}
        {!loading && <span className={styles.arrow}>→</span>}
      </button>
    </div>
  );
}