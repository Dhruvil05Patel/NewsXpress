import os
import json
import time
from langchain_community.llms import Ollama
from langchain.prompts import ChatPromptTemplate

ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# Initialize Ollama with better parameters
llm = Ollama(
    model="gemma3:1b",  # Using 2b for better quality
    base_url=ollama_host, 
    temperature=0.3,  # Lower temperature for more consistent summaries
    num_predict=700,  # Limit response length
    top_p=0.9
)

# Improved prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert news summarizer. Your task is to create concise, informative summaries.

RULES:
- Write exactly 5-7 sentences
- Focus on WHO, WHAT, WHEN, WHERE, WHY
- Use clear, simple language
- Avoid phrases like "the article states" or "according to the report"
- Start directly with the main news
- Return only the summary text, no JSON format
- Do not add anything else in this. Just the summary.

Example: "Tesla announced quarterly earnings showing 20% growth in vehicle deliveries. The company reported $23.4 billion in revenue, beating analyst expectations. CEO Elon Musk attributed success to improved manufacturing efficiency and strong demand in Asian markets."
"""),
    
    ("human", "Summarize this news article:\n\nTitle: {title}\nSource: {source}\nContent: {content}")
])

def clean_summary(summary_text):
    """Clean and format the summary text"""
    # Remove common unwanted phrases
    unwanted_phrases = [
        "the article", "the report", "according to", "the news", 
        "it is reported", "sources say", "the story", "Here’s a summary of article: "
    ]
    
    cleaned = summary_text.strip()
    
    # Remove unwanted phrases (case insensitive)
    for phrase in unwanted_phrases:
        cleaned = cleaned.replace(phrase.title(), "").replace(phrase.lower(), "").replace(phrase.upper(), "")
    
    # Clean up extra spaces and newlines
    cleaned = " ".join(cleaned.split())
    
    # Ensure it ends with proper punctuation
    if cleaned and not cleaned.endswith(('.', '!', '?')):
        cleaned += '.'
    
    return cleaned

def summarize_single_article(filename, output_counter):
    """Summarize a single article"""
    try:
        print(f"Processing: {filename}")
        
        with open(filename, "r", encoding="utf-8") as f:
            article_data = json.load(f)
        
        content = article_data.get('content', '')
        title = article_data.get('title', 'No Title')
        source = article_data.get('source', 'Unknown')
        
        # Skip if content is too short
        if len(content.strip()) < 300:
            return None
        
        # Generate summary
        final_prompt = prompt.format(
            title=title,
            source=source,
            content=content
        )
        
        result = llm.invoke(final_prompt)
        
        # Clean the summary
        cleaned_summary = clean_summary(result)
        
        if not cleaned_summary:
            return None
        
        # Prepare final article data with summary
        summarized_article = {
            'id': output_counter,
            'source': source,
            'title': title,
            'url': article_data.get('url', ''),
            'summary': cleaned_summary,
            'publish_date': article_data.get('publish_date'),
            'authors': article_data.get('authors', []),
            'top_image': article_data.get('top_image', ''),
            'original_content_length': len(content)
        }
        
        # Save summarized article
        os.makedirs("summaries", exist_ok=True)
        summary_filename = f"summaries/article_{output_counter:03d}_{source.lower()}.json"
        
        with open(summary_filename, "w", encoding="utf-8") as f:
            json.dump(summarized_article, f, indent=2, ensure_ascii=False)
        
        
        return summarized_article
        
    except Exception as e:
        return None

def summarize_news(news_queue):
    """Summarize news articles from the queue"""
    
    output_counter = 101
    processed_articles = []
    
    
    while True:
        try:
            # Get filename from queue (blocking)
            filename = news_queue.get(timeout=300)  # 5 minute timeout
            
            if filename is None:
                break
            
            # Process the article
            summarized = summarize_single_article(filename, output_counter)
            
            if summarized:
                processed_articles.append(summarized)
                output_counter += 1
            
            # Mark task as done
            news_queue.task_done()
            
            # Small delay to prevent overwhelming the LLM
            time.sleep(1)
            
        except Exception as e:
            break
    
    # Save final consolidated file
    if processed_articles:
        final_output = {
            'total_articles': len(processed_articles),
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'articles': processed_articles
        }
        
        with open("summaries/all_articles_summary.json", "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=2, ensure_ascii=False)
        
        print(f"Final summary saved to: summaries/all_articles_summary.json")
    else:
        print("No articles were successfully summarized")
        

def remove_local_files():
    folder = './summaries'
    files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
    for f in files:
        os.remove(os.path.join(folder, f))
    
