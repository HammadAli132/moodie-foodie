import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Background from './components/shared/Background';
import Spinner from './components/shared/Spinner';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import AppPage from './pages/AppPage';
import styles from './styles/App.module.css';
import './styles/global.css';

/**
 * Inner router — reads auth state and decides which page to show.
 * Three possible states:
 *   1. Not authenticated       → AuthPage  (login / signup)
 *   2. Authenticated, no prefs → OnboardingPage  (dietary setup)
 *   3. Authenticated + prefs   → AppPage  (main flow)
 */
function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.centred}>
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (!user) return <AuthPage />;
  if (!user.has_preferences) return <OnboardingPage />;
  return <AppPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className={styles.app}>
        <Background />
        <div className={styles.inner}>
          <Router />
        </div>
      </div>
    </AuthProvider>
  );
}