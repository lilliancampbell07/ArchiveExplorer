import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Star } from "lucide-react";
import { useState } from "react";

interface SummaryCardProps {
  title: string;
  originalDate: string;
  category: string;
  summary: string;
  url?: string;
  onRatingChange?: (title: string, rating: number) => void;
  initialRating?: number;
}

const SummaryCard = ({ 
  title, 
  originalDate, 
  category, 
  summary, 
  url,
  onRatingChange,
  initialRating = 0
}: SummaryCardProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    if (onRatingChange) {
      onRatingChange(title, starValue);
    }
  };

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
        
        <div className="flex items-center justify-between gap-4 pt-2">
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
          
          {onRatingChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rate this summary:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-all hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;

