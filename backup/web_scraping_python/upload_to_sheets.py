import json
import os
import time
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials

class NewsSheetUploader:
    def __init__(self, credentials_file, spreadsheet_name):
        """Initialize Google Sheets connection"""
        self.credentials_file = credentials_file
        self.spreadsheet_name = spreadsheet_name
        self.gc = None
        self.worksheet = None
        self.setup_connection()
    
    def setup_connection(self):
        """Setup Google Sheets connection"""
        try:
            # Define the scope
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            
            # Load credentials
            creds = Credentials.from_service_account_file(
                self.credentials_file, 
                scopes=scope
            )
            
            # Connect to Google Sheets
            self.gc = gspread.authorize(creds)
            
            # Try to open existing spreadsheet or create new one
            try:
                spreadsheet = self.gc.open(self.spreadsheet_name)
                print(f"Connected to existing spreadsheet: {self.spreadsheet_name}")
            except gspread.SpreadsheetNotFound:
                spreadsheet = self.gc.create(self.spreadsheet_name)
                print(f"Created new spreadsheet: {self.spreadsheet_name}")
            
            # Get or create the main worksheet
            try:
                self.worksheet = spreadsheet.worksheet("News Articles")
            except gspread.WorksheetNotFound:
                self.worksheet = spreadsheet.add_worksheet(
                    title="News Articles", 
                    rows="1000", 
                    cols="10"
                )
                # Add headers
                headers = [
                    'ID', 'Source', 'Title', 'Summary', 'URL', 
                    'Publish Date', 'Authors', 'Upload Time', 'Image URL', 'Content Length'
                ]
                self.worksheet.append_row(headers)
                print("Added headers to new worksheet")
            
        except Exception as e:
            print(f"Error setting up Google Sheets: {e}")
            raise
    
    def upload_articles(self, json_file_path):
        """Upload articles from JSON file to Google Sheets"""
        try:
            print(f"Starting upload from: {json_file_path}")
            
            # Load the JSON data
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            articles = data.get('articles', [])
            
            if not articles:
                print("No articles found in the JSON file")
                return
            
            # Prepare data for batch upload
            rows_to_add = []
            upload_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            for article in articles:
                row = [
                    article.get('id', ''),
                    article.get('source', ''),
                    article.get('title', ''),
                    article.get('summary', ''),
                    article.get('url', ''),
                    article.get('publish_date', ''),
                    ', '.join(article.get('authors', [])),  # Convert list to string
                    upload_time,
                    article.get('top_image', ''),
                    article.get('original_content_length', '')
                ]
                rows_to_add.append(row)
            
            # Upload in batches to avoid rate limits
            batch_size = 10
            total_uploaded = 0
            
            for i in range(0, len(rows_to_add), batch_size):
                batch = rows_to_add[i:i + batch_size]
                
                try:
                    # Append the batch
                    self.worksheet.append_rows(batch)
                    total_uploaded += len(batch)
                    print(f"Uploaded batch: {len(batch)} articles (Total: {total_uploaded})")
                    
                    # Small delay to respect rate limits
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"Error uploading batch: {e}")
                    time.sleep(5)  # Longer delay on error
            
            print(f"Upload complete! Total articles uploaded: {total_uploaded}")
            
            # Get the spreadsheet URL for easy access
            spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{self.worksheet.spreadsheet.id}"
            print(f"Spreadsheet URL: {spreadsheet_url}")
            
        except Exception as e:
            print(f"Error uploading articles: {e}")
    
    def clear_old_data(self, days_to_keep=7):
        """Clear old articles (optional maintenance function)"""
        try:
            print(f"Clearing articles older than {days_to_keep} days...")
            
            # Get all records
            all_records = self.worksheet.get_all_records()
            
            # Filter records to keep (implement your logic here)
            # This is a basic example - you can customize based on your needs
            cutoff_date = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)
            
            rows_to_delete = []
            for i, record in enumerate(all_records, start=2):  # Start at 2 because row 1 is headers
                # Add your date filtering logic here if needed
                pass
            
            print("Cleanup complete")
            
        except Exception as e:
            print(f"Error during cleanup: {e}")

def upload_news_to_sheets():
    """Main function to upload news to Google Sheets"""
    
    # Configuration
    CREDENTIALS_FILE = "/path/to/credential.json"  # Update this path
    SPREADSHEET_NAME = "newsXpress-news"
    JSON_FILE = "summaries/all_articles_summary.json"
    
    # Check if files exist
    if not os.path.exists(CREDENTIALS_FILE):
        print("Google Sheets credentials file not found!")
        return
    
    if not os.path.exists(JSON_FILE):
        print(f"Summary file not found: {JSON_FILE}")
        return
    
    try:
        # Create uploader and upload articles
        uploader = NewsSheetUploader(CREDENTIALS_FILE, SPREADSHEET_NAME)
        uploader.upload_articles(JSON_FILE)
        
    except Exception as e:
        print(f"Upload failed: {e}")

if __name__ == "__main__":
    upload_news_to_sheets()
