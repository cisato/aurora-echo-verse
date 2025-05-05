
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function ModelComparison() {
  const [compareMetric, setCompareMetric] = useState("latency");
  
  // Sample model comparison data
  const modelComparisonData = [
    {
      name: "Phi-3-mini-4k-instruct",
      category: "Text Generation",
      size: 1950,
      latency: 240,
      accuracy: 82,
      tokens_per_second: 15,
      memory_usage: 2200,
      rating: 4.2
    },
    {
      name: "Llama-3-8B-Instruct",
      category: "Text Generation",
      size: 4300,
      latency: 320,
      accuracy: 89,
      tokens_per_second: 12,
      memory_usage: 4800,
      rating: 4.7
    },
    {
      name: "GPT-Neo-1.3B",
      category: "Text Generation",
      size: 850,
      latency: 180,
      accuracy: 76,
      tokens_per_second: 22,
      memory_usage: 1400,
      rating: 3.9
    },
    {
      name: "Whisper-Tiny",
      category: "Speech Recognition",
      size: 75,
      latency: 100,
      accuracy: 72,
      tokens_per_second: 35,
      memory_usage: 350,
      rating: 3.6
    },
    {
      name: "Whisper-Base",
      category: "Speech Recognition",
      size: 142,
      latency: 150,
      accuracy: 80,
      tokens_per_second: 30,
      memory_usage: 620,
      rating: 4.0
    }
  ];
  
  // Filter to compare only text generation models
  const textGenerationModels = modelComparisonData.filter(model => 
    model.category === "Text Generation"
  );
  
  // Format for radar chart
  const radarData = textGenerationModels.map(model => ({
    model: model.name,
    Accuracy: model.accuracy,
    Speed: 100 - (model.latency / 4), // Normalize latency
    Efficiency: model.tokens_per_second * 3,
    Size: 100 - (model.size / 50), // Normalize size (smaller is better)
    Memory: 100 - (model.memory_usage / 50) // Normalize memory (smaller is better)
  }));
  
  // Metrics for comparison
  const metrics = {
    latency: {
      label: "Response Time (ms)",
      color: "#8884d8",
      higherIsBetter: false
    },
    accuracy: {
      label: "Accuracy (%)",
      color: "#82ca9d",
      higherIsBetter: true
    },
    tokens_per_second: {
      label: "Tokens/Second",
      color: "#ffc658", 
      higherIsBetter: true
    },
    memory_usage: {
      label: "Memory Usage (MB)",
      color: "#ff8042",
      higherIsBetter: false
    },
    size: {
      label: "Model Size (MB)",
      color: "#0088fe",
      higherIsBetter: false
    }
  };
  
  // Chart configuration for UI
  const chartConfig = {
    latency: {
      label: "Response Time (ms)",
      theme: { light: "#8884d8", dark: "#a997ff" },
    },
    accuracy: {
      label: "Accuracy (%)",
      theme: { light: "#82ca9d", dark: "#93ddb6" },
    },
    tokens_per_second: {
      label: "Tokens/Second",
      theme: { light: "#ffc658", dark: "#ffd57e" },
    },
    memory_usage: {
      label: "Memory Usage (MB)",
      theme: { light: "#ff8042", dark: "#ff9966" },
    },
    size: {
      label: "Model Size (MB)",
      theme: { light: "#0088fe", dark: "#66b0ff" },
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Model Performance Comparison</h2>
        <div className="w-56">
          <Select value={compareMetric} onValueChange={setCompareMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latency">Response Time</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
              <SelectItem value="tokens_per_second">Processing Speed</SelectItem>
              <SelectItem value="memory_usage">Memory Usage</SelectItem>
              <SelectItem value="size">Model Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{metrics[compareMetric as keyof typeof metrics].label} by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelComparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar 
                    dataKey={compareMetric} 
                    fill={metrics[compareMetric as keyof typeof metrics].color} 
                    name={metrics[compareMetric as keyof typeof metrics].label}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text Generation Models - Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="model" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {Object.keys(radarData[0]).slice(1).map((key, index) => (
                    <Radar 
                      key={key}
                      name={key} 
                      dataKey={key} 
                      stroke={`hsl(${index * 45}, 70%, 60%)`}
                      fill={`hsl(${index * 45}, 70%, 60%)`} 
                      fillOpacity={0.2} 
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Model Detail Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size (MB)</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Best For</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelComparisonData.map((model) => (
                    <TableRow key={model.name}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.category}</TableCell>
                      <TableCell>{model.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`mr-2 ${
                            model.rating >= 4.5 ? "text-green-500" : 
                            model.rating >= 4.0 ? "text-blue-500" :
                            model.rating >= 3.5 ? "text-amber-500" : "text-red-500"
                          }`}>
                            {model.rating.toFixed(1)}
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                model.rating >= 4.5 ? "bg-green-500" : 
                                model.rating >= 4.0 ? "bg-blue-500" :
                                model.rating >= 3.5 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${(model.rating / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {model.latency < 200 && <Badge className="mr-1 bg-green-500">Speed</Badge>}
                        {model.accuracy > 85 && <Badge className="mr-1 bg-blue-500">Accuracy</Badge>}
                        {model.size < 1000 && <Badge className="mr-1 bg-purple-500">Compact</Badge>}
                        {model.tokens_per_second > 20 && <Badge className="mr-1 bg-amber-500">Efficient</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
