import { useState } from "react";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import ExternalLink from "@/components/ExternalLink";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const { toast } = useToast();
  const [searchResults] = useState([
    {
      title: "Illinois State Normal University Founding Charter",
      date: "February 18, 1857",
      type: "Official Records",
      summary: "Legislative act establishing Illinois' first public university in Normal. Documents the vision to train teachers for Illinois schools and the selection of Jesse Fell's donated land for the campus."
    },
    {
      title: "The Pantagraph - State Farm Insurance Company Moves to Bloomington",
      date: "June 7, 1929",
      type: "Newspaper Article",
      summary: "Coverage of State Farm's relocation from Bloomington to a larger headquarters, marking the beginning of what would become the city's largest employer and a Fortune 500 company."
    },
    {
      title: "Beer Nuts Factory Opening Ceremony",
      date: "April 19, 1937",
      type: "Business Records",
      summary: "Documentation of the Shirk family's candy-coated peanut factory opening. The product originally called 'Redskins' would become an iconic Bloomington-Normal brand sold nationwide."
    },
    {
      title: "David Davis Mansion Dedication",
      date: "October 15, 1872",
      type: "Historical Site",
      summary: "Records from the completion of Supreme Court Justice David Davis's Victorian mansion, friend and campaign manager of Abraham Lincoln. Now a National Historic Landmark."
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
