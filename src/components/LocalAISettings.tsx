
import React, { useState } from 'react';
import { useLocalAI } from '@/hooks/useLocalAI';
import { usePlatform } from '@/hooks/use-platform';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Download, Headphones, Laptop, Loader2, Play, Smartphone, Square } from 'lucide-react';
import { toast } from 'sonner';

export const LocalAISettings = () => {
  const { 
    isAvailable, 
    isLoading, 
    error, 
    models, 
    activeModel,
    downloadModel,
    loadModel,
    unloadModel,
    runInference
  } = useLocalAI();
  
  const { isMobile, isDesktop, platformName } = usePlatform();
  
  // Track which models are currently being processed
  const [processingModels, setProcessingModels] = useState<Record<string, string>>({});

  const handleDownload = async (modelName: string) => {
    try {
      setProcessingModels(prev => ({ ...prev, [modelName]: 'downloading' }));
      toast.info(`Downloading model: ${modelName}`);
      
      await downloadModel(modelName);
      
      toast.success(`Model downloaded: ${modelName}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    } catch (error) {
      toast.error(`Failed to download model: ${error instanceof Error ? error.message : String(error)}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  };

  const handleLoad = async (modelName: string) => {
    try {
      setProcessingModels(prev => ({ ...prev, [modelName]: 'loading' }));
      toast.info(`Loading model: ${modelName}`);
      
      await loadModel(modelName);
      
      toast.success(`Model loaded: ${modelName}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
      
      // Demo the model with a simple test
      try {
        toast.info(`Testing model: ${modelName}`, { duration: 1000 });
        const result = await runInference("Hello, this is a test.");
        toast.info(`Model test result: "${result.substring(0, 50)}${result.length > 50 ? '...' : ''}"`, { duration: 3000 });
      } catch (testError) {
        console.error("Model test failed:", testError);
      }
    } catch (error) {
      toast.error(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  };

  const handleUnload = async (modelName: string) => {
    try {
      setProcessingModels(prev => ({ ...prev, [modelName]: 'unloading' }));
      toast.info(`Unloading model: ${modelName}`);
      
      await unloadModel(modelName);
      
      toast.success(`Model unloaded: ${modelName}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    } catch (error) {
      toast.error(`Failed to unload model: ${error instanceof Error ? error.message : String(error)}`);
      setProcessingModels(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking device capabilities...
        </p>
        <Progress value={50} className="mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-4">
        <Card className="p-4 bg-muted">
          <h3 className="text-lg font-medium">Local AI Not Available</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your device doesn't support local AI models. This could be due to hardware limitations or browser compatibility.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        {isMobile ? (
          <Smartphone className="h-5 w-5 text-primary" />
        ) : (
          <Laptop className="h-5 w-5 text-primary" />
        )}
        <span className="font-medium">
          Platform: {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
        </span>
      </div>

      <h2 className="text-xl font-bold">Available Models</h2>

      {models.length > 0 ? (
        <div className="grid gap-4">
          {models.map((model) => (
            <Card key={model.name} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{model.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  model.type === 'text-generation' ? 'bg-blue-100 text-blue-800' : 
                  model.type === 'speech-recognition' ? 'bg-green-100 text-green-800' :
                  'bg-muted'
                }`}>
                  {model.type}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                Size: {model.size}MB
              </div>
              
              {model.downloadProgress !== undefined && (
                <div className="w-full my-2">
                  <Progress value={model.downloadProgress} className="h-2" />
                  <p className="text-xs text-center mt-1">{model.downloadProgress}% downloaded</p>
                </div>
              )}
              
              {model.isLoaded && activeModel === model.name && (
                <div className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-md mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active model - ready for use
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Switch 
                    id={`model-${model.name}`}
                    checked={model.isLoaded}
                    disabled={!model.isDownloaded || Boolean(processingModels[model.name])}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleLoad(model.name);
                      } else {
                        handleUnload(model.name);
                      }
                    }}
                  />
                  <Label htmlFor={`model-${model.name}`} className="ml-2">
                    {model.isLoaded ? 'Active' : 'Inactive'}
                  </Label>
                </div>
                
                <div className="space-x-2">
                  {!model.isDownloaded && model.downloadProgress === undefined ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(model.name)}
                      disabled={Boolean(processingModels[model.name])}
                    >
                      {processingModels[model.name] === 'downloading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  ) : model.isDownloaded && !model.isLoaded ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleLoad(model.name)}
                      disabled={Boolean(processingModels[model.name])}
                    >
                      {processingModels[model.name] === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Load
                        </>
                      )}
                    </Button>
                  ) : model.isLoaded ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUnload(model.name)}
                      disabled={Boolean(processingModels[model.name])}
                    >
                      {processingModels[model.name] === 'unloading' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Unloading...
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-1" />
                          Unload
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
              
              {model.downloadUrl && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Model source: <a href={model.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{new URL(model.downloadUrl).hostname}</a>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          No compatible AI models found for your device.
        </p>
      )}
      
      <div className="text-sm bg-primary/5 p-3 rounded-md mt-2">
        <p className="font-medium mb-1">Using local AI models</p>
        <p className="text-muted-foreground">
          To use local models with Aurora, download and load a model, then enable "Local Models Only" in General Settings
          or simply ask Aurora to use a specific model by name.
        </p>
      </div>
    </div>
  );
};
