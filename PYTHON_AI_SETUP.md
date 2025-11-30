# Python-Based AI Search Setup

This guide explains how to use Python for AI embeddings instead of loading models in the browser.

## Why This Approach?

- ✅ **Works on free hosting** (Vercel, Netlify, GitHub Pages)
- ✅ **No heavy AI model in browser** (instant loading)
- ✅ **Fast search** (just math, no AI inference)
- ✅ **Simple to deploy** (static files only)

## Setup Steps

### 1. Install Python Dependencies

```bash
pip install sentence-transformers
```

### 2. Generate Embeddings

Run the Python script to create embeddings for all articles:

```bash
python scripts/generate_embeddings.py
```

This creates `src/data/articles_with_embeddings.json` with AI vectors embedded in each article.

### 3. Update Your React Import

Change your article import to use the version with embeddings:

**Before:**
```typescript
import articlesData from "@/data/articles.json";
```

**After:**
```typescript
import articlesData from "@/data/articles_with_embeddings.json";
```

### 4. Done!

Your app now has instant AI-powered search with no model loading!

## How It Works

1. **Python generates embeddings offline** (run once)
   - Uses `sentence-transformers` library
   - Model: `all-MiniLM-L6-v2`
   - Converts each article into a 384-dimension vector

2. **React app loads pre-computed embeddings** (instant)
   - No AI model to load in browser
   - Just loads JSON file with embeddings

3. **Search uses simple math** (fast)
   - Keyword matching for queries
   - Can compare with pre-computed article embeddings if needed

## File Size

- Original `articles.json`: ~650 KB
- With embeddings `articles_with_embeddings.json`: ~4-5 MB
- Still small enough for free-tier hosting!

## When to Regenerate

Re-run the embedding script whenever you:
- Add new articles
- Update article content
- Change article descriptions

## Advanced: Query Embeddings

For true semantic search, you'd need to generate embeddings for user queries too. Options:

1. **Keyword matching** (current implementation)
2. **Backend API** - Flask/FastAPI endpoint to generate query embeddings
3. **Pre-compute common queries** - Generate embeddings for frequent searches

For a free-tier app, option #1 (keyword matching) works great!
