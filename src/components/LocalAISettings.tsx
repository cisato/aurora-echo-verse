
import React from 'react';
import { useLocalAI } from '@/hooks/useLocalAI';
import { usePlatform } from '@/hooks/use-platform';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Download, Headphones, Laptop, Play, Smartphone, Square } from 'lucide-react';
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

  const handleDownload = async (modelName: string) => {
    try {
      toast.info(`Downloading model: ${modelName}`);
      await downloadModel(modelName);
      toast.success(`Model downloaded: ${modelName}`);
    } catch (error) {
      toast.error(`Failed to download model: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLoad = async (modelName: string) => {
    try {
      toast.info(`Loading model: ${modelName}`);
      await loadModel(modelName);
      toast.success(`Model loaded: ${modelName}`);
      
      // Demo the model with a simple test
      try {
        const result = await runInference("Hello, this is a test.");
        toast.info(`Model test result: ${result}`);
      } catch (testError) {
        console.error("Model test failed:", testError);
      }
    } catch (error) {
      toast.error(`Failed to load model: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleUnload = async (modelName: string) => {
    try {
      await unloadModel(modelName);
      toast.success(`Model unloaded: ${modelName}`);
    } catch (error) {
      toast.error(`Failed to unload model: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p>Checking device capabilities...</p>
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

      <div className="grid gap-4">
        {models.map((model) => (
          <Card key={model.name} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{model.name}</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {model.type}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              Size: {model.size}MB
            </div>
            
            {model.downloadProgress !== undefined && (
              <div className="w-full my-2">
                <Progress value={model.downloadProgress} className="h-2" />
                <p className="text-xs text-center mt-1">{model.downloadProgress}%</p>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <Switch 
                  id={`model-${model.name}`}
                  checked={model.isLoaded}
                  disabled={!model.isDownloaded}
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
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                ) : model.isDownloaded && !model.isLoaded ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleLoad(model.name)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                ) : model.isLoaded ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUnload(model.name)}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Unload
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
        
        {models.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No compatible AI models found for your device.
          </p>
        )}
      </div>
    </div>
  );
};
