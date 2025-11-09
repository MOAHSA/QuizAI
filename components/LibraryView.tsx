
import React from 'react';
import { type Exam } from '../types';
import { PlusIcon, TrashIcon, PlayIcon, DownloadIcon } from './icons';
import { exportExamTemplateToHTML } from '../services/exportService';

interface LibraryViewProps {
  exams: Exam[];
  onStartExam: (examId: string) => void;
  onDeleteExam: (examId: string) => void;
  onGenerateNew: () => void;
}

const ExamCard: React.FC<{ exam: Exam; onStart: () => void; onDelete: () => void; }> = ({ exam, onStart, onDelete }) => (
  <div className="bg-secondary p-6 rounded-lg shadow-lg border border-border-color flex flex-col justify-between transition-transform duration-300 hover:scale-[1.03] hover:shadow-accent/20">
    <div>
      <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
      <p className="text-sm text-text-secondary mb-1">Topic: {exam.topic}</p>
      <p className="text-sm text-text-secondary mb-4">{exam.questions.length} Questions</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => exportExamTemplateToHTML(exam)} 
          className="p-2 text-text-secondary hover:text-accent transition-colors" 
          aria-label={`Export ${exam.title} as template`}
          title="Export as HTML template"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={onDelete} 
          className="p-2 text-text-secondary hover:text-incorrect transition-colors" 
          aria-label={`Delete ${exam.title}`}
          title="Delete exam"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <button onClick={onStart} className="flex items-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
        <PlayIcon className="w-5 h-5"/> Start
      </button>
    </div>
  </div>
);

const LibraryView: React.FC<LibraryViewProps> = ({ exams, onStartExam, onDeleteExam, onGenerateNew }) => {
  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Exam Library</h2>
        <button
          onClick={onGenerateNew}
          className="flex items-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-5 h-5"/> Create New Exam
        </button>
      </header>
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={() => onStartExam(exam.id)}
              onDelete={() => onDeleteExam(exam.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-secondary rounded-lg border-2 border-dashed border-border-color">
          <h3 className="text-2xl font-semibold text-text-primary mb-2">Your library is empty!</h3>
          <p className="text-text-secondary mb-6">Click "Create New Exam" to get started with our AI-powered quiz generator.</p>
          <button
            onClick={onGenerateNew}
            className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity text-lg"
          >
            Create Your First Exam
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryView;