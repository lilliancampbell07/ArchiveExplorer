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
        while not self.to_visit.empty():
            url = self.to_visit.get()
            #Skip if URL has already been crawled (shouldn't happen, safety check)
            if url in self.visited:
                continue
            reduced_url = url.replace(self.root_url, "", 1) or "/"
            self.modified_urls.append(reduced_url)
            print(f"Crawling: {url}")
            #Empty list to store links found on page
            self.crawler_links[url] = []
            self.visited.add(url) #marks URL as visited to prevent crawling it again
            links = self.fetch_links(url)
            for link in links:
                if urlparse(link).netloc == self.base_host:
                    if link.startswith(self.root_url):
                        self.crawler_links[url].append(link)
                        print(f"  Found relevant link: {link}")
                        if link not in self.visited:
                            self.to_visit.put(link)

    def fetch_links(self, url):
        try:
            response = urllib.request.urlopen(url)
            if response.info().get_content_type() != "text/html":
                return []
            html_content = response.read().decode("utf-8")
            soup = BeautifulSoup(html_content, "html.parser")
            links = [urljoin(url, a.get("href")) for a in soup.find_all("a", href=True)]
            return links
        except urllib.error.URLError as e:
            print(f"Error fetching {url}: {e}") #handles network errors 
            return []

    def save_results(self):
        #Creates two output files: one with found links, one with simplified URLs
        with open("crawler_with_found_links_new_.json", "w") as f:
            json.dump(self.crawler_links, f, indent=4)
        print("Saved crawler_with_found_links_new_.json")
        with open("crawler_only_urls_new.json", "w") as f:
            json.dump(self.modified_urls, f, indent=4)
        print("Saved crawler_only_urls_new.json")

def crawl_and_save_results(url):
    crawler = SimpleCrawler(url)
    crawler.crawl()
    crawler.save_results()
    return ("crawler_with_found_links_new.json", "crawler_only_urls_new.json")

if __name__ == "__main__":
    print("Starting crawler for mchistory.org/research/articles...")
    crawl_and_save_results("https://mchistory.org/research/articles")
    print("Crawling complete!")
    #this is an adjusted version of the "SimpleCrawler-StarterNotebook.ipynb" that was shared in the class Drive folder