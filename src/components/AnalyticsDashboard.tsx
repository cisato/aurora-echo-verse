import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelUsageAnalytics } from "@/components/analytics/ModelUsageAnalytics";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { UsageStatistics } from "@/components/analytics/UsageStatistics";
import { HistoricalData } from "@/components/analytics/HistoricalData";
import { ModelComparison } from "@/components/analytics/ModelComparison";

export function AnalyticsDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-8 overflow-auto h-full">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive view of AI model usage, performance metrics, and system statistics
        </p>
      </div>
      
      {/* Usage Statistics Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Usage Statistics</h2>
          <p className="text-sm text-muted-foreground">Feature usage patterns and trends</p>
        </div>
        <UsageStatistics />
      </section>

      {/* Model Usage and Performance - Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-semibold">Model Usage</h2>
            <p className="text-sm text-muted-foreground">Track which AI models are used most frequently</p>
          </div>
          <Card className="shadow-md border-muted">
            <CardContent className="p-6">
              <ModelUsageAnalytics />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
            <p className="text-sm text-muted-foreground">Response times and model accuracy analysis</p>
          </div>
          <Card className="shadow-md border-muted">
            <CardContent className="p-6">
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Historical Data Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Historical Data</h2>
          <p className="text-sm text-muted-foreground">Usage patterns and trends over time</p>
        </div>
        <Card className="shadow-md border-muted">
          <CardContent className="p-6">
            <HistoricalData />
          </CardContent>
        </Card>
      </section>

      {/* Model Comparison Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Model Comparison</h2>
          <p className="text-sm text-muted-foreground">Compare performance between different AI models</p>
        </div>
        <Card className="shadow-md border-muted">
          <CardContent className="p-6">
            <ModelComparison />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}