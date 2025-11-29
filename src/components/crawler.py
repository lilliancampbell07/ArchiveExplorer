
"""
What this file does:
Web Crawler: specifically for mchistory.org/articles

This crawler visits & extracts links from mchistory.org/articles.

Dependencies:
    - urllib
    - BeautifulSoup
    - queue

Output Files:
    - crawler_with_found_links_new_.json: Maps each visited URL to its found links
    - crawler_only_urls_new.json: List of all visited URLs (simplified paths)
"""

import urllib.request
import urllib.error
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from queue import Queue
import json


class SimpleCrawler:
    def __init__(self, root_url):
        self.root_url = root_url.rstrip("/")      
        self.base_host = urlparse(root_url).netloc
        self.visited = set()
        self.to_visit = Queue()
        self.to_visit.put(root_url) 
        self.crawler_links = {}
        self.modified_urls = []

    def crawl(self):
        #Main crawling loop that processes URLs from the queue.
        while not self.to_visit.empty():
            # Get the next URL to crawl
            url = self.to_visit.get()
            # Skip if URL has already been crawled (shouldn't happen, safety check)
            if url in self.visited:
                continue
            
            reduced_url = url.replace(self.root_url, "", 1) or "/"
            self.modified_urls.append(reduced_url)
            
            print(f"Crawling: {url}")
            
            # Empty list to store links found on page
            self.crawler_links[url] = []
            
            # Mark URL as visited to prevent crawling it again
            self.visited.add(url)
            
            # Fetch the page and extract all links
            links = self.fetch_links(url)
            
            # Process each link found on the page
            for link in links:
                if urlparse(link).netloc == self.base_host:
                    if link.startswith(self.root_url):
                        self.crawler_links[url].append(link)
                        print(f"  Found relevant link: {link}")
                        if link not in self.visited:
                            self.to_visit.put(link)

    def fetch_links(self, url):
        #Fetch a URL and extract all links from the HTML content.
        try:
            #HTTP GET request to fetch the page
            response = urllib.request.urlopen(url)
            #Check if the response is HTML (not PDF, image, JSON, etc.), only parse HTML pages to extract links
            if response.info().get_content_type() != "text/html":
                return []
            html_content = response.read().decode("utf-8")
            # Parse HTML using BeautifulSoup for easy link extraction
            soup = BeautifulSoup(html_content, "html.parser")
            links = [urljoin(url, a.get("href")) for a in soup.find_all("a", href=True)]
            return links
        except urllib.error.URLError as e:
            # Handle network errors (timeout, DNS failure, 404, etc.)
            print(f"Error fetching {url}: {e}")
            return []

    def save_results(self):
        #Save crawling results to JSON files.
        #Creates two output files:
          #1. crawler_with_found_links_new_.json: Full mapping of URLs to their links
          #2. crawler_only_urls_new.json: Simple list of visited URLs (simplified paths)
        with open("crawler_with_found_links_new_.json", "w") as f:
            json.dump(self.crawler_links, f, indent=4)
        print("Saved crawler_with_found_links_new_.json")
        with open("crawler_only_urls_new.json", "w") as f:
            json.dump(self.modified_urls, f, indent=4)
        print("Saved crawler_only_urls_new.json")

def crawl_and_save_results(url):
    #Convenience function to crawl a URL and save results in one call.
    crawler = SimpleCrawler(url)
    crawler.crawl()
    crawler.save_results()
    return ("crawler_with_found_links_new.json", "crawler_only_urls_new.json")

if __name__ == "__main__":
    print("Starting crawler for mchistory.org/research/articles...")
    
    # Crawl the McLean County Museum of History articles section
    crawl_and_save_results("https://mchistory.org/research/articles")
    
    print("Crawling complete!")

    #this is an adjusted version of the "SimpleCrawler-StarterNotebook.ipynb" that was shared in the class Drive folder