import { memo, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy chart components
const ModelUsageAnalytics = lazy(() => import("@/components/analytics/ModelUsageAnalytics").then(m => ({ default: m.ModelUsageAnalytics })));
const PerformanceMetrics = lazy(() => import("@/components/analytics/PerformanceMetrics").then(m => ({ default: m.PerformanceMetrics })));
const UsageStatistics = lazy(() => import("@/components/analytics/UsageStatistics").then(m => ({ default: m.UsageStatistics })));
const HistoricalData = lazy(() => import("@/components/analytics/HistoricalData").then(m => ({ default: m.HistoricalData })));
const ModelComparison = lazy(() => import("@/components/analytics/ModelComparison").then(m => ({ default: m.ModelComparison })));

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const AnalyticsDashboard = memo(function AnalyticsDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-8 overflow-auto h-full">
      <header className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive view of AI model usage, performance metrics, and system statistics
        </p>
      </header>
      
      {/* Usage Statistics Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Usage Statistics</h2>
          <p className="text-sm text-muted-foreground">Feature usage patterns and trends</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <UsageStatistics />
        </Suspense>
      </section>

      {/* Model Usage and Performance - Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-semibold">Model Usage</h2>
            <p className="text-sm text-muted-foreground">Track which AI models are used most frequently</p>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <ModelUsageAnalytics />
          </Suspense>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
            <p className="text-sm text-muted-foreground">Response times and model accuracy analysis</p>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <PerformanceMetrics />
          </Suspense>
        </section>
      </div>

      {/* Historical Data Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Historical Data</h2>
          <p className="text-sm text-muted-foreground">Usage patterns and trends over time</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <HistoricalData />
        </Suspense>
      </section>

      {/* Model Comparison Section */}
      <section className="space-y-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-semibold">Model Comparison</h2>
          <p className="text-sm text-muted-foreground">Compare performance between different AI models</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <ModelComparison />
        </Suspense>
      </section>
    </div>
  );
});