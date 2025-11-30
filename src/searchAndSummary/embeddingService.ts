import { pipeline } from '@xenova/transformers';

/**
 * Embedding Service using transformers.js
 * Model: Xenova/all-MiniLM-L6-v2 (same as your RAG.py)
 * Runs entirely in the browser - no backend needed!
 */

class EmbeddingService {
  private static instance: EmbeddingService;
  private embedder: any = null;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Initialize the embedding model (loads ~23MB, takes 5-10 seconds first time)
   */
  async initialize(): Promise<void> {
    if (this.embedder) return;
    if (this.isLoading) {
      await this.loadPromise;
      return;
    }

    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        console.log('🤖 Loading AI embedding model (Xenova/all-MiniLM-L6-v2)...');
        console.log('⏳ This takes ~5-10 seconds on first load...');
        
        // Load the same model as your RAG.py: all-MiniLM-L6-v2
        this.embedder = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2'
        );
        
        console.log('✅ AI model loaded successfully!');
        this.isLoading = false;
      } catch (error) {
        console.error('❌ Failed to load embedding model:', error);
        this.isLoading = false;
        throw error;
      }
    })();

    await this.loadPromise;
  }

  /**
   * Generate embedding vector for a text string
   * Returns 384-dimensional vector (same as Python version)
   */
  async embed(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    if (!this.embedder) {
      throw new Error('Embedding model not loaded');
    }

    try {
      // Generate embedding
      const output = await this.embedder(text, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert to regular array
      const embedding = Array.from(output.data) as number[];
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.embed(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }

  /**
   * Check if model is loaded
   */
  isReady(): boolean {
    return this.embedder !== null && !this.isLoading;
  }

  /**
   * Check if model is currently loading
   */
  isModelLoading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
export const embeddingService = EmbeddingService.getInstance();

/**
 * Convenience function to get embedding
 */
export async function getEmbedding(text: string): Promise<number[]> {
  return embeddingService.embed(text);
}

/**
 * Calculate cosine similarity between two vectors
 * Returns value between 0 (dissimilar) and 1 (identical)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
