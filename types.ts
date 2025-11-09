
export type Theme = 'dark-blue' | 'light' | 'forest';
export type FontFamily = "'Segoe UI', sans-serif" | "'Georgia', serif" | "'Courier New', monospace";

export interface Settings {
  theme: Theme;
  fontSize: number;
  fontFamily: FontFamily;
  highContrast: boolean;
  reduceMotion: boolean;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
}

export interface Option {
  optionText: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Question {
  questionText: string;
  options: Option[];
  questionType: QuestionType;
}

export interface ExamSettings {
  timer: number; // in minutes
  allowChatBot: boolean;
}

export interface Exam {
  id: string;
  title: string;
  topic: string;
  questions: Question[];
  settings: ExamSettings;
  createdAt: number;
}

export interface UserAnswers {
  [questionIndex: number]: number[];
}