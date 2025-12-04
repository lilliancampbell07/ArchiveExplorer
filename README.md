# Archive Explorer 
A searchable archive of historical articles from the McLean County Museum of History, powered by AI semantic search and AI summarization.

## Project Introduction
"Archive Explorer" is a web-based tool for researching that was designed to help make the McLean County History Museum "Pages of the Past" articles more accessible using AI. This application helps researchers, students, and BloNo history buffs find artices relevant to what they're looking for, and create short summaries of lengthy articles. The summaries are very helpful to gain insight on exactly what is covered in an article before diving into it. Archive Explorer implements a search feature that processes natural language, rather than keyword matching, which makes sure that the searcher recieves all the information they want, even if they're calling it by a different name. The search system uses transformer-based neural networks to do this. These run entirely client-side, so there's no backend server or APIs required. This was done to make it free and fast. 

## Features
- **AI Semantic Search**: Understands WHAT you're searching, not just exact word matches
- **AI Summarization**: Get quick summaries of long articles
- **Fast & Free**: Runs entirely in your browser, no backend needed

##APIs, Models, Accounts, & Platforms

### Platform
- **[Lovable](https://archiveexplorer.lovable.app/)** - This site runs entirely on Lovable. 
- **No API keys required** - All AI models run locally in the browser

### AI Models Used 
- **Xenova/all-MiniLM-L6-v2** - This is a sentence embedding model for the semantic search feature -- It was used in class during the RAG example. 
  - Source: [Hugging Face](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
  - What it does: Converts text to vectors for similarity comparison
  - Note: It takes about 5-10 seconds to initially load, and then it is cached in the browser
- **Xenova/distilbart-cnn-6-6** (~50MB) - Text summarization model
  - Source: [Hugging Face](https://huggingface.co/Xenova/distilbart-cnn-6-6)
  - What it does: Generates concise summaries of articles
  - Note: It takes about 10-20 seconds to initially load, and then it is cached in the browser

### Technologies & Frameworks
**Frontend (TypeScript/React)**
- **Vite**  --> From Lovable template
- **React** --> From Lovable template
- **TypeScript** --> From Lovable template
- **Tailwind CSS** --> From Lovable template
- **shadcn-ui** --> From Lovable template
- **transformers.js** - Browser-based AI (ADDED BY ME)
- **Python** - BeatutifulSoup, requests (ADDED BY ME)

**Data Collection (Python)**
- **Python** - This is used for the crawler and scraper 
- **requests** - This is the library used for fetching web pages
- **beautifulsoup4** - This is used for data extraction, and HTML parsing 

### External Data Sources
- **McLean County History Museum** - Historical article content
  - Note that there is no API used, article content was scraped after crawling through "mchistory.org/research/articles" 
  - *All content belongs to McLean County Museum of History 

## The flow of this program: 
    -Data Collection: 
      -crawler.py -> Crawls mchistory.org/articles for all URLS of articles 
      -extractArticles.py -> scrapes the article content from each URL found 
      -articles.json -> OUTPUT, the database of 155 articles goes into this file 

    -At runtime in the browser:
      -embeddingService.ts -> Initializes, downloads, caches the AI model (all-MiniLM-L6-v2)
    
    -When "Search" feature is being used: 
      -aiSearchLogic.ts -> Handles all of the search logic that is used 
        -Calls: 
          -embeddingService.ts -> to convert queries to vectors, and also to convert each article to a vector 
        -Uses: 
          -cosineSimilarity() -> to compare vectors 
        Returns: 
          -Returns SCORED/RANKED results after vector comparison 
    
    -When "Summary" feature is being used: 
      -summarizationService.ts -> Generates a summary 
        -How it does this: 
          -Takes in article text 
          -Uses distilbart model to create a short summary of the text 
          -Returns the condensed/summarized version

## Installation & Setup
**Lovable**: (https://archiveexplorer.lovable.app) 
    - no installation needed, web hosted on Lovable
### Local Development Setup
#### Prerequisites
- **Node.js** OR **Bun** ([Download Bun](https://bun.sh))
- **Git** for cloning the repository
- **Python** (Python installation is only needed if you are updating the article database)

#### Step-by-Step Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/lilliancampbell07/ArchiveExplorer.git
   cd ArchiveExplorer
   ```

2. **Install dependencies**
   Using Bun (which is faster, and therefore recommended):
   ```bash
   bun install
   ```
   
   OR using npm:
   ```bash
   npm install
   ```

3. **Run the development server**
   
   Using Bun:
   ```bash
   bun run dev
   ```
   
   OR using npm:
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8080` (or the port shown in your terminal)
   - Wait 5-10 seconds for AI models to download on their first load
   - You will know they're installed when you see a "🤖 AI Model Ready" toast notification

## How to Use

1. **Search**: Type any query in the search bar
2. **Browse Results**: Articles are ranked by relevance to your search, the most relevant results will appear closest to the top of the page 
3. **Summarize**: Click the "Summarize" button on any article card to generate a quick summary
4. **Read Full Article**: Click "Read Full Article" to be redirected to the link of the original article on the museum's website 

## Issues Encountered & Their Fixes 

This is the section where I documented problems I encountered during development, and how I fixed them. 

### Issue 1: Folder Organization Breaking my Build 
**Problem**: I attempted to move all config files (`vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, etc.) into a `config/` folder for a neater organization. This caused:
- Vite couldn't find source files (path alias `@` pointing to wrong location)
  - Despite this being easily handleable, there were a TON of places I had to fix it 
- Tailwind CSS not loading (white, unstyled page)
- TypeScript path resolution errors
- Essentially, this broke Lovable's ability to properly build the webpage 

**Solution**: 
- Moved all config files back to the root program
- Updated all path aliases to how they originally were
- Changed Tailwind content paths to how they were 

### Issue 2: Model Loading with `require()` in ES Modules
**Problem**: The AI models were failing to load on startup with error "Cannot find module". Functions like `preloadAIModel()`, `isAIReady()`, and `isAILoading()` used `require('./embeddingService')` didn't work in ES modules.

**Solution**:
- Switched from `const { embeddingService } = require('./embeddingService')` to proper imports
- Added `embeddingService` to the import statement: `import { getEmbedding, cosineSimilarity, embeddingService } from './embeddingService'`
- Removed all three `require()` calls from `aiSearchLogic.ts`

### Issue 3: Duplicate `utils.ts` Files
**Problem**: Created a `searchAndSummary/` folder for the AI code while organizing files and moved `utils.ts` there. This caused:
- Two identical `utils.ts` files (`lib/utils.ts` and `searchAndSummary/utils.ts`)
- UI components were importing from wrong location
- The program did not know which file to use 

**Solution**:
- Keep `lib/utils.ts` (where it originally was)
- Keep `searchAndSummary/` for AI-specific code only (`aiSearchLogic.ts`, `embeddingService.ts`, `summarizationService.ts`)
- Deleted duplicate `utils.ts` from `searchAndSummary/`
- Updated all UI component imports to use `@/lib/utils`

### Issue 4: Unnecessarily using Puppeteer for Scraping Data
**Problem**: I was initially using Puppeteer (which is a headless Chrome browser automation) to scrape the content of the articles from the museum website. This caused:
- A very large dependency size
- Slow installation times
- Overcomplicated scraping process for something that could be simpler

**Solution**:
- I switched to BeautifulSoup4 (Python) with the `requests` library, because we used BeautifulSoup in class for scrapers. 
- Much lighter weight 
- Faster and simpler
- No browser automation needed since the museum pages are server-rendered

### Issue 5: UI Buttons Breaking / Not Responding
**Problem**: The interactive buttons (Search, Summarize, navigation) would intermittently stop working or become unresponsive. Some problems with them included:
- Clicking the buttons was not doing anything 
- Buttons visually stuck in hover/pressed "state"

**Solution**:
- Added a proper TypeScript error handler in case a button broke 
- Wrapped summarization button actions in try/catch blocks

### Issue 6: Summaries Not Displaying
**Problem**: After clicking "Summarize" button, the generated summary would not appear. Sometimes:
- A Toast notification appeared but there would be no summary available 
- Clicking onto the Summaries page showed up as empty, despite having generated summaries

**Reason 1: LocalStorage was not being used**
- The summary data was being generated but not saved to anything
- **How I fixed it**: Added proper `localStorage.setItem('aiSummaries', JSON.stringify(summaries))` after generation to make sure the summaries would appear

**Reason 2: Async timing issues**
- The Toast notification would fire before a summary was fully generated
- **How I fixed it**: I moved the toast notification to appear after `await generateArticleSummary()` completion

**Reason 3: Summaries page was not reading from localStorage**
- `Summaries.tsx` wasn't refreshing on navigation
- **How I fixed it**: Added `useEffect` to reload the summaries from localStorage

**Reason 4: The model was not fully loaded**
- The page would attempt to summarize an article before the distilbart model finished downloading
- **How I fixed it**: Added `summarizationReady` check before allowing summarize button clicks
- I also added a loading indicator if the model was not ready