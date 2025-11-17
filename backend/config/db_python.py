"""
Database connection helper for Python ML scripts
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load environment variables
load_dotenv()

def get_db_connection():
    """
    Create and return a PostgreSQL database connection
    Supports both DATABASE_URL and individual credentials
    Uses SSL for Supabase in production
    """
    try:
        # First try DATABASE_URL (Supabase/Heroku style)
        database_url = os.getenv('DATABASE_URL')
        
        if database_url:
            # Parse the DATABASE_URL
            result = urlparse(database_url)
            
            # Supabase requires SSL in production
            ssl_config = None
            if os.getenv('NODE_ENV') == 'production':
                ssl_config = {'sslmode': 'require'}
            
            connection = psycopg2.connect(
                host=result.hostname,
                port=result.port or 5432,
                database=result.path[1:],  # Remove leading slash
                user=result.username,
                password=result.password,
                sslmode='require' if os.getenv('NODE_ENV') == 'production' else 'prefer'
            )
        else:
            # Fall back to individual environment variables
            connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                sslmode='prefer'
            )
        
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def get_db_cursor(connection, dict_cursor=True):
    """
    Get a cursor from the connection
    """
    if dict_cursor:
        return connection.cursor(cursor_factory=RealDictCursor)
    return connection.cursor()
