
import { toast } from "@/components/ui/use-toast";

interface Question {
  question: string;
  options: string[];
}

export const getAIAnswer = async (question: Question) => {
  try {
    const response = await fetch('/api/get-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Given this multiple choice question: "${question.question}"
                With these options: ${question.options.map((opt, i) => `${i}: ${opt}`).join(', ')}
                Please analyze and return only the index number (0-${question.options.length - 1}) of the correct answer.`,
      }),
    });

    const data = await response.json();
    return parseInt(data.generatedText);
  } catch (error) {
    toast({
      title: "Error getting AI answer",
      description: "Could not get an answer from the AI service.",
      variant: "destructive",
    });
    return null;
  }
}
