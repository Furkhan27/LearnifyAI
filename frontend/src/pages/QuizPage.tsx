import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./QuizPage.css";
import Spinner from "./Spinner";

type Question = {
  _id?: string;
  question: string;
  options: string[];
  answer: string; // correct answer
};

type ApiQuizResponse = {
  questions?: Question[];
  timer?: number; // minutes
};

type ResultPayloadQuestion = {
  question: string;
  options: string[];
  correctOption: string;
  selectedOption: string | null;
};

const QuizPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("q_id") ?? "";
   const rawUser = typeof window !== "undefined" ? localStorage.getItem("UserID") : null;
  const userId = rawUser ? rawUser.replace(/^"|"$/g, "") : null;

  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(600); // seconds
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // keep ref to avoid stale closure on interval
  const timeLeftRef = useRef<number>(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!quizId) {
        setError("Quiz ID missing from URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/quiz_test/${quizId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: ApiQuizResponse = await res.json();
        const qs = data.questions ?? [];
        setQuestions(qs);
        const minutes = data.timer ?? 10;
        setTimeLeft(minutes * 60);
      } catch (err) {
        console.error("fetchQuestions error:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!userId) {
      localStorage.removeItem("token");
    }
  }, [userId]);

  // Timer effect: runs once, updates timeLeft every second
  useEffect(() => {
    if (loading) return; // don't start timer until questions loaded

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // auto finish when hitting zero
          if (!quizCompleted) {
            handleFinish();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // only set up once after loading false

  const handleSelect = (opt: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentQuestion]: opt }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((c) => c - 1);
  };

  const handleFinish = async () => {
    if (quizCompleted) return;
    setQuizCompleted(true);
    alert("Quiz Completed!");

    // Build resultData and scoring
    const resultData: ResultPayloadQuestion[] = questions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      correctOption: q.answer,
      selectedOption: selectedOptions[idx] ?? null,
    }));

    const totalQuestions = questions.length;
    let score = 0;
    let correctAnswers = 0;
    const incorrectQuestions: number[] = [];
    const correctQuestions: number[] = [];
    const unSelected: number[] = [];

    questions.forEach((question, index) => {
      const selected = selectedOptions[index];
      if (selected == null) {
        unSelected.push(index);
      } else if (selected === question.answer) {
        correctAnswers++;
        score++;
        correctQuestions.push(index);
      } else {
        incorrectQuestions.push(index);
      }
    });

    const resultSummary = {
      score,
      totalQuestions,
      correctAnswers,
      incorrectQuestions,
      correctQuestions,
      unSelected,
    };
    setResult(resultSummary);

    const payload = {
      quizId,
      userId,
      resultScore: resultSummary,
      questions: resultData,
    };
    console.log(payload);
    
    try {
      const res = await axios.post("http://localhost:8000/api/store_result", payload);
      const data = res?.data;
      // Your backend earlier returned { message, response: 200 } on success
      if (data?.response !== 200) {
        alert("Something went wrong, please try later.");
        // return navigate("/");
      }
      // Navigate to result page
      navigate(`/result?userId=${encodeURIComponent(userId ?? "")}&q_Id=${encodeURIComponent(quizId)}`);
    } catch (err) {
      console.error("store_result error:", err);
      alert("Something went wrong while saving results.");
      // navigate("/");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) return <Spinner />;

  if (error) return <div className="quizpage-container">{error}</div>;

  return (
    <div className="quizpage-container">
      <div className="quiz-header">
        <span>
          Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}
        </span>
        <span className="timer">⏱ {formatTime(timeLeft)}</span>
      </div>

      <div className="quiz-question-box">
        <h3>{questions[currentQuestion]?.question ?? "No question available"}</h3>
        <div className="options">
          {questions[currentQuestion]?.options?.map((opt, idx) => (
            <button
              key={idx}
              className={`option-button ${selectedOptions[currentQuestion] === opt ? "selected" : ""}`}
              onClick={() => handleSelect(opt)}
              disabled={quizCompleted || timeLeft === 0}
            >
              {opt}
            </button>
          )) ?? <div>No options</div>}
        </div>
      </div>

      <div className="next-prev-container">
        <button
          className="prev-button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || quizCompleted || timeLeft === 0}
        >
          Previous
        </button>
        <button
          className="next-button"
          onClick={handleNext}
          disabled={quizCompleted || timeLeft === 0}
        >
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

      {quizCompleted && result && (
        <div className="quiz-result">
          <h3>Quiz Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
