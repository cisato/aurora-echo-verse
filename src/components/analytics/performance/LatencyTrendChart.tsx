
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Chart configuration for model colors and labels
export const chartConfig = {
  "Phi-3-mini-4k-instruct": {
    label: "Phi-3 Mini",
    theme: { light: "#8884d8", dark: "#a997ff" },
  },
  "Llama-3-8B-Instruct": {
    label: "Llama-3 8B",
    theme: { light: "#82ca9d", dark: "#93ddb6" },
  },
  "Whisper-Tiny": {
    label: "Whisper Tiny",
    theme: { light: "#ffc658", dark: "#ffd57e" },
  },
  "GPT-Neo-1.3B": {
    label: "GPT-Neo",
    theme: { light: "#ff8042", dark: "#ff9966" },
  },
};

interface LatencyTrendChartProps {
  historicalData: any[];
}

export function LatencyTrendChart({ historicalData }: LatencyTrendChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Latency Trends (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Phi-3-mini-4k-instruct" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="Llama-3-8B-Instruct" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="Whisper-Tiny" stroke="#ffc658" strokeWidth={2} />
                <Line type="monotone" dataKey="GPT-Neo-1.3B" stroke="#ff8042" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
