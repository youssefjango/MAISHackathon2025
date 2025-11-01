import React, { useState } from "react";
import { questions } from "../constants";
import QuestionPage from "../components/QuestionPage";

export default function Create() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleNext = (selectedOption) => {
    setAnswers((prev) => [
      ...prev,
      { questionId: questions[currentIndex].id, answer: selectedOption },
    ]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log("All answers:", answers);
      alert("You’ve completed your cheatsheet setup!");
    }
  };

  return (
    <div className="create-container">
      <h3>Create Your Own Cheatsheet</h3>

      <QuestionPage
        question={questions[currentIndex]}
        onNext={handleNext}
      />
    </div>
  );
}