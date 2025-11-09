
import React, { useState, useEffect } from 'react';
import GeneratorView from './components/GeneratorView';
import LibraryView from './components/LibraryView';
import ExamView from './components/ExamView';
import ResultsView from './components/ResultsView';
import { type Exam, type UserAnswers } from './types';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon } from './components/icons';

type View = 'generator' | 'library' | 'exam' | 'results';

const App: React.FC = () => {
    const [view, setView] = useState<View>('library');
    const [exams, setExams] = useState<Exam[]>([]);
    const [currentExam, setCurrentExam] = useState<Exam | null>(null);
    const [results, setResults] = useState<{ userAnswers: UserAnswers; score: number } | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        try {
            const savedExams = localStorage.getItem('exams');
            if (savedExams) {
                setExams(JSON.parse(savedExams));
            }
        } catch (error) {
            console.error("Failed to load exams from localStorage", error);
        }
    }, []);

    const saveExams = (updatedExams: Exam[]) => {
        try {
            localStorage.setItem('exams', JSON.stringify(updatedExams));
            setExams(updatedExams);
        } catch (error) {
            console.error("Failed to save exams to localStorage", error);
        }
    };

    const handleExamGenerated = (exam: Exam) => {
        const newExams = [...exams, exam];
        saveExams(newExams);
        setView('library');
    };

    const handleStartExam = (examId: string) => {
        const examToStart = exams.find(e => e.id === examId);
        if (examToStart) {
            setCurrentExam(examToStart);
            setView('exam');
        }
    };

    const handleDeleteExam = (examId: string) => {
        const newExams = exams.filter(e => e.id !== examId);
        saveExams(newExams);
    };

    const handleExamSubmit = (userAnswers: UserAnswers) => {
        if (!currentExam) return;
        
        let correctCount = 0;
        currentExam.questions.forEach((q, qIndex) => {
            const correctIndices = q.options.map((opt, i) => opt.isCorrect ? i : -1).filter(i => i !== -1);
            const userIndices = userAnswers[qIndex] || [];
            const isCorrect = correctIndices.length === userIndices.length && correctIndices.every(i => userIndices.includes(i));
            if(isCorrect) {
                correctCount++;
            }
        });

        const score = (correctCount / currentExam.questions.length) * 100;
        setResults({ userAnswers, score });
        setView('results');
    };

    const handleBackToLibrary = () => {
        setView('library');
        setCurrentExam(null);
        setResults(null);
    };

    const renderView = () => {
        switch (view) {
            case 'generator':
                return <GeneratorView onExamGenerated={handleExamGenerated} onBackToLibrary={() => setView('library')} />;
            case 'exam':
                return currentExam && <ExamView exam={currentExam} onSubmit={handleExamSubmit} />;
            case 'results':
                return currentExam && results && <ResultsView exam={currentExam} results={results} onBackToLibrary={handleBackToLibrary} />;
            case 'library':
            default:
                return <LibraryView exams={exams} onStartExam={handleStartExam} onDeleteExam={handleDeleteExam} onGenerateNew={() => setView('generator')} />;
        }
    };
    
    return (
        <div className="bg-primary text-text-primary min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-text-primary cursor-pointer" onClick={handleBackToLibrary}>Quiz<span className="text-accent">AI</span></h1>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Open settings">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </header>
                <main>
                    {renderView()}
                </main>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} showExamSettings={view === 'exam' || view === 'results'} />
        </div>
    );
};

export default App;
