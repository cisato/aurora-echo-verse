
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { useLocalAI, ModelConfig, ModelUsage } from "@/hooks/useLocalAI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Gauge } from "lucide-react";

export function PerformanceMetrics() {
  const { models, getModelUsage } = useLocalAI();
  const [performanceData, setPerformanceData] = useState<(ModelConfig & { usage: ModelUsage })[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate some simulated historical data
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      
      // Generate 14 days of data
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Simulate different model latencies with a slight improvement trend
        const entry = {
          date: date.toISOString().split('T')[0],
          "Phi-3-mini-4k-instruct": Math.floor(240 - (i * 0.8) + (Math.random() * 20 - 10)),
          "Llama-3-8B-Instruct": Math.floor(320 - (i * 1.2) + (Math.random() * 30 - 15)),
          "Whisper-Tiny": Math.floor(100 - (i * 0.4) + (Math.random() * 10 - 5)),
          "GPT-Neo-1.3B": Math.floor(180 - (i * 0.6) + (Math.random() * 15 - 7.5)),
        };
        data.push(entry);
      }
      
      return data;
    };
    
    setHistoricalData(generateHistoricalData());
  }, []);
  
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      const modelPerformanceData = await Promise.all(
        models.map(async (model) => {
          const usage = await getModelUsage(model.name);
          return { ...model, usage };
        })
      );
      
      // Sort by average latency (fastest first)
      modelPerformanceData.sort((a, b) => a.usage.averageLatency - b.usage.averageLatency);
      setPerformanceData(modelPerformanceData);
      setIsLoading(false);
    };
    
    fetchPerformanceData();
  }, [models, getModelUsage]);
  
  // Chart config
  const chartConfig = {
    "Phi-3-mini-4k-instruct": {
      label: "Phi-3 Mini",
    },
    "Llama-3-8B-Instruct": {
      label: "Llama-3 8B",
    },
    "Whisper-Tiny": {
      label: "Whisper Tiny",
    },
    "GPT-Neo-1.3B": {
      label: "GPT-Neo",
    },
  };
  
  if (isLoading) {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fastest Model
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fastestModel?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {fastestModel ? `${fastestModel.usage.averageLatency.toFixed(0)}ms average response time` : "No data"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Latency
            </CardTitle>
            <Gauge className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageLatency}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Slowest Model
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slowestModel?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {slowestModel ? `${slowestModel.usage.averageLatency.toFixed(0)}ms average response time` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Latency Trends (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Phi-3-mini-4k-instruct" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line type="monotone" dataKey="Llama-3-8B-Instruct" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="Whisper-Tiny" stroke="#ffc658" />
                  <Line type="monotone" dataKey="GPT-Neo-1.3B" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance by Model Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  dataKey="size" 
                  name="Size"
                  unit=" MB"
                  label={{ value: 'Model Size (MB)', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  type="number"
                  dataKey="latency" 
                  name="Latency"
                  unit=" ms"
                  label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  data={performanceData.map(model => ({
                    name: model.name,
                    size: model.size,
                    latency: model.usage.averageLatency
                  }))}
                  fill="#8884d8" 
                  name="Response Time"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
