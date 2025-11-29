/**
 * Automated Article Extraction
 * 
 * Purpose:
 *   To automate the extraction of article data from the MCHM website. 
 *   Compiles data into a JSON file for the search interface.
 * 
 * Tech used:
 *   - Puppeteer: automated page visiting
 *   - Node.js fs: for reading/writing JSON
 * 
 * Process Flow:
 *   1. Read URLs from python crawler output (crawler_with_found_links_new_.json)
 *   2. Filter to only actual article pages (exclude topics, etc.)
 *   3. Launch headless Chrome browser
 *   4. Visit each URL sequentially
 *   5. Execute JavaScript in page context to extract 
 *   6. Parse and clean the extracted data
 *   7. Generate tags and keywords from content
 *   8. Save all articles to articles.json
 *
 * What to run: 
 *   npm install puppeteer
 *   node scripts/extractArticles.js
 * 
 * Output:
 *   Creates/overwrites src/data/articles.json with structured article data
 *

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM (ES Module) compatibility: Convert import.meta.url to __dirname
// This allows us to use __dirname like in CommonJS modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration Constants
// ============================================================================

// Input file: JSON output from the Python crawler containing all discovered URLs
// Expected format: { "url1": ["linked_url1", "linked_url2"], ... }
const CRAWLER_OUTPUT = path.join(__dirname, 'crawler_with_found_links_new_.json');

// Output file: Where the final articles.json will be saved
// This file is imported by the React app to populate the search interface
const OUTPUT_FILE = path.join(__dirname, '../src/data/articles.json');

// Delay between page requests in milliseconds
// Being "polite" to the server - avoid overwhelming it with rapid requests
// 2000ms = 2 seconds between each article extraction
const DELAY_BETWEEN_REQUESTS = 2000;

// Maximum number of articles to process
// Useful for testing (set lower) or limiting to recent articles
// The mchistory.org site has approximately 155 total articles
const MAX_ARTICLES = 155;


 * Extract structured article data from a single webpage
 * 
 * This function uses Puppeteer to visit a URL and extract article metadata
 * by querying the DOM (Document Object Model). It tries multiple CSS selectors
 * to handle different page layouts and structures.
 * 
 * @param {Page} page - Puppeteer Page object (headless browser tab)
 * @param {string} url - The full URL of the article to extract
 * @param {number} id - Sequential ID number for this article
 * @returns {Object|null} Article object with all fields, or null if extraction fails
 * 
 * Process:
 *   1. Navigate to the URL and wait for network to be idle
 *   2. Execute JavaScript in the browser context (page.evaluate)
 *   3. Query DOM for title, date, content, and type using CSS selectors
 *   4. Return extracted data back to Node.js context
 *   5. Clean and process the extracted text
 *   6. Generate tags and keywords from content
 *   7. Return structured article object

async function extractArticleData(page, url, id) {
  try {
    // Navigate to the article page
    // waitUntil: 'networkidle2' means wait until network is mostly idle
    // (max 2 connections for at least 500ms)
    // timeout: 30000ms = 30 seconds before giving up
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Execute JavaScript in the browser context to extract DOM elements
    // page.evaluate() runs code in the browser and returns the result
    const data = await page.evaluate(() => {
      // Try multiple CSS selectors to find the article title
      // Uses optional chaining (?.) and nullish coalescing (||) for fallbacks
      // Priority order: h1 → .article-title → .entry-title → document title
      const title = 
        document.querySelector('h1')?.innerText ||
        document.querySelector('.article-title')?.innerText ||
        document.querySelector('.entry-title')?.innerText ||
        document.title;
      
      // Try multiple selectors to find the publication date
      // HTML5 <time> tags are preferred, then common class names
      // Falls back to empty string if no date found
      const dateElement = 
        document.querySelector('time')?.innerText ||
        document.querySelector('.date')?.innerText ||
        document.querySelector('.published')?.innerText ||
        document.querySelector('[datetime]')?.getAttribute('datetime') ||
        '';
      
      // Extract the main article content text
      // innerText preserves line breaks and excludes hidden elements
      // Priority: <article> tag → .content class → .entry-content → <main> tag
      const contentElement = 
        document.querySelector('article')?.innerText ||
        document.querySelector('.content')?.innerText ||
        document.querySelector('.entry-content')?.innerText ||
        document.querySelector('main')?.innerText ||
        '';
      
      // Try to find the article category or type (e.g., "Newspaper Article", "Official Records")
      // Falls back to generic "Article" if no category found
      const type = 
        document.querySelector('.category')?.innerText ||
        document.querySelector('.type')?.innerText ||
        'Article';
      
      // Return data object back to Node.js context
      return { title, date: dateElement, content: contentElement, type };
    });
    
    // ========================================================================
    // Text Cleaning and Processing
    // ========================================================================
    
    // Clean up whitespace in the extracted content
    // Replace multiple spaces, newlines, tabs with a single space
    // Then trim leading/trailing whitespace
    const fullContent = data.content
      .replace(/\s+/g, ' ')  // Collapse all whitespace to single spaces
      .trim();                // Remove leading/trailing whitespace
    
    // Generate a preview description from the first 200 characters
    // This is displayed in search results before the user clicks
    // The "..." indicates there's more content
    const description = fullContent.substring(0, 200) + '...';
    
    // Generate searchable tags by extracting important words
    // Combines title and content for better keyword extraction
    const tags = generateTags(data.title + ' ' + fullContent);
    
    // Generate space-separated keywords string for search indexing
    // Used by the semantic search algorithm
    const keywords = generateKeywords(data.title + ' ' + fullContent);
    
    // Return the complete article object with all metadata
    return {
      id,                                      // Sequential number
      title: data.title.trim(),                 // Clean article title
      url,                                      // Original URL
      date: data.date.trim() || 'Unknown',     // Publication date (or "Unknown")
      type: data.type.trim() || 'Article',     // Category/type
      description: description,                 // Short preview (200 chars)
      content: fullContent,                     // Full article text for summarization
      tags,                                     // Array of relevant keywords
      keywords                                  // Space-separated keywords string
    };
  } catch (error) {
    // Log any errors that occur during extraction
    // Returns null so the main loop can continue with other articles
    console.error(`❌ Error extracting ${url}:`, error.message);
    return null;
  }
}

/**
 * Generate searchable tags from article text
 * 
 * This function implements a simple keyword extraction algorithm:
 * 1. Convert text to lowercase for case-insensitive matching
 * 2. Remove punctuation (keep only words, spaces, and hyphens)
 * 3. Split into individual words
 * 4. Filter out common English stop words ("the", "and", etc.)
 * 5. Filter out very short words (3 chars or less)
 * 6. Remove duplicates
 * 7. Return the first 8 most relevant unique words
 * 
 * @param {string} text - Combined title and content text to analyze
 * @returns {string[]} Array of up to 8 relevant tag words
 * 
 * Example:
 *   Input: "The Illinois State University was founded in 1857"
 *   Output: ["illinois", "state", "university", "founded", "1857"]
 
function generateTags(text) {
  // Stop words: Common English words that don't add semantic value
  // These are filtered out because they appear frequently but aren't useful
  // for search/categorization (articles, prepositions, pronouns, etc.)
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'it', 'its', 'his', 'her', 'their'
  ]);
  
  // Text processing pipeline:
  const words = text.toLowerCase()              // Case-insensitive
    .replace(/[^\w\s-]/g, ' ')                 // Remove punctuation (keep hyphens)
    .split(/\s+/)                               // Split on whitespace
    .filter(word => 
      word.length > 3 &&                        // Minimum 4 characters
      !commonWords.has(word)                    // Not a stop word
    );
  
  // Remove duplicate words (Set automatically deduplicates)
  // Convert back to array with spread operator
  const uniqueWords = [...new Set(words)];
  
  // Return the first 8 unique words as tags
  // These become searchable tags in the UI
  return uniqueWords.slice(0, 8);
}


 * Generate space-separated keywords string from text
 * 
 * This is a convenience wrapper around generateTags() that returns
 * a space-separated string instead of an array. The keywords string is
 * used by the semantic search embedding system for text analysis.
 * 
 * @param {string} text - Combined title and content to extract keywords from
 * @returns {string} Space-separated keywords (e.g., "illinois state university founded 1857")

function generateKeywords(text) {
  // Generate tag array
  const tags = generateTags(text);
  
  // Join array into space-separated string
  // Example: ["illinois", "state", "university"] → "illinois state university"
  return tags.join(' ');
}

/**
 * Main extraction orchestration function
 * 
 * This is the entry point that coordinates the entire extraction process:
 * 1. Validate that crawler output exists
 * 2. Load and parse the crawler's JSON output
 * 3. Filter URLs to only include actual article pages
 * 4. Launch Puppeteer headless browser
 * 5. Loop through URLs and extract each article
 * 6. Implement polite delays between requests
 * 7. Compile results and save to articles.json
 * 8. Print extraction statistics
 * 
 * @returns {Promise<void>} Resolves when extraction is complete
 
async function extractAllArticles() {
  // ========================================================================
  // Step 1: Validate Prerequisites
  // ========================================================================
  
  // Check if the crawler has been run and produced output
  // This file should exist after running: python src/components/crawler.py
  if (!fs.existsSync(CRAWLER_OUTPUT)) {
    console.error(`❌ Crawler output not found: ${CRAWLER_OUTPUT}`);
    console.log('Please run your crawler first: python src/components/backend/crawler.py');
    return;
  }
  
  // ========================================================================
  // Step 2: Load Crawler Output
  // ========================================================================
  
  // Read and parse the JSON file containing all discovered URLs
  // Format: { "url1": ["linked_url1", "linked_url2"], "url2": [...], ... }
  const crawlerData = JSON.parse(fs.readFileSync(CRAWLER_OUTPUT, 'utf-8'));
  
  // ========================================================================
  // Step 3: Extract and Filter Article URLs
  // ========================================================================
  
  // Use a Set to automatically deduplicate URLs (crawler may find same URL multiple times)
  const allUrls = new Set();
  
  // Iterate through the crawler output structure
  // Each key is a page URL, each value is an array of links found on that page
  for (const [key, urls] of Object.entries(crawlerData)) {
    urls.forEach(url => {
      // Filter logic: Only include actual article pages
      // Include: URLs containing '/research/articles/' and specific article paths
      // Exclude: Topics pages, main articles index, anchor links (#)
      if (url.includes('/research/articles/') &&   // Must be in articles section
          !url.includes('/topics') &&               // Exclude topic listing pages
          !url.endsWith('/articles') &&             // Exclude main index page
          !url.includes('#')) {                     // Exclude anchor/fragment links
        allUrls.add(url);  // Set automatically prevents duplicates
      }
    });
  }
  
  // Convert Set to Array and limit to MAX_ARTICLES
  // This allows processing a subset for testing or time constraints
  const urlsToProcess = Array.from(allUrls).slice(0, MAX_ARTICLES);
  
  // Print extraction plan summary
  console.log(`📋 Found ${allUrls.size} total article URLs`);
  console.log(`📝 Processing first ${urlsToProcess.length} articles`);
  
  // Calculate estimated time based on delay between requests
  // Formula: (number of articles × delay in ms) / 1000 / 60 = minutes
  console.log(`⏱️  Estimated time: ~${Math.round(urlsToProcess.length * DELAY_BETWEEN_REQUESTS / 1000 / 60)} minutes\n`);
  
  // ========================================================================
  // Step 4: Launch Headless Browser
  // ========================================================================
  
  console.log('🚀 Launching browser...');
  
  // Launch Chromium in headless mode (no GUI)
  // headless: true = runs in background without opening windows
  // --no-sandbox = needed for some server environments (Docker, etc.)
  // --disable-setuid-sandbox = additional compatibility flag
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create a new browser tab/page to use for all requests
  // Reusing one page is more efficient than opening/closing tabs
  const page = await browser.newPage();
  
  // Set a custom User-Agent string to identify our bot
  // This is polite and helps site administrators understand the traffic
  // Some sites may block or throttle requests without a user agent
  await page.setUserAgent('Mozilla/5.0 (Educational Research Bot) - MCHS Article Archiver');
  
  // ========================================================================
  // Step 5: Process Each URL Sequentially
  // ========================================================================
  
  // Array to store all successfully extracted articles
  const articles = [];
  
  // Track success/failure counts for final report
  let successCount = 0;
  let errorCount = 0;
  
  // Loop through each URL and extract its data
  // Sequential processing (not parallel) to be respectful to the server
  for (let i = 0; i < urlsToProcess.length; i++) {
    let url = urlsToProcess[i];
    
    // Handle relative URLs by converting to absolute URLs
    // If URL doesn't start with 'http', prepend the domain
    if (!url.startsWith('http')) {
      url = `https://mchistory.org${url}`;
    }
    
    // Print progress indicator: [current/total] URL
    console.log(`\n[${i + 1}/${urlsToProcess.length}] Processing: ${url}`);
    
    // Extract article data (this navigates to the page and scrapes content)
    // Returns article object or null if extraction failed
    const article = await extractArticleData(page, url, i + 1);
    
    // Check if extraction was successful
    if (article) {
      articles.push(article);  // Add to results array
      successCount++;
      console.log(`✅ Extracted: ${article.title}`);
    } else {
      errorCount++;  // Count failures but continue processing
    }
    
    // ====================================================================
    // Polite Crawling: Delay Between Requests
    // ====================================================================
    // Wait before the next request (except after the last one)
    // This prevents overwhelming the server with rapid requests
    // It's good web citizenship and avoids being blocked
    if (i < urlsToProcess.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
  
  // Close the browser to free up system resources
  await browser.close();
  
  // ========================================================================
  // Step 6: Save Results to JSON File
  // ========================================================================
  
  // Write the articles array to disk as formatted JSON
  // JSON.stringify params:
  //   - articles: the data to serialize
  //   - null: replacer function (not needed)
  //   - 2: indent with 2 spaces for human readability
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
  
  // ========================================================================
  // Step 7: Print Final Statistics
  // ========================================================================
  
  console.log('\n' + '='.repeat(60));
  console.log('Extraction Summary:');
  console.log('='.repeat(60));
  console.log(`Successfully extracted: ${successCount} articles`);
  console.log(`Failed extractions: ${errorCount}`);
  console.log(`Output file: ${OUTPUT_FILE}`);
  console.log(`Total records: ${articles.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ Done! Your articles.json is ready to use!');
  console.log('The React app will now be able to search through these articles.\n');
}

// ============================================================================
// Script Entry Point
// ============================================================================

// Execute the main function and catch any unhandled errors
// This ensures errors are logged to console instead of silent failures
extractAllArticles().catch(console.error);
