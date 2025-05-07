
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { UsageDataTimeframe } from "./useUsageData";

type UsageTrendsChartProps = {
  timeframe: UsageDataTimeframe;
  setTimeframe: (timeframe: UsageDataTimeframe) => void;
  usageDataByTime: {
    day: any[];
    week: any[];
    month: any[];
    year: any[];
  };
  chartConfig: {
    interactions: {
      label: string;
    };
    tokens: {
      label: string;
    };
  };
};

export function UsageTrendsChart({ 
  timeframe, 
  setTimeframe, 
  usageDataByTime,
  chartConfig
}: UsageTrendsChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usage Trends</CardTitle>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as UsageDataTimeframe)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageDataByTime[timeframe]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="interactions" fill="#8884d8" name="Interactions" />
                <Bar yAxisId="right" dataKey="tokens" fill="#82ca9d" name="Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
