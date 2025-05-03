
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setSearching(true);
    
    // Simulate search results
    setTimeout(() => {
      setResults([
        `Result for "${query}" - Knowledge article`,
        `Result for "${query}" - Web search`,
        `Result for "${query}" - News item`,
        `Result for "${query}" - Related information`,
      ]);
      setSearching(false);
    }, 1500);
  };
  
  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="text"
            placeholder="What would you like to search for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={searching}>
            {searching ? (
              <>Searching...</>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </form>
        
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, i) => (
              <Card key={i} className="p-4 hover:bg-muted/30 cursor-pointer transition-colors">
                <p>{result}</p>
              </Card>
            ))}
          </div>
        )}
        
        {searching && (
          <div className="text-center py-8 text-muted-foreground">
            Searching for "{query}"...
          </div>
        )}
        
        {!searching && query && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No results found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
