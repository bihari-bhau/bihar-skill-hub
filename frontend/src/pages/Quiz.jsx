import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getUser } from "../utils/api";

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [quiz, setQuiz]         = useState(null);
  const [attempt, setAttempt]   = useState(null);
  const [answers, setAnswers]   = useState({});
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      try {
        // Find quiz for this course
        const qRes  = await api.get(`/quizzes/?course=${courseId}`);
        const qData = await qRes.json();
        const list  = qData.results ?? qData;
        if (list.length === 0) { setError("No quiz found for this course."); setLoading(false); return; }
        setQuiz(list[0]);
      } catch {
        setError("Could not load quiz.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const startQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await api.post(`/quizzes/${quiz.id}/start/`, {});
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not start quiz."); return; }
      setAttempt(data);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    const payload = {
      answers: Object.entries(answers).map(([question, selected_option]) => ({
        question: parseInt(question),
        selected_option: parseInt(selected_option),
      })),
    };
    setSubmitting(true);
    try {
      const res  = await api.post(`/quizzes/attempts/${attempt.id}/submit/`, payload);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed."); return; }
      setResult(data);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="quiz-page"><p>Loading quiz…</p></div>;
  if (error)   return <div className="quiz-page"><div className="form-error">{error}</div><button onClick={() => navigate("/dashboard")}>Back to Dashboard</button></div>;

  // Result screen
  if (result) return (
    <div className="quiz-page">
      <div className="quiz-result-card">
        <div className={`result-icon ${result.passed ? "pass" : "fail"}`}>
          {result.passed ? "🏆" : "😔"}
        </div>
        <h1>{result.passed ? "Congratulations!" : "Better luck next time"}</h1>
        <div className="result-score">
          <span className="score-num">{result.score}%</span>
          <span className="score-label">Your Score</span>
        </div>
        <p>{result.message}</p>
        <p className="passing-note">Passing score: {result.passing_score}%</p>
        <div className="result-actions">
          {result.passed && (
            <button className="primary-btn" onClick={() => navigate("/dashboard")}>
              View Certificate
            </button>
          )}
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );

  // Start screen
  if (!attempt) return (
    <div className="quiz-page">
      <div className="quiz-start-card">
        <h1>📝 {quiz.title}</h1>
        {quiz.description && <p>{quiz.description}</p>}
        <div className="quiz-meta">
          <span>⏱ {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} min` : "No time limit"}</span>
          <span>📊 {quiz.total_marks} marks</span>
          <span>❓ {quiz.questions?.length} questions</span>
        </div>
        <button className="detail-enroll-btn" onClick={startQuiz}>Start Quiz</button>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>Cancel</button>
      </div>
    </div>
  );

  // Quiz questions
  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <span>{Object.keys(answers).length} / {quiz.questions?.length} answered</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="quiz-questions">
        {quiz.questions?.map((q, idx) => (
          <div className="question-card" key={q.id}>
            <p className="question-text">
              <strong>Q{idx + 1}.</strong> {q.text}
              <span className="question-marks">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
            </p>
            <div className="options-list">
              {q.options?.map((opt) => (
                <label
                  key={opt.id}
                  className={`option-label ${answers[q.id] === opt.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleSelect(q.id, opt.id)}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-submit-row">
        <button
          className="detail-enroll-btn"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length === 0}
        >
          {submitting ? "Submitting…" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
