import React from 'react';
import styles from '../../styles/RecommendationsScreen.module.css';

const PRICE_LABEL = { low: 'Budget-friendly', medium: 'Mid-range', high: 'Premium' };

/**
 * rec shape from backend:
 * { dish, restaurant, tags, reasoning, foodpanda_link, price_range }
 */
export default function DishCard({ rec, index }) {
  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardTop}>
        <span className={styles.pickNum}>Pick {String(index + 1).padStart(2, '0')}</span>
        {rec.price_range && (
          <span className={styles.priceBadge}>{PRICE_LABEL[rec.price_range] ?? rec.price_range}</span>
        )}
      </div>

      <h2 className={styles.dishName}>{rec.dish}</h2>
      <p className={styles.restaurant}>{rec.restaurant}</p>

      <blockquote className={styles.reason}>{rec.reasoning}</blockquote>

      <div className={styles.tags}>
        {rec.tags.slice(0, 4).map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      <a
        href={rec.foodpanda_link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.orderBtn}
      >
        🐼 Order on foodpanda
      </a>
    </div>
  );
}