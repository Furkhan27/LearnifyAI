// frontend/src/components/Result.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Result.css";
import Spinner from "./Spinner";
import Sidebar from "../components/Sidebar";

type IncorrectItem = {
  question: string;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
};

type ResultResponse = {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectQuestions?: IncorrectItem[]; // optional
  // old shape compatibility
  // some backends might return different names — adapt if needed
};

const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

  const userId = searchParams.get("userId") ?? "";
  const quizId = searchParams.get("q_Id") ?? "";

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/results?userId=${encodeURIComponent(userId)}&quizId=${encodeURIComponent(quizId)}`
        );
        if (!res.ok) {
          console.error("Failed to fetch results:", res.statusText);
          setResult(null);
          return;
        }
        const data = (await res.json()) as ResultResponse;
        setResult(data);
        console.log("Result data:", data);
      } catch (error) {
        console.error("Error fetching result:", error);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
    // rerun when userId or quizId change
  }, [userId, quizId]);

  const toggleExplanation = (index: number) => {
    setShowExplanations((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="result-container">
        <Spinner />
        <div className="loading-text">Loading your result...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-container">
        <div className="no-result">No result found.</div>
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, incorrectQuestions = [] } = result;
  const incorrect = (totalQuestions ?? 0) - (correctAnswers ?? 0);
  const percentage =
    totalQuestions && totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : "0.00";

  return (
    <>
    <Sidebar role={"student"} isCollapsed={false} setIsCollapsed={function (value: React.SetStateAction<boolean>): void {
              throw new Error("Function not implemented.");
          } }/>
    <div className="result-container">
      <div className="result-box">
        <h2>🎉 Quiz Completed!</h2>
        <div className="result-grid">
          <p>
            <strong>Total Questions:</strong> {totalQuestions ?? 0}
          </p>
          <p>
            <strong>Correct Answers:</strong> {correctAnswers ?? 0}
          </p>
          <p>
            <strong>Incorrect Answers:</strong> {incorrect ?? 0}
          </p>
          <p>
            <strong>Your Score:</strong> {score ?? 0}/{totalQuestions ?? 0}
          </p>
          <p>
            <strong>Percentage:</strong> {percentage}% 
          </p>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => (window.location.href = "/")}
            className="result-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {incorrectQuestions.length > 0 && (
        <div className="review-box">
          <h3>🔍 Review Incorrect Answers</h3>
          <div className="review-grid">
            {incorrectQuestions.map((item, index) => (
              <div key={index} className="review-card">
                <p className="question-text">Q: {item.question}</p>
                <p className="user-answer">Your Answer: {item.userAnswer ?? "Not answered"}</p>
                <p className="correct-answer">Correct Answer: {item.correctAnswer ?? "N/A"}</p>

                <button
                  onClick={() => toggleExplanation(index)}
                  className="explain-button"
                >
                  {showExplanations[index] ? "Hide Explanation" : "Show Explanation"}
                </button>

                <div className={`explanation ${showExplanations[index] ? "show" : ""}`}>
                  <p>{item.explanation ?? "No explanation available."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Result;
