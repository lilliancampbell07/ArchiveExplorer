/**
 * AI Summarization Service
 * Uses transformers.js to generate article summaries
 * Model: Xenova/distilbart-cnn-6-6 (optimized for summarization)
 */

import { pipeline, env } from '@xenova/transformers';

// Configure to use cached models
env.allowLocalModels = false;

class SummarizationService {
  private static instance: SummarizationService;
  private summarizer: any = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SummarizationService {
    if (!SummarizationService.instance) {
      SummarizationService.instance = new SummarizationService();
    }
    return SummarizationService.instance;
  }

  async initialize(onProgress?: (progress: any) => void): Promise<void> {
    if (this.summarizer) return; // Already initialized
    if (this.isInitializing && this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        console.log('Loading summarization model...');
        
        // Use a lightweight summarization model
        this.summarizer = await pipeline(
          'summarization',
          'Xenova/distilbart-cnn-6-6',
          { progress_callback: onProgress }
        );
        
        console.log('✅ Summarization model loaded successfully');
      } catch (error) {
        console.error('Failed to load summarization model:', error);
        this.summarizer = null;
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Generate a summary of the given text
   * @param text - The text to summarize
   * @param maxLength - Maximum length of summary (default: 150)
   * @param minLength - Minimum length of summary (default: 50)
   * @returns Summary text
   */
  async summarize(
    text: string,
    maxLength: number = 150,
    minLength: number = 50
  ): Promise<string> {
    if (!this.summarizer) {
      await this.initialize();
    }

    try {
      // Clean and truncate text if too long (models have token limits)
      const cleanedText = text
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // Limit input to ~2000 chars

      const result = await this.summarizer(cleanedText, {
        max_length: maxLength,
        min_length: minLength,
        do_sample: false,
      });

      return result[0].summary_text;
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback to extractive summary (first few sentences)
      return this.extractiveSummary(text, maxLength);
    }
  }

  /**
   * Fallback extractive summarization
   * Simply takes the first few sentences
   */
  private extractiveSummary(text: string, targetLength: number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length > targetLength) break;
      summary += sentence;
    }
    
    return summary.trim() || text.substring(0, targetLength) + '...';
  }

  isLoaded(): boolean {
    return this.summarizer !== null;
  }
}

// Export singleton instance
export const summarizationService = SummarizationService.getInstance();

/**
 * Preload the summarization model
 */
export async function preloadSummarizationModel(
  onProgress?: (progress: any) => void
): Promise<void> {
  await summarizationService.initialize(onProgress);
}

/**
 * Generate a summary for an article
 */
export async function generateArticleSummary(
  articleContent: string,
  maxLength?: number
): Promise<string> {
  return await summarizationService.summarize(articleContent, maxLength);
}

/**
 * Check if summarization model is ready
 */
export function isSummarizationReady(): boolean {
  return summarizationService.isLoaded();
}
