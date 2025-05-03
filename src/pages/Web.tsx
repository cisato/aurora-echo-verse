
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Globe, Loader2, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  category: string;
  time: string;
}

const Web = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Simulate fetching web news
    const timer = setTimeout(() => {
      setNews([
        {
          id: 1,
          title: "New AI breakthrough enables more natural conversations",
          summary: "Researchers have developed a new AI model that can understand context better than previous systems.",
          source: "Tech Daily",
          category: "Technology",
          time: "2 hours ago"
        },
        {
          id: 2,
          title: "Global climate initiative launches with support from 50 countries",
          summary: "A new international agreement aims to reduce carbon emissions by 30% over the next decade.",
          source: "World News",
          category: "Environment",
          time: "5 hours ago"
        },
        {
          id: 3,
          title: "Scientists discover potential new treatment for common disease",
          summary: "A clinical trial shows promising results for treating a widespread medical condition.",
          source: "Health Report",
          category: "Health",
          time: "Yesterday"
        },
        {
          id: 4,
          title: "Stock markets reach all-time high as tech sector booms",
          summary: "Major indices climbed as technology companies reported strong earnings this quarter.",
          source: "Finance Today",
          category: "Finance",
          time: "1 day ago"
        }
      ]);
      setLoading(false);
      toast.success("Web content loaded");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-3xl font-bold mb-2">Web</h1>
      <p className="text-muted-foreground mb-6">Latest news and information from the web</p>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-aurora-blue mr-2" />
          <span>Loading web content...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="h-5 w-5 text-aurora-blue" />
              <h2 className="text-xl font-semibold">Today's Headlines</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <Card key={item.id} className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
                  <Badge className="mb-2" variant="outline">{item.category}</Badge>
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.summary}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-aurora-purple" />
              <h2 className="text-xl font-semibold">Popular Websites</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Wikipedia", url: "https://wikipedia.org", color: "bg-aurora-blue/10" },
                { name: "Reddit", url: "https://reddit.com", color: "bg-aurora-orange/10" },
                { name: "GitHub", url: "https://github.com", color: "bg-aurora-purple/10" },
                { name: "YouTube", url: "https://youtube.com", color: "bg-aurora-pink/10" }
              ].map((site, i) => (
                <a 
                  key={i} 
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-6 rounded-md ${site.color} flex justify-center items-center hover:opacity-80 transition-opacity`}
                >
                  <span className="font-medium">{site.name}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Web;
