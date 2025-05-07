
import { useState, useEffect } from "react";
import { useLocalAI, ModelConfig, ModelUsage } from "@/hooks/useLocalAI";
import { Button } from "@/components/ui/button";
import { PerformanceCards } from "./performance/PerformanceCards";
import { LatencyTrendChart } from "./performance/LatencyTrendChart";
import { ModelSizeChart } from "./performance/ModelSizeChart";
import { useHistoricalData } from "./performance/useHistoricalData";

export function PerformanceMetrics() {
  const { models, getModelUsage } = useLocalAI();
  const [performanceData, setPerformanceData] = useState<(ModelConfig & { usage: ModelUsage })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  
  // Get historical data from custom hook
  const historicalData = useHistoricalData();
  
  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const modelPerformanceData = await Promise.all(
        models.map(async (model) => {
          const usage = await getModelUsage(model.name);
          return { ...model, usage };
        })
      );
      
      // Sort by average latency (fastest first)
      modelPerformanceData.sort((a, b) => a.usage.averageLatency - b.usage.averageLatency);
      setPerformanceData(modelPerformanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPerformanceData();
    
    // Refresh data every 2 minutes
    const intervalId = setInterval(() => {
      fetchPerformanceData();
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, [models, getModelUsage]);
  
  const handleRefresh = () => {
    setShowRefreshIndicator(true);
    fetchPerformanceData().then(() => {
      setTimeout(() => setShowRefreshIndicator(false), 1000);
    });
  };
  
  if (isLoading && performanceData.length === 0) {
    return <div className="flex justify-center items-center h-80">Loading performance data...</div>;
  }
  
  // Calculate performance metrics
  const fastestModel = performanceData.length > 0 ? performanceData[0] : null;
  const slowestModel = performanceData.length > 0 ? performanceData[performanceData.length - 1] : null;
  const averageLatency = performanceData.length > 0 
    ? Math.floor(performanceData.reduce((acc, model) => acc + model.usage.averageLatency, 0) / performanceData.length)
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Model Response Times</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading || showRefreshIndicator}
          className="transition-all"
        >
          {showRefreshIndicator ? "Refreshed!" : isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      
      <PerformanceCards 
        fastestModel={fastestModel}
        slowestModel={slowestModel}
        averageLatency={averageLatency}
      />
      
      <LatencyTrendChart historicalData={historicalData} />
      
      <ModelSizeChart performanceData={performanceData} />
    </div>
  );
}
