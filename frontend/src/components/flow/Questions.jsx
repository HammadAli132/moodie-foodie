import React from 'react';
import { QUESTIONS } from '../data/mockData';
import styles from '../styles/QuestionsScreen.module.css';

export default function Questions({ answers, setAnswers, onBack, onNext }) {
  const allAnswered = answers.every((a) => a !== null);

  function selectAnswer(qIndex, oIndex) {
    const next = [...answers];
    next[qIndex] = oIndex;
    setAnswers(next);
  }

  function handleSubmit() {
    if (!allAnswered) return;
    onNext();
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>personalize your order</div>
      <h1 className={styles.heading}>
        A few quick <em>questions</em>
      </h1>
      <p className={styles.sub}>Help us understand what you're in the mood for.</p>

      <div className={styles.questions}>
        {QUESTIONS.map((q, qi) => (
          <div
            key={qi}
            className={styles.card}
            style={{ animationDelay: `${qi * 0.08}s` }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.qNum}>0{qi + 1}</span>
              <p className={styles.qText}>{q.question}</p>
            </div>
            <div className={styles.chips}>
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  className={`${styles.chip} ${answers[qi] === oi ? styles.selected : ''}`}
                  onClick={() => selectAnswer(qi, oi)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${!allAnswered ? styles.btnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Show Me What to Eat
          <span className={styles.arrow}>→</span>
        </button>
        <button className={styles.btnGhost} onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
