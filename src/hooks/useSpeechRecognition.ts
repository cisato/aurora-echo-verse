
import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: any) => void;
}

// Define SpeechRecognitionError interface to handle the error event
interface SpeechRecognitionError extends Event {
  error: string;
}

export const useSpeechRecognition = ({ onResult, onInterim, onError }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if SpeechRecognition is available in the browser
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = Boolean(onInterim);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const isFinal = event.results[0].isFinal;
        
        if (isFinal) {
          onResult(transcript);
        } else if (onInterim) {
          onInterim(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        // Cast event to SpeechRecognitionError to access the error property
        const errorEvent = event as SpeechRecognitionError;
        console.error("Speech recognition error", errorEvent.error);
        
        if (onError) {
          onError(errorEvent);
        } else {
          toast.error("Could not understand audio. Please try again.");
        }
      };
    } else {
      toast.error("Speech recognition is not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, onInterim, onError]);

  return {
    startRecognition: () => recognitionRef.current?.start(),
    stopRecognition: () => recognitionRef.current?.stop(),
    isSupported: Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  };
};
