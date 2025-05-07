
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Database } from "lucide-react";
import { UsageDataTimeframe } from "./useUsageData";

type MostUsedFeature = {
  name: string;
  value: number;
  color: string;
  icon: string;
};

type StatisticsCardsProps = {
  timeframe: UsageDataTimeframe;
  dailyUsageData: { name: string; interactions: number; tokens: number }[];
  monthlyUsageData: { name: string; interactions: number; tokens: number }[];
  mostUsedFeature: MostUsedFeature;
  usagePercentage: number;
};

export function StatisticsCards({
  timeframe,
  dailyUsageData,
  monthlyUsageData,
  mostUsedFeature,
  usagePercentage,
}: StatisticsCardsProps) {
  let IconComponent;
  switch (mostUsedFeature.icon) {
    case "MessageCircle":
      IconComponent = MessageCircle;
      break;
    case "Brain":
      IconComponent = Database; // Using Database as a placeholder, since Brain is not available
      break;
    case "Bot":
    case "Image":
    case "User":
    case "Glasses":
      IconComponent = MessageCircle; // Using MessageCircle as a fallback
      break;
    default:
      IconComponent = MessageCircle;
  }

  return (
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
          {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
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
  );
}
