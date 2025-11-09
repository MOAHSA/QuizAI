
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type Exam, type UserAnswers, QuestionType } from '../types';
import ChatBot from './ChatBot';
import { ChatIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';
import ContentRenderer from './ContentRenderer';

interface ExamViewProps {
  exam: Exam;
  onSubmit: (userAnswers: UserAnswers) => void;
}

const ExamView: React.FC<ExamViewProps> = ({ exam, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { fontFamily, fontSize } = useTheme();

  const initialTime = useMemo(() => exam.settings.timer > 0 ? exam.settings.timer * 60 : null, [exam.settings.timer]);
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTime);

  const currentQuestion = exam.questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    if (timeLeft === null) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => (prevTime ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerChange = (optionIndex: number, isChecked: boolean) => {
    setUserAnswers(prev => {
      const currentAnswers = prev[currentQuestionIndex] || [];
      if (currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE) {
        return { ...prev, [currentQuestionIndex]: [optionIndex] };
      } else { // MULTIPLE_SELECT
        const newAnswers = isChecked
          ? [...currentAnswers, optionIndex]
          : currentAnswers.filter(idx => idx !== optionIndex);
        return { ...prev, [currentQuestionIndex]: newAnswers };
      }
    });
  };

  const goToNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      // FIX: Decrement currentQuestionIndex instead of incrementing it.
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = useCallback(() => {
    onSubmit(userAnswers);
  }, [onSubmit, userAnswers]);

  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <header className="mb-6 bg-secondary p-4 rounded-lg shadow-md border border-border-color">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{exam.title}</h1>
                {timeLeft !== null && (
                    <div className="text-2xl font-mono bg-primary px-4 py-2 rounded-md">
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>
            <div className="w-full bg-primary rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-right mt-1 text-sm text-text-secondary">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
        </header>
      
        <div className="bg-secondary p-8 rounded-lg shadow-xl border border-border-color min-h-[400px] flex flex-col justify-between" style={{ fontFamily, fontSize: `${fontSize}px` }}>
            <div>
                <p className="text-sm text-text-secondary mb-2">{currentQuestion.questionType.replace(/_/g, ' ')}</p>
                <div className="text-2xl font-semibold mb-6">
                    <ContentRenderer content={currentQuestion.questionText} />
                </div>
                <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <label key={index} className="flex items-center p-4 bg-primary rounded-lg cursor-pointer hover:bg-primary/80 transition-colors has-[:checked]:bg-accent has-[:checked]:text-white has-[:checked]:font-bold">
                            <input
                                type={currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE ? 'radio' : 'checkbox'}
                                name={`question-${currentQuestionIndex}`}
                                checked={(userAnswers[currentQuestionIndex] || []).includes(index)}
                                onChange={(e) => handleAnswerChange(index, e.target.checked)}
                                className="h-5 w-5 mr-4 accent-primary shrink-0"
                            />
                            <ContentRenderer content={option.optionText} />
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="bg-primary text-text-primary font-bold py-2 px-6 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border-color"
                >
                    Previous
                </button>
                {currentQuestionIndex === exam.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-correct text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors"
                    >
                        Submit Exam
                    </button>
                ) : (
                    <button
                        onClick={goToNext}
                        className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>

        {exam.settings.allowChatBot && (
            <>
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-20 right-6 bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                    aria-label="Open AI Assistant"
                >
                    <ChatIcon className="w-8 h-8"/>
                </button>
                <ChatBot 
                    isOpen={isChatOpen} 
                    onClose={() => setIsChatOpen(false)} 
                    question={currentQuestion} 
                />
            </>
        )}
    </div>
  );
};

export default ExamView;
