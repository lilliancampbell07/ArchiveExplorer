# Archive Explorer 

A searchable archive of historical articles from the McLean County Museum of History, powered by an AI semantic search and AI summarization.

## About This Project

Archive Explorer makes it easier to explore the over 150 historical articles from the McLean County Museum of History's "Pages of the Past" collection. Using AI technology, you can search by meaning (not just keywords) and generate instantly generate summaries of articles.

## Features

- **AI Semantic Search**: Understands WHAT you're searching, not just exact word matches
- **AI Summarization**: Get quick summaries of long articles
- **Fast & Free**: Runs entirely in your browser, no backend needed

## What technologies are used for this project?
    -This project is built with:
      -Vite -> From Lovable
      -TypeScript -> From Lovable
      -React -> From Lovable
      -shadcn-ui -> From Lovable
      -Tailwind CSS -> From Lovable
      -transformers.js (Browser-based AI) -> ADDED
      -Python (BeautifulSoup, requests) -> ADDED 

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

1. **Clone the repository**
   ```bash
   git clone https://github.com/lilliancampbell07/chronicle-clues.git
   cd chronicle-clues
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## How to Use

1. **Search**: Type any query in the search bar (e.g., "Lincoln courthouse" or "historic buildings")
2. **Browse Results**: Articles are ranked by relevance to your search
3. **Summarize**: Click the "Summarize" button on any article card to generate a quick summary
4. **Read Full Article**: Click "Read Full Article" to view the complete content on the museum website

## Data Collection (Optional)

If you want to update the article database:

1. **Install Python dependencies**
   ```bash
   pip install requests beautifulsoup4
   ```

2. **Run the crawler**
   ```bash
   python src/components/backend/crawler.py
   ```

3. **Extract articles**
   ```bash
   python "article extraction/extractArticles.py"
   ```

## Project Structure

```
chronicle-clues/
├── src/
│   ├── components/        # UI components
│   ├── data/             # articles.json database
│   ├── lib/              # Core functionality
│   │   ├── aiSearchUtils.ts        # AI search logic
│   │   ├── embeddingService.ts     # AI model management
│   │   └── summarizationService.ts # Summarization
│   └── pages/            # React pages
├── scripts/              # Data collection scripts
└── documentation/        # Project documentation
```

## Credits

- Historical content from [McLean County Museum of History](https://mchistory.org)
- Built with [Lovable](https://lovable.dev)
- AI models from [Hugging Face](https://huggingface.co)

## License

This project is for educational purposes. Historical content belongs to the McLean County Museum of History. 
