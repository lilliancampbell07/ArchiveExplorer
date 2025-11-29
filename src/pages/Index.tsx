import { useNavigate } from "react-router-dom";
import Navigation from "@/components/ui/Navigation";
import SearchBar from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Sparkles, Mail } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate("/search");
  };

  const features = [
    {
      icon: Search,
      title: "Natural Language Search",
      description: "Ask questions in plain English and find relevant historical documents instantly"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Summaries",
      description: "Complex archival materials translated into clear, accessible language"
    },
    {
      icon: Mail,
      title: "Expert Assistance",
      description: "Connect with professional archivists for personalized research support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
                  Bloomington-Normal History
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90">
                  Discover McLean County's past through the Pages of the Past archives - from the founding of Illinois State University to the growth of State Farm Insurance
                </p>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-lg">
                <SearchBar onSearch={handleSearch} placeholder="Try: 'History of Illinois State University' or 'Beer Nuts factory'" size="large" />
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate("/search")}>
                  <Search className="mr-2 h-5 w-5" />
                  Start Searching
                </Button>
                <Button size="lg" variant="outline" className="bg-primary-foreground" onClick={() => navigate("/summaries")}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Summaries
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                Explore Bloomington-Normal's Rich Heritage
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="transition-all hover:shadow-lg">
                      <CardHeader className="text-center">
                        <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Need Help with Your Research?
              </h2>
              <p className="text-lg text-muted-foreground">
                The McLean County Historical Society archivists are ready to help you explore Bloomington-Normal's history
              </p>
              <Button size="lg" onClick={() => navigate("/contact")}>
                <Mail className="mr-2 h-5 w-5" />
                Contact an Archivist
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
