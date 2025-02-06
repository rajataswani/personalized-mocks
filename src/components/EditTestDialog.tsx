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
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  const parseFileContent = async (file: File) => {
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ');
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.type === 'application/msword') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        throw new Error('Unsupported file type');
      }

      // Simple parsing logic - assumes questions are numbered and options are lettered
      const questionBlocks = text.split(/\d+\.\s+/).filter(Boolean);
      
      const parsedQuestions = questionBlocks.map(block => {
        const lines = block.split('\n').filter(line => line.trim());
        const question = lines[0].trim();
        const options = lines.slice(1, 5).map(line => 
          line.replace(/^[A-D][\)\.]\s*/, '').trim()
        );
        
        // Default to first option as correct answer
        return {
          question,
          options,
          correctAnswer: 0
        };
      });

      onQuestionsChange([...questions, ...parsedQuestions]);
      
      toast({
        title: "Import Successful",
        description: `Added ${parsedQuestions.length} questions from the file.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to parse the file. Please check the format and try again.",
        variant: "destructive",
      });
      console.error('File parsing error:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        file.type !== 'application/msword') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    parseFileContent(file);
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
          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Import Questions from File
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Upload a PDF or Word document containing questions
            </p>
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
