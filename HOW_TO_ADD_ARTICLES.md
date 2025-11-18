# How to Add Articles to Your Search System

## Quick Guide

### 1. Run Your Crawler
```bash
python src/components/backend/crawler.py
```
This creates `crawler_only_urls_new.json` with all article URLs.

### 2. Pick Articles to Add
For a class project, I recommend adding 10-20 diverse articles covering:
- Education history
- Business/economy
- Historic figures
- Landmarks
- Major events

### 3. Fill in Article Data

For each URL from your crawler, visit the page and fill in this template:

```json
{
  "id": 5,
  "title": "Copy the exact article title here",
  "url": "https://mchistory.org/research/articles/article-name",
  "date": "Month Day, Year",
  "type": "Choose one: Newspaper Article, Official Records, Business Records, Historical Site, Photograph Collection",
  "description": "Write 1-2 sentences summarizing what this article is about",
  "tags": ["keyword1", "keyword2", "location", "person", "year"],
  "keywords": "all important words from title and description for search matching"
}
```

### 4. Add to articles.json

Open `src/data/articles.json` and add your new entry to the array:

```json
[
  {
    "id": 1,
    "title": "Existing article...",
    ...
  },
  {
    "id": 5,
    "title": "Your new article",
    "url": "https://mchistory.org/...",
    ...
  }
]
```

### 5. Test Your Search

Try queries related to your new articles:
- Search for names mentioned
- Search for years/dates
- Search for locations
- Search for topics/themes

## Tips for Good Article Data

### Title
- Use the exact title from the article
- Keep capitalization consistent

### Description  
- 1-3 sentences
- Include key facts: who, what, when, where
- Use natural language (helps with search)

### Tags
- 5-10 keywords
- Include: names, places, years, topics
- Lowercase preferred
- Think "what would someone search for?"

### Keywords
- Copy all important words from title and description
- Space-separated
- Used by search algorithm for matching

### Type Categories
Choose the most appropriate:
- **Newspaper Article** - from The Pantagraph or other papers
- **Official Records** - government documents, charters, legal
- **Business Records** - company histories, transactions
- **Historical Site** - buildings, landmarks, locations
- **Photograph Collection** - primarily images
- **Personal Papers** - letters, diaries, journals
- **Organization Records** - clubs, societies, groups

## Example: Adding a New Article

Let's say you found this on mchistory.org:

**URL:** `https://mchistory.org/research/articles/1922-constitution-trail`  
**Page shows:**
- Title: "Constitution Trail Railroad Abandonment"
- Date: July 15, 1922
- Content: About when the railroad stopped running...

**Your JSON entry:**
```json
{
  "id": 5,
  "title": "Constitution Trail Railroad Abandonment",
  "url": "https://mchistory.org/research/articles/1922-constitution-trail",
  "date": "July 15, 1922",
  "type": "Newspaper Article",
  "description": "Coverage of the Illinois Central Railroad's decision to abandon the rail line that would later become the Constitution Trail, a popular recreational path connecting Bloomington and Normal.",
  "tags": ["constitution trail", "railroad", "illinois central", "bloomington", "normal", "transportation", "1922"],
  "keywords": "Constitution Trail railroad abandonment Illinois Central transportation Bloomington Normal 1922 rail line"
}
```

## Testing Your Additions

After adding articles, test with queries:

```
"constitution trail"           → Should find your new article
"railroad 1922"                → Should match by date and keyword
"transportation bloomington"   → Should match by tags
"illinois central"             → Should match by tags and keywords
```

## Batch Adding Articles

For 10-20 articles, the workflow is:

1. Open crawler output
2. Open a browser to mchistory.org
3. Open articles.json in your editor
4. For each URL:
   - Visit the page
   - Copy the template
   - Fill in title, date, type, description
   - Generate tags from content
   - Paste into articles.json
5. Save and test

**Time estimate:** ~5-10 minutes per article

## Need Help?

If you get stuck:
- Check `SEARCH_SYSTEM_README.md` for full documentation
- Look at existing articles in `articles.json` for examples
- Test each article after adding to make sure search works
