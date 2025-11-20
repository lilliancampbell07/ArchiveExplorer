import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink } from "lucide-react";

interface SummaryCardProps {
  title: string;
  originalDate: string;
  category: string;
  summary: string;
  url?: string;
}

const SummaryCard = ({ title, originalDate, category, summary, url }: SummaryCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="text-xl flex-1">{title}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Summary
          </Badge>
        </div>
        <CardDescription>
          {originalDate} • {category}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{summary}</p>
        {url && (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.open(url, '_blank')}
          >
            View Original Document
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
