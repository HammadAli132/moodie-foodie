import React from 'react';
import styles from '../styles/StepDots.module.css';

export default function StepDots({ current, total }) {
  return (
    <div className={styles.dots} role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`${styles.dot} ${i === current ? styles.active : ''} ${i < current ? styles.done : ''}`}
        />
      ))}
    </div>
  );
}
