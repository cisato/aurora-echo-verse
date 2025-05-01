
import { useRef, useEffect, useState } from 'react';
import { useElevenLabs } from './useElevenLabs';

interface UseSpeechSynthesisProps {
  onStart?: () => void;
  onEnd?: () => void;
  useElevenLabs?: boolean;
}

export const useSpeechSynthesis = ({ onStart, onEnd, useElevenLabs: useEleven = false }: UseSpeechSynthesisProps = {}) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const elevenLabs = useElevenLabs();
  const [isElevenLabsEnabled, setIsElevenLabsEnabled] = useState(useEleven);
  const [currentVoice, setCurrentVoice] = useState<string>("21m00Tcm4TlvDq8ikWAM");
  
  // Create an event listener to detect settings changes
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Function to check for settings updates
  const checkSettings = () => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { elevenLabsEnabled, elevenLabsApiKey, elevenLabsVoiceId, voiceEnabled, selectedVoice } = JSON.parse(savedSettings);
        
        // Only enable ElevenLabs if we have an API key
        const shouldEnable = Boolean(elevenLabsEnabled && elevenLabsApiKey);
        setIsElevenLabsEnabled(shouldEnable);
        
        // Store the selected voice ID
        if (elevenLabsVoiceId && elevenLabsVoiceId !== currentVoice) {
          setCurrentVoice(elevenLabsVoiceId);
          console.log(`Updated ElevenLabs voice ID from settings: ${elevenLabsVoiceId}`);
        }
      }
    } catch (error) {
      console.error("Failed to load speech settings:", error);
    }
  };

  // Set up event listeners for settings changes
  useEffect(() => {
    // Listen for storage events to detect settings changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "settings") {
        console.log("Settings changed, updating speech synthesis");
        checkSettings();
        setSettingsVersion(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial settings check
    checkSettings();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }

    // Check settings again
    checkSettings();

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [settingsVersion]);

  const speak = async (text: string, voiceSettings?: { voice?: string; rate?: number }) => {
    // Re-check settings to ensure we have the latest
    checkSettings();
    
    if (isElevenLabsEnabled) {
      try {
        if (onStart) onStart();
        
        let voiceId = currentVoice;
        
        // Check settings for voice ID one last time to ensure most up-to-date
        try {
          const savedSettings = localStorage.getItem("settings");
          if (savedSettings) {
            const { elevenLabsVoiceId } = JSON.parse(savedSettings);
            if (elevenLabsVoiceId) {
              voiceId = elevenLabsVoiceId;
              console.log(`Using voice ID from settings: ${voiceId}`);
            }
          }
        } catch (error) {
          console.error("Failed to get ElevenLabs voice ID from settings:", error);
        }
        
        // If voice settings specify a voice, map it to ElevenLabs voice ID
        if (voiceSettings?.voice) {
          // Map browser voices to ElevenLabs voices based on name
          if (voiceSettings.voice.includes("female") || voiceSettings.voice.includes("Aria")) {
            voiceId = "9BWtsMINqrJLrRacOk9x"; // Aria
          } else if (voiceSettings.voice.includes("male") || voiceSettings.voice.includes("Guy")) {
            voiceId = "CwhRBWXzGAHq8TQ4Fs17"; // Roger
          } else if (voiceSettings.voice.includes("British") || voiceSettings.voice.includes("Ryan")) {
            voiceId = "pFZP5JQG7iQjIQuC4Bku"; // Lily
          }
        }
        
        console.log(`Speaking text with ElevenLabs voice ID: ${voiceId}`);
        await elevenLabs.speakText(text, { voiceId });
        
        if (onEnd) onEnd();
      } catch (error) {
        console.error("ElevenLabs speech error:", error);
        if (onEnd) onEnd();
        
        // Fall back to browser speech synthesis
        console.log("Falling back to browser speech synthesis");
        if (synthRef.current) {
          browserSpeak(text, voiceSettings);
        }
      }
    } else if (synthRef.current) {
      browserSpeak(text, voiceSettings);
    }
  };
  
  const browserSpeak = (text: string, voiceSettings?: { voice?: string; rate?: number }) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voiceSettings?.voice) {
        const voices = synthRef.current.getVoices();
        const selectedVoice = voices.find(v => v.name.includes(voiceSettings.voice));
        if (selectedVoice) {
          console.log(`Using browser voice: ${selectedVoice.name}`);
          utterance.voice = selectedVoice;
        }
      }
      
      if (voiceSettings?.rate) {
        utterance.rate = voiceSettings.rate;
      }
      
      if (onStart) {
        utterance.onstart = onStart;
      }
      
      if (onEnd) {
        utterance.onend = onEnd;
      }
      
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      if (onEnd) onEnd();
    }
  };

  return {
    speak,
    cancel: () => synthRef.current?.cancel(),
    isSupported: Boolean(window.speechSynthesis || isElevenLabsEnabled),
    usingElevenLabs: isElevenLabsEnabled,
    currentVoice,
    refreshSettings: checkSettings
  };
};
