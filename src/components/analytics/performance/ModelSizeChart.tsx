
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { chartConfig } from "./LatencyTrendChart";

interface ModelSizeChartProps {
  performanceData: Array<{
    name: string;
    size: number;
    usage: {
      averageLatency: number;
    };
  }>;
}

export function ModelSizeChart({ performanceData }: ModelSizeChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Performance by Model Size</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
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
              >
                {performanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={Object.values(chartConfig)[index % Object.values(chartConfig).length].theme.light} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
