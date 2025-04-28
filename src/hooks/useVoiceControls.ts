
import { useState } from 'react';
import { toast } from 'sonner';

export const useVoiceControls = (
  startRecognition: () => void,
  stopRecognition: () => void,
  cancelSpeech: () => void
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
    } else {
      try {
        startRecognition();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Could not start speech recognition");
        setIsRecording(false);
      }
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.voiceEnabled = !isVoiceEnabled;
        localStorage.setItem("settings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Failed to update voice settings:", error);
    }
    
    if (isTalking) {
      cancelSpeech();
      setIsTalking(false);
    }
    
    toast.success(isVoiceEnabled ? "Voice disabled" : "Voice enabled");
  };

  return {
    isRecording,
    setIsTalking,
    isTalking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    toggleRecording,
    toggleVoice
  };
};
