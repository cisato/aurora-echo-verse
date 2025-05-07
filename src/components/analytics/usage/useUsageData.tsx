
import { useState } from "react";

export type UsageDataTimeframe = "day" | "week" | "month" | "year";

export function useUsageData() {
  const [timeframe, setTimeframe] = useState<UsageDataTimeframe>("week");
  
  // Feature usage data
  const featureUsageData = [
    { name: "Chat", value: 42, color: "#8884d8", icon: "MessageCircle" },
    { name: "Memory", value: 18, color: "#82ca9d", icon: "Brain" },
    { name: "Agents", value: 12, color: "#ffc658", icon: "Bot" },
    { name: "Multimodal", value: 9, color: "#ff8042", icon: "Image" },
    { name: "Personas", value: 15, color: "#0088fe", icon: "User" },
    { name: "VR/AR", value: 4, color: "#00C49F", icon: "Glasses" }
  ];
  
  // Model type usage data
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

  return {
    timeframe,
    setTimeframe,
    featureUsageData,
    modelTypeUsageData,
    dailyUsageData,
    monthlyUsageData,
    usageDataByTime,
    chartConfig
  };
}
