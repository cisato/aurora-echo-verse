
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Gauge } from "lucide-react";

interface PerformanceCardProps {
  fastestModel: { name: string; usage: { averageLatency: number } } | null;
  slowestModel: { name: string; usage: { averageLatency: number } } | null;
  averageLatency: number;
}

export function PerformanceCards({ fastestModel, slowestModel, averageLatency }: PerformanceCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-card/50 hover:bg-card/80 transition-colors">
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
      
      <Card className="bg-card/50 hover:bg-card/80 transition-colors">
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
      
      <Card className="bg-card/50 hover:bg-card/80 transition-colors">
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
  );
}
