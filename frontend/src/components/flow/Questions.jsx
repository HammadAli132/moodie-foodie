import React, { useState } from 'react';
import styles from '../../styles/QuestionsScreen.module.css';

/**
 * questions: Array<{ question: string, options: [{label: string, value: string}] }>
 * onBack: () => void
 * onSubmit: (answers: [{question: string, answer: string}]) => void
 * loading: bool
 */
export default function Questions({ questions, onBack, onSubmit, loading }) {
  // Track selected option index per question
  const [selections, setSelections] = useState(() => Array(questions.length).fill(null));

  const allAnswered = selections.every((s) => s !== null);

  function select(qIndex, oIndex) {
    setSelections((prev) => {
      const next = [...prev];
      next[qIndex] = oIndex;
      return next;
    });
  }

  function handleSubmit() {
    if (!allAnswered || loading) return;
    const answers = questions.map((q, i) => ({
      question: q.question,
      answer: q.options[selections[i]].value,
    }));
    onSubmit(answers);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.eyebrow}>personalize your order</div>
      <h1 className={styles.heading}>
        A few quick <em>questions</em>
      </h1>
      <p className={styles.sub}>Help us understand what you're in the mood for.</p>

      <div className={styles.questions}>
        {questions.map((q, qi) => (
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
                  className={`${styles.chip} ${selections[qi] === oi ? styles.selected : ''}`}
                  onClick={() => select(qi, oi)}
                  disabled={loading}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${!allAnswered || loading ? styles.btnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
        >
          {loading ? 'Finding your food…' : 'Show Me What to Eat'}
          {!loading && <span className={styles.arrow}>→</span>}
        </button>
        <button className={styles.btnGhost} onClick={onBack} disabled={loading} type="button">
          ← Back
        </button>
      </div>
    </div>
  );
}