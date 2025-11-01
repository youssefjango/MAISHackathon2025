import React, { useState } from "react";

const QuestionPage = ({ question, onNext }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (!selected) {
      alert("Please select an option!");
      return;
    }
    onNext(selected);
  };

  return (
    <div className="question-container">
      <h2 className="question-title">{question.text}</h2>

      <div className="options-grid">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn ${selected === opt ? "selected" : ""}`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button className="next-btn" onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default QuestionPage;