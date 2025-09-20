import threading
import queue 
import time
import os
from fetch_news import fetch_news_articles
from summarize_news import summarize_news, remove_local_files
from upload_to_sheets import upload_news_to_sheets

def setup_directories():
    """Create necessary directories"""
    os.makedirs("news_articles", exist_ok=True)
    os.makedirs("summaries", exist_ok=True)
    print("Directories setup complete")

def print_status(news_queue, start_time):
    """Print periodic status updates"""
    while True:
        try:
            current_queue_size = news_queue.qsize()
            elapsed_time = time.time() - start_time
            print(f"Status - Queue size: {current_queue_size}, Elapsed: {elapsed_time:.1f}s")
            time.sleep(30)  # Update every 30 seconds
        except:
            break

def main():
    """Main function to coordinate news fetching, summarization, and uploading"""
    
    print("🚀 Starting NewsXpress Backend...")
    print("=" * 50)
    
    # Setup
    setup_directories()
    start_time = time.time()
    
    # Create a queue with reasonable size limit
    news_queue = queue.Queue(maxsize=50)
    
    # Configuration
    MAX_ARTICLES_PER_SOURCE = 10  # Reduced for faster processing
    UPLOAD_TO_SHEETS = True  # Set to False to skip Google Sheets upload
    
    print(f"Configuration:")
    print(f"   - Max articles per source: {MAX_ARTICLES_PER_SOURCE}")
    print(f"   - Queue max size: {news_queue.maxsize}")
    print(f"   - Upload to Google Sheets: {UPLOAD_TO_SHEETS}")
    print("=" * 50)
    
    # Create threads
    fetcher_thread = threading.Thread(
        target=fetch_news_articles, 
        args=(news_queue, MAX_ARTICLES_PER_SOURCE),
        name="NewsXpress-Fetcher"
    )
    
    summarizer_thread = threading.Thread(
        target=summarize_news, 
        args=(news_queue,),
        name="NewsXpress-Summarizer"
    )
    
    # Optional: Status monitoring thread
    status_thread = threading.Thread(
        target=print_status,
        args=(news_queue, start_time),
        name="NewsXpress-Monitor",
        daemon=True  # Dies when main program exits
    )
    
    try:
        print("starting threads...")
        
        # Start fetcher first
        fetcher_thread.start()
        print(f"Started: {fetcher_thread.name}")
        
        # Small delay then start summarizer
        time.sleep(2)
        summarizer_thread.start()
        print(f"Started: {summarizer_thread.name}")
        
        # Start status monitor
        status_thread.start()
        print(f"Started: {status_thread.name}")
        
        print("=" * 50)
        print("Processing in progress... (Check status updates above)")
        print("=" * 50)
        
        # Wait for fetcher to complete
        fetcher_thread.join()
        print("News fetching completed")
        
        # Wait for summarizer to complete
        summarizer_thread.join()
        print("News summarization completed")
        
        # Upload to Google Sheets if enabled
        if UPLOAD_TO_SHEETS:
            print("=" * 50)
            print("Starting Google Sheets upload...")
            try:
                upload_news_to_sheets()
                print("Google Sheets upload completed")
            except Exception as e:
                print(f"Google Sheets upload failed: {e}")
                print("The local files are still available in the summaries folder")
        
        # Calculate total time
        total_time = time.time() - start_time
        
        print("=" * 50)
        print("NewsXpress Backend Complete!")
        print(f"Total processing time: {total_time:.2f} seconds")
        print("Check the 'summaries' folder for local results")
        if UPLOAD_TO_SHEETS: 
            try:
                upload_news_to_sheets()
                print("Google Sheets upload completed")
                print("Articles also uploaded to Google Sheets")
                remove_local_files();
            except Exception as e:
                print(f"Google Sheets upload failed: {e}")
                print("The local files are still available in the summaries folder")
        print("=" * 50)
        
    except KeyboardInterrupt:
        print("\nInterrupted by user. Cleaning up...")
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        
    finally:
        # Ensure clean shutdown
        if fetcher_thread.is_alive():
            print("Waiting for fetcher to finish...")
            fetcher_thread.join(timeout=30)
            
        if summarizer_thread.is_alive():
            print("Waiting for summarizer to finish...")
            summarizer_thread.join(timeout=30)
        
        print("Cleanup complete")

if __name__ == "__main__":
    main()
