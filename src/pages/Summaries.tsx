import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SummaryCard from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles } from "lucide-react";

interface Summary {
  title: string;
  originalDate: string;
  category: string;
  summary: string;
  url?: string;
  createdAt?: string;
}

const Summaries = () => {
  const [aiSummaries, setAiSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    // Load AI-generated summaries from localStorage
    const stored = localStorage.getItem('aiSummaries');
    if (stored) {
      setAiSummaries(JSON.parse(stored));
    }
  }, []);

  const clearAISummaries = () => {
    localStorage.removeItem('aiSummaries');
    setAiSummaries([]);
  };

  const deleteSummary = (title: string) => {
    const updated = aiSummaries.filter(s => s.title !== title);
    setAiSummaries(updated);
    localStorage.setItem('aiSummaries', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Bloomington-Normal History Summaries</h1>
            <p className="text-lg text-muted-foreground">
              Plain-language explanations of McLean County's rich historical heritage
            </p>
          </div>

          {aiSummaries.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  AI-Generated Summaries
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAISummaries}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-6">
                {aiSummaries.map((summary, index) => (
                  <div key={index} className="relative group">
                    <SummaryCard {...summary} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSummary(summary.title)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">No Summaries Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Use the Search page to find articles and click the "Summarize" button to generate AI-powered summaries. They'll appear here!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Summaries;
