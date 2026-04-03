import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecommendations } from '../hooks/useRecommendations';
import StepDots from '../components/shared/StepDots';
import Spinner from '../components/shared/Spinner';
import MoodInput from '../components/flow/MoodInput';
import Questions from '../components/flow/Questions';
import Recommendations from '../components/flow/Recommendations';
import Feedback from '../components/flow/Feedback';
import styles from '../styles/App.module.css';

export default function AppPage() {
  const { user, logout } = useAuth();
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

  // Steps 0-3 map to: mood → questions → recommendations → feedback
  // StepDots only shows during the active flow (steps 0-3)
  const TOTAL_STEPS = 4;

  return (
    <>
      <header className={styles.header}>
        <span className={styles.logo}>Foodie Moodie</span>
        <div className={styles.headerRight}>
          <StepDots current={step} total={TOTAL_STEPS} />
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.name}</span>
            <button className={styles.logoutBtn} onClick={logout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main} key={step}>

        {/* Global error banner — shown on top of whichever step is active */}
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