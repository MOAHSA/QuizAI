import React, { useState, useMemo } from 'react';
import { type Exam, type UserAnswers } from '../types';
import { exportExamToHTML } from '../services/exportService';
import { DownloadIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import ScoreCircle from './ScoreCircle';
import ContentRenderer from './ContentRenderer';

interface ResultsViewProps {
  exam: Exam;
  results: { userAnswers: UserAnswers; score: number };
  onBackToLibrary: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ exam, results, onBackToLibrary }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questionResults = useMemo(() => {
    return exam.questions.map((q, qIndex) => {
      const correctIndices = q.options.map((opt, i) => opt.isCorrect ? i : -1).filter(i => i !== -1);
      const userIndices = results.userAnswers[qIndex] || [];
      const isCorrect = correctIndices.length === userIndices.length && correctIndices.every(i => userIndices.includes(i));
      return { isCorrect, userIndices, correctIndices };
    });
  }, [exam, results.userAnswers]);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const { userIndices, correctIndices } = questionResults[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="bg-secondary p-6 rounded-lg shadow-lg mb-8 border border-border-color flex flex-col items-center">
        <h1 className="text-3xl text-center font-extrabold mb-2">Results for: {exam.title}</h1>
        <ScoreCircle score={results.score} />
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={onBackToLibrary} className="bg-primary text-text-primary font-bold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors border border-border-color">
            Back to Library
          </button>
          <button onClick={() => exportExamToHTML(exam, results)} className="bg-accent text-white flex items-center gap-2 font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity">
            <DownloadIcon className="w-5 h-5"/> Export Results
          </button>
        </div>
      </header>

      {/* Question Navigator */}
      <div className="bg-secondary p-4 rounded-lg border border-border-color mb-6">
        <h2 className="text-lg font-semibold mb-3 text-center text-text-secondary">Question Navigator</h2>
        <div className="flex flex-wrap justify-center gap-2">
            {questionResults.map((result, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 flex items-center justify-center font-bold rounded-md transition-all duration-200 border-2 ${
                        currentQuestionIndex === index 
                        ? 'border-accent scale-110 ring-2 ring-accent ring-offset-2 ring-offset-secondary' 
                        : result.isCorrect 
                            ? 'bg-correct/20 border-correct/50 text-correct' 
                            : 'bg-incorrect/20 border-incorrect/50 text-incorrect'
                    }`}
                >
                    {index + 1}
                </button>
            ))}
        </div>
      </div>

      {/* Current Question Display */}
      <div className="bg-secondary p-6 rounded-lg shadow-md border-l-4"
           key={currentQuestionIndex} // Add key to force re-render on change for animations
      >
        <div className="text-xl font-semibold mb-4">
            <ContentRenderer content={`${currentQuestionIndex + 1}. ${currentQuestion.questionText}`} />
        </div>
        <div className="space-y-3">
          {currentQuestion.options.map((option, oIndex) => {
            const isUserChoice = userIndices.includes(oIndex);
            const isActuallyCorrect = correctIndices.includes(oIndex);
            
            let indicator = '';
            if (isUserChoice && !isActuallyCorrect) indicator = '❌'; // User chose, but incorrect
            if (isUserChoice && isActuallyCorrect) indicator = '✅'; // User chose, and correct
            if (!isUserChoice && isActuallyCorrect) indicator = '✅'; // User didn't choose, but was correct

            let bgColor = 'bg-primary';
            if (isActuallyCorrect) {
                bgColor = 'bg-correct/10';
            } else if (isUserChoice) {
                bgColor = 'bg-incorrect/10';
            }

            return (
              <div key={oIndex} className={`p-3 rounded-md ${bgColor} border border-transparent ${isActuallyCorrect ? 'border-correct/20' : isUserChoice ? 'border-incorrect/20' : ''}`}>
                <div className="flex items-start">
                  <span className="mr-3 w-6 text-lg">{indicator}</span>
                  <div className="flex-1">
                    <ContentRenderer content={option.optionText} />
                  </div>
                </div>
                <div className="text-sm text-text-secondary pl-9 mt-1">
                    <ContentRenderer content={option.explanation} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

       {/* Bottom Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="bg-primary text-text-primary font-bold py-2 px-6 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border-color flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Previous
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
          disabled={currentQuestionIndex === exam.questions.length - 1}
          className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Next <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ResultsView;