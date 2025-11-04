import Navigation from "@/components/Navigation";
import SummaryCard from "@/components/SummaryCard";

const Summaries = () => {
  const summaries = [
    {
      title: "1920s Downtown Development Plans",
      originalDate: "1923-1927",
      category: "Urban Planning",
      summary: "These documents detail the ambitious expansion of downtown during the post-WWI boom. City planners proposed widening Main Street, adding electric streetlights, and constructing several new commercial buildings. The plans show careful attention to preserving historic facades while modernizing infrastructure. This development laid the groundwork for the downtown we know today."
    },
    {
      title: "Women's Suffrage Movement Letters",
      originalDate: "1918-1920",
      category: "Social History",
      summary: "A collection of correspondence between local suffragettes and state organizers. These letters reveal the grassroots organizing efforts, including door-to-door campaigns, public speaking events, and coordination with national groups. The writers express both frustration with opposition and hope for change. Their efforts contributed to the state's early ratification of the 19th Amendment."
    },
    {
      title: "Great Depression Era Relief Programs",
      originalDate: "1932-1938",
      category: "Economic History",
      summary: "Documentation of New Deal programs implemented locally, including the Works Progress Administration projects. Records show the construction of public buildings, parks, and roads that employed hundreds of residents. Personal testimonies describe the impact of these programs on families struggling through economic hardship. Many of these WPA projects remain important community landmarks."
    },
    {
      title: "School Integration Documents",
      originalDate: "1954-1965",
      category: "Civil Rights",
      summary: "School board minutes, community correspondence, and newspaper clippings documenting the local response to desegregation mandates. Materials show both resistance and support from community members, revealing the complex social dynamics of this transformative period. Student and teacher accounts provide personal perspectives on this significant historical transition."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-foreground">Document Summaries</h1>
            <p className="text-lg text-muted-foreground">
              AI-generated plain-language explanations of complex historical materials
            </p>
          </div>

          <div className="space-y-6">
            {summaries.map((summary, index) => (
              <SummaryCard key={index} {...summary} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summaries;
