import React, { useState } from 'react';
import styles from '../styles/AuthScreen.module.css';

export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    // Mock login for MVP - replace with real API call later
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock success - store fake token
      const mockToken = btoa(JSON.stringify({ email, timestamp: Date.now() }));
      sessionStorage.setItem('authToken', mockToken);
      sessionStorage.setItem('userEmail', email);

      onLogin({ email });
    } catch (err) {
      setError('Login failed. Please try again.');
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

      <p className={styles.sub}>
        Find your perfect meal based on your mood
      </p>

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
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.btn}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
      </form>

      <p className={styles.switch}>
        Don't have an account?{' '}
        <button
          type="button"
          className={styles.link}
          onClick={onSwitchToSignup}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
