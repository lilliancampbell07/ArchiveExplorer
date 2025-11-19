
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
            if url in self.visited:
                continue
            reduced_url = url.replace(self.root_url, "", 1) or "/"
            self.modified_urls.append(reduced_url)
            print(f"Crawling: {url}")
            self.crawler_links[url] = []
            self.visited.add(url)
            links = self.fetch_links(url)
            for link in links:
                # Check if link is from same host and within the articles section
                if urlparse(link).netloc == self.base_host:
                    # Include article pages and pagination
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
            print(f"Error fetching {url}: {e}")
            return []

    def save_results(self):
        with open("crawler_with_found_links_new_.json", "w") as f:
            json.dump(self.crawler_links, f, indent=4)
        print("Saved crawler_with_found_links_new.json")
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