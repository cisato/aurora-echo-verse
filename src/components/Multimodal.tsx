
import { useState, useRef, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Upload, Download, RefreshCcw, Camera, Search, FileText } from "lucide-react";
import { toast } from "sonner";

export function Multimodal() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setImageAnalysis(null); // Reset analysis when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAnalyzeImage = () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }
    
    setIsProcessing(true);
    
    // In a real implementation, this would call a vision model API
    setTimeout(() => {
      setImageAnalysis("This appears to be an image of [mock analysis]. The image shows several key elements including [mock details]. The estimated context and purpose of this image is [mock purpose].");
      setIsProcessing(false);
      toast.success("Image analysis complete");
    }, 2000);
  };
  
  const handleGenerateImage = () => {
    if (!imageDescription) {
      toast.error("Please enter a description for the image");
      return;
    }
    
    setIsProcessing(true);
    
    // In a real implementation, this would call an image generation API
    setTimeout(() => {
      // For demo purposes, use a placeholder image
      setGeneratedImage("https://source.unsplash.com/random/600x400/?nature");
      setIsProcessing(false);
      toast.success("Image generation complete");
    }, 3000);
  };
  
  const handleClearImage = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setImageAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="p-6 container mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multimodal Interface</h1>
        <p className="text-muted-foreground">Process and generate visual information</p>
      </header>
      
      <Tabs defaultValue="analyze">
        <TabsList className="mb-4">
          <TabsTrigger value="analyze">Analyze Images</TabsTrigger>
          <TabsTrigger value="generate">Generate Images</TabsTrigger>
          <TabsTrigger value="ocr">Text Recognition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analyze" className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Image Analysis</h3>
                {selectedImage && (
                  <Button variant="ghost" size="sm" onClick={handleClearImage}>
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {selectedImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="relative aspect-video rounded-md overflow-hidden border border-input mb-4">
                      <img 
                        src={selectedImage} 
                        alt="Uploaded" 
                        className="object-contain w-full h-full"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAnalyzeImage} 
                      disabled={isProcessing}
                      className="mb-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin mr-2">
                            <RefreshCcw className="h-4 w-4" />
                          </div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium mb-2">Analysis Results</h4>
                    {imageAnalysis ? (
                      <div className="bg-secondary/30 p-3 rounded-md h-full">
                        <p className="text-sm">{imageAnalysis}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/20 rounded-md p-6">
                        <p className="text-muted-foreground text-center">
                          {isProcessing ? "Analyzing image..." : "Click 'Analyze Image' to process"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-secondary/50 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-3 rounded-full bg-secondary/20 mb-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">Upload an image</p>
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Drag and drop or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    Select Image
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate" className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Image Generation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="description" className="text-sm font-medium mb-2">
                    Image Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe the image you want to generate..."
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    className="min-h-32 mb-4"
                  />
                  
                  <Button 
                    onClick={handleGenerateImage}
                    disabled={isProcessing || !imageDescription.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin mr-2">
                          <RefreshCcw className="h-4 w-4" />
                        </div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium mb-2">Generated Image</h4>
                  {generatedImage ? (
                    <>
                      <div className="relative aspect-video rounded-md overflow-hidden border border-input mb-4">
                        <img 
                          src={generatedImage} 
                          alt="Generated" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button variant="outline" size="sm" className="w-fit">
                        <Download className="h-4 w-4 mr-2" />
                        Save Image
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full aspect-video bg-secondary/20 rounded-md">
                      <p className="text-muted-foreground text-center">
                        {isProcessing ? "Generating image..." : "Enter a description and click generate"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="ocr" className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Text Recognition (OCR)</h3>
              
              <div className="border-2 border-dashed border-secondary/50 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors">
                <div className="p-3 rounded-full bg-secondary/20 mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Upload an image with text</p>
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Aurora will extract text content from your image
                </p>
                <Button variant="outline" size="sm" onClick={() => toast.info("OCR functionality coming in a future update")}>
                  Coming Soon
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
