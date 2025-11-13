"""
Recommendation Service for NewsXpress
Provides content-based, collaborative, and hybrid recommendations
"""
import os
import sys
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = Path(__file__).resolve().parent
MODELS_DIR = ML_DIR / 'models'

class RecommendationService:
    def __init__(self):
        self.models_loaded = False
        self.tfv = None
        self.sig_matrix = None
        self.indices = None
        self.user_sim_matrix = None
        self.user_features = None
        self.article_features = None
        self.article_metadata = None
        self.mlb = None
        
    def load_models(self):
        """Load pre-trained models from disk"""
        try:
            logger.info("Loading recommendation models...")
            
            # Load content-based models
            if (MODELS_DIR / 'tfidf_vectorizer.pkl').exists():
                with open(MODELS_DIR / 'tfidf_vectorizer.pkl', 'rb') as f:
                    self.tfv = pickle.load(f)
                
                with open(MODELS_DIR / 'sigmoid_matrix.pkl', 'rb') as f:
                    self.sig_matrix = pickle.load(f)
                
                with open(MODELS_DIR / 'article_indices.pkl', 'rb') as f:
                    self.indices = pickle.load(f)
                
                self.article_metadata = pd.read_csv(MODELS_DIR / 'article_metadata.csv')
                logger.info("Content-based models loaded")
            else:
                logger.warning("Content-based models not found")
            
            # Load collaborative filtering models
            if (MODELS_DIR / 'user_similarity_matrix.pkl').exists():
                with open(MODELS_DIR / 'user_similarity_matrix.pkl', 'rb') as f:
                    self.user_sim_matrix = pickle.load(f)
                
                with open(MODELS_DIR / 'user_features.pkl', 'rb') as f:
                    self.user_features = pickle.load(f)
                
                with open(MODELS_DIR / 'article_features.pkl', 'rb') as f:
                    self.article_features = pickle.load(f)
                
                with open(MODELS_DIR / 'mlb_encoder.pkl', 'rb') as f:
                    self.mlb = pickle.load(f)
                
                logger.info(" Collaborative filtering models loaded")
            else:
                logger.warning("⚠️  Collaborative filtering models not found")
            
            self.models_loaded = True
            logger.info("All models loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            return False
    
    def get_similar_articles(self, article_id, top_n=10, exclude_ids=None):
        """
        Get articles similar to the given article (Content-Based)
        
        Args:
            article_id: ID of the article
            top_n: Number of recommendations to return
            exclude_ids: List of article IDs to exclude (e.g., already read)
        
        Returns:
            List of recommended article dictionaries
        """
        if not self.models_loaded:
            self.load_models()
        
        if self.sig_matrix is None or self.indices is None:
            logger.error("Content-based models not available")
            return []
        
        try:
            # Get article index
            if article_id not in self.indices.index:
                logger.warning(f"Article {article_id} not found in index")
                return []
            
            idx = self.indices[article_id]
            
            # Get similarity scores
            sig_scores = list(enumerate(self.sig_matrix[idx]))
            sig_scores = sorted(sig_scores, key=lambda x: x[1], reverse=True)
            
            # Filter out the article itself and excluded articles
            recommendations = []
            for i, score in sig_scores[1:]:  # Skip first (itself)
                article_id_rec = self.article_metadata.iloc[i]['id']
                
                # Skip if in exclude list
                if exclude_ids and article_id_rec in exclude_ids:
                    continue
                
                article_info = self.article_metadata.iloc[i].to_dict()
                article_info['similarity_score'] = float(score)
                recommendations.append(article_info)
                
                if len(recommendations) >= top_n:
                    break
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting similar articles: {e}")
            return []

    def get_collaborative_recommendations(self, user_id, top_k=5, top_n=10, exclude_ids=None):
        """
        Get personalized recommendations based on similar users (Collaborative Filtering)
        
        Args:
            user_id: ID of the user
            top_k: Number of similar users to consider
            top_n: Number of recommendations to return
            exclude_ids: List of article IDs to exclude
        
        Returns:
            List of recommended article dictionaries
        """
        if not self.models_loaded:
            self.load_models()
        
        if self.user_sim_matrix is None or self.article_features is None:
            logger.error("Collaborative filtering models not available")
            return []
        
        try:
            # Check if user exists
            if user_id not in self.user_sim_matrix.index:
                logger.warning(f"User {user_id} not found in similarity matrix")
                return []
            
            # Get top-K similar users
            similar_users = (
                self.user_sim_matrix.loc[user_id]
                .drop(user_id, errors='ignore')
                .sort_values(ascending=False)
                .head(top_k)
            )
            
            if len(similar_users) == 0:
                logger.warning(f"No similar users found for {user_id}")
                return []
            
            # Aggregate preferences from similar users
            agg_profile = np.zeros(self.article_features.shape[1])
            for sim_user, sim_score in similar_users.items():
                if sim_user in self.user_features.index:
                    agg_profile += sim_score * self.user_features.loc[sim_user].values
            
            # Normalize
            if np.linalg.norm(agg_profile) > 0:
                agg_profile = agg_profile / np.linalg.norm(agg_profile)
            
            # Score all articles
            scores = self.article_features.dot(agg_profile)
            top_article_ids = scores.sort_values(ascending=False).head(top_n * 3).index
            
            # Get article details and filter
            recommendations = []
            for article_id in top_article_ids:
                if exclude_ids and article_id in exclude_ids:
                    continue
                
                article_row = self.article_metadata[
                    self.article_metadata['id'] == article_id
                ]
                
                if not article_row.empty:
                    article_info = article_row.iloc[0].to_dict()
                    article_info['relevance_score'] = float(scores[article_id])
                    recommendations.append(article_info)
                
                if len(recommendations) >= top_n:
                    break
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting collaborative recommendations: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def get_hybrid_recommendations(self, user_id, recent_article_ids=None, 
                                   alpha=0.6, beta=0.4, top_n=10, exclude_ids=None):
        """
        Get hybrid recommendations combining collaborative and content-based
        
        Args:
            user_id: ID of the user
            recent_article_ids: List of recently read article IDs
            alpha: Weight for collaborative filtering (0-1)
            beta: Weight for content-based (0-1, should equal 1-alpha)
            top_n: Number of recommendations to return
            exclude_ids: List of article IDs to exclude
        
        Returns:
            List of recommended article dictionaries
        """
        if not self.models_loaded:
            self.load_models()
        
        recommendations = {}
        
        # Get collaborative recommendations
        collab_recs = self.get_collaborative_recommendations(
            user_id, top_n=top_n*2, exclude_ids=exclude_ids
        )
        
        for rec in collab_recs:
            article_id = rec['id']
            recommendations[article_id] = {
                **rec,
                'hybrid_score': alpha * rec.get('relevance_score', 0)
            }
        
        # Get content-based recommendations from recent articles
        if recent_article_ids and self.sig_matrix is not None:
            for article_id in recent_article_ids[:3]:  # Use up to 3 recent articles
                content_recs = self.get_similar_articles(
                    article_id, top_n=top_n, exclude_ids=exclude_ids
                )
                
                for rec in content_recs:
                    rec_id = rec['id']
                    if rec_id in recommendations:
                        # Combine scores
                        recommendations[rec_id]['hybrid_score'] += (
                            beta * rec.get('similarity_score', 0)
                        )
                    else:
                        recommendations[rec_id] = {
                            **rec,
                            'hybrid_score': beta * rec.get('similarity_score', 0)
                        }
        
        # Sort by hybrid score
        sorted_recs = sorted(
            recommendations.values(),
            key=lambda x: x['hybrid_score'],
            reverse=True
        )
        
        return sorted_recs[:top_n]
    
    def get_trending_articles(self, top_n=10, time_window_days=7):
        """
        Get trending articles (fallback for cold start)
        
        Args:
            top_n: Number of articles to return
            time_window_days: Consider articles from last N days
        
        Returns:
            List of article dictionaries
        """
        try:
            # This would typically query the database for view counts
            # For now, return most recent articles
            if self.article_metadata is not None:
                recent = self.article_metadata.copy()
                recent['published_at'] = pd.to_datetime(recent['published_at'])
                
                cutoff_date = datetime.now() - timedelta(days=time_window_days)
                recent = recent[recent['published_at'] >= cutoff_date]
                recent = recent.sort_values('published_at', ascending=False)
                
                return recent.head(top_n).to_dict('records')
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting trending articles: {e}")
            return []


# Singleton instance
_recommendation_service = None

def get_recommendation_service():
    """Get or create recommendation service instance"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
        _recommendation_service.load_models()
    return _recommendation_service


# Example usage
if __name__ == '__main__':
    service = get_recommendation_service()
    
    # Test similar articles
    print("\n=== Testing Similar Articles ===")
    similar = service.get_similar_articles('some-article-id', top_n=5)
    print(f"Found {len(similar)} similar articles")
    
    # Test collaborative recommendations
    print("\n=== Testing Collaborative Recommendations ===")
    collab = service.get_collaborative_recommendations('some-user-id', top_n=5)
    print(f"Found {len(collab)} collaborative recommendations")
