"""
ML Model Training Script for NewsXpress
Trains content-based and collaborative filtering recommendation models
"""
import os
import sys
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import sigmoid_kernel, cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer
import pickle
from pathlib import Path
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = Path(__file__).resolve().parent
MODELS_DIR = ML_DIR / 'models'
DATA_DIR = ML_DIR / 'data'

# Create directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class ModelTrainer:
    def __init__(self):
        self.articles = None
        self.users = None
        self.tfv = None
        self.sig_matrix = None
        self.user_sim_matrix = None
        self.article_features = None
        self.indices = None
        
    def load_data_from_db(self):
        """Load data from PostgreSQL database"""
        try:
            # Import database connection
            sys.path.append(str(BASE_DIR))
            from config.db_python import get_db_connection
            
            conn = get_db_connection()
            
            # Load articles
            logger.info("Loading articles from database...")
            articles_query = """
                SELECT 
                    id::text,
                    title,
                    summary,
                    actors,
                    place,
                    topic,
                    published_at,
                    source_id::text
                FROM articles
                WHERE summary IS NOT NULL AND summary != ''
                ORDER BY published_at DESC
            """
            self.articles = pd.read_sql_query(articles_query, conn)
            logger.info(f"Loaded {len(self.articles)} articles")
            
            # Load user profiles
            logger.info("Loading user profiles from database...")
            users_query = """
                SELECT 
                    id::text as user_id,
                    auth_id::text,
                    actor,
                    place,
                    topic
                FROM profiles
                WHERE actor IS NOT NULL OR place IS NOT NULL OR topic IS NOT NULL
            """
            self.users = pd.read_sql_query(users_query, conn)
            logger.info(f"Loaded {len(self.users)} user profiles")
            
            conn.close()
            
            # Save to CSV for backup
            self.articles.to_csv(DATA_DIR / 'articles_export.csv', index=False)
            self.users.to_csv(DATA_DIR / 'users_export.csv', index=False)
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading data from database: {e}")
            logger.info("Attempting to load from CSV files...")
            return self.load_data_from_csv()
    
    def load_data_from_csv(self):
        """Fallback: Load data from CSV files"""
        try:
            articles_path = DATA_DIR / 'articles_export.csv'
            users_path = DATA_DIR / 'users_export.csv'
            
            if articles_path.exists():
                self.articles = pd.read_csv(articles_path)
                logger.info(f"Loaded {len(self.articles)} articles from CSV")
            else:
                logger.error("No articles CSV found")
                return False
                
            if users_path.exists():
                self.users = pd.read_csv(users_path)
                logger.info(f"Loaded {len(self.users)} users from CSV")
            else:
                logger.warning("No users CSV found, skipping collaborative filtering")
                
            return True
            
        except Exception as e:
            logger.error(f"Error loading data from CSV: {e}")
            return False
    
    def train_content_based_model(self):
        """Train content-based recommendation model using TF-IDF"""
        logger.info("=" * 60)
        logger.info("Training Content-Based Recommendation Model")
        logger.info("=" * 60)
        
        try:
            # Prepare text data
            self.articles['summary'] = self.articles['summary'].fillna('')
            self.articles['combined_text'] = (
                self.articles['title'].fillna('') + ' ' + 
                self.articles['summary'].fillna('') + ' ' +
                self.articles['topic'].fillna('')
            )
            
            # Train TF-IDF vectorizer
            logger.info("Training TF-IDF vectorizer...")
            self.tfv = TfidfVectorizer(
                min_df=2,
                max_features=5000,
                strip_accents='unicode',
                analyzer='word',
                token_pattern=r'\w{1,}',
                ngram_range=(1, 3),
                stop_words='english'
            )
            
            tfv_matrix = self.tfv.fit_transform(self.articles['combined_text'])
            logger.info(f"TF-IDF matrix shape: {tfv_matrix.shape}")
            
            # Compute similarity matrix
            logger.info("Computing sigmoid kernel similarity matrix...")
            self.sig_matrix = sigmoid_kernel(tfv_matrix, tfv_matrix)
            logger.info(f"Similarity matrix shape: {self.sig_matrix.shape}")
            
            # Create article index mapping
            self.indices = pd.Series(
                self.articles.index, 
                index=self.articles['id']
            ).drop_duplicates()
            
            # Save models
            logger.info("Saving content-based models...")
            with open(MODELS_DIR / 'tfidf_vectorizer.pkl', 'wb') as f:
                pickle.dump(self.tfv, f)
            
            with open(MODELS_DIR / 'sigmoid_matrix.pkl', 'wb') as f:
                pickle.dump(self.sig_matrix, f)
            
            with open(MODELS_DIR / 'article_indices.pkl', 'wb') as f:
                pickle.dump(self.indices, f)
            
            # Save article metadata
            article_metadata = self.articles[['id', 'title', 'topic', 'place', 'published_at']]
            article_metadata.to_csv(MODELS_DIR / 'article_metadata.csv', index=False)
            
            logger.info("Content-based model trained and saved successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Error training content-based model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def train_collaborative_model(self):
        """Train collaborative filtering model"""
        logger.info("=" * 60)
        logger.info("Training Collaborative Filtering Model")
        logger.info("=" * 60)
        
        if self.users is None or len(self.users) == 0:
            logger.warning("No user data available, skipping collaborative filtering")
            return False
        
        try:
            # Clean and process user preferences
            logger.info("Processing user preferences...")
            
            def clean_array_column(col):
                """Clean PostgreSQL array columns"""
                # Handle None/NaN
                if col is None or (isinstance(col, float) and pd.isna(col)):
                    return []
                
                # Already a list
                if isinstance(col, list):
                    return [str(item).strip().lower() for item in col if str(item).strip()]
                
                # NumPy array
                if hasattr(col, '__iter__') and not isinstance(col, str):
                    return [str(item).strip().lower() for item in col if str(item).strip()]
                
                # String representation
                if isinstance(col, str):
                    # Remove brackets and quotes
                    col = col.strip('{}[]"')
                    if not col:
                        return []
                    return [item.strip().lower() for item in col.split(',') if item.strip()]
                
                return []
            
            self.users['actor_list'] = self.users['actor'].apply(clean_array_column)
            self.users['place_list'] = self.users['place'].apply(
                lambda x: [str(x).strip().lower()] if pd.notna(x) and str(x).strip() else []
            )
            self.users['topic_list'] = self.users['topic'].apply(
                lambda x: [str(x).strip().lower()] if pd.notna(x) and str(x).strip() else []
            )
            
            # Combine all preferences
            self.users['combined_preferences'] = (
                self.users['actor_list'] + 
                self.users['place_list'] + 
                self.users['topic_list']
            )
            
            # Filter users with preferences
            users_with_prefs = self.users[
                self.users['combined_preferences'].apply(len) > 0
            ].copy()
            
            if len(users_with_prefs) == 0:
                logger.warning(" No users with valid preferences")
                return False
            
            logger.info(f"Found {len(users_with_prefs)} users with preferences")
            
            # Encode preferences using MultiLabelBinarizer
            logger.info("Encoding user preferences...")
            mlb = MultiLabelBinarizer()
            user_features = pd.DataFrame(
                mlb.fit_transform(users_with_prefs['combined_preferences']),
                index=users_with_prefs['user_id'],
                columns=mlb.classes_
            )
            
            logger.info(f"User feature matrix shape: {user_features.shape}")
            
            # Compute user-to-user similarity
            logger.info("Computing user similarity matrix...")
            self.user_sim_matrix = pd.DataFrame(
                cosine_similarity(user_features),
                index=user_features.index,
                columns=user_features.index
            )
            
            logger.info(f"User similarity matrix shape: {self.user_sim_matrix.shape}")
            
            # Encode article features
            logger.info("Encoding article features...")
            self.articles['article_actors'] = self.articles['actors'].apply(clean_array_column)
            self.articles['article_place'] = self.articles['place'].apply(
                lambda x: [str(x).strip().lower()] if pd.notna(x) and str(x).strip() else []
            )
            self.articles['article_topic'] = self.articles['topic'].apply(
                lambda x: [str(x).strip().lower()] if pd.notna(x) and str(x).strip() else []
            )
            
            self.articles['article_features'] = (
                self.articles['article_actors'] + 
                self.articles['article_place'] + 
                self.articles['article_topic']
            )
            
            # Create article feature matrix using the same encoder
            article_features = pd.DataFrame(
                mlb.transform(self.articles['article_features']),
                index=self.articles['id'],
                columns=mlb.classes_
            )
            
            logger.info(f"Article feature matrix shape: {article_features.shape}")
            
            # Save models
            logger.info("Saving collaborative filtering models...")
            with open(MODELS_DIR / 'user_similarity_matrix.pkl', 'wb') as f:
                pickle.dump(self.user_sim_matrix, f)
            
            with open(MODELS_DIR / 'user_features.pkl', 'wb') as f:
                pickle.dump(user_features, f)
            
            with open(MODELS_DIR / 'article_features.pkl', 'wb') as f:
                pickle.dump(article_features, f)
            
            with open(MODELS_DIR / 'mlb_encoder.pkl', 'wb') as f:
                pickle.dump(mlb, f)
            
            logger.info("Collaborative filtering model trained and saved successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Error training collaborative model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def save_metadata(self):
        """Save training metadata"""
        metadata = {
            'trained_at': datetime.now().isoformat(),
            'num_articles': len(self.articles) if self.articles is not None else 0,
            'num_users': len(self.users) if self.users is not None else 0,
            'content_based_trained': os.path.exists(MODELS_DIR / 'tfidf_vectorizer.pkl'),
            'collaborative_trained': os.path.exists(MODELS_DIR / 'user_similarity_matrix.pkl'),
        }
        
        metadata_df = pd.DataFrame([metadata])
        metadata_df.to_csv(MODELS_DIR / 'training_metadata.csv', index=False)
        logger.info(f"Training metadata saved: {metadata}")
    
    def train_all(self):
        """Train all models"""
        logger.info(" Starting ML Model Training Pipeline")
        logger.info(f"Models will be saved to: {MODELS_DIR}")
        
        # Load data
        if not self.load_data_from_db():
            logger.error("Failed to load data. Exiting.")
            return False
        
        # Train content-based model
        content_success = self.train_content_based_model()
        
        # Train collaborative model
        collab_success = self.train_collaborative_model()
        
        # Save metadata
        self.save_metadata()
        
        logger.info("=" * 60)
        if content_success or collab_success:
            logger.info("🎉 Training completed successfully!")
            logger.info(f"   Content-Based Model: {'✅' if content_success else '❌'}")
            logger.info(f"   Collaborative Model: {'✅' if collab_success else '❌'}")
            return True
        else:
            logger.error("Training failed")
            return False


def main():
    """Main training function"""
    trainer = ModelTrainer()
    success = trainer.train_all()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
