import React from 'react';
import styles from '../../styles/Spinner.module.css';

export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className={styles.wrap} role="status" aria-label={label}>
      <div className={styles.ring} />
      <p className={styles.label}>{label}</p>
    </div>
  );
}