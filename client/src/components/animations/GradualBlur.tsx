import React, { useState, useEffect } from 'react';

interface GradualBlurProps {
  text: string;
  className?: string;
  blurAmount?: number;
  duration?: number;
}

const GradualBlur: React.FC<GradualBlurProps> = ({ 
  text, 
  className = '', 
  blurAmount = 10,
  duration = 1000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const words = text.split(' ');

  return (
    <div className={`${className}`}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block mx-1 transition-all"
          style={{
            filter: isVisible ? 'blur(0px)' : `blur(${blurAmount}px)`,
            opacity: isVisible ? 1 : 0,
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * 50}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default GradualBlur;
