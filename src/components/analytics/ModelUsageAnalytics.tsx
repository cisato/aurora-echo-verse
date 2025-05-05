
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocalAI, ModelConfig, ModelUsage } from "@/hooks/useLocalAI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function ModelUsageAnalytics() {
  const { models, getModelUsage } = useLocalAI();
  const [usageData, setUsageData] = useState<(ModelConfig & { usage: ModelUsage })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsageData = async () => {
      setIsLoading(true);
      const modelUsageData = await Promise.all(
        models.map(async (model) => {
          const usage = await getModelUsage(model.name);
          return { ...model, usage };
        })
      );
      
      // Sort by inference count descending
      modelUsageData.sort((a, b) => b.usage.inferenceCount - a.usage.inferenceCount);
      setUsageData(modelUsageData);
      setIsLoading(false);
    };
    
    fetchUsageData();
  }, [models, getModelUsage]);
  
  // Prepare chart data
  const chartData = usageData.map(model => ({
    name: model.name,
    inferences: model.usage.inferenceCount,
    tokens: model.usage.totalTokens
  }));
  
  // For nicely formatted chart tooltip
  const chartConfig = {
    inferences: {
      label: "Inferences",
    },
    tokens: {
      label: "Tokens",
    },
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-80">Loading usage data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.reduce((acc, model) => acc + model.usage.inferenceCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.reduce((acc, model) => acc + model.usage.totalTokens, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed by all models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Used Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.length > 0 ? usageData[0].name : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {usageData.length > 0 ? `${usageData[0].usage.inferenceCount} inferences` : "No usage data"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-80">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="inferences" fill="#8884d8" name="Inferences" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Model Usage Details</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Inferences</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Avg. Latency</TableHead>
                <TableHead>Last Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((model) => (
                <TableRow key={model.name}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.type}</TableCell>
                  <TableCell>{model.usage.inferenceCount}</TableCell>
                  <TableCell>{model.usage.totalTokens.toLocaleString()}</TableCell>
                  <TableCell>{model.usage.averageLatency.toFixed(0)}ms</TableCell>
                  <TableCell>
                    {model.usage.lastUsed 
                      ? new Date(model.usage.lastUsed).toLocaleString() 
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
