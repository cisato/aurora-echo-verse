
import React from "react";
import { Card } from "@/components/ui/card";
import { Code as CodeIcon, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Code = () => {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Code Examples</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-green/10">
              <CodeIcon className="h-5 w-5 text-aurora-green" />
            </div>
            <h3 className="font-medium">React Component Example</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => copyCode(`import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default Counter;`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <pre className="p-4 bg-background/30 rounded-md overflow-auto text-sm">
            {`import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default Counter;`}
          </pre>
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-purple/10">
              <CodeIcon className="h-5 w-5 text-aurora-purple" />
            </div>
            <h3 className="font-medium">TypeScript Interface Example</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => copyCode(`interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  role: 'admin' | 'user' | 'guest';
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}\`;
}

const newUser: User = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  isActive: true,
  role: "admin"
};

const greeting = greetUser(newUser);`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <pre className="p-4 bg-background/30 rounded-md overflow-auto text-sm">
            {`interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  role: 'admin' | 'user' | 'guest';
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}\`;
}

const newUser: User = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  isActive: true,
  role: "admin"
};

const greeting = greetUser(newUser);`}
          </pre>
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-aurora-blue/10">
                <CodeIcon className="h-5 w-5 text-aurora-blue" />
              </div>
              <h3 className="font-medium">More Code Resources</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <a 
              href="https://react.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-background/30 rounded-md hover:bg-accent/20 transition-colors"
            >
              <span>React Documentation</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a 
              href="https://www.typescriptlang.org/docs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-background/30 rounded-md hover:bg-accent/20 transition-colors"
            >
              <span>TypeScript Documentation</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a 
              href="https://tailwindcss.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-background/30 rounded-md hover:bg-accent/20 transition-colors"
            >
              <span>Tailwind CSS Documentation</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Code;
