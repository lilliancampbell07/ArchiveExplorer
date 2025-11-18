/**
 * Automated Article Extractor
 * 
 * This script uses Puppeteer to automatically:
 * 1. Read URLs from crawler output
 * 2. Visit each page
 * 3. Extract title, date, content
 * 4. Generate articles.json
 * 
 * Installation:
 * npm install puppeteer
 * 
 * Usage:
 * node scripts/extractArticles.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CRAWLER_OUTPUT = 'crawler_only_urls_new.json';
const OUTPUT_FILE = path.join(__dirname, '../src/data/articles.json');
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds - be respectful!

/**
 * Extract article data from a page
 */
async function extractArticleData(page, url, id) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract data using common HTML patterns
    // Adjust these selectors based on mchistory.org's actual structure
    const data = await page.evaluate(() => {
      // Try to find title
      const title = 
        document.querySelector('h1')?.innerText ||
        document.querySelector('.article-title')?.innerText ||
        document.querySelector('.entry-title')?.innerText ||
        document.title;
      
      // Try to find date
      const dateElement = 
        document.querySelector('time')?.innerText ||
        document.querySelector('.date')?.innerText ||
        document.querySelector('.published')?.innerText ||
        document.querySelector('[datetime]')?.getAttribute('datetime') ||
        '';
      
      // Try to find main content
      const contentElement = 
        document.querySelector('article')?.innerText ||
        document.querySelector('.content')?.innerText ||
        document.querySelector('.entry-content')?.innerText ||
        document.querySelector('main')?.innerText ||
        '';
      
      // Try to find article type/category
      const type = 
        document.querySelector('.category')?.innerText ||
        document.querySelector('.type')?.innerText ||
        'Article';
      
      return { title, date: dateElement, content: contentElement, type };
    });
    
    // Generate description (first 200 chars of content)
    const description = data.content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200) + '...';
    
    // Generate tags from title and content
    const tags = generateTags(data.title + ' ' + description);
    
    // Generate keywords
    const keywords = generateKeywords(data.title + ' ' + description);
    
    return {
      id,
      title: data.title.trim(),
      url,
      date: data.date.trim() || 'Unknown',
      type: data.type.trim() || 'Article',
      description: description,
      tags,
      keywords
    };
  } catch (error) {
    console.error(`❌ Error extracting ${url}:`, error.message);
    return null;
  }
}

/**
 * Generate tags from text
 */
function generateTags(text) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'it', 'its', 'his', 'her', 'their'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Get unique words and take top 8
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 8);
}

/**
 * Generate keywords string
 */
function generateKeywords(text) {
  const tags = generateTags(text);
  return tags.join(' ');
}

/**
 * Main extraction function
 */
async function extractAllArticles() {
  // Check if crawler output exists
  if (!fs.existsSync(CRAWLER_OUTPUT)) {
    console.error(`❌ Crawler output not found: ${CRAWLER_OUTPUT}`);
    console.log('Please run your crawler first: python src/components/backend/crawler.py');
    return;
  }
  
  // Read URLs from crawler
  const urls = JSON.parse(fs.readFileSync(CRAWLER_OUTPUT, 'utf-8'));
  console.log(`📋 Found ${urls.length} URLs to process`);
  
  // Launch browser
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set a user agent to be polite
  await page.setUserAgent('Mozilla/5.0 (Educational Research Bot) - MCHS Article Archiver');
  
  const articles = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process each URL
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    // Skip if not a full URL
    if (!url.startsWith('http')) {
      url = `https://mchistory.org${url}`;
    }
    
    console.log(`\n[${i + 1}/${urls.length}] Processing: ${url}`);
    
    const article = await extractArticleData(page, url, i + 1);
    
    if (article) {
      articles.push(article);
      successCount++;
      console.log(`✅ Extracted: ${article.title}`);
    } else {
      errorCount++;
    }
    
    // Be respectful - wait between requests
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
  
  await browser.close();
  
  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
  
  console.log('\n📊 Extraction Summary:');
  console.log(`✅ Successfully extracted: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  console.log('\n🎉 Done! Your articles.json is ready to use!');
}

// Run if called directly
if (require.main === module) {
  extractAllArticles().catch(console.error);
}

module.exports = { extractAllArticles };
