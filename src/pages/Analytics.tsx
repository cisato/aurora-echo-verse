
import { useState } from "react";
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

export default function Analytics() {
  const { models, isAvailable } = useLocalAI();
  const [activeTab, setActiveTab] = useState("usage");
  
  return (
    <div className="container mx-auto py-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track AI model usage, performance metrics, and system statistics
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <div className="bg-background sticky top-0 z-10 pb-4 backdrop-blur-sm">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Usage
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Performance
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="historical" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Historical
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Comparison
            </TabsTrigger>
          </TabsList>
        </div>
        
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
      </Tabs>
    </div>
  );
}
