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
import { useToast } from "@/hooks/use-toast";

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
  const [jsonInput, setJsonInput] = useState("");
  const { toast } = useToast();

  const handleAddQuestion = () => {
    if (!newQuestion || newOptions.some(opt => !opt)) {
      toast({
        title: "Invalid Question",
        description: "Please fill in all fields before adding the question.",
        variant: "destructive",
      });
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

  const handleJsonImport = () => {
    try {
      const parsedQuestions = JSON.parse(jsonInput);
      
      // Validate the structure of parsed questions
      if (!Array.isArray(parsedQuestions)) {
        throw new Error('JSON must be an array of questions');
      }

      const validQuestions = parsedQuestions.every((q: any) => 
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < 4
      );

      if (!validQuestions) {
        throw new Error('Invalid question format');
      }

      onQuestionsChange([...questions, ...parsedQuestions]);
      setJsonInput("");
      
      toast({
        title: "Import Successful",
        description: `Added ${parsedQuestions.length} questions from JSON.`,
      });
    } catch (error) {
      toast({
        title: "Invalid JSON Format",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
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
          {/* JSON Import */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Import Questions from JSON
            </label>
            <Textarea
              placeholder="Paste your JSON questions here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="h-32"
            />
            <Button 
              onClick={handleJsonImport}
              className="w-full"
              variant="outline"
            >
              Import from JSON
            </Button>
          </div>

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
