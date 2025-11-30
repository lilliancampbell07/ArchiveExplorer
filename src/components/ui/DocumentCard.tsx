import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

interface DocumentCardProps {
  title: string;
  date: string;
  summary: string;
  type: string;
  url?: string;
  onSummarize?: (title: string, summary: string) => void;
  canSummarize?: boolean;
  isSummarizing?: boolean;
}

const DocumentCard = ({ 
  title, 
  date, 
  summary, 
  type, 
  url,
  onSummarize,
  canSummarize = false,
  isSummarizing = false
}: DocumentCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {date} • {type}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{summary}</p>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="gap-2"
            onClick={() => url && window.open(url, '_blank')}
          >
            View Document
            <ExternalLink className="h-4 w-4" />
          </Button>
          {canSummarize && onSummarize && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => onSummarize(title, summary)}
              disabled={isSummarizing}
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Summarize
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;

