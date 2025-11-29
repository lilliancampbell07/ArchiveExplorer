"""
Automated Article Extraction Script (Python Version)

Purpose:
  Extract article data from the McLean County Museum of History website
  and compile it into a JSON file for the search interface.

Tech Used:
  - requests: HTTP requests to fetch web pages
  - BeautifulSoup: HTML parsing and data extraction
  - json: Reading/writing JSON files

Process Flow:
  1. Read URLs from crawler output (crawler_with_found_links_new_.json)
  2. Filter to only include actual article pages
  3. Visit each URL and extract content
  4. Clean and process the extracted data
  5. Generate tags and keywords from content
  6. Save all articles to articles.json

Prerequisites:
  pip install requests beautifulsoup4

Usage:
  python scripts/extractArticles.py

Output:
  Creates/overwrites src/data/articles.json with structured article data
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

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent

# Input file: JSON output from the Python crawler
CRAWLER_OUTPUT = SCRIPT_DIR / 'crawler_with_found_links_new_.json'

# Output file: Where the final articles.json will be saved
OUTPUT_FILE = SCRIPT_DIR.parent / 'src' / 'data' / 'articles.json'

# Delay between page requests in seconds
# Being "polite" to the server - avoid overwhelming it with rapid requests
DELAY_BETWEEN_REQUESTS = 2

# Maximum number of articles to process
# The mchistory.org site has approximately 155 total articles
MAX_ARTICLES = 155

# User agent to identify our bot
USER_AGENT = 'Mozilla/5.0 (Educational Research Bot) - MCHS Article Archiver'


def extract_article_data(url, article_id):
    """
    Extract structured article data from a single webpage
    
    Args:
        url (str): The full URL of the article to extract
        article_id (int): Sequential ID number for this article
        
    Returns:
        dict: Article object with all fields, or None if extraction fails
        
    Process:
        1. Make HTTP GET request to fetch the page
        2. Parse HTML with BeautifulSoup
        3. Extract title, date, content, and type using CSS selectors
        4. Clean and process the extracted text
        5. Generate tags and keywords from content
        6. Return structured article object
    """
    try:
        # Make HTTP GET request with custom user agent
        # Timeout after 30 seconds if page doesn't respond
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=30)
        
        # Raise an exception if the request failed (4xx or 5xx status)
        response.raise_for_status()
        
        # Parse HTML content with BeautifulSoup
        # 'html.parser' is Python's built-in parser (no extra dependencies)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # ====================================================================
        # Extract Title
        # ====================================================================
        # Try multiple selectors to find the article title
        # Priority: h1 → .article-title → .entry-title → page title
        title_element = (
            soup.find('h1') or
            soup.find(class_='article-title') or
            soup.find(class_='entry-title') or
            soup.find('title')
        )
        title = title_element.get_text().strip() if title_element else 'Untitled'
        
        # ====================================================================
        # Extract Date
        # ====================================================================
        # Try multiple selectors to find the publication date
        # Priority: <time> tag → .date class → .published class → datetime attribute
        date_element = (
            soup.find('time') or
            soup.find(class_='date') or
            soup.find(class_='published')
        )
        
        if date_element:
            # Try to get datetime attribute first, then text content
            date = date_element.get('datetime', date_element.get_text().strip())
        else:
            date = 'Unknown'
        
        # ====================================================================
        # Extract Content
        # ====================================================================
        # Extract the main article content text
        # Priority: <article> tag → .content class → .entry-content → <main> tag
        content_element = (
            soup.find('article') or
            soup.find(class_='content') or
            soup.find(class_='entry-content') or
            soup.find('main')
        )
        
        if content_element:
            # Get all text from the element, preserving structure
            content = content_element.get_text(separator=' ', strip=True)
        else:
            content = ''
        
        # ====================================================================
        # Extract Type/Category
        # ====================================================================
        # Try to find the article category
        type_element = (
            soup.find(class_='category') or
            soup.find(class_='type')
        )
        article_type = type_element.get_text().strip() if type_element else 'Article'
        
        # ====================================================================
        # Text Cleaning and Processing
        # ====================================================================
        
        # Clean up whitespace in the extracted content
        # Replace multiple spaces/newlines with a single space
        full_content = ' '.join(content.split())
        
        # Generate a preview description from the first 200 characters
        description = full_content[:200] + '...' if len(full_content) > 200 else full_content
        
        # Generate searchable tags by extracting important words
        tags = generate_tags(title + ' ' + full_content)
        
        # Generate space-separated keywords string for search indexing
        keywords = generate_keywords(title + ' ' + full_content)
        
        # Return the complete article object
        return {
            'id': article_id,
            'title': title,
            'url': url,
            'date': date,
            'type': article_type,
            'description': description,
            'content': full_content,
            'tags': tags,
            'keywords': keywords
        }
        
    except requests.exceptions.RequestException as e:
        # Handle network errors (timeout, connection error, HTTP errors)
        print(f'❌ Error fetching {url}: {e}')
        return None
    except Exception as e:
        # Handle any other errors during extraction
        print(f'❌ Error extracting {url}: {e}')
        return None


def generate_tags(text):
    """
    Generate searchable tags from article text
    
    Implements a simple keyword extraction algorithm:
    1. Convert text to lowercase
    2. Remove punctuation, keep only letters, numbers, spaces, hyphens
    3. Split into individual words
    4. Filter out common English stop words
    5. Filter out very short words (3 chars or less)
    6. Remove duplicates
    7. Return the first 8 most relevant unique words
    
    Args:
        text (str): Combined title and content text to analyze
        
    Returns:
        list: Array of up to 8 relevant tag words
        
    Example:
        Input: "The Illinois State University was founded in 1857"
        Output: ["illinois", "state", "university", "founded", "1857"]
    """
    # Stop words: Common English words that don't add semantic value
    # These are filtered out because they appear frequently but aren't useful
    # for search/categorization
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
        'those', 'it', 'its', 'his', 'her', 'their'
    }
    
    # Convert to lowercase for case-insensitive matching
    text = text.lower()
    
    # Keep only alphanumeric characters, spaces, and hyphens
    # Remove all other punctuation
    import re
    text = re.sub(r'[^\w\s-]', ' ', text)
    
    # Split into words
    words = text.split()
    
    # Filter words: must be > 3 chars and not a stop word
    filtered_words = [
        word for word in words
        if len(word) > 3 and word not in common_words
    ]
    
    # Remove duplicates while preserving order
    # Use dict.fromkeys() as an ordered set (Python 3.7+)
    unique_words = list(dict.fromkeys(filtered_words))
    
    # Return the first 8 unique words as tags
    return unique_words[:8]


def generate_keywords(text):
    """
    Generate space-separated keywords string from text
    
    This is a convenience wrapper around generate_tags() that returns
    a space-separated string instead of a list.
    
    Args:
        text (str): Combined title and content to extract keywords from
        
    Returns:
        str: Space-separated keywords (e.g., "illinois state university founded 1857")
    """
    tags = generate_tags(text)
    return ' '.join(tags)


def extract_all_articles():
    """
    Main extraction orchestration function
    
    Coordinates the entire extraction process:
    1. Validate that crawler output exists
    2. Load and parse the crawler's JSON output
    3. Filter URLs to only include actual article pages
    4. Loop through URLs and extract each article
    5. Implement polite delays between requests
    6. Compile results and save to articles.json
    7. Print extraction statistics
    """
    print('=' * 60)
    print('Article Extraction Script')
    print('=' * 60)
    
    # ========================================================================
    # Step 1: Validate Prerequisites
    # ========================================================================
    
    # Check if the crawler has been run and produced output
    if not CRAWLER_OUTPUT.exists():
        print(f'❌ Crawler output not found: {CRAWLER_OUTPUT}')
        print('Please run your crawler first: python src/components/crawler.py')
        return
    
    # ========================================================================
    # Step 2: Load Crawler Output
    # ========================================================================
    
    print(f'\n📂 Loading crawler output from: {CRAWLER_OUTPUT}')
    
    with open(CRAWLER_OUTPUT, 'r', encoding='utf-8') as f:
        crawler_data = json.load(f)
    
    # ========================================================================
    # Step 3: Extract and Filter Article URLs
    # ========================================================================
    
    # Use a set to automatically deduplicate URLs
    all_urls = set()
    
    # Iterate through the crawler output structure
    # Each key is a page URL, each value is a list of links found on that page
    for page_url, linked_urls in crawler_data.items():
        for url in linked_urls:
            # Filter logic: Only include actual article pages
            # Include: URLs containing '/research/articles/' and specific article paths
            # Exclude: Topics pages, main articles index, anchor links (#)
            if ('/research/articles/' in url and
                '/topics' not in url and
                not url.endswith('/articles') and
                '#' not in url):
                all_urls.add(url)
    
    # Convert set to list and limit to MAX_ARTICLES
    urls_to_process = list(all_urls)[:MAX_ARTICLES]
    
    # Print extraction plan summary
    print(f'\n📋 Found {len(all_urls)} total article URLs')
    print(f'📝 Processing first {len(urls_to_process)} articles')
    
    # Calculate estimated time
    estimated_minutes = (len(urls_to_process) * DELAY_BETWEEN_REQUESTS) / 60
    print(f'⏱️  Estimated time: ~{estimated_minutes:.1f} minutes\n')
    
    # ========================================================================
    # Step 4: Process Each URL Sequentially
    # ========================================================================
    
    articles = []
    success_count = 0
    error_count = 0
    
    for i, url in enumerate(urls_to_process, start=1):
        # Handle relative URLs by converting to absolute URLs
        if not url.startswith('http'):
            url = f'https://mchistory.org{url}'
        
        # Print progress indicator
        print(f'\n[{i}/{len(urls_to_process)}] Processing: {url}')
        
        # Extract article data
        article = extract_article_data(url, i)
        
        if article:
            articles.append(article)
            success_count += 1
            print(f'✅ Extracted: {article["title"]}')
        else:
            error_count += 1
        
        # ====================================================================
        # Polite Crawling: Delay Between Requests
        # ====================================================================
        # Wait before the next request (except after the last one)
        if i < len(urls_to_process):
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # ========================================================================
    # Step 5: Save Results to JSON File
    # ========================================================================
    
    print(f'\n💾 Saving results to: {OUTPUT_FILE}')
    
    # Create parent directories if they don't exist
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Write the articles list to disk as formatted JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    
    # ========================================================================
    # Step 6: Print Final Statistics
    # ========================================================================
    
    print('\n' + '=' * 60)
    print('Extraction Summary:')
    print('=' * 60)
    print(f'Successfully extracted: {success_count} articles')
    print(f'Failed extractions: {error_count}')
    print(f'Output file: {OUTPUT_FILE}')
    print(f'Total records: {len(articles)}')
    print('=' * 60)
    print('\n✨ Done! Your articles.json is ready to use!')
    print('The React app will now be able to search through these articles.\n')


# ============================================================================
# Script Entry Point
# ============================================================================

if __name__ == '__main__':
    # Execute the main function
    try:
        extract_all_articles()
    except KeyboardInterrupt:
        print('\n\n⚠️  Extraction interrupted by user')
    except Exception as e:
        print(f'\n\n❌ Unexpected error: {e}')
        import traceback
        traceback.print_exc()
