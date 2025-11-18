/**
 * Data Ingestion Script
 * 
 * This script processes the crawler output and creates the articles.json file
 * 
 * Usage:
 * 1. Run your Python crawler to generate crawler_only_urls_new.json
 * 2. Manually visit a few URLs and fill in the template below
 * 3. Run: node scripts/createArticlesData.js
 * 
 * For automation, you could:
 * - Use Puppeteer/Playwright to fetch content from each URL
 * - Extract title, description, date from page HTML
 * - Generate tags based on content keywords
 */

const fs = require('fs');
const path = require('path');

// Sample template - replace with your actual data
const sampleArticles = [
  {
    id: 1,
    title: "Illinois State Normal University Founding Charter",
    url: "https://mchistory.org/research/articles/isnu-founding-charter",
    date: "February 18, 1857",
    type: "Official Records",
    description: "Legislative act establishing Illinois' first public university in Normal. Documents the vision to train teachers for Illinois schools and the selection of Jesse Fell's donated land for the campus.",
    tags: ["education", "illinois state university", "isnu", "normal", "jesse fell", "university", "teaching", "1857"],
    keywords: "Illinois State Normal University founding charter education teachers Jesse Fell campus legislation"
  },
  // Add more articles here...
];

/**
 * Reads crawler output and creates article entries
 * You'll need to manually add metadata for now
 */
function processUrls() {
  // Read crawler output
  const crawlerFile = 'crawler_only_urls_new.json';
  
  if (!fs.existsSync(crawlerFile)) {
    console.log('⚠️  crawler_only_urls_new.json not found');
    console.log('Run your Python crawler first, then come back here');
    return;
  }

  const urls = JSON.parse(fs.readFileSync(crawlerFile, 'utf-8'));
  console.log(`📝 Found ${urls.length} URLs from crawler`);

  // For a class project, you can manually populate article data
  // for the most important/representative articles
  const articles = sampleArticles;

  // Write to src/data/articles.json
  const outputPath = path.join(__dirname, '../src/data/articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
  
  console.log(`✅ Created ${outputPath} with ${articles.length} articles`);
  console.log('\n💡 To add more articles:');
  console.log('   1. Visit URLs from your crawler output');
  console.log('   2. Copy the article structure from articles.json');
  console.log('   3. Fill in: title, description, date, type, tags, keywords');
  console.log('   4. Add to the articles array');
}

/**
 * Helper function to generate tags from text
 */
function generateTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const words = text
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  // Get unique words and take the most relevant ones
  return [...new Set(words)].slice(0, 8);
}

/**
 * Helper to create a new article entry template
 */
function createArticleTemplate(url, id) {
  return {
    id: id,
    title: "REPLACE_WITH_ARTICLE_TITLE",
    url: url,
    date: "REPLACE_WITH_DATE", // Format: "Month Day, Year"
    type: "REPLACE_WITH_TYPE", // e.g., "Newspaper Article", "Official Records", etc.
    description: "REPLACE_WITH_DESCRIPTION",
    tags: ["tag1", "tag2", "tag3"],
    keywords: "REPLACE_WITH_SPACE_SEPARATED_KEYWORDS"
  };
}

// Run the script
if (require.main === module) {
  processUrls();
}

module.exports = { generateTags, createArticleTemplate };
