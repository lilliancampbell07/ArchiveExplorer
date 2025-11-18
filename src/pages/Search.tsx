import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import ExternalLink from "@/components/ExternalLink";
import { useToast } from "@/hooks/use-toast";
import { searchArticlesHybrid, formatSearchResults, preloadAIModel, isAILoading } from "@/lib/aiSearchUtils";
import articlesData from "@/data/articles.json";
import { Loader2 } from "lucide-react";

const Search = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState(
    formatSearchResults(articlesData.map(article => ({ ...article, relevanceScore: 0 })))
  );
  const [isSearching, setIsSearching] = useState(false);
  const [aiModelLoading, setAiModelLoading] = useState(true);

  // Pre-load AI model on component mount
  useEffect(() => {
    const loadModel = async () => {
      setAiModelLoading(true);
      await preloadAIModel();
      setAiModelLoading(false);
      
      toast({
        title: "🤖 AI Model Ready",
        description: "Semantic search powered by all-MiniLM-L6-v2 is now active!",
      });
    };
    
    loadModel();
  }, [toast]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    
    try {
      // Perform AI-powered hybrid search
      const results = await searchArticlesHybrid(query, articlesData);
      const formattedResults = formatSearchResults(results);
      
      setSearchResults(formattedResults);
      
      toast({
        title: query ? "🔍 AI Search completed" : "Showing all articles",
        description: query 
          ? `Found ${formattedResults.length} article${formattedResults.length !== 1 ? 's' : ''} using semantic matching`
          : `Displaying all ${formattedResults.length} articles`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search error",
        description: "An error occurred during search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
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
            {aiModelLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading AI model (all-MiniLM-L6-v2)... This takes ~5-10 seconds
              </div>
            )}
            {!aiModelLoading && (
              <div className="text-sm text-green-600 dark:text-green-400">
                🤖 AI-powered semantic search ready!
              </div>
            )}
          </div>

          <SearchBar onSearch={handleSearch} size="large" disabled={isSearching || aiModelLoading} />

          <ExternalLink />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Search Results</h2>
              <p className="text-sm text-muted-foreground">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching with AI...
                  </span>
                ) : (
                  `${searchResults.length} document${searchResults.length !== 1 ? 's' : ''} found`
                )}
              </p>
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
