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
  createdAt?: string;
}

const Summaries = () => {
  const [aiSummaries, setAiSummaries] = useState<Summary[]>([]);
  
  const exampleSummaries: Summary[] = [
    {
      title: "Abraham Lincoln's Time in Bloomington",
      originalDate: "1854-1860",
      category: "Political History",
      summary: "Lincoln visited Bloomington frequently while riding the 8th Judicial Circuit. In 1856, he delivered his famous 'Lost Speech' at Major's Hall during the Republican Party's founding convention in Illinois. The speech was so powerful that reporters forgot to take notes. Lincoln stayed at the Pike House hotel and developed close friendships with local leaders including Jesse Fell, who later convinced him to run for president. David Davis, his friend and campaign manager, lived in Bloomington and later became a Supreme Court Justice."
    },
    {
      title: "Illinois State Normal University: The First Public University",
      originalDate: "1857-1900",
      category: "Education",
      summary: "Founded in 1857 as Illinois State Normal University, it was the state's first public university. Jesse Fell donated 60 acres of land, and the town of Normal grew around the campus. The university trained teachers during a critical period of educational expansion in Illinois. Old Main, the original building, served as classroom, dormitory, and administration building. The university played a crucial role in professionalizing teaching and establishing educational standards across the state. Today it's Illinois State University."
    },
    {
      title: "State Farm Insurance: From Startup to Fortune 500",
      originalDate: "1922-1950",
      category: "Business History",
      summary: "George J. Mecherle founded State Farm Mutual Automobile Insurance Company in 1922 in Bloomington, with the innovative idea of insuring only farmers who were safer drivers. Starting in a small office, State Farm revolutionized insurance by cutting out middlemen and offering lower rates directly to customers. The company grew rapidly during the automobile boom, moving to increasingly larger headquarters in Bloomington. By 1942, it was the nation's largest auto insurer. State Farm became Bloomington-Normal's dominant employer, shaping the community's growth and character."
    },
    {
      title: "The Underground Railroad in McLean County",
      originalDate: "1840-1865",
      category: "Civil Rights",
      summary: "McLean County was an active station on the Underground Railroad, with several homes serving as safe houses for freedom seekers. The Bloomington area's anti-slavery sentiment was strong, influenced by abolitionists like Jesse Fell and Owen Lovejoy. Local Quaker communities and others risked legal consequences to help enslaved people reach freedom in Canada. Some freedom seekers stayed in the area, contributing to Bloomington's early African American community. These activities occurred despite Illinois' own 'Black Laws' that restricted the rights of free Black residents."
    }
  ];

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

          {aiSummaries.length > 0 && (
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
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {aiSummaries.length > 0 ? 'Example Summaries' : 'Summaries'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {aiSummaries.length > 0 
                ? 'These are example summaries. Use the Search page to generate AI summaries of real articles!' 
                : 'Use the Search page and click "Summarize" on any article to generate AI summaries!'}
            </p>
            
            <div className="space-y-6">
              {exampleSummaries.map((summary, index) => (
                <SummaryCard key={index} {...summary} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summaries;
