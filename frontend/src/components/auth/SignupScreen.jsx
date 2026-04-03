import React, { useState } from 'react';
import styles from '../styles/AuthScreen.module.css';

export default function SignupScreen({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Mock signup for MVP - replace with real API call later
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock success - store fake token
      const mockToken = btoa(JSON.stringify({ email, username, timestamp: Date.now() }));
      sessionStorage.setItem('authToken', mockToken);
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userName', username);

      onSignup({ email, username });
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>join us</div>

      <h1 className={styles.heading}>
        Create your <em>Foodie Moodie</em> account
      </h1>

      <p className={styles.sub}>
        Start finding food that matches your mood
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            autoComplete="username"
          />
        </div>

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.btn}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{' '}
        <button
          type="button"
          className={styles.link}
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
