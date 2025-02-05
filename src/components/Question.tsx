interface QuestionProps {
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
  selectedAnswer?: number;
  correctAnswer?: number;
}

export const Question = ({ 
  question, 
  options, 
  onAnswer, 
  selectedAnswer,
  correctAnswer 
}: QuestionProps) => {
  const getOptionClassName = (index: number) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-all ";
    
    if (correctAnswer === undefined) {
      return baseClasses + (
        selectedAnswer === index
          ? "border-primary bg-primary/10 text-primary"
          : "border-gray-200 hover:border-primary/50"
      );
    }

    if (index === correctAnswer) {
      return baseClasses + "border-green-500 bg-green-100 text-green-800";
    }
    
    if (selectedAnswer === index && index !== correctAnswer) {
      return baseClasses + "border-red-500 bg-red-100 text-red-800";
    }

    return baseClasses + "border-gray-200";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-xl font-semibold text-gray-800">{question}</h2>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !correctAnswer && onAnswer(index)}
            disabled={correctAnswer !== undefined}
            className={getOptionClassName(index)}
          >
            {option}
            {correctAnswer !== undefined && selectedAnswer === index && index !== correctAnswer && (
              <div className="mt-2 text-sm text-green-700">
                Correct answer: {options[correctAnswer]}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};