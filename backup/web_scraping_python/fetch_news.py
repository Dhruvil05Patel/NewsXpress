import newspaper
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import regex as re
import os

# News sources configuration
NEWS_SOURCES = [
    {
        'name': 'CNN',
        'url': 'http://www.cnn.com',
        'pattern': r"^https?:\/\/(www\.)?([a-z]+\.)?cnn\.com\/\d{4}\/\d{2}\/\d{2}\/(?!.*\/video\/).*"
    },
    {
        'name': 'BBC',
        'url': 'http://www.bbc.com/news',
        'pattern': r"^https?:\/\/(www\.)?bbc\.com\/news\/.*"
    },
    {
        'name': 'Reuters',
        'url': 'http://www.reuters.com',
        'pattern': r"^https?:\/\/(www\.)?reuters\.com\/.*"
    },
    {
        'name': 'Guardian',
        'url': 'http://www.theguardian.com',
        'pattern': r"^https?:\/\/(www\.)?theguardian\.com\/.*"
    }
]

def fetch_from_source(source, news_queue, articles_per_source=5):
    """Fetch articles from a single news source"""
    try:
        
        # Build newspaper for the source
        paper = newspaper.build(source['url'], memoize_articles=False)
        
        article_list = []
        
        # Filter articles based on URL pattern
        for article in paper.articles:
            if len(article_list) >= articles_per_source:
                break
            
            if re.match(pattern=source['pattern'], string=article.url):
                article_list.append(article)
                
        # Process each article
        for i, article in enumerate(article_list, start=100):
            try:                
                article.download()
                article.parse()
                
                if not article.text or len(article.text.strip()) < 400:
                    continue
                
                # Create article data
                article_data = {
                    'source': source['name'],
                    'title': article.title,
                    'url': article.url,
                    'content': article.text,
                    'publish_date': str(article.publish_date) if article.publish_date else None,
                    'authors': article.authors,
                    'top_image': article.top_image
                }
                
                # Save to file and add to queue
                os.makedirs("news_articles", exist_ok=True)
                filename = f"news_articles/{source['name'].lower()}_article_{i}.json"
                
                with open(filename, "w", encoding='utf-8') as f:
                    json.dump(article_data, f, indent=2, ensure_ascii=False)
                
                news_queue.put(filename)
                print(f"Saved: {filename}")
                
                # Small delay to be respectful to the website
                time.sleep(2)
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error fetching from {source['name']}: {e}")

def fetch_news_articles(news_queue, max_articles_per_source=5):
    """Fetch news articles from multiple sources concurrently"""
    
    # Create news_articles directory
    os.makedirs("news_articles", exist_ok=True)
    
    # Using multithreading to fetch from multiple sources concurrently
    with ThreadPoolExecutor(max_workers=len(NEWS_SOURCES)) as executor:
        # Submit tasks for each news source
        futures = []
        for source in NEWS_SOURCES:
            future = executor.submit(fetch_from_source, source, news_queue, max_articles_per_source)
            futures.append(future)
        
        # Wait for all sources to complete
        for future in futures:
            try:
                future.result()  # This will raise any exceptions that occurred
            except Exception as e:
                print(f"Source fetch failed: {e}")
    
    # Signal that fetching is complete
    news_queue.put(None)
    print("All news sources processed")
