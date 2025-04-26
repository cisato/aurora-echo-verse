
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
}

// Define SpeechRecognitionError interface to handle the error event
interface SpeechRecognitionError extends Event {
  error: string;
}

export const useSpeechRecognition = ({ onResult }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if SpeechRecognition is available in the browser
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        // Cast event to SpeechRecognitionError to access the error property
        const errorEvent = event as SpeechRecognitionError;
        console.error("Speech recognition error", errorEvent.error);
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
    isSupported: Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  };
};
