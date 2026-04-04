import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecommendations } from '../hooks/useRecommendations';
import StepDots from '../components/shared/StepDots';
import Spinner from '../components/shared/Spinner';
import MoodInput from '../components/flow/MoodInput';
import Questions from '../components/flow/Questions';
import Recommendations from '../components/flow/Recommendations';
import Feedback from '../components/flow/Feedback';
import ProfilePage from './ProfilePage';
import styles from '../styles/App.module.css';

/** Returns up to 2 initials from a full name, e.g. "Ali Raza" → "AR", "Ali" → "A" */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AppPage() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const {
    step,
    questions,
    recommendations,
    refinedMood,
    loading,
    error,
    submitMood,
    submitAnswers,
    goToFeedback,
    submitThumbsFeedback,
    reset,
  } = useRecommendations();

  if (showProfile) {
    return (
      <>
        <header className={styles.header}>
          <span className={styles.logo}>Foodie Moodie</span>
          <div className={styles.headerRight}>
            <button className={styles.logoutBtn} onClick={logout} type="button">
              Logout
            </button>
          </div>
        </header>
        <main className={styles.main}>
          <ProfilePage onBack={() => setShowProfile(false)} />
        </main>
      </>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <span className={styles.logo}>Foodie Moodie</span>
        <div className={styles.headerRight}>
          <StepDots current={step} total={4} />
          <div className={styles.userMeta}>
            <button
              className={styles.profileBtn}
              onClick={() => setShowProfile(true)}
              type="button"
              title={user?.name || 'Profile'}
            >
              {getInitials(user?.name)}
            </button>
            <button className={styles.logoutBtn} onClick={logout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main} key={step}>

        {error && (
          <div className={styles.errorBanner}>
            {error}
            <button onClick={reset} className={styles.errorReset}>Start over</button>
          </div>
        )}

        {step === 0 && (
          <MoodInput onSubmit={submitMood} loading={loading} />
        )}

        {step === 1 && (
          loading
            ? <Spinner label="Preparing your questions…" />
            : <Questions
                questions={questions}
                onBack={reset}
                onSubmit={submitAnswers}
                loading={loading}
              />
        )}

        {step === 2 && (
          loading
            ? <Spinner label="Finding your perfect meal…" />
            : <Recommendations
                recommendations={recommendations}
                refinedMood={refinedMood}
                onFeedback={goToFeedback}
                onReset={reset}
              />
        )}

        {step === 3 && (
          <Feedback
            onSubmit={submitThumbsFeedback}
            onReset={reset}
          />
        )}

      </main>
    </>
  );
}