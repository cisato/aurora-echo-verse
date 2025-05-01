
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

  useEffect(() => {
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }

    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { elevenLabsEnabled, elevenLabsApiKey, elevenLabsVoiceId } = JSON.parse(savedSettings);
        
        // Only enable ElevenLabs if we have an API key
        const shouldEnable = Boolean(elevenLabsEnabled && elevenLabsApiKey);
        setIsElevenLabsEnabled(shouldEnable);
        
        // Store the selected voice ID
        if (elevenLabsVoiceId) {
          setCurrentVoice(elevenLabsVoiceId);
          console.log(`Loaded ElevenLabs voice ID from settings: ${elevenLabsVoiceId}`);
        }
      }
    } catch (error) {
      console.error("Failed to load ElevenLabs settings:", error);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = async (text: string, voiceSettings?: { voice?: string; rate?: number }) => {
    if (isElevenLabsEnabled) {
      try {
        if (onStart) onStart();
        
        let voiceId = currentVoice;
        
        // Check settings for voice ID
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
            voiceId = "21m00Tcm4TlvDq8ikWAM"; // Aria
          } else if (voiceSettings.voice.includes("male") || voiceSettings.voice.includes("Guy")) {
            voiceId = "SOYHLrjzK2X1ezoPC6cr"; // Adam
          } else if (voiceSettings.voice.includes("British") || voiceSettings.voice.includes("Ryan")) {
            voiceId = "pNInz6obpgDQGcFmaJgB"; // Harry
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
    currentVoice
  };
};
