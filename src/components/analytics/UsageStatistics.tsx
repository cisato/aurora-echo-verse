
import { useUsageData } from "./usage/useUsageData";
import { StatisticsCards } from "./usage/StatisticsCards";
import { FeatureDistributionChart } from "./usage/FeatureDistributionChart";
import { ModelTypeChart } from "./usage/ModelTypeChart";
import { UsageTrendsChart } from "./usage/UsageTrendsChart";

export function UsageStatistics() {
  const {
    timeframe,
    setTimeframe,
    featureUsageData,
    modelTypeUsageData,
    dailyUsageData,
    monthlyUsageData,
    usageDataByTime,
    chartConfig
  } = useUsageData();
  
  // Find the most used feature for display
  const mostUsedFeature = [...featureUsageData].sort((a, b) => b.value - a.value)[0];
  const totalUsage = featureUsageData.reduce((acc, feature) => acc + feature.value, 0);
  const usagePercentage = Math.round((mostUsedFeature.value / totalUsage) * 100);
  
  return (
    <div className="space-y-6">
      <StatisticsCards
        timeframe={timeframe}
        dailyUsageData={dailyUsageData}
        monthlyUsageData={monthlyUsageData}
        mostUsedFeature={mostUsedFeature}
        usagePercentage={usagePercentage}
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureDistributionChart featureUsageData={featureUsageData} />
        <ModelTypeChart modelTypeUsageData={modelTypeUsageData} />
      </div>
      
      <UsageTrendsChart 
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        usageDataByTime={usageDataByTime}
        chartConfig={chartConfig}
      />
    </div>
  );
}
