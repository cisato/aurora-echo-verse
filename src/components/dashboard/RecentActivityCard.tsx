
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RecentActivityCard() {
  return (
    <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-aurora-purple/10">
          <MessageCircle className="h-5 w-5 text-aurora-purple" />
        </div>
        <h3 className="font-medium">Recent Activity</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">10:23 AM</span>
          <span className="text-sm">Weather information requested</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Yesterday</span>
          <span className="text-sm">Calendar appointment added</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Yesterday</span>
          <span className="text-sm">Code explanation generated</span>
        </div>
      </div>
    </Card>
  );
}
