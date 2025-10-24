import React, { useState } from 'react';
import './TextToSpeech.css';

const TextToSpeech = ({ 
  text = '',
  rate = 1,
  pitch = 1,
  className = '' 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported');
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className={`text-to-speech ${className}`}>
      <button 
        className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
        onClick={isSpeaking ? stop : speak}
      >
        {isSpeaking ? '🔇 Stop' : '🔊 Speak'}
      </button>
    </div>
  );
};

export default TextToSpeech;