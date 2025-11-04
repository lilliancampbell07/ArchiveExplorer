import { Button } from "@/components/ui/button";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

const ExternalLink = () => {
  return (
    <div className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-lg">
      <h3 className="text-xl font-semibold text-foreground mb-3">
        Visit Pages of the Past Archives
      </h3>
      <p className="text-muted-foreground mb-4">
        Access the complete McLean County Historical Society digital archives with articles, photographs, and historical documents about Bloomington-Normal history.
      </p>
      <Button 
        variant="default" 
        className="gap-2"
        onClick={() => window.open('https://mchistory.org/research/articles', '_blank')}
      >
        Open Pages of the Past
        <ExternalLinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ExternalLink;
