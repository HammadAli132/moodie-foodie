import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, getPreferences, updatePreferences } from '../api/user';
import styles from '../styles/ProfileScreen.module.css';

const DIETARY_FLAGS = [
  { value: 'halal',      label: 'Halal',      emoji: '🌙' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan',      label: 'Vegan',      emoji: '🌱' },
];

const ALLERGENS = [
  { value: 'gluten',    label: 'Gluten',    emoji: '🌾' },
  { value: 'nuts',      label: 'Nuts',      emoji: '🥜' },
  { value: 'dairy',     label: 'Dairy',     emoji: '🥛' },
  { value: 'eggs',      label: 'Eggs',      emoji: '🥚' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'soy',       label: 'Soy',       emoji: '🫘' },
];

export default function ProfilePage({ onBack }) {
  const { user, saveSession, token } = useAuth();

  // ── Profile section state ──────────────────────────────────────────────────
  const [name, setName]                   = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [profileMsg, setProfileMsg]       = useState(null); // { type: 'success'|'error', text }
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Preferences section state ──────────────────────────────────────────────
  const [selectedFlags, setSelectedFlags]         = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [prefsMsg, setPrefsMsg]                   = useState(null);
  const [prefsLoading, setPrefsLoading]           = useState(false);
  const [prefsInitialised, setPrefsInitialised]   = useState(false);

  // Load current preferences on mount
  useEffect(() => {
    getPreferences()
      .then((data) => {
        setSelectedFlags(data.dietary_flags || []);
        setSelectedAllergens(data.allergens || []);
        setPrefsInitialised(true);
      })
      .catch(() => setPrefsInitialised(true)); // show UI even if fetch fails
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function toggleChip(value, selected, setSelected) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg(null);

    const payload = {};
    if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();
    if (newPassword) {
      if (!currentPassword) {
        setProfileMsg({ type: 'error', text: 'Enter your current password to set a new one.' });
        return;
      }
      if (newPassword.length < 8) {
        setProfileMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
        return;
      }
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    if (!Object.keys(payload).length) {
      setProfileMsg({ type: 'error', text: 'Nothing to update.' });
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await updateProfile(payload);
      // Refresh user in context without a full logout/re-login
      saveSession(token, { ...updated, has_preferences: user?.has_preferences });
      setCurrentPassword('');
      setNewPassword('');
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Update failed. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePrefsSave() {
    setPrefsMsg(null);
    setPrefsLoading(true);
    try {
      await updatePreferences({
        dietary_flags: selectedFlags,
        allergens: selectedAllergens,
      });
      setPrefsMsg({ type: 'success', text: 'Preferences saved.' });
    } catch (err) {
      setPrefsMsg({ type: 'error', text: err.message || 'Could not save preferences.' });
    } finally {
      setPrefsLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} type="button">
          ← Back
        </button>
        <span className={styles.pageTitle}>Your Profile</span>
      </div>

      {/* ── Account info ── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Account info</h2>

        <form onSubmit={handleProfileSave} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={profileLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={`${styles.input} ${styles.inputReadonly}`}
              type="email"
              value={user?.email || ''}
              readOnly
              tabIndex={-1}
            />
            <span className={styles.fieldNote}>Email cannot be changed.</span>
          </div>

          <div className={styles.divider} />
          <p className={styles.sectionLabel}>Change password</p>

          <div className={styles.field}>
            <label className={styles.label}>Current password</label>
            <input
              className={styles.input}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={profileLoading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>New password</label>
            <input
              className={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={profileLoading}
            />
          </div>

          {profileMsg && (
            <p className={profileMsg.type === 'success' ? styles.success : styles.error}>
              {profileMsg.text}
            </p>
          )}

          <button type="submit" className={styles.btn} disabled={profileLoading}>
            {profileLoading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      {/* ── Dietary preferences ── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Dietary preferences</h2>
        <p className={styles.cardSub}>
          Applied as hard filters on every recommendation.
        </p>

        {!prefsInitialised ? (
          <p className={styles.loadingText}>Loading your preferences…</p>
        ) : (
          <>
            <div className={styles.prefSection}>
              <p className={styles.prefLabel}>Diet</p>
              <div className={styles.chips}>
                {DIETARY_FLAGS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${selectedFlags.includes(value) ? styles.chipSelected : ''}`}
                    onClick={() => toggleChip(value, selectedFlags, setSelectedFlags)}
                    disabled={prefsLoading}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.prefSection}>
              <p className={styles.prefLabel}>Allergens to avoid</p>
              <div className={styles.chips}>
                {ALLERGENS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${selectedAllergens.includes(value) ? styles.chipSelected : ''}`}
                    onClick={() => toggleChip(value, selectedAllergens, setSelectedAllergens)}
                    disabled={prefsLoading}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {prefsMsg && (
              <p className={prefsMsg.type === 'success' ? styles.success : styles.error}>
                {prefsMsg.text}
              </p>
            )}

            <button
              type="button"
              className={styles.btn}
              onClick={handlePrefsSave}
              disabled={prefsLoading}
            >
              {prefsLoading ? 'Saving…' : 'Save preferences'}
            </button>
          </>
        )}
      </section>

    </div>
  );
}