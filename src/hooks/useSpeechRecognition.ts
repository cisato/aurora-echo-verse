import { useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = ({ onResult, onInterim, onError, onEnd }: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Use refs for callbacks to avoid re-initializing recognition on every render
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const getSpeechRecognitionAPI = useCallback(() => {
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition ||
      null
    );
  }, []);

  const isSupported = Boolean(getSpeechRecognitionAPI());

  // Initialize only once
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();

    if (SpeechRecognitionAPI && !isInitializedRef.current) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          if (!event.results || event.results.length === 0) return;

          // Process all results
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            onResultRef.current(finalTranscript.trim());
          } else if (interimTranscript && onInterimRef.current) {
            onInterimRef.current(interimTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          const errorType = event?.error || 'unknown';
          console.error("Speech recognition error:", errorType);

          if (errorType === 'aborted') return;

          if (onErrorRef.current) {
            onErrorRef.current(event);
          } else if (errorType === 'not-allowed') {
            toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
          } else if (errorType === 'no-speech') {
            toast.info("No speech detected. Try again.");
          } else if (errorType === 'network') {
            toast.error("Network error during speech recognition.");
          } else {
            toast.error("Speech recognition error. Please try again.");
          }
        };

        recognition.onend = () => {
          onEndRef.current?.();
        };

        recognitionRef.current = recognition;
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      }
    };
  }, [getSpeechRecognitionAPI]); // stable dep — only runs once

  const startRecognition = useCallback(() => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error: any) {
        if (error?.message?.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try { recognitionRef.current?.start(); } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }, 150);
        } else {
          console.error("Error starting speech recognition:", error);
          toast.error("Could not start speech recognition. Check microphone permissions.");
        }
      }
    }
  }, [isSupported]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
  }, []);

  return { startRecognition, stopRecognition, isSupported };
};
