# Simple RAG Search System - Documentation

## Overview
A lightweight, client-side search system for historical articles. No backend required - perfect for Lovable free tier hosting.

## How It Works

1. **Articles Data** (`src/data/articles.json`)
   - Static JSON file containing article metadata
   - Each article has: title, URL, description, tags, keywords, date, type
   
2. **Search Algorithm** (`src/lib/searchUtils.ts`)
   - Keyword matching with relevance scoring
   - Scores based on: title matches (highest), description matches, tags, type
   - Returns results sorted by relevance
   
3. **Search Interface** (`src/pages/Search.tsx`)
   - Users enter natural language questions
   - System extracts keywords and searches articles
   - Displays ranked results with relevance scores

## Setup Instructions

### Step 1: Collect Article URLs
Run your Python crawler:
```bash
python src/components/backend/crawler.py
```
This generates: `crawler_only_urls_new.json`

### Step 2: Populate Article Data

**Option A: Manual (Recommended for class project)**
1. Open `src/data/articles.json`
2. For each important article from your crawler:
   - Visit the URL
   - Copy the template structure
   - Fill in: title, description, date, type, tags, keywords
3. Save the file

**Option B: Semi-automated**
```bash
node scripts/createArticlesData.js
```
This creates templates you can fill in manually.

### Article Structure
```json
{
  "id": 1,
  "title": "Article Title",
  "url": "https://mchistory.org/research/articles/...",
  "date": "Month Day, Year",
  "type": "Newspaper Article | Official Records | Business Records | Historical Site",
  "description": "Brief summary of the article content",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "keywords": "space separated keywords for search"
}
```

### Step 3: Test the Search

1. Start your dev server (if using Lovable, it auto-starts)
2. Navigate to the Search page
3. Try queries like:
   - "When was Illinois State University founded?"
   - "State Farm Insurance"
   - "David Davis mansion"
   - "Beer Nuts factory"

## Search Algorithm Details

### Relevance Scoring:
- **Exact phrase in title**: +100 points
- **Exact phrase in description**: +50 points
- **Individual word in title**: +20 points per word
- **Tag match**: +15 points per tag
- **Individual word in description**: +10 points per word
- **Type match**: +10 points
- **Keyword match**: +5 points per word

Results are filtered (score > 0) and sorted by score descending.

## For Your Class Project

### What to Include:
1. ✅ Working search interface
2. ✅ Natural language question handling
3. ✅ Relevance-ranked results
4. ✅ Article metadata (title, date, type, description)
5. ✅ Links to original sources

### Recommended: Populate 10-20 Articles
Focus on diverse topics:
- Education (Illinois State University)
- Business (State Farm, Beer Nuts)
- Historical figures (David Davis, Abraham Lincoln connections)
- Local landmarks
- Major events

### Demo Queries:
```
"When was Illinois State University founded?"
"State Farm Insurance history"
"Abraham Lincoln Bloomington"
"David Davis mansion"
"Beer Nuts factory"
"Historic landmarks"
"1850s Normal Illinois"
```

## Extending the System (Optional)

### Add More Articles:
Just append to `src/data/articles.json`

### Improve Search:
- Edit `src/lib/searchUtils.ts`
- Adjust scoring weights
- Add fuzzy matching
- Add date range filtering

### Add Filtering:
- Filter by type (Newspaper, Official Records, etc.)
- Filter by date range
- Filter by topic/tag

## Limitations

- **No AI summarization**: Uses pre-written descriptions
- **No semantic search**: Keyword-based only (no embeddings)
- **Manual data entry**: Article metadata must be manually curated
- **Static data**: Must rebuild/redeploy to update articles

## Advantages

- ✅ **Free**: No API costs, no backend hosting
- ✅ **Fast**: All search happens in browser
- ✅ **Simple**: Easy to understand and explain
- ✅ **Reliable**: No external dependencies
- ✅ **Privacy**: No data sent to servers

## Troubleshooting

**Search returns no results:**
- Check that `articles.json` is properly formatted
- Verify keywords/tags match your search terms
- Try broader search terms

**Import errors:**
- Make sure `articles.json` is in `src/data/`
- Check that TypeScript can find the file

**Search too slow:**
- If you have 100+ articles, consider adding pagination
- Limit results to top 20-30

## Future Enhancements (After Class)

If you want to improve this later:
1. Add actual embeddings (use transformers.js in browser)
2. Connect to a real backend (Supabase)
3. Implement web scraping for automatic updates
4. Add AI-powered summarization
5. Build a Chrome extension for quick search
