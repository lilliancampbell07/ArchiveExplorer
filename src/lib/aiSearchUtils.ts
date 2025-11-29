import { embeddingService, cosineSimilarity } from './embeddingService';

interface Article {
  id: number;
  title: string;
  url: string;
  date: string;
  type: string;
  description: string;
  tags: string[];
  keywords: string;
  embedding?: number[];
}

interface SearchResult extends Article {
  relevanceScore: number;
  similarityScore?: number;
}

/**
 * AI-Powered Semantic Search using embeddings
 * Model: all-MiniLM-L6-v2
 */
export async function searchArticlesAI(
  query: string,
  articles: Article[]
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return articles.map(article => ({ ...article, relevanceScore: 0 }));
  }

  try {
    // Ensure model is loaded
    if (!embeddingService.isReady()) {
      console.log('🤖 Initializing AI model...');
      await embeddingService.initialize();
    }

    // Generate query embedding
    console.log('🔍 Generating query embedding...');
    const queryEmbedding = await embeddingService.embed(query);

    // Calculate similarity scores for each article
    const results = await Promise.all(
      articles.map(async (article) => {
        let similarityScore = 0;

        // Generate article embedding if not exists
        if (!article.embedding) {
          // Combine title and description for embedding
          const articleText = `${article.title}. ${article.description}`;
          article.embedding = await embeddingService.embed(articleText);
        }

        // Calculate cosine similarity
        similarityScore = cosineSimilarity(queryEmbedding, article.embedding);

        // Convert similarity (0-1) to relevance score (0-100)
        const relevanceScore = Math.round(similarityScore * 100);

        return {
          ...article,
          relevanceScore,
          similarityScore,
        };
      })
    );

    // Filter and sort by relevance
    return results
      .filter(result => result.relevanceScore > 10) // Filter very low scores
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error in AI search:', error);
    // Fallback to keyword search
    return searchArticlesKeyword(query, articles);
  }
}

/**
 * Fallback keyword search (your original implementation)
 */
export function searchArticlesKeyword(
  query: string,
  articles: Article[]
): SearchResult[] {
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
 * Hybrid search: Combines AI semantic search with keyword matching
 * Best of both worlds!
 */
export async function searchArticlesHybrid(
  query: string,
  articles: Article[]
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return articles.map(article => ({ ...article, relevanceScore: 0 }));
  }

  try {
    // Get both AI and keyword results
    const [aiResults, keywordResults] = await Promise.all([
      searchArticlesAI(query, articles),
      Promise.resolve(searchArticlesKeyword(query, articles))
    ]);

    // Combine scores (70% AI, 30% keyword)
    const combinedMap = new Map<number, SearchResult>();

    aiResults.forEach(result => {
      combinedMap.set(result.id, {
        ...result,
        relevanceScore: result.relevanceScore * 0.7
      });
    });

    keywordResults.forEach(result => {
      const existing = combinedMap.get(result.id);
      if (existing) {
        existing.relevanceScore += result.relevanceScore * 0.3;
      } else {
        combinedMap.set(result.id, {
          ...result,
          relevanceScore: result.relevanceScore * 0.3
        });
      }
    });

    // Convert to array and sort
    return Array.from(combinedMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Error in hybrid search:', error);
    return searchArticlesKeyword(query, articles);
  }
}

/**
 * Check if AI model is ready
 */
export function isAIReady(): boolean {
  return embeddingService.isReady();
}

/**
 * Check if AI model is loading
 */
export function isAILoading(): boolean {
  return embeddingService.isModelLoading();
}

/**
 * Pre-load the AI model (call this on app start)
 */
export async function preloadAIModel(): Promise<void> {
  try {
    await embeddingService.initialize();
    console.log('✅ AI model pre-loaded successfully');
  } catch (error) {
    console.error('❌ Failed to pre-load AI model:', error);
  }
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: SearchResult[]) {
  return results.map(result => ({
    title: result.title,
    date: result.date,
    type: result.type,
    summary: result.description,
    url: result.url,
    relevanceScore: result.relevanceScore,
    similarityScore: result.similarityScore
  }));
}
