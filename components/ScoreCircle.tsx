import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const { reduceMotion } = useTheme();
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate the score from 0 to the final score for a nice visual effect
  // If reduceMotion is on, just show the final score immediately.
  const [animatedScore, setAnimatedScore] = useState(reduceMotion ? score : 0);

  useEffect(() => {
    if (reduceMotion) {
      setAnimatedScore(score);
      return;
    }
    // A simple timeout to ensure the animation runs on component mount
    const timer = setTimeout(() => {
        setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, reduceMotion]);

  const offset = circumference - (animatedScore / 100) * circumference;

  let colorClass = 'stroke-incorrect';
  if (score >= 75) {
    colorClass = 'stroke-correct';
  } else if (score >= 40) {
    colorClass = 'stroke-accent';
  }

  const transitionClass = reduceMotion ? '' : 'transition-all duration-1000 ease-out';

  return (
    <div className="relative flex items-center justify-center my-4" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-border-color/50"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`${colorClass} ${transitionClass}`}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-4xl font-bold text-text-primary">
        {score.toFixed(0)}%
      </span>
    </div>
  );
};

export default ScoreCircle;