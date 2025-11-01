// src/components/QuestionPage.jsx
import React, { useEffect, useState } from "react";

const Questions = ({ question, onNext }) => {
  const [selected, setSelected] = useState([]);

  // Reset selection when the question changes
  // Prefer a stable key like question.id if available
  useEffect(() => {
    setSelected([]);
  }, [question]);

  const handleSelect = (option) => {
    // Check if option is already selected
    if (selected.includes(option)) {
      // Deselect it
      setSelected(selected.filter((o) => o !== option));
    } else {
      // Add option to selection, but only if we haven't hit the limit
      if (selected.length < question.maxSelections) {
        setSelected([...selected, option]);
      } else {
        //remove the first that was selected and add the new one
        setSelected([...selected.slice(1), option]);
      }
    }
  };

  const handleNext = () => {
    if (selected.length === 0) {
      alert("Please select at least one option!");
      return;
    }
    onNext(selected);
  };

  return (
    <div className="question-container">
      <h2 className="question-title">{question.text}</h2>
      <p className="selection-info">
        (Select up to {question.maxSelections})
      </p>

      <div className="options-grid">
        {question.options.map((opt, i) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={i}
              type="button"
              className={`option-btn ${isSelected ? "selected" : ""}`}
              aria-pressed={isSelected}
              data-selected={isSelected}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button className="next-btn" onClick={handleNext} type="button">
        Next
      </button>
    </div>
  );
};

export default Questions;
