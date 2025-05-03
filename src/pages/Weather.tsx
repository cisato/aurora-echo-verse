
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CloudSun, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Weather = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading weather data
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success("Weather data loaded");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Weather</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-orange/10">
              <CloudSun className="h-5 w-5 text-aurora-orange" />
            </div>
            <h3 className="font-medium">Current Weather</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-aurora-blue" />
              <span className="ml-2">Loading weather data...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">72°F</h2>
                  <p className="text-muted-foreground">Partly Cloudy</p>
                </div>
                <CloudSun className="h-12 w-12 text-aurora-orange" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-background/30 rounded">
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-medium">65%</p>
                </div>
                <div className="p-2 bg-background/30 rounded">
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-medium">8 mph</p>
                </div>
                <div className="p-2 bg-background/30 rounded">
                  <p className="text-xs text-muted-foreground">Feels Like</p>
                  <p className="font-medium">74°F</p>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-blue/10">
              <CloudSun className="h-5 w-5 text-aurora-blue" />
            </div>
            <h3 className="font-medium">5-Day Forecast</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-aurora-blue" />
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { day: "Monday", temp: "73°F", condition: "Sunny" },
                { day: "Tuesday", temp: "68°F", condition: "Partly Cloudy" },
                { day: "Wednesday", temp: "65°F", condition: "Rainy" },
                { day: "Thursday", temp: "70°F", condition: "Cloudy" },
                { day: "Friday", temp: "75°F", condition: "Sunny" },
              ].map((day, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-background/30 rounded transition-colors">
                  <span>{day.day}</span>
                  <div className="flex items-center gap-2">
                    <span>{day.condition}</span>
                    <span className="font-medium">{day.temp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Weather;
