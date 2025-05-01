
import { useState } from 'react';

interface UseElevenLabsProps {
  apiKey?: string;
}

interface VoiceOptions {
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export const useElevenLabs = ({ apiKey }: UseElevenLabsProps = {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get API key from localStorage if not provided
  const getApiKey = (): string | null => {
    if (apiKey) return apiKey;
    
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { elevenLabsApiKey } = JSON.parse(savedSettings);
        return elevenLabsApiKey || null;
      }
    } catch (error) {
      console.error("Failed to get ElevenLabs API key from settings:", error);
    }
    
    return null;
  };

  const synthesizeSpeech = async (
    text: string, 
    options: VoiceOptions
  ): Promise<ArrayBuffer | null> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError("ElevenLabs API key is required");
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const voiceId = options.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default voice
      const modelId = options.modelId || "eleven_monolingual_v1";
      const stability = options.stability || 0.5;
      const similarityBoost = options.similarityBoost || 0.75;
      
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error("ElevenLabs synthesis error:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioData: ArrayBuffer): Promise<void> => {
    const audioContext = new AudioContext();
    try {
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      return new Promise((resolve) => {
        source.onended = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      throw error;
    }
  };

  const speakText = async (
    text: string, 
    options: VoiceOptions
  ): Promise<void> => {
    try {
      const audioData = await synthesizeSpeech(text, options);
      if (audioData) {
        await playAudio(audioData);
      }
    } catch (error) {
      console.error("Error speaking text:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  return {
    speakText,
    isLoading,
    error,
  };
};
