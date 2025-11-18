# Automated Article Extraction Guide

## What This Does

Automatically extracts article data from mchistory.org and creates `articles.json` for you!

## Setup (One-Time)

1. **Install Node.js** (if you don't have it)
   - Download from: https://nodejs.org

2. **Install Puppeteer**
   ```bash
   npm install puppeteer
   ```

## How To Use

### Step 1: Run Your Crawler
```bash
python src/components/backend/crawler.py
```
This creates `crawler_only_urls_new.json`

### Step 2: Run The Automated Extractor
```bash
node scripts/extractArticles.js
```

### What Happens:
1. ✅ Reads URLs from crawler output
2. ✅ Opens each page in a headless browser
3. ✅ Extracts title, date, content
4. ✅ Generates description (first 200 chars)
5. ✅ Auto-generates tags and keywords
6. ✅ Saves everything to `src/data/articles.json`
7. ✅ Waits 2 seconds between requests (respectful!)

### Step 3: Deploy
Your `articles.json` is now populated with real data - just deploy to Lovable!

## Example Output

The script will show progress:
```
📋 Found 47 URLs to process
🚀 Launching browser...

[1/47] Processing: https://mchistory.org/research/articles/...
✅ Extracted: BroMenn donation speaks to 125 years...

[2/47] Processing: https://mchistory.org/research/articles/...
✅ Extracted: Electric Cars Sparked Local Interest...

...

📊 Extraction Summary:
✅ Successfully extracted: 45
❌ Failed: 2
📁 Saved to: src/data/articles.json

🎉 Done! Your articles.json is ready to use!
```

## Customization

### Adjust Delay (if site is slow)
In `extractArticles.js`, line 18:
```javascript
const DELAY_BETWEEN_REQUESTS = 2000; // Change to 3000 for 3 seconds
```

### Adjust Selectors (if extraction fails)
The script tries common HTML patterns. If mchistory.org uses different selectors, update lines 34-58 in `extractArticles.js`.

### Limit Number of Articles
Process only first 20 URLs:
```javascript
for (let i = 0; i < Math.min(urls.length, 20); i++) {
```

## Troubleshooting

**"Crawler output not found"**
- Run the crawler first: `python src/components/backend/crawler.py`

**"Puppeteer not found"**
- Install it: `npm install puppeteer`

**Extraction fails for some pages**
- Normal! Some pages may have different structure
- The script will skip them and continue

**Too slow**
- Reduce `DELAY_BETWEEN_REQUESTS` (but be respectful!)
- Or process only important URLs

## Benefits

✅ **Saves hours** - No manual copy/paste
✅ **Consistent format** - All articles structured the same
✅ **Auto-generates tags** - Smart keyword extraction
✅ **Respectful** - Includes delays, proper user agent
✅ **Error handling** - Continues even if some pages fail

## Next Steps

1. Run the extractor
2. Review `articles.json` (verify data looks good)
3. Edit any descriptions that need improvement
4. Deploy to Lovable
5. Test AI search with real data!

---

**Note:** This script is for educational purposes. Always respect the website's terms of service and robots.txt.
