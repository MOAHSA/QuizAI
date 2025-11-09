import React, { useState, useEffect } from 'react';

const loadingTexts = [
    "Warming up the AI...",
    "Crafting challenging questions...",
    "Generating detailed explanations...",
    "Building your custom quiz...",
    "Finalizing the details...",
    "Almost there..."
];

const LoadingSpinner: React.FC = () => {
    const [text, setText] = useState(loadingTexts[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setText(prevText => {
                const currentIndex = loadingTexts.indexOf(prevText);
                const nextIndex = (currentIndex + 1) % loadingTexts.length;
                return loadingTexts[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-accent rounded-full animate-spin border-t-transparent"></div>
                <div className="absolute inset-2 border-4 border-secondary rounded-full animate-spin-reverse border-t-transparent"></div>
            </div>
            <p className="text-text-secondary text-xl font-medium transition-opacity duration-500">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
