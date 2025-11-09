import React, { useState, useRef, useEffect } from 'react';
import { getHint } from '../services/geminiService';
import { type Question } from '../types';
import { CloseIcon, SendIcon } from './icons';
import ContentRenderer from './ContentRenderer';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, question }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([{
        sender: 'bot',
        text: `Hi! I'm your AI assistant. How can I help you with this question? Remember, I can only give hints, not answers!`
      }]);
      setInput('');
    }
  }, [isOpen, question]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const hint = await getHint(question, input);
      const botMessage: Message = { sender: 'bot', text: hint };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-secondary w-full max-w-lg h-[80vh] max-h-[700px] rounded-lg shadow-xl flex flex-col border border-border-color"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold">AI Assistant</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-primary">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-primary text-text-primary'}`}>
                  <ContentRenderer content={msg.text} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-primary text-text-primary">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse delay-150"></div>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-border-color">
          <div className="flex items-center bg-primary rounded-lg">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask for a hint..."
              className="w-full bg-transparent p-3 focus:outline-none"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-accent disabled:text-text-secondary disabled:cursor-not-allowed">
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;