// frontend/src/components/Quiz.tsx
import React, { useState } from "react";
import "./Quiz.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBook, FaListOl, FaClock, FaTachometerAlt } from "react-icons/fa";
import Spinner from "./Spinner";
import Sidebar from "../components/Sidebar";

type QuestionForm = {
  subject: string;
  numQuestions: number;
  difficulty: string;
  timer: number;
};

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    subject: "",
    numQuestions: 0,
    difficulty: "",
    timer: 0,
  });

  // old
  // const user_id = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("UserID")) : null;

  // new
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("UserID") : null;
  const user_id = rawUser ? rawUser.replace(/^"|"$/g, "") : null;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "numQuestions" || name === "timer") {
      // convert numeric inputs to numbers; empty -> 0
      const numeric = value === "" ? 0 : parseInt(value, 10);
      setQuestionForm((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setQuestionForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { subject, numQuestions, difficulty, timer } = questionForm;

    // Basic validation
    if (!subject || !difficulty || numQuestions <= 0 || timer <= 0) {
      alert("Please fill in all fields & ensure values are > 0");
      return;
    }
    if (numQuestions > 15 || timer > 15) {
      alert("Please ensure number of questions and timer are <= 15");
      return;
    }

    const payload = {
      user_id,
      subject,
      numQuestions,
      difficulty,
      timer,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/create-quiz-questions",
        payload
      );
      setLoading(false);

      // defensive checks for response shape
      if (res?.data?.questions?.Error === 400) {
        alert("Invalid Topic");
        return;
      }

      const quizId = res?.data?.quiz_id;
      if (!quizId) {
        alert("Server did not return a quiz id");
        return;
      }

      navigate(`/QUIZTEST?topic=${encodeURIComponent(subject)}&q_id=${encodeURIComponent(quizId)}`);
    } catch (error) {
      setLoading(false);
      console.error("Create quiz error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
    <Sidebar role={"student"} isCollapsed={false} setIsCollapsed={function (value: React.SetStateAction<boolean>): void {
              throw new Error("Function not implemented.");
          } }/>
    <div className="quizpref-container">
      <div className="quizpref-box">
        <h2>Customize Your Quiz</h2>
        <form onSubmit={handleSubmit} className="quizpref-form">
          <div className="input-icon">
            <FaBook />
            <input
              type="text"
              placeholder="Enter Subject Interest"
              name="subject"
              value={questionForm.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-icon">
            <FaListOl />
            <input
              type="number"
              placeholder="Number of Questions (max 15)"
              name="numQuestions"
              value={questionForm.numQuestions === 0 ? "" : questionForm.numQuestions}
              onChange={handleChange}
              min={1}
              max={15}
              required
            />
          </div>

          <div className="input-icon">
            <FaTachometerAlt />
            <select
              name="difficulty"
              value={questionForm.difficulty}
              onChange={handleChange}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="input-icon">
            <FaClock />
            <input
              type="number"
              placeholder="Timer (in minutes, max 15)"
              name="timer"
              value={questionForm.timer === 0 ? "" : questionForm.timer}
              onChange={handleChange}
              min={1}
              max={15}
              required
            />
          </div>

          <button type="submit" className="quizpref-button" disabled={loading}>
            {loading ? <Spinner /> : "Start Quiz"}
          </button>
        </form>
      </div>
    </div></>
  );
};

export default Quiz;
