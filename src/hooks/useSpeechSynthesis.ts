
import { useRef, useEffect } from 'react';

interface UseSpeechSynthesisProps {
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechSynthesis = ({ onStart, onEnd }: UseSpeechSynthesisProps = {}) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text: string, voiceSettings?: { voice?: string; rate?: number }) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voiceSettings?.voice) {
        const voices = synthRef.current.getVoices();
        const selectedVoice = voices.find(v => v.name.includes(voiceSettings.voice));
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      if (voiceSettings?.rate) {
        utterance.rate = voiceSettings.rate;
      }
      
      utterance.onstart = onStart || null;
      utterance.onend = onEnd || null;
      
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      onEnd?.();
    }
  };

  return {
    speak,
    cancel: () => synthRef.current?.cancel(),
    isSupported: Boolean(window.speechSynthesis)
  };
};
