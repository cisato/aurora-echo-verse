import { Settings, BarChart3, Gauge, TrendingUp, History, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAnalyticsSettings } from "@/hooks/useAnalyticsSettings";

const METRICS = [
  {
    key: "usage" as const,
    label: "Model Usage Analytics",
    description: "Track which AI models are used most frequently",
    icon: BarChart3,
  },
  {
    key: "performance" as const,
    label: "Performance Metrics",
    description: "Analyze response times and accuracy of models",
    icon: Gauge,
  },
  {
    key: "statistics" as const,
    label: "Usage Statistics",
    description: "View detailed usage statistics across features",
    icon: TrendingUp,
  },
  {
    key: "historical" as const,
    label: "Historical Data",
    description: "View usage patterns over time",
    icon: History,
  },
  {
    key: "comparison" as const,
    label: "Model Comparison",
    description: "Compare performance between different AI models",
    icon: GitCompare,
  },
];

export function AnalyticsSettings() {
  const { settings, toggleMetric, resetSettings, enableAll, disableAll } = useAnalyticsSettings();

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const totalCount = Object.keys(settings).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Analytics Settings</SheetTitle>
          <SheetDescription>
            Customize which analytics metrics are displayed and tracked
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enableAll}
                className="flex-1"
              >
                Enable All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAll}
                className="flex-1"
              >
                Disable All
              </Button>
            </div>
          </div>

          <Separator />

          {/* Metrics Status */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Metrics Status</h4>
            <p className="text-sm text-muted-foreground">
              {enabledCount} of {totalCount} metrics enabled
            </p>
          </div>

          <Separator />

          {/* Individual Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Individual Metrics</h4>
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.key}
                  className="flex items-start space-x-3 rounded-lg border p-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={metric.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {metric.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                  <Switch
                    id={metric.key}
                    checked={settings[metric.key]}
                    onCheckedChange={() => toggleMetric(metric.key)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={resetSettings} className="w-full">
            Reset to Default
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
