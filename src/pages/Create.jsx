import React, { useState } from "react";
import { questions } from "../constants";
import QuestionPage from "../components/Questions";

export default function Create() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleCurrent = (selectedOptions) => {
    
    // 1. Define the new answer payload
    const newAnswerPayload = {
      questionId: questions[currentIndex].id,
      answers: selectedOptions,
    };

    // 2. Use the safe functional update for state
    setAnswers((currentAnswers) => [...currentAnswers, newAnswerPayload]);

    // 3. Check if we are on the last question
    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      // We are on the last question.
      // The 'answers' state variable is not updated yet (it's stale).
      // To log the *full* list, we manually create it by combining
      // the (stale) 'answers' state with our new payload.
      const finalAnswers = [...answers, newAnswerPayload];

      console.log("Final answers:", finalAnswers);
      alert("Cheatsheet setup complete!");

      // You would send 'finalAnswers' to your API here, not 'answers'

    } else {
      // Not the last question, just advance the index
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="create-container">
      <QuestionPage question={questions[currentIndex]} onNext={handleCurrent} />
    </div>
  );
}