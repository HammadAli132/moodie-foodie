import React, { useState } from 'react';
import { updatePreferences } from '../../api/user';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/OnboardingScreen.module.css';

const DIETARY_FLAGS = [
  { value: 'halal',       label: 'Halal',       emoji: '🌙' },
  { value: 'vegetarian',  label: 'Vegetarian',  emoji: '🥗' },
  { value: 'vegan',       label: 'Vegan',       emoji: '🌱' },
];

const ALLERGENS = [
  { value: 'gluten',    label: 'Gluten',    emoji: '🌾' },
  { value: 'nuts',      label: 'Nuts',      emoji: '🥜' },
  { value: 'dairy',     label: 'Dairy',     emoji: '🥛' },
  { value: 'eggs',      label: 'Eggs',      emoji: '🥚' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'soy',       label: 'Soy',       emoji: '🫘' },
];

export default function DietarySetup() {
  const { user, markPreferencesSaved } = useAuth();
  const [selectedFlags, setSelectedFlags]     = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function toggle(value, selected, setSelected) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setError('');
    setLoading(true);
    try {
      await updatePreferences({
        dietary_flags: selectedFlags,
        allergens: selectedAllergens,
      });
      markPreferencesSaved(); // signals App to route to main flow
    } catch (err) {
      setError(err.message || 'Could not save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>one-time setup</div>
      <h1 className={styles.heading}>
        Hey {user?.name?.split(' ')[0] || 'there'}, let's get you set up
      </h1>
      <p className={styles.sub}>
        We'll use these to filter every recommendation — you can update them anytime.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dietary preferences</h2>
        <div className={styles.chips}>
          {DIETARY_FLAGS.map(({ value, label, emoji }) => (
            <button
              key={value}
              className={`${styles.chip} ${selectedFlags.includes(value) ? styles.selected : ''}`}
              onClick={() => toggle(value, selectedFlags, setSelectedFlags)}
              type="button"
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Allergens to avoid</h2>
        <div className={styles.chips}>
          {ALLERGENS.map(({ value, label, emoji }) => (
            <button
              key={value}
              className={`${styles.chip} ${selectedAllergens.includes(value) ? styles.selected : ''}`}
              onClick={() => toggle(value, selectedAllergens, setSelectedAllergens)}
              type="button"
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </section>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save & Continue'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
        <button
          className={styles.skipLink}
          onClick={markPreferencesSaved}
          disabled={loading}
          type="button"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}