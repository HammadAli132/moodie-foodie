import React, { useMemo } from 'react';
import styles from '../../styles/Background.module.css';

export default function Background() {
  const drops = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      height: 55 + Math.random() * 75,
      duration: 1.8 + Math.random() * 2.4,
      delay: Math.random() * 4,
      opacity: 0.12 + Math.random() * 0.22,
    })),
  []);

  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={styles.glowTop} />
      <div className={styles.glowBottom} />
      {drops.map((d) => (
        <div
          key={d.id}
          className={styles.drop}
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}