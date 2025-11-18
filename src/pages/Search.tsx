import { useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import ExternalLink from "@/components/ExternalLink";
import { useToast } from "@/hooks/use-toast";
import { searchArticles, formatSearchResults } from "@/lib/searchUtils";
import articlesData from "@/data/articles.json";

const Search = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState(
    formatSearchResults(articlesData.map(article => ({ ...article, relevanceScore: 0 })))
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    
    // Perform search
    const results = searchArticles(query, articlesData);
    const formattedResults = formatSearchResults(results);
    
    setSearchResults(formattedResults);
    
    toast({
      title: query ? "Search completed" : "Showing all articles",
      description: query 
        ? `Found ${formattedResults.length} article${formattedResults.length !== 1 ? 's' : ''} matching "${query}"`
        : `Displaying all ${formattedResults.length} articles`,
    });
    
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Search Bloomington-Normal History</h1>
            <p className="text-lg text-muted-foreground">
              Ask questions about McLean County's past and discover historical documents from Pages of the Past
            </p>
          </div>

          <SearchBar onSearch={handleSearch} size="large" />

          <ExternalLink />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Search Results</h2>
              <p className="text-sm text-muted-foreground">{searchResults.length} documents found</p>
            </div>
            
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <DocumentCard key={index} {...result} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
