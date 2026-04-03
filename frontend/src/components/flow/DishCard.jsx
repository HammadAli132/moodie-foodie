import React from 'react';
import { WARM_REASONS } from '../data/mockData';
import styles from '../styles/RecommendationsScreen.module.css';

const PRICE_LABEL = { low: 'Budget-friendly', medium: 'Mid-range', high: 'Premium' };

export default function DishCard({ rec, index }) {
  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardTop}>
        <span className={styles.pickNum}>Pick {String(index + 1).padStart(2, '0')}</span>
        {rec.priceRange && (
          <span className={styles.priceBadge}>{PRICE_LABEL[rec.priceRange]}</span>
        )}
      </div>

      <h2 className={styles.dishName}>{rec.name}</h2>
      <p className={styles.restaurant}>{rec.restaurant}</p>

      <blockquote className={styles.reason}>
        {WARM_REASONS[index]}
      </blockquote>

      <div className={styles.tags}>
        {rec.tags.slice(0, 4).map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      <a
        href={rec.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.orderBtn}
      >
        🐼 Order on foodpanda
      </a>
    </div>
  );
}
