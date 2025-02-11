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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timerReset, setTimerReset] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const { toast } = useToast();
  const [showSummary, setShowSummary] = useState(false);

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
    setTimerReset(true);
    setQuestionTimes({});
    setTotalTime(0);
    setTimeout(() => setTimerReset(false), 100);
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

  const handleTimeUpdate = (time: number) => {
    setTotalTime(time);
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion]: time - (Object.values(questionTimes).reduce((a, b) => a + b, 0) || 0)
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const getSummaryText = () => {
    const { totalScore, correctCount, wrongCount, skippedCount } = calculateScore();
    const averageTimePerQuestion = totalTime / questions.length;
    
    const fastestQuestion = Object.entries(questionTimes)
      .sort(([, a], [, b]) => a - b)[0];
    const slowestQuestion = Object.entries(questionTimes)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalQuestions: questions.length,
      totalScore,
      correctCount,
      wrongCount,
      skippedCount,
      totalTime: formatTime(totalTime),
      averageTime: formatTime(Math.floor(averageTimePerQuestion)),
      fastestQuestion: `Q${Number(fastestQuestion?.[0]) + 1} (${formatTime(fastestQuestion?.[1] || 0)})`,
      slowestQuestion: `Q${Number(slowestQuestion?.[0]) + 1} (${formatTime(slowestQuestion?.[1] || 0)})`,
      accuracy: `${((correctCount / questions.length) * 100).toFixed(1)}%`
    };
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
            <Timer 
              isRunning={isStarted} 
              shouldReset={timerReset}
              onTimeUpdate={handleTimeUpdate}
            />
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </div>
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
          <div className="mt-4 text-sm text-gray-500">
            Time spent on this question: {formatTime(questionTimes[currentQuestion] || 0)}
          </div>
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
            {isSubmitted && (
              <Dialog open={showSummary} onOpenChange={setShowSummary}>
                <DialogTrigger asChild>
                  <Button variant="secondary">View Summary</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Test Summary</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 space-y-4">
                    {(() => {
                      const summary = getSummaryText();
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">Total Questions</p>
                              <p className="text-2xl font-bold">{summary.totalQuestions}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">Total Score</p>
                              <p className="text-2xl font-bold">{summary.totalScore}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm text-green-600">Correct Answers</p>
                              <p className="text-2xl font-bold text-green-600">{summary.correctCount}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                              <p className="text-sm text-red-600">Wrong Answers</p>
                              <p className="text-2xl font-bold text-red-600">{summary.wrongCount}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500">Skipped Questions</p>
                              <p className="text-2xl font-bold">{summary.skippedCount}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-blue-600">Accuracy</p>
                              <p className="text-2xl font-bold text-blue-600">{summary.accuracy}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="font-medium">Time Analysis</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Total Time</p>
                                <p className="font-semibold">{summary.totalTime}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Average Time/Question</p>
                                <p className="font-semibold">{summary.averageTime}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Fastest Question</p>
                                <p className="font-semibold">{summary.fastestQuestion}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Slowest Question</p>
                                <p className="font-semibold">{summary.slowestQuestion}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Q.No</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const marks = userAnswer === undefined ? 0 : 
                    isCorrect ? question.marks : question.negativeMark;

                  return (
                    <TableRow key={index}>
                      <TableCell>Question {index + 1}</TableCell>
                      <TableCell>
                        {userAnswer !== undefined ? question.options[userAnswer] : "Skipped"}
                      </TableCell>
                      <TableCell>{question.options[question.correctAnswer]}</TableCell>
                      <TableCell>{formatTime(questionTimes[index] || 0)}</TableCell>
                      <TableCell>
                        {userAnswer === undefined ? (
                          <span className="text-gray-500">Skipped</span>
                        ) : isCorrect ? (
                          <span className="text-green-600">Correct</span>
                        ) : (
                          <span className="text-red-600">Wrong</span>
                        )}
                      </TableCell>
                      <TableCell>{marks}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">{formatTime(totalTime)}</TableCell>
                  <TableCell colSpan={1}></TableCell>
                  <TableCell className="font-semibold">{calculateScore().totalScore}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
