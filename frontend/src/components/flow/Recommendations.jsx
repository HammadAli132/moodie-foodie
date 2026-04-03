import React from 'react';
import DishCard from './DishCard';
import styles from '../../styles/RecommendationsScreen.module.css';

export default function Recommendations({ recommendations, refinedMood, onFeedback, onReset }) {
  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>your perfect match</div>
      <h1 className={styles.heading}>
        Tonight's <em>bites</em> for you
      </h1>
      {refinedMood && (
        <p className={styles.sub}>
          Curated for when you're feeling <em>{refinedMood}</em>.
        </p>
      )}

      <div className={styles.grid}>
        {recommendations.map((rec, i) => (
          <DishCard key={rec.dish + i} rec={rec} index={i} />
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} onClick={onFeedback}>
          Did this match your mood?
          <span className={styles.arrow}>→</span>
        </button>
        <button className={styles.resetLink} onClick={onReset}>
          Start over
        </button>
      </div>
    </div>
  );
}