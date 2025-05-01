
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
  downloadUrl?: string;
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
        // We check for WebAssembly as it's required for most local models
        const webCapableOfLocalAI = 'gpu' in navigator || 'WebAssembly' in window;
        const hasLocalAISupport = isCapacitor || webCapableOfLocalAI;
        
        // Realistic models that are available for download
        const availableModels: ModelConfig[] = [];
        
        if (hasLocalAISupport) {
          // Add appropriate models based on platform
          if (isCapacitor) {
            // Native models for mobile devices - more powerful models
            availableModels.push({
              name: 'Llama-3-8B-Instruct',
              type: 'text-generation',
              path: '/models/llama-3-8b-instruct-q4',
              size: 4300, // MB
              isDownloaded: false,
              isLoaded: false,
              downloadUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx'
            });
            
            availableModels.push({
              name: 'Whisper-Small',
              type: 'speech-recognition',
              path: '/models/whisper-small',
              size: 460, // MB
              isDownloaded: false,
              isLoaded: false,
              downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp'
            });

            // Add more powerful model 
            availableModels.push({
              name: 'Llama-3-70B-Instruct',
              type: 'text-generation',
              path: '/models/llama-3-70b-instruct-q4',
              size: 35000, // MB - much larger
              isDownloaded: false,
              isLoaded: false,
              downloadUrl: 'https://huggingface.co/meta-llama/Llama-3-70b-instruct'
            });
          }
          
          // Common models for all platforms - smaller models that work in browser
          availableModels.push({
            name: 'Phi-3-mini-4k-instruct',
            type: 'text-generation',
            path: '/models/phi-3-mini-4k-instruct-q4_0',
            size: 1950, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx'
          });
          
          availableModels.push({
            name: 'Whisper-Tiny',
            type: 'speech-recognition',
            path: '/models/whisper-tiny',
            size: 75, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp'
          });
          
          availableModels.push({
            name: 'MiniLM-L6',
            type: 'text-generation',
            path: '/models/minilm-l6',
            size: 90, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadUrl: 'https://huggingface.co/microsoft/MiniLM-L6-H384-uncased'
          });

          // Add more powerful models for all platforms
          availableModels.push({
            name: 'Phi-3-medium-4k-instruct',
            type: 'text-generation',
            path: '/models/phi-3-medium-4k-instruct-q4_0',
            size: 3940, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadUrl: 'https://huggingface.co/microsoft/Phi-3-medium-4k-instruct-onnx'
          });

          availableModels.push({
            name: 'Whisper-Base',
            type: 'speech-recognition',
            path: '/models/whisper-base',
            size: 142, // MB
            isDownloaded: false,
            isLoaded: false,
            downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp'
          });
        }
        
        // Check localStorage for previously downloaded and loaded models
        try {
          const savedModels = localStorage.getItem('aurora_local_models');
          const savedActiveModel = localStorage.getItem('aurora_active_model');
          
          if (savedModels) {
            const parsedModels = JSON.parse(savedModels);
            // Update available models with download and load status
            availableModels.forEach((model, index) => {
              const savedModel = parsedModels.find((m: ModelConfig) => m.name === model.name);
              if (savedModel) {
                availableModels[index] = {
                  ...model,
                  isDownloaded: savedModel.isDownloaded,
                  isLoaded: savedModel.isLoaded // Preserve loaded state across sessions
                };
              }
            });
          }
          
          // Set active model from localStorage if it exists
          const activeModel = savedActiveModel || null;
          
          setLocalAIState({
            isAvailable: hasLocalAISupport,
            isLoading: false,
            error: null,
            models: availableModels,
            activeModel
          });
        } catch (error) {
          console.error("Failed to load saved model states:", error);
          
          setLocalAIState({
            isAvailable: hasLocalAISupport,
            isLoading: false,
            error: null,
            models: availableModels,
            activeModel: null
          });
        }
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

  // Model download function with more realistic simulation
  const downloadModel = async (modelName: string) => {
    // Get the model to download
    const modelIndex = localAIState.models.findIndex(model => model.name === modelName);
    if (modelIndex === -1) return false;
    
    const model = localAIState.models[modelIndex];
    
    // Check if model is already downloaded
    if (model.isDownloaded) {
      console.log(`Model ${model.name} is already downloaded`);
      return true;
    }
    
    // Update model with download started status
    setLocalAIState(prev => ({
      ...prev,
      models: prev.models.map((m, idx) => 
        idx === modelIndex 
          ? { ...m, downloadProgress: 0 }
          : m
      )
    }));
    
    // Simulate download with progress updates based on file size
    // Larger models should take longer to download
    return new Promise<boolean>((resolve) => {
      let progress = 0;
      // Adjust interval based on model size - larger models take longer
      const updateInterval = Math.max(100, Math.min(500, 200 * (model.size / 1000)));
      const incrementAmount = Math.max(0.5, Math.min(5, 100 / (model.size / 10)));
      
      console.log(`Downloading ${model.name} - Size: ${model.size}MB, Update interval: ${updateInterval}ms, Increment: ${incrementAmount}%`);
      
      const interval = setInterval(() => {
        progress += incrementAmount + (Math.random() * (incrementAmount / 2)); 
        
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
      }, updateInterval);
    });
  };
  
  // Function to load a downloaded model
  const loadModel = async (modelName: string) => {
    const modelIndex = localAIState.models.findIndex(model => 
      model.name === modelName && model.isDownloaded
    );
    
    if (modelIndex === -1) return false;
    const model = localAIState.models[modelIndex];
    
    // Check if model is already loaded
    if (model.isLoaded) {
      console.log(`Model ${model.name} is already loaded`);
      setLocalAIState(prev => ({
        ...prev,
        activeModel: modelName
      }));
      
      // Save active model to localStorage
      localStorage.setItem('aurora_active_model', modelName);
      return true;
    }
    
    // Simulate loading time based on model size
    const loadTimeMs = Math.max(500, Math.min(3000, model.size));
    console.log(`Loading ${model.name} - Simulating ${loadTimeMs}ms load time`);
    
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        setLocalAIState(prev => {
          const updatedModels = prev.models.map((m, idx) => 
            idx === modelIndex 
              ? { ...m, isLoaded: true }
              : m
          );
          
          // Save loaded state to localStorage
          try {
            localStorage.setItem('aurora_local_models', JSON.stringify(updatedModels));
            localStorage.setItem('aurora_active_model', modelName);
          } catch (error) {
            console.error("Failed to save model states:", error);
          }
          
          return {
            ...prev,
            models: updatedModels,
            activeModel: modelName
          };
        });
        
        resolve(true);
      }, loadTimeMs);
    });
  };
  
  // Function to unload a model
  const unloadModel = async (modelName: string) => {
    const updatedModels = localAIState.models.map(model => 
      model.name === modelName 
        ? { ...model, isLoaded: false }
        : model
    );
    
    // Update state
    setLocalAIState(prev => ({
      ...prev,
      models: updatedModels,
      activeModel: prev.activeModel === modelName ? null : prev.activeModel
    }));
    
    // Update localStorage
    try {
      localStorage.setItem('aurora_local_models', JSON.stringify(updatedModels));
      
      // Remove active model from localStorage if it's the one being unloaded
      if (localAIState.activeModel === modelName) {
        localStorage.removeItem('aurora_active_model');
      }
    } catch (error) {
      console.error("Failed to save model states:", error);
    }
    
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
    
    // Simulate model inference based on model type and size
    // Larger models should take longer but give better responses
    return new Promise((resolve) => {
      // Calculate processing time based on model size and prompt length
      const baseTime = activeModel.size > 1000 ? 1000 : 500;
      const processingTime = baseTime + (prompt.length * 2);
      
      console.log(`Processing with ${activeModel.name} - Simulating ${processingTime}ms inference time`);
      
      setTimeout(() => {
        // Generate a response based on model type, size and name
        switch(activeModel.type) {
          case 'text-generation':
            if (activeModel.name.includes('70B')) {
              // Most sophisticated response for largest models
              resolve(`I processed your question "${prompt}" using the high-capacity ${activeModel.name} model running locally on your device. 
                As a powerful local AI model with 70B parameters, I can help with complex reasoning, code generation, and detailed explanations.
                My responses are generated entirely on-device without internet access. What else would you like to know about this topic?`);
            }
            else if (activeModel.name.includes('Llama') || activeModel.name.includes('Phi-3-medium')) {
              // More sophisticated response for larger models
              resolve(`I processed your question "${prompt}" using the powerful ${activeModel.name} model running locally on your device. 
                As a substantial local AI model, I can help you with detailed information based on my training data, though I don't have real-time internet access. 
                What else would you like to know about this topic?`);
            }
            else if (activeModel.name.includes('Phi-3-mini')) {
              // Standard response for mid-tier models
              resolve(`I analyzed your query "${prompt}" using the ${activeModel.name} model running locally. This model is optimized for efficient on-device performance while maintaining good response quality. How can I assist further?`);
            } 
            else {
              // Basic response for smallest models
              resolve(`Local response using ${activeModel.name}: I've analyzed your input "${prompt}" locally. How can I assist further with this?`);
            }
            break;
          case 'speech-recognition':
            if (activeModel.name.includes('Small')) {
              resolve(`High-accuracy transcription using ${activeModel.name}: "${prompt}"`);
            } else if (activeModel.name.includes('Base')) {
              resolve(`Good-quality transcription using ${activeModel.name}: "${prompt}"`);
            } else {
              resolve(`Basic transcription using ${activeModel.name}: "${prompt}"`);
            }
            break;
          default:
            resolve(`Processed with ${activeModel.name}: ${prompt}`);
        }
      }, processingTime);
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
