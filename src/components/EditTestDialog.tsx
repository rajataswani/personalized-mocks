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
import { Pencil, Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  marks?: number;
  negativeMark?: number;
}

interface ImportedQuestion {
  question: string;
  options: {
    [key: string]: string;
  };
  correct_answer: number;
}

interface ImportedJSON {
  test_name?: string;
  questions: ImportedQuestion[];
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
  const [globalMarks, setGlobalMarks] = useState("2");
  const [globalNegativeMarks, setGlobalNegativeMarks] = useState("-0.66");
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
        marks: Number(globalMarks),
        negativeMark: Number(globalNegativeMarks),
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
      const parsedJson: ImportedJSON = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedJson.questions)) {
        throw new Error('JSON must contain a questions array');
      }

      const formattedQuestions: Question[] = parsedJson.questions.map(q => ({
        question: q.question,
        options: Object.values(q.options),
        correctAnswer: q.correct_answer - 1,
        marks: Number(globalMarks),
        negativeMark: Number(globalNegativeMarks),
      }));

      onQuestionsChange([...questions, ...formattedQuestions]);
      setJsonInput("");
      
      toast({
        title: "Import Successful",
        description: `Added ${formattedQuestions.length} questions${parsedJson.test_name ? ` from "${parsedJson.test_name}"` : ''}.`,
      });
    } catch (error) {
      toast({
        title: "Invalid JSON Format",
        description: "Please check your JSON format and try again.",
        variant: "destructive",
      });
    }
  };

  const applyGlobalMarks = () => {
    const updatedQuestions = questions.map(q => ({
      ...q,
      marks: Number(globalMarks),
      negativeMark: Number(globalNegativeMarks),
    }));
    onQuestionsChange(updatedQuestions);
    toast({
      title: "Marks Updated",
      description: "Applied marking scheme to all questions.",
    });
  };

  const handleClearAllQuestions = () => {
    onQuestionsChange([]);
    toast({
      title: "Questions Cleared",
      description: "All questions have been removed from the test.",
    });
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
          <Button 
            variant="destructive" 
            onClick={handleClearAllQuestions}
            className="w-full"
          >
            Clear All Questions
          </Button>

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Global Marking Scheme
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Marks for Correct Answer</label>
                <Input
                  type="number"
                  value={globalMarks}
                  onChange={(e) => setGlobalMarks(e.target.value)}
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Negative Marks</label>
                <Input
                  type="number"
                  value={globalNegativeMarks}
                  onChange={(e) => setGlobalNegativeMarks(e.target.value)}
                  step="0.01"
                />
              </div>
            </div>
            <Button onClick={applyGlobalMarks} className="w-full">
              Apply to All Questions
            </Button>
          </div>

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
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Marks"
                      value={q.marks || globalMarks}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index] = {
                          ...q,
                          marks: Number(e.target.value),
                        };
                        onQuestionsChange(updatedQuestions);
                      }}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Negative Marks"
                      value={q.negativeMark || globalNegativeMarks}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index] = {
                          ...q,
                          negativeMark: Number(e.target.value),
                        };
                        onQuestionsChange(updatedQuestions);
                      }}
                      className="text-sm"
                    />
                  </div>
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
