
import { useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: any) => void;
}

export const useSpeechRecognition = ({ onResult, onInterim, onError }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const getSpeechRecognitionAPI = () => {
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition ||
      null
    );
  };

  const isSupported = Boolean(getSpeechRecognitionAPI());

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    
    if (SpeechRecognitionAPI && !isInitializedRef.current) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = Boolean(onInterim);
        recognition.lang = navigator.language || 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          if (event.results && event.results.length > 0) {
            const transcript = event.results[0][0].transcript;
            const isFinal = event.results[0].isFinal;
            
            if (isFinal) {
              onResult(transcript);
            } else if (onInterim) {
              onInterim(transcript);
            }
          }
        };
        
        recognition.onerror = (event: any) => {
          const errorType = event?.error || 'unknown';
          console.error("Speech recognition error:", errorType);
          
          // Don't show error for 'aborted' (user cancelled) or 'no-speech'
          if (errorType === 'aborted') return;
          
          if (onError) {
            onError(event);
          } else if (errorType === 'not-allowed') {
            toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
          } else if (errorType === 'no-speech') {
            toast.info("No speech detected. Please try again.");
          } else if (errorType === 'network') {
            toast.error("Network error during speech recognition. Please check your connection.");
          } else {
            toast.error("Speech recognition error. Please try again.");
          }
        };

        recognition.onend = () => {
          // Recognition ended naturally
        };
        
        recognitionRef.current = recognition;
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, [onResult, onInterim, onError]);

  const startRecognition = useCallback(() => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        // If already started, stop and restart
        if (error?.message?.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }, 100);
        } else {
          console.error("Error starting speech recognition:", error);
          toast.error("Could not start speech recognition. Please check microphone permissions.");
        }
      }
    }
  }, [isSupported]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
  }, []);

  return {
    startRecognition,
    stopRecognition,
    isSupported
  };
};
