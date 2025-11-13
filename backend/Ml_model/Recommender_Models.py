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
    