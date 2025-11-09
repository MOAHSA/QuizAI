import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { type Theme, type FontFamily } from '../types';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showExamSettings: boolean;
}

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
  { id: 'dark-blue', name: 'Dark Blue', colors: ['#3B82F6', '#334155', '#F8FAFC'] },
  { id: 'light', name: 'Light', colors: ['#3B82F6', '#FFFFFF', '#0F172A'] },
  { id: 'forest', name: 'Forest', colors: ['#8BC34A', '#283C3B', '#E4E5DC'] },
];

const FONT_FAMILIES: { id: FontFamily; name: string }[] = [
    { id: "'Segoe UI', sans-serif", name: 'Sans-serif' },
    { id: "'Georgia', serif", name: 'Serif' },
    { id: "'Courier New', monospace", name: 'Monospace' },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-12 h-6 rounded-full transition ${checked ? 'bg-accent' : 'bg-primary'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, showExamSettings }) => {
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily, highContrast, setHighContrast, reduceMotion, setReduceMotion, resetSettings } = useTheme();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-secondary w-full max-w-md m-4 rounded-lg shadow-xl border border-border-color animate-fade-in-up flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-border-color shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-primary">
            <CloseIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Theme Settings */}
          <section>
            <h3 className="text-lg font-semibold text-text-secondary mb-3">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${theme === t.id ? 'border-accent scale-105' : 'border-border-color hover:border-text-secondary/50'}`}
                >
                  <div className="flex justify-center space-x-1.5 mb-2">
                    {t.colors.map(color => <div key={color} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />)}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Exam-specific settings */}
          {showExamSettings && (
            <section className="border-t border-border-color pt-6">
                <h3 className="text-lg font-semibold text-text-secondary mb-4">Exam Readability</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="font-size" className="block text-sm font-medium text-text-secondary mb-2">Font Size</label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm">Small</span>
                            <input
                                id="font-size"
                                type="range"
                                min="12"
                                max="24"
                                step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <span className="text-sm">Large</span>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="font-family" className="block text-sm font-medium text-text-secondary mb-2">Font Family</label>
                        <select
                            id="font-family"
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                            className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
                        >
                            {FONT_FAMILIES.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}
                        </select>
                    </div>
                </div>
            </section>
          )}

           {/* Accessibility Settings */}
           <section className="border-t border-border-color pt-6">
                <h3 className="text-lg font-semibold text-text-secondary mb-4">Accessibility</h3>
                <div className="space-y-4">
                    <ToggleSwitch label="High Contrast Mode" checked={highContrast} onChange={setHighContrast} />
                    <ToggleSwitch label="Reduce Motion" checked={reduceMotion} onChange={setReduceMotion} />
                </div>
            </section>
        </div>

        <footer className="p-4 border-t border-border-color shrink-0">
            <button 
                onClick={resetSettings}
                className="w-full text-center text-sm text-text-secondary hover:text-accent font-medium py-2 rounded-md hover:bg-primary transition-colors"
            >
                Reset to Defaults
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;