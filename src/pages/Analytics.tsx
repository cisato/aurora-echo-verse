
import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalAI } from "@/hooks/useLocalAI";
import { ModelUsageAnalytics } from "@/components/analytics/ModelUsageAnalytics";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { UsageStatistics } from "@/components/analytics/UsageStatistics";
import { HistoricalData } from "@/components/analytics/HistoricalData";
import { ModelComparison } from "@/components/analytics/ModelComparison";
import { AnalyticsSettings } from "@/components/analytics/AnalyticsSettings";
import { useAnalyticsSettings } from "@/hooks/useAnalyticsSettings";

export default function Analytics() {
  const { models, isAvailable } = useLocalAI();
  const { settings } = useAnalyticsSettings();
  const [activeTab, setActiveTab] = useState("usage");
  
  // Get enabled tabs for navigation
  const enabledTabs = useMemo(() => {
    const tabs = [];
    if (settings.usage) tabs.push("usage");
    if (settings.performance) tabs.push("performance");
    if (settings.statistics) tabs.push("statistics");
    if (settings.historical) tabs.push("historical");
    if (settings.comparison) tabs.push("comparison");
    return tabs;
  }, [settings]);
  
  // Auto-switch to first enabled tab if current tab is disabled
  useMemo(() => {
    if (enabledTabs.length > 0 && !enabledTabs.includes(activeTab)) {
      setActiveTab(enabledTabs[0]);
    }
  }, [enabledTabs, activeTab]);
  
  return (
    <div className="container mx-auto py-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track AI model usage, performance metrics, and system statistics
          </p>
        </div>
        <AnalyticsSettings />
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        {enabledTabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-center">
              No analytics metrics enabled. Enable at least one metric in settings.
            </p>
            <AnalyticsSettings />
          </div>
        ) : (
          <div className="bg-background sticky top-0 z-10 pb-4 backdrop-blur-sm">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5 gap-2">
              {settings.usage && (
                <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Usage
                </TabsTrigger>
              )}
              {settings.performance && (
                <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Performance
                </TabsTrigger>
              )}
              {settings.statistics && (
                <TabsTrigger value="statistics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Statistics
                </TabsTrigger>
              )}
              {settings.historical && (
                <TabsTrigger value="historical" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Historical
                </TabsTrigger>
              )}
              {settings.comparison && (
                <TabsTrigger value="comparison" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Comparison
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        )}
        
        {settings.usage && (
          <TabsContent value="usage" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-muted">
              <CardHeader>
                <CardTitle>Model Usage Analytics</CardTitle>
                <CardDescription>
                  Track which AI models are used most frequently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelUsageAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {settings.performance && (
          <TabsContent value="performance" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-muted">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Analyze response times and accuracy of different models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {settings.statistics && (
          <TabsContent value="statistics" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-muted">
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  View detailed usage statistics across features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageStatistics />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {settings.historical && (
          <TabsContent value="historical" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-muted">
              <CardHeader>
                <CardTitle>Historical Data</CardTitle>
                <CardDescription>
                  View usage patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricalData />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {settings.comparison && (
          <TabsContent value="comparison" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-muted">
              <CardHeader>
                <CardTitle>Model Comparison</CardTitle>
                <CardDescription>
                  Compare performance between different AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelComparison />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
