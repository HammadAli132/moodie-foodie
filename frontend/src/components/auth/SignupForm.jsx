import React, { useState } from 'react';
import { signup } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/AuthScreen.module.css';

export default function SignupForm({ onSwitchToLogin }) {
  const { saveSession } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await signup({ name: name.trim(), email: email.trim(), password });
      // has_preferences: false → App will route to onboarding
      saveSession(data.access_token, {
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        has_preferences: false,
      });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
      <p className={styles.sub}>Start finding food that matches your mood</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            disabled={loading}
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{' '}
        <button type="button" className={styles.link} onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </div>
  );
}