
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function HistoricalData() {
  const [selectedMetric, setSelectedMetric] = useState("interactions");
  const [timeRange, setTimeRange] = useState("month");
  
  // Generate sample historical data
  const generateData = () => {
    const data = [];
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const days = ranges[timeRange as keyof typeof ranges];
    const interval = timeRange === "week" ? 1 : 
                     timeRange === "month" ? 1 :
                     timeRange === "quarter" ? 3 : 7;
    
    // Base values that will increase over time
    let interactions = 18 + Math.floor(Math.random() * 10);
    let tokens = 2700 + Math.floor(Math.random() * 300);
    let queries = 12 + Math.floor(Math.random() * 5);
    let uniqueFeatures = 2 + Math.floor(Math.random() * 2);
    
    for (let i = days; i > 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Add some random variation but with an overall increasing trend
      interactions += Math.floor(Math.random() * 4 - 1) + (days - i) / 60;
      tokens += Math.floor(Math.random() * 600 - 200) + (days - i) * 8;
      queries += Math.floor(Math.random() * 3 - 1) + (days - i) / 90;
      uniqueFeatures = Math.min(6, uniqueFeatures + (Math.random() > 0.85 ? 1 : 0));
      
      if (interval === 1 || i % interval === 0) {
        data.push({
          date: date.toISOString().split('T')[0],
          interactions: Math.floor(interactions),
          tokens: Math.floor(tokens),
          queries: Math.floor(queries),
          uniqueFeatures: Math.floor(uniqueFeatures)
        });
      }
    }
    
    return data;
  };
  
  const [historicalData, setHistoricalData] = useState(generateData());
  
  useEffect(() => {
    setHistoricalData(generateData());
  }, [timeRange]);
  
  const metrics = {
    interactions: {
      label: "User Interactions",
      color: "#8884d8",
      format: (value: number) => value.toString()
    },
    tokens: {
      label: "Token Usage",
      color: "#82ca9d",
      format: (value: number) => value.toLocaleString()
    },
    queries: {
      label: "AI Queries",
      color: "#ffc658",
      format: (value: number) => value.toString()
    },
    uniqueFeatures: {
      label: "Unique Features Used",
      color: "#ff8042",
      format: (value: number) => value.toString()
    }
  };
  
  const chartConfig = {
    interactions: {
      label: "Interactions",
      theme: { light: "#8884d8", dark: "#a997ff" },
    },
    tokens: {
      label: "Tokens",
      theme: { light: "#82ca9d", dark: "#93ddb6" },
    },
    queries: {
      label: "Queries",
      theme: { light: "#ffc658", dark: "#ffd57e" },
    },
    uniqueFeatures: {
      label: "Features",
      theme: { light: "#ff8042", dark: "#ff9966" },
    },
  };
  
  const getAverageValue = () => {
    const values = historicalData.map(item => item[selectedMetric as keyof typeof item] as number);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  };
  
  const getGrowthRate = () => {
    if (historicalData.length < 2) return 0;
    
    const firstValue = historicalData[0][selectedMetric as keyof typeof historicalData[0]] as number;
    const lastValue = historicalData[historicalData.length - 1][selectedMetric as keyof typeof historicalData[0]] as number;
    
    return ((lastValue - firstValue) / firstValue) * 100;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-40">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interactions">Interactions</SelectItem>
                <SelectItem value="tokens">Token Usage</SelectItem>
                <SelectItem value="queries">AI Queries</SelectItem>
                <SelectItem value="uniqueFeatures">Features Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-32">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average:</p>
            <p className="text-xl font-bold">
              {metrics[selectedMetric as keyof typeof metrics].format(getAverageValue())}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Growth:</p>
            <p className={`text-xl font-bold ${getGrowthRate() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getGrowthRate().toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {metrics[selectedMetric as keyof typeof metrics].label} Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={metrics[selectedMetric as keyof typeof metrics].color}
                    fill={metrics[selectedMetric as keyof typeof metrics].color}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Combined Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="#8884d8" 
                    dot={false}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="queries" 
                    stroke="#ffc658" 
                    dot={false}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="uniqueFeatures" 
                    stroke="#ff8042" 
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#82ca9d" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
