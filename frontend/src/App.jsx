import React, { useState, useEffect } from 'react';
import './styles/global.css';
import Background from './components/Background';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import MoodInput from './components/MoodInput';
import Questions from './components/Questions';
import Recommendations from './components/Recommendations';
import Feedback from './components/Feedback';
import StepDots from './components/StepDots';
import styles from './styles/App.module.css';
import { getRecommendations } from './utils/recommendationEngine';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);

  // App state
  const [step, setStep] = useState(0);
  const [moodText, setMoodText] = useState('');
  const [answers, setAnswers] = useState([null, null, null]);
  const [recommendations, setRecommendations] = useState([]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const email = sessionStorage.getItem('userEmail');
    const username = sessionStorage.getItem('userName');

    if (token && email) {
      setIsAuthenticated(true);
      setUser({ email, username });
    }
  }, []);

  function handleLogin(userData) {
    setIsAuthenticated(true);
    setUser(userData);
  }

  function handleSignup(userData) {
    setIsAuthenticated(true);
    setUser(userData);
  }

  function handleLogout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUser(null);
    handleReset();
  }

  function handleReset() {
    setStep(0);
    setMoodText('');
    setAnswers([null, null, null]);
    setRecommendations([]);
  }

  function handleQuestionsNext() {
    const recs = getRecommendations(moodText, answers);
    setRecommendations(recs);
    setStep(2);
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.app}>
        <Background />
        <div className={styles.inner}>
          <header className={styles.header}>
            <span className={styles.logo}>Foodie Moodie</span>
          </header>

          <main className={styles.main}>
            {showLogin ? (
              <LoginScreen
                onLogin={handleLogin}
                onSwitchToSignup={() => setShowLogin(false)}
              />
            ) : (
              <SignupScreen
                onSignup={handleSignup}
                onSwitchToLogin={() => setShowLogin(true)}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className={styles.app}>
      <Background />
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.logo}>Foodie Moodie</span>
          <div className={styles.headerRight}>
            <StepDots current={step} total={4} />
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className={styles.main} key={step}>
          {step === 0 && (
            <MoodInput
              moodText={moodText}
              setMoodText={setMoodText}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <Questions
              answers={answers}
              setAnswers={setAnswers}
              onBack={() => setStep(0)}
              onNext={handleQuestionsNext}
            />
          )}
          {step === 2 && (
            <Recommendations
              recommendations={recommendations}
              onFeedback={() => setStep(3)}
              onReset={handleReset}
            />
          )}
          {step === 3 && (
            <Feedback
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}