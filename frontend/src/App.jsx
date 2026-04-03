import React, { useState } from 'react';
import './styles/global.css';
import Background from './components/Background';
import MoodInput from './components/MoodInput';
import Questions from './components/Questions';
import Recommendations from './components/Recommendations';
import Feedback from './components/Feedback';
import StepDots from './components/StepDots';
import styles from './styles/App.module.css';
import { getRecommendations } from './utils/recommendationEngine';

export default function App() {
  const [step, setStep] = useState(0);
  const [moodText, setMoodText] = useState('');
  const [answers, setAnswers] = useState([null, null, null]);
  const [recommendations, setRecommendations] = useState([]);

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

  return (
    <div className={styles.app}>
      <Background />
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.logo}>Foodie Moodie</span>
          <StepDots current={step} total={4} />
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
