import { useState } from "react";

interface QuestionProps {
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
  selectedAnswer?: number;
}

export const Question = ({ question, options, onAnswer, selectedAnswer }: QuestionProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-semibold text-gray-800">{question}</h2>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === index
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};