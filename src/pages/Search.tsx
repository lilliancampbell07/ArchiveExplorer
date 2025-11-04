import { useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const { toast } = useToast();
  const [searchResults] = useState([
    {
      title: "Town Council Meeting Minutes - Urban Development Discussion",
      date: "March 15, 1985",
      type: "Meeting Minutes",
      summary: "Discussion of proposed downtown revitalization project, including new library construction and public park improvements. Council voted 7-2 in favor of the initial planning phase."
    },
    {
      title: "Local Newspaper - Community Center Opens",
      date: "June 22, 1978",
      type: "Newspaper Article",
      summary: "Coverage of the grand opening of the Riverside Community Center, featuring interviews with founding members and description of available programs and services."
    },
    {
      title: "Historical Society Records - Founding Documents",
      date: "January 10, 1952",
      type: "Official Records",
      summary: "Original charter and bylaws for the establishment of the local historical society, including mission statement and list of founding members."
    },
  ]);

  const handleSearch = (query: string) => {
    toast({
      title: "Search submitted",
      description: `Searching for: "${query}"`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Search the Archives</h1>
            <p className="text-lg text-muted-foreground">
              Ask questions in natural language and discover historical documents
            </p>
          </div>

          <SearchBar onSearch={handleSearch} size="large" />

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
