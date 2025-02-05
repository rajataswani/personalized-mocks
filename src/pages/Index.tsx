import { useState } from "react";
import { Timer } from "@/components/Timer";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Sample questions - in a real app, these would come from an API
const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
  },
];

const Index = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const handleAnswer = (answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (answers[currentQuestion] === undefined) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const score = questions.reduce((acc, q, index) => {
      return acc + (answers[index] === q.correctAnswer ? 1 : 0);
    }, 0);

    toast({
      title: "Test Completed!",
      description: `Your score: ${score}/${questions.length}`,
    });
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Timer />
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            {/* Question Navigation Panel */}
            <div className="flex flex-wrap gap-2 max-w-[200px]">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={answers[index] !== undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigateToQuestion(index)}
                  className={currentQuestion === index ? "ring-2 ring-primary" : ""}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <ProgressBar current={currentQuestion + 1} total={questions.length} />

        <div className="bg-white shadow-sm rounded-xl p-6">
          <Question
            question={questions[currentQuestion].question}
            options={questions[currentQuestion].options}
            onAnswer={handleAnswer}
            selectedAnswer={answers[currentQuestion]}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="space-x-4">
            <Button 
              variant="destructive"
              onClick={handleSubmit}
            >
              Submit Test
            </Button>
            {currentQuestion !== questions.length - 1 && (
              <Button onClick={handleNext}>Next Question</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;