"""
Article Extraction

Purpose:
  -Extract article data from the MCHM website
  -Compile it into a JSON file for the search interface

Tech Used:
  - requests: HTTP requests to fetch web pages
  - BeautifulSoup: HTML parsing and data extraction
  - json: Reading/writing JSON files

What happens (step-by-step):
  1. Read URLs from crawler output (crawler_with_found_links_new_.json)
  2. Filter to only include actual article pages (excludes stuff like topics and index pages)
  3. Visit each URL and extract content
  4. Clean and process the extracted data
  5. Generate tags and keywords from content
  6. Save all articles to articles.json

How to Run:
  pip install requests beautifulsoup4
  python scripts/extractArticles.py

Output:
  Creates/overwrites src/data/articles.json with article data
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from pathlib import Path

# ============================================================================
# Configuration Constants
# ============================================================================

SCRIPT_DIR = Path(__file__).parent
CRAWLER_OUTPUT = SCRIPT_DIR / 'crawler_with_found_links_new_.json'
OUTPUT_FILE = SCRIPT_DIR.parent / 'src' / 'data' / 'articles.json'
DELAY_BETWEEN_REQUESTS = 2
MAX_ARTICLES = 155 #MCHM POTP has approx 155 articles, but can limit # for testing

# User agent to identify our bot - some sites block requests without it, better safe than sorry! 
USER_AGENT = 'Mozilla/5.0 (Educational Research Bot) - MCHM Article Archiver'

def extract_article_data(url, article_id):
    #Extract article data from a URL
    try:
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser') #Fetching the page ^
        
        title = (soup.find('h1') or soup.find('title')).get_text().strip()
        date = (soup.find('time') or soup.find(class_='date'))
        date = date.get_text().strip() if date else 'Unknown'
        content = (soup.find('article') or soup.find('main') or soup.find(class_='content'))
        content = content.get_text(separator=' ', strip=True) if content else ''
        article_type = soup.find(class_='category')
        article_type = article_type.get_text().strip() if article_type else 'Article' #extracts data ^
        
        full_content = ' '.join(content.split())
        description = full_content[:200] + '...' if len(full_content) > 200 else full_content
        tags = generate_tags(title + ' ' + full_content) #process text ^
        
        return {
            'id': article_id,
            'title': title,
            'url': url,
            'date': date,
            'type': article_type,
            'description': description,
            'content': full_content,
            'tags': tags,
            'keywords': ' '.join(tags)
        }
    except Exception as e:
        print(f'Error extracting {url}: {e}')
        return None


def generate_tags(text):
    #Extract 8 most important words from text (filters stop words)
    import re #re is used for regular expressions
    
    #Stop words to filter out
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
        'those', 'it', 'its', 'his', 'her', 'their'
    }
    
    #Clean, split, filter
    words = re.sub(r'[^\w\s-]', ' ', text.lower()).split()
    filtered = [w for w in words if len(w) > 3 and w not in stop_words]
    
    #Remove duplicates, return first 8
    return list(dict.fromkeys(filtered))[:8]


def extract_all_articles():
    #Main function: extracts all articles and saves to JSON
    print('=' * 60)
    print('Article Extraction Script')
    print('=' * 60)
    
    # Check if crawler output exists
    if not CRAWLER_OUTPUT.exists():
        print(f'Crawler output not found: {CRAWLER_OUTPUT}')
        print('Run: python src/components/crawler.py')
        return
    
    # Load crawler data
    print(f'\nLoading crawler data: {CRAWLER_OUTPUT}')
    with open(CRAWLER_OUTPUT, 'r', encoding='utf-8') as f:
        crawler_data = json.load(f)
    
    #Filter to article URLs only
    all_urls = set()
    for page_url, linked_urls in crawler_data.items():
        for url in linked_urls:
            if ('/research/articles/' in url and '/topics' not in url 
                and not url.endswith('/articles') and '#' not in url):
                all_urls.add(url)
    
    urls_to_process = list(all_urls)[:MAX_ARTICLES]
    
    print(f'\nFound {len(all_urls)} URLs, processing {len(urls_to_process)}')
    print(f'Estimated: ~{len(urls_to_process) * DELAY_BETWEEN_REQUESTS / 60:.1f} min\n')
    
    #Extract each article
    articles = []
    success = 0
    
    for i, url in enumerate(urls_to_process, start=1):
        if not url.startswith('http'):
            url = f'https://mchistory.org{url}'
        
        print(f'[{i}/{len(urls_to_process)}] {url}')
        article = extract_article_data(url, i)
        
        if article:
            articles.append(article)
            success += 1
            print(f'✅ {article["title"]}')
        
        if i < len(urls_to_process):
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    #Save results
    print(f'\n💾 Saving to: {OUTPUT_FILE}')
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    
    #Print summary
    print('\n' + '=' * 60)
    print(f'Success: {success} | Failed: {len(urls_to_process) - success}')
    print(f'Saved {len(articles)} articles to {OUTPUT_FILE}')
    print('=' * 60)

#Script Entry Point
if __name__ == '__main__':
    # Execute the main function
    try:
        extract_all_articles()
    except KeyboardInterrupt:
        print('\n\nExtraction interrupted by user')
    except Exception as e:
        print(f'\n\nUnexpected error: {e}')
        import traceback
        traceback.print_exc()
