
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Database, MessageCircle, Brain, Bot, Image, User, Glasses } from "lucide-react";

export function UsageStatistics() {
  const [timeframe, setTimeframe] = useState("week");
  
  // Sample data - in a real app this would come from a database or backend
  const featureUsageData = [
    { name: "Chat", value: 42, color: "#8884d8", icon: MessageCircle },
    { name: "Memory", value: 18, color: "#82ca9d", icon: Brain },
    { name: "Agents", value: 12, color: "#ffc658", icon: Bot },
    { name: "Multimodal", value: 9, color: "#ff8042", icon: Image },
    { name: "Personas", value: 15, color: "#0088fe", icon: User },
    { name: "VR/AR", value: 4, color: "#00C49F", icon: Glasses }
  ];
  
  const modelTypeUsageData = [
    { name: "Text Generation", value: 58, color: "#8884d8" },
    { name: "Speech Recognition", value: 24, color: "#82ca9d" },
    { name: "Image Generation", value: 8, color: "#ffc658" },
    { name: "Speech Synthesis", value: 10, color: "#ff8042" }
  ];
  
  // Daily usage data for the past week
  const dailyUsageData = [
    { name: "Monday", interactions: 32, tokens: 4800 },
    { name: "Tuesday", interactions: 28, tokens: 4200 },
    { name: "Wednesday", interactions: 36, tokens: 5400 },
    { name: "Thursday", interactions: 42, tokens: 6300 },
    { name: "Friday", interactions: 38, tokens: 5700 },
    { name: "Saturday", interactions: 25, tokens: 3750 },
    { name: "Sunday", interactions: 30, tokens: 4500 }
  ];
  
  // Monthly usage data
  const monthlyUsageData = [
    { name: "Jan", interactions: 120, tokens: 18000 },
    { name: "Feb", interactions: 150, tokens: 22500 },
    { name: "Mar", interactions: 200, tokens: 30000 },
    { name: "Apr", interactions: 180, tokens: 27000 },
    { name: "May", interactions: 220, tokens: 33000 }
  ];
  
  const usageDataByTime = {
    day: dailyUsageData.slice(-1),
    week: dailyUsageData,
    month: monthlyUsageData.slice(-4),
    year: monthlyUsageData
  };
  
  const chartConfig = {
    interactions: {
      label: "Interactions",
    },
    tokens: {
      label: "Tokens",
    },
  };
  
  // Find the most used feature for display
  const mostUsedFeature = [...featureUsageData].sort((a, b) => b.value - a.value)[0];
  const MostUsedIcon = mostUsedFeature.icon;
  const totalUsage = featureUsageData.reduce((acc, feature) => acc + feature.value, 0);
  const usagePercentage = Math.round((mostUsedFeature.value / totalUsage) * 100);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interactions
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeframe === "week" ? 
                dailyUsageData.reduce((acc, day) => acc + day.interactions, 0) : 
                timeframe === "month" ? 
                  monthlyUsageData.slice(-4).reduce((acc, month) => acc + month.interactions, 0) :
                  monthlyUsageData.reduce((acc, month) => acc + month.interactions, 0)
              }
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tokens
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeframe === "week" ? 
                dailyUsageData.reduce((acc, day) => acc + day.tokens, 0).toLocaleString() : 
                timeframe === "month" ? 
                  monthlyUsageData.slice(-4).reduce((acc, month) => acc + month.tokens, 0).toLocaleString() :
                  monthlyUsageData.reduce((acc, month) => acc + month.tokens, 0).toLocaleString()
              }
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Used Feature
            </CardTitle>
            {MostUsedIcon && <MostUsedIcon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostUsedFeature.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage}% of total usage
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={featureUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {featureUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Model Type Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelTypeUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {modelTypeUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usage Trends</CardTitle>
          <Tabs value={timeframe} onValueChange={setTimeframe}>
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
                <BarChart data={usageDataByTime[timeframe as keyof typeof usageDataByTime]}>
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
    </div>
  );
}
