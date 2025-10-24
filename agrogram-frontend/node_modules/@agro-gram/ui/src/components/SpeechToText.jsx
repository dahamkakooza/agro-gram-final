import React, { useState, useEffect } from 'react';
import './SpeechToText.css';

const SpeechToText = ({ 
  onResult,
  language = 'en-US',
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      onResult && onResult(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, language, onResult]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className={`speech-to-text ${className}`}>
      <button 
        className={`listen-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
      >
        {isListening ? '🛑 Stop' : '🎤 Start Listening'}
      </button>
      {transcript && (
        <div className="transcript">
          {transcript}
        </div>
      )}
    </div>
  );
};

export default SpeechToText;