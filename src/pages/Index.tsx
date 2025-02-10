import { useState } from "react";
import { Timer } from "@/components/Timer";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EditTestDialog } from "@/components/EditTestDialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface QuestionType {
  question: string;
  options: string[];
  correctAnswer: number;
  marks?: number;
  negativeMark?: number;
}

const defaultQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    marks: 2,
    negativeMark: -0.66,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    marks: 2,
    negativeMark: -0.66,
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    marks: 2,
    negativeMark: -0.66,
  },
];

const Index = () => {
  const [questions, setQuestions] = useState<QuestionType[]>(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <EditTestDialog 
              questions={questions}
              onQuestionsChange={setQuestions}
            />
          </div>
          <div className="bg-white shadow-sm rounded-xl p-6 text-center">
            <p className="text-gray-500">No questions available. Please add questions using the Edit Test button.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = (answerIndex: number) => {
    if (!isStarted) {
      toast({
        title: "Test not started",
        description: "Please click 'Start Test' to begin.",
        variant: "destructive",
      });
      return;
    }
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleSkip = () => {
    if (!isStarted) return;
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleSaveAndNext = () => {
    if (!isStarted) return;
    if (answers[currentQuestion] === undefined) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before saving.",
        variant: "destructive",
      });
      return;
    }
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    if (!isStarted) return;
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setIsSubmitted(false);
    setIsStarted(false);
    setShowResults(false);
    toast({
      title: "Test Reset",
      description: "All answers have been cleared. You can start fresh.",
    });
  };

  const calculateScore = () => {
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined) {
        skippedCount++;
      } else if (userAnswer === q.correctAnswer) {
        totalScore += q.marks || 2;
        correctCount++;
      } else {
        totalScore += q.negativeMark || -0.66;
        wrongCount++;
      }
    });

    return {
      totalScore: totalScore.toFixed(2),
      correctCount,
      wrongCount,
      skippedCount,
    };
  };

  const handleSubmit = () => {
    if (!isStarted) return;
    const results = calculateScore();
    setIsSubmitted(true);
    setIsStarted(false);
    setShowResults(true);
    toast({
      title: "Test Completed!",
      description: `Score: ${results.totalScore} | Correct: ${results.correctCount} | Wrong: ${results.wrongCount} | Skipped: ${results.skippedCount}`,
    });
  };

  const navigateToQuestion = (index: number) => {
    if (!isStarted && !isSubmitted) return;
    setCurrentQuestion(index);
  };

  const isAnswerCorrect = (questionIndex: number) => {
    if (!isSubmitted || answers[questionIndex] === undefined) return null;
    return answers[questionIndex] === questions[questionIndex].correctAnswer;
  };

  const getButtonVariant = (index: number) => {
    if (!isSubmitted) {
      return answers[index] !== undefined ? "default" : "outline";
    }
    const isCorrect = isAnswerCorrect(index);
    if (isCorrect === true) return "secondary";
    if (isCorrect === false) return "destructive";
    return "outline";
  };

  const getButtonStyle = (index: number) => {
    if (!isSubmitted) return {};
    const isCorrect = isAnswerCorrect(index);
    if (isCorrect === true) return { backgroundColor: '#22c55e' };
    if (isCorrect === false) return { backgroundColor: '#ef4444' };
    return { backgroundColor: '#ffffff' };
  };

  const getResultsChartData = () => {
    const results = calculateScore();
    return [
      { name: 'Results', Correct: results.correctCount, Wrong: results.wrongCount, Skipped: results.skippedCount }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsStarted(true)}
              disabled={isStarted || isSubmitted}
              variant="outline"
            >
              Start Test
            </Button>
            <EditTestDialog 
              questions={questions}
              onQuestionsChange={setQuestions}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Timer isRunning={isStarted} />
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            {/* Question Navigation Panel */}
            <div className="flex flex-wrap gap-2 max-w-[200px]">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(index)}
                  size="sm"
                  onClick={() => navigateToQuestion(index)}
                  className={currentQuestion === index ? "ring-2 ring-primary" : ""}
                  style={getButtonStyle(index)}
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
            correctAnswer={isSubmitted ? questions[currentQuestion].correctAnswer : undefined}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || !isStarted}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
            >
              Reset Test
            </Button>
          </div>
          
          <div className="space-x-4">
            <Button 
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitted || !isStarted}
            >
              Submit Test
            </Button>
            {currentQuestion !== questions.length - 1 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  disabled={!isStarted}
                >
                  Skip
                </Button>
                <Button 
                  onClick={handleSaveAndNext}
                  disabled={answers[currentQuestion] === undefined || !isStarted}
                >
                  Save & Next
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              {Object.entries(calculateScore()).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <BarChart
                width={500}
                height={300}
                data={getResultsChartData()}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Correct" fill="#22c55e" />
                <Bar dataKey="Wrong" fill="#ef4444" />
                <Bar dataKey="Skipped" fill="#94a3b8" />
              </BarChart>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
