interface Article {
  id: number;
  title: string;
  url: string;
  date: string;
  type: string;
  description: string;
  tags: string[];
  keywords: string;
}

interface SearchResult extends Article {
  relevanceScore: number;
}

/**
 * Performs a simple keyword-based search on articles
 * Returns articles sorted by relevance score
 */
export function searchArticles(query: string, articles: Article[]): SearchResult[] {
  if (!query.trim()) {
    return articles.map(article => ({ ...article, relevanceScore: 0 }));
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

  const results = articles.map(article => {
    let score = 0;

    // Exact phrase match in title (highest weight)
    if (article.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Exact phrase match in description
    if (article.description.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Individual word matches in title
    queryWords.forEach(word => {
      if (article.title.toLowerCase().includes(word)) {
        score += 20;
      }
    });

    // Individual word matches in description
    queryWords.forEach(word => {
      if (article.description.toLowerCase().includes(word)) {
        score += 10;
      }
    });

    // Tag matches
    queryWords.forEach(word => {
      article.tags.forEach(tag => {
        if (tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase())) {
          score += 15;
        }
      });
    });

    // Keywords match
    queryWords.forEach(word => {
      if (article.keywords.toLowerCase().includes(word)) {
        score += 5;
      }
    });

    // Type match
    if (article.type.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    return {
      ...article,
      relevanceScore: score
    };
  });

  // Filter out articles with score 0 and sort by relevance
  return results
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Extracts key entities from a natural language question
 * Examples: "When was Illinois State University founded?" -> ["Illinois State University", "founded"]
 */
export function extractKeywords(query: string): string[] {
  // Remove common question words
  const stopWords = ['when', 'where', 'what', 'who', 'why', 'how', 'was', 'were', 'is', 'are', 'the', 'a', 'an', 'did', 'does', 'do'];
  
  const words = query.toLowerCase().split(/\s+/);
  const filtered = words.filter(word => 
    word.length > 2 && !stopWords.includes(word) && !/[?.,!]/.test(word)
  );

  return filtered;
}

/**
 * Formats search results for display
 */
export function formatSearchResults(results: SearchResult[]) {
  return results.map(result => ({
    title: result.title,
    date: result.date,
    type: result.type,
    summary: result.description,
    url: result.url,
    relevanceScore: result.relevanceScore
  }));
}
