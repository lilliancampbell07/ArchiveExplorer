/**
 * AI Search Utilities
 * 
 * Purpose:
 *   Provides multiple search strategies for finding articles
 *   - AI semantic search: Understands meaning and context
 *   - Keyword search: Fast, traditional text matching
 * 
 * Tech Used:
 *   - transformers.js: Browser-based AI 
 *   - Cosine similarity: Measures how similar two pieces of text are
 *   - Vector embeddings: Converts text into numbers for comparison
 * line 12 & 13 were learned in class
 * 
 * How it works:
 *   1. User types a search query
 *   2. AI converts query into a vector (list of numbers)
 *   3. AI converts each article into a vector
 *   4. Compare vectors to find most similar articles
 *   5. Return results sorted by relevance
 */

import { getEmbedding, cosineSimilarity, embeddingService } from './embeddingService';

//Structure from articles.json
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

//Search result includes relevance scores
interface SearchResult extends Article {
  relevanceScore: number;      //0-100 score for sorting results
  similarityScore?: number;     //0-1 score showing how similar (AI)
}

/**
 * AI Semantic Search
 * 
 * What it does:
 *   -Uses AI to understand WHAT is being searched, not just matching words
 * 
 * Process (step-by-step):
 *   1. Convert query into a vector
 *   2. For each article, convert its text into a vector
 *   3. Compare vectors using cosine similarity
 *   4. Score results: higher score = more relevant
 *   5. Filter out low scores (< 10%) and sort by relevance
 * 
 * Why I chose this instead of keyword search:
 *   - Understands synonyms: "photo" matches "picture"
 *   - Understands context: "bank" (river) vs "bank" (money)
 *   - Finds related concepts even without exact word matches
 *   - Overall, it's more human for searching
 * 
 * Fallback:
 *   If the AI model fails to load, it uses keyword search as a failsafe
 */
export async function searchArticlesAI(
  query: string,
  articles: Article[]
): Promise<SearchResult[]> {
  // If no query, return all articles with 0 score
  if (!query.trim()) {
    return articles.map(article => ({ ...article, relevanceScore: 0 }));
  }

  try {
    //Convert query into a vector
    const queryEmbedding = await getEmbedding(query);

    //For each article, calculate similarity to the query
    const results = await Promise.all(
      articles.map(async (article) => {
        const articleText = `${article.title}. ${article.description}`; 
        //Convert article text into vector (same 384-number format)
        const articleEmbedding = await getEmbedding(articleText);  
        //Calculate similarity between query and article
        const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);
        const relevanceScore = similarity * 100;
        return {
          ...article,
          relevanceScore,
          similarityScore: similarity,
        };
      })
    );

    //Filter out weak matches (< 10%) and sort best matches first
    return results
      .filter(result => result.relevanceScore > 10)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    // If AI fails, fall back to traditional keyword search
    console.error('Error in AI search:', error);
    return searchArticlesKeyword(query, articles);
  }
}

/**
 * Traditional Keyword Search
 * 
 * What it does:
 *   Looks for exact word matches in article title, description, tags, etc.
 *   Fast and reliable, but doesn't understand meaning
 *   Based on a point system to rank relevance of results
 * 
 * How scoring works:
 *   Different parts of the article get different point values:
 *   - Title exact phrase: 100 points (most important)
 *   - Description exact phrase: 50 points
 *   - Individual words in title: 20 points each
 *   - Individual words in description: 10 points each
 *   - Tag matches: 15 points each
 *   - Keyword matches: 5 points each
 *   - Article type matches: 10 points
 * 
 * 
 * Why this wasn't my go-to choice:
 *   - Won't find "court house" if you search "courthouse"
 *   - Won't understand "Abe Lincoln" matches "Abraham Lincoln"
 *   - This is why AI search is better for complex queries
 */
export function searchArticlesKeyword(
  query: string,
  articles: Article[]
): SearchResult[] {
  //If no query, return all articles with 0 score
  if (!query.trim()) {
    return articles.map(article => ({ ...article, relevanceScore: 0 }));
  }

  //Prepare query for matching
  const queryLower = query.toLowerCase();
  //Split into words, filter out short words (like "a", "an", "to")
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  //Score each article
  const results = articles.map(article => {
    let score = 0;
  //Best match: Exact phrase in title
    if (article.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }
    //Second best: Exact phrase in description
    if (article.description.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    //Check each word individually in title
    queryWords.forEach(word => {
      if (article.title.toLowerCase().includes(word)) {
        score += 20;
      }
    });
    // Check each word in description
    queryWords.forEach(word => {
      if (article.description.toLowerCase().includes(word)) {
        score += 10;
      }
    });
    //Check if query words match article tags
    queryWords.forEach(word => {
      article.tags.forEach(tag => {
        if (tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase())) {
          score += 15;
        }
      });
    });
    //Check keywords field (less important than tags)
    queryWords.forEach(word => {
      if (article.keywords.toLowerCase().includes(word)) {
        score += 5;
      }
    });
    //Check article type (biography, article, etc.)
    if (article.type.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    return {
      ...article,
      relevanceScore: score
    };
  });
  //Remove articles with 0 score and sort by highest score first
  return results
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Check if AI Model is Ready
 * 
 * What it does:
 *   Returns true if the AI model is loaded and ready to use
 *   Returns false if still loading or failed to load
 * 
 * This is to:
 *   - Decide whether to use AI search or fall back to keyword search
 *   - Display "AI search ready" message to user if model loads
 */
export function isAIReady(): boolean {
  return embeddingService.isReady();
}

/**
 * Check if AI Model is Currently Loading
 * 
 * What it does:
 *   Returns true if the model is currently being downloaded
 *   Returns false if not loading (either ready or not started)
 * 
 * This is to:
 *   - Show "Loading AI model..." message
 *   - Display progress indicator
 *   - Prevent multiple load attempts
 */
export function isAILoading(): boolean {
  return embeddingService.isModelLoading();
}

/**
 * Pre-load the AI Model
 * 
 * What it does:
 *   Downloads and initializes the AI model
 * 
 * When to call this:
 *   - Anytime before first search (to avoid delay)
 * 
 * Model details:
 *   - Size: ~23 MB download
 *   - Speed: Generates embeddings in ~0.1-0.5 seconds
 *   - Cached: Browser stores it, so next visit is instant
 *   - We used this model in class 
 */
export async function preloadAIModel(): Promise<void> {
  await embeddingService.initialize();
}

/**
 * Format Search Results for Display
 * 
 * What it does:
 *   Converts internal search results to a cleaner format for UI components
 *   Renames fields to be more user-friendly
 * 
 * Changes made:
 *   - Keeps all important fields (title, date, type, url, scores)
 *   - Removes internal fields not needed for display
 * 
 * Use this before:
 *   - Passing results to DocumentCard component
 *   - Displaying results in search results page
 *   - Exporting results as JSON
 */
export function formatSearchResults(results: SearchResult[]) {
  return results.map(result => ({
    title: result.title,
    date: result.date,
    type: result.type,
    summary: result.description,        // Renamed from description
    url: result.url,
    relevanceScore: result.relevanceScore,
    similarityScore: result.similarityScore
  }));
}
