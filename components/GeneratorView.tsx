
import React, { useState } from 'react';
import { generateExam } from '../services/geminiService';
import { type Exam, QuestionType, type ExamSettings } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ArrowLeftIcon } from './icons';

interface GeneratorViewProps {
  onExamGenerated: (exam: Exam) => void;
  onBackToLibrary: () => void;
}

const GeneratorView: React.FC<GeneratorViewProps> = ({ onExamGenerated, onBackToLibrary }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([QuestionType.MULTIPLE_CHOICE]);
  const [settings, setSettings] = useState<ExamSettings>({ timer: 10, allowChatBot: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (type: QuestionType) => {
    setQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || numQuestions < 1 || questionTypes.length === 0) {
      setError("Please fill in all fields and select at least one question type.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const generatedExamBody = await generateExam(topic, numQuestions, questionTypes);

    if (generatedExamBody) {
      const newExam: Exam = {
        id: new Date().toISOString(),
        ...generatedExamBody,
        settings,
        createdAt: Date.now(),
      };
      onExamGenerated(newExam);
    } else {
      setError("Failed to generate the exam. The AI might be busy or the request could not be processed. Please try again.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-secondary p-8 rounded-lg shadow-xl border border-border-color animate-fade-in">
      <button onClick={onBackToLibrary} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeftIcon className="w-5 h-5" /> Back to Library
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center">Create a New Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-lg font-medium mb-2">Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., React Hooks, World War II, Photosynthesis"
            className="w-full bg-primary p-3 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="block text-lg font-medium mb-2">Number of Questions: <span className="font-bold text-accent">{numQuestions}</span></label>
          <input
            id="numQuestions"
            type="range"
            min="1"
            max="25"
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Question Types</label>
          <div className="flex gap-4">
            {[QuestionType.MULTIPLE_CHOICE, QuestionType.MULTIPLE_SELECT].map(type => (
              <label key={type} className="flex items-center gap-2 p-3 bg-primary rounded-md border border-border-color has-[:checked]:bg-accent has-[:checked]:text-white cursor-pointer flex-1 justify-center">
                <input
                  type="checkbox"
                  checked={questionTypes.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="h-5 w-5 accent-primary"
                />
                <span>{type.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <fieldset className="border border-border-color p-4 rounded-md">
            <legend className="text-lg font-medium px-2">Exam Settings</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="timer" className="block font-medium mb-2">Timer (minutes): <span className="font-bold text-accent">{settings.timer === 0 ? "Off" : settings.timer}</span></label>
                    <input id="timer" type="range" min="0" max="60" step="5" value={settings.timer} onChange={e => setSettings(s => ({...s, timer: Number(e.target.value)}))} className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent"/>
                </div>
                 <div className="flex items-center gap-3">
                    <input id="allowChatBot" type="checkbox" checked={settings.allowChatBot} onChange={e => setSettings(s => ({...s, allowChatBot: e.target.checked}))} className="h-5 w-5 accent-accent rounded" />
                    <label htmlFor="allowChatBot" className="font-medium">Enable AI Assistant (for hints)</label>
                </div>
            </div>
        </fieldset>

        {error && <p className="text-incorrect bg-incorrect/10 p-3 rounded-md">{error}</p>}

        <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-lg disabled:opacity-50" disabled={isLoading}>
          Generate Exam
        </button>
      </form>
    </div>
  );
};

export default GeneratorView;
