
import { useState, useEffect } from 'react';
import { usePlatform } from './use-platform';

// Define interfaces for local AI model integration
export interface ModelConfig {
  name: string;
  type: 'text-generation' | 'speech-recognition' | 'speech-synthesis' | 'image-generation';
  path: string;
  size: number;
  isDownloaded: boolean;
  isLoaded: boolean;
  downloadProgress?: number;
}

export interface LocalAIState {
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  models: ModelConfig[];
  activeModel: string | null;
}

export function useLocalAI() {
  const { isCapacitor, isBrowser, platformName } = usePlatform();
  const [localAIState, setLocalAIState] = useState<LocalAIState>({
    isAvailable: false,
    isLoading: true,
    error: null,
    models: [],
    activeModel: null,
  });

  // Check if local AI is available
  useEffect(() => {
    const checkLocalAIAvailability = async () => {
      try {
        // Check if the device supports local AI models
        const webCapableOfLocalAI = 'gpu' in navigator || 'WebAssembly' in window;
        const hasLocalAISupport = isCapacitor || webCapableOfLocalAI;
        
        // Simulate available models based on platform
        const availableModels: ModelConfig[] = [];
        
        if (hasLocalAISupport) {
          // Add appropriate models based on platform
          if (isCapacitor) {
            // Native models for mobile devices
            availableModels.push({
              name: 'Aurora-Nano',
              type: 'text-generation',
              path: '/models/aurora-nano',
              size: 250, // MB
              isDownloaded: false,
              isLoaded: false,
              downloadProgress: 0
            });
            
            availableModels.push({
              name: 'Whisper-Small',
              type: 'speech-recognition',
              path: '/models/whisper-small',
              size: 460, // MB
              isDownloaded: false,
              isLoaded: false,
              downloadProgress: 0
            });
          }
          
          // Common models for all platforms
          availableModels.push({
            name: 'Whisper-Tiny',
            type: 'speech-recognition',
            path: '/models/whisper-tiny',
            size: 75, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadProgress: 0
          });
          
          availableModels.push({
            name: 'MiniLM-L6',
            type: 'text-generation',
            path: '/models/minilm-l6',
            size: 90, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadProgress: 0
          });
        }
        
        // Check localStorage for previously downloaded models
        try {
          const savedModels = localStorage.getItem('aurora_local_models');
          if (savedModels) {
            const parsedModels = JSON.parse(savedModels);
            // Update available models with download status
            availableModels.forEach((model, index) => {
              const savedModel = parsedModels.find((m: ModelConfig) => m.name === model.name);
              if (savedModel) {
                availableModels[index] = {
                  ...model,
                  isDownloaded: savedModel.isDownloaded,
                  isLoaded: false // Always start with models unloaded
                };
              }
            });
          }
        } catch (error) {
          console.error("Failed to load saved model states:", error);
        }
        
        setLocalAIState({
          isAvailable: hasLocalAISupport,
          isLoading: false,
          error: null,
          models: availableModels,
          activeModel: null
        });
      } catch (error) {
        console.error("Error checking for local AI availability:", error);
        setLocalAIState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to initialize local AI detection"
        }));
      }
    };
    
    checkLocalAIAvailability();
  }, [isCapacitor, isBrowser]);

  // Simulated model download function
  const downloadModel = async (modelName: string) => {
    // Get the model to download
    const modelIndex = localAIState.models.findIndex(model => model.name === modelName);
    if (modelIndex === -1) return false;
    
    const model = localAIState.models[modelIndex];
    
    // Update model with download started status
    setLocalAIState(prev => ({
      ...prev,
      models: prev.models.map((m, idx) => 
        idx === modelIndex 
          ? { ...m, downloadProgress: 0 }
          : m
      )
    }));
    
    // Simulate download with progress updates
    return new Promise<boolean>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15; // Random increment between 0-15%
        
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
          
          // Update model as downloaded
          setLocalAIState(prev => {
            const updatedModels = prev.models.map((m, idx) => 
              idx === modelIndex 
                ? { ...m, isDownloaded: true, downloadProgress: undefined }
                : m
            );
            
            // Save download status to localStorage
            try {
              localStorage.setItem('aurora_local_models', JSON.stringify(updatedModels));
            } catch (error) {
              console.error("Failed to save model states:", error);
            }
            
            return {
              ...prev,
              models: updatedModels
            };
          });
          
          resolve(true);
        } else {
          // Update download progress
          setLocalAIState(prev => ({
            ...prev,
            models: prev.models.map((m, idx) => 
              idx === modelIndex 
                ? { ...m, downloadProgress: Math.round(progress) }
                : m
            )
          }));
        }
      }, 500);
    });
  };
  
  // Function to load a downloaded model
  const loadModel = async (modelName: string) => {
    const modelIndex = localAIState.models.findIndex(model => 
      model.name === modelName && model.isDownloaded
    );
    
    if (modelIndex === -1) return false;
    
    // Simulate loading time
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setLocalAIState(prev => ({
          ...prev,
          models: prev.models.map((model, idx) => 
            idx === modelIndex 
              ? { ...model, isLoaded: true }
              : model
          ),
          activeModel: modelName
        }));
        
        resolve(true);
      }, 1500); // Simulate 1.5 second load time
    });
  };
  
  // Function to unload a model
  const unloadModel = async (modelName: string) => {
    setLocalAIState(prev => ({
      ...prev,
      models: prev.models.map(model => 
        model.name === modelName 
          ? { ...model, isLoaded: false }
          : model
      ),
      activeModel: prev.activeModel === modelName ? null : prev.activeModel
    }));
    
    return true;
  };
  
  // Helper function to run local inference with the active model
  const runInference = async (prompt: string): Promise<string> => {
    if (!localAIState.activeModel) {
      throw new Error("No active model loaded");
    }
    
    const activeModel = localAIState.models.find(m => m.name === localAIState.activeModel);
    if (!activeModel || !activeModel.isLoaded) {
      throw new Error("Active model not properly loaded");
    }
    
    // Simulate model inference based on model type
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple response generation based on model type
        switch(activeModel.type) {
          case 'text-generation':
            if (activeModel.name === 'Aurora-Nano') {
              resolve(`I processed your input: "${prompt}" using the ${activeModel.name} model locally.`);
            } else {
              resolve(`Local response using ${activeModel.name}: ${prompt.length > 10 ? prompt.substring(0, 10) + '...' : prompt}`);
            }
            break;
          case 'speech-recognition':
            resolve(`Transcription result: "${prompt}"`);
            break;
          default:
            resolve(`Processed with ${activeModel.name}`);
        }
      }, 1000);
    });
  };

  return {
    ...localAIState,
    downloadModel,
    loadModel,
    unloadModel,
    runInference
  };
}
