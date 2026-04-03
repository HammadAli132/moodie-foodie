import React, { useState } from 'react';
import { login } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/AuthScreen.module.css';

export default function LoginForm({ onSwitchToSignup }) {
  const { saveSession } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      saveSession(data.access_token, {
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        has_preferences: true, // Login means they've been through onboarding already
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>welcome back</div>
      <h1 className={styles.heading}>
        Sign in to <em>Foodie Moodie</em>
      </h1>
      <p className={styles.sub}>Find your perfect meal based on your mood</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
      </form>

      <p className={styles.switch}>
        Don't have an account?{' '}
        <button type="button" className={styles.link} onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>
    </div>
  );
}