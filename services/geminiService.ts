
import { GoogleGenAI, Type } from "@google/genai";
import { type Question, QuestionType, type Exam } from '../types';

// Per guidelines, initialize with apiKey from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const examSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative and engaging title for the quiz." },
        topic: { type: Type.STRING, description: "The specific topic of the quiz that was requested." },
        questions: {
            type: Type.ARRAY,
            description: "An array of quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: { type: Type.STRING, description: "The text of the question. Can include Markdown for formatting." },
                    questionType: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.MULTIPLE_SELECT], description: "The type of question." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of possible answers.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                optionText: { type: Type.STRING, description: "The text for this answer option. Can include Markdown." },
                                isCorrect: { type: Type.BOOLEAN, description: "Whether this option is a correct answer." },
                                explanation: { type: Type.STRING, description: "A brief explanation of why this option is correct or incorrect." }
                            },
                            required: ['optionText', 'isCorrect', 'explanation']
                        }
                    }
                },
                required: ['questionText', 'questionType', 'options']
            }
        }
    },
    required: ['title', 'topic', 'questions']
};


export const generateExam = async (topic: string, numQuestions: number, questionTypes: QuestionType[]): Promise<Omit<Exam, 'id' | 'settings' | 'createdAt'> | null> => {
    // Per guidelines, complex text tasks should use gemini-2.5-pro
    const model = 'gemini-2.5-pro';

    const prompt = `
      Create a quiz about "${topic}".
      The quiz must have exactly ${numQuestions} questions.
      The question types should be a mix of the following: ${questionTypes.join(', ')}.
      For each question, provide the question text, a question type ('MULTIPLE_CHOICE' or 'MULTIPLE_SELECT'), and 4-5 answer options.
      For each option, provide the option text, whether it is correct ('isCorrect'), and a brief explanation for why it's correct or incorrect.
      Ensure there is at least one correct answer for each question. For MULTIPLE_CHOICE questions, ensure there is exactly one correct answer.
      Return the output in the specified JSON format. The question and option text can use Markdown for formatting (e.g., code blocks, bolding).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examSchema,
            },
        });

        // Per guidelines, use response.text and trim it.
        const jsonText = response.text.trim();
        const examData = JSON.parse(jsonText);

        if (!examData.questions || examData.questions.length === 0) {
            console.error("Generated exam has no questions.");
            return null;
        }
        
        return examData;
    } catch (error) {
        console.error("Error generating exam with JSON schema:", error);
        return null;
    }
};

export const getHint = async (question: Question, userInput: string): Promise<string> => {
  // Per guidelines, basic text tasks can use gemini-2.5-flash
  const model = 'gemini-2.5-flash';
  const prompt = `
    You are an AI assistant for a quiz application. Your role is to provide hints, not answers.
    A user is stuck on the following question:
    ---
    Question: ${question.questionText}
    Options:
    ${question.options.map((opt) => `- ${opt.optionText}`).join('\n')}
    ---
    The user's query is: "${userInput}"

    Your task is to provide a helpful hint that guides the user toward the correct answer without revealing it directly.
    Focus on explaining a concept, asking a leading question, or clarifying a term from the question.
    Keep your hint concise (2-3 sentences).
    DO NOT state which option is correct or incorrect.
    DO NOT give away the answer.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    // Per guidelines, use response.text
    return response.text;
  } catch (error) {
    console.error("Error getting hint:", error);
    return "I'm sorry, I'm having trouble coming up with a hint right now. Please try asking in a different way.";
  }
};
