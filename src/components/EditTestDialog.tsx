import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface EditTestDialogProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function EditTestDialog({ questions, onQuestionsChange }: EditTestDialogProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);

  const handleAddQuestion = () => {
    if (!newQuestion || newOptions.some(opt => !opt)) {
      return;
    }

    const updatedQuestions = [
      ...questions,
      {
        question: newQuestion,
        options: [...newOptions],
        correctAnswer: newCorrectAnswer,
      },
    ];

    onQuestionsChange(updatedQuestions);
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectAnswer(0);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Questions */}
          <div className="space-y-4">
            <h3 className="font-medium">Current Questions</h3>
            {questions.map((q, index) => (
              <div key={index} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, optIndex) => (
                      <li key={optIndex} className={optIndex === q.correctAnswer ? "text-green-600 font-medium" : ""}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQuestion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Question */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Add New Question</h3>
            <Textarea
              placeholder="Enter question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="space-y-2">
              {newOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[index] = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant={newCorrectAnswer === index ? "default" : "outline"}
                    onClick={() => setNewCorrectAnswer(index)}
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleAddQuestion} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
