
import { useState, useEffect } from 'react';

export function useHistoricalData() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  // Generate some simulated historical data
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      
      // Generate 14 days of data
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Simulate different model latencies with a slight improvement trend
        const entry = {
          date: date.toISOString().split('T')[0],
          "Phi-3-mini-4k-instruct": Math.floor(240 - (i * 0.8) + (Math.random() * 20 - 10)),
          "Llama-3-8B-Instruct": Math.floor(320 - (i * 1.2) + (Math.random() * 30 - 15)),
          "Whisper-Tiny": Math.floor(100 - (i * 0.4) + (Math.random() * 10 - 5)),
          "GPT-Neo-1.3B": Math.floor(180 - (i * 0.6) + (Math.random() * 15 - 7.5)),
        };
        data.push(entry);
      }
      
      return data;
    };
    
    setHistoricalData(generateHistoricalData());
  }, []);

  return historicalData;
}
