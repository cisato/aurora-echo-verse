
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onResult }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast.error("Could not understand audio. Please try again.");
      };
    } else {
      toast.error("Speech recognition is not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  return {
    start: () => recognitionRef.current?.start(),
    stop: () => recognitionRef.current?.stop(),
    isSupported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};
