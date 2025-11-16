"""
Flask API Server for ML Recommendations
Provides REST API endpoints for recommendation service
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from recommendation_service import get_recommendation_service
from cache_manager import get_cache_manager, cached

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config: dict = None):
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Configure CORS origins from environment variable or allow all in local
    allowed = os.getenv('ML_API_ALLOWED_ORIGINS')
    if allowed:
        origins = [o.strip() for o in allowed.split(',') if o.strip()]
        CORS(app, origins=origins)
        logger.info(f"CORS origins set: {origins}")
    else:
        # Default: allow all origins for ML subservice on dev setups
        CORS(app)

    # Initialize services lazily and attach to app for easy testing
    app.recommendation_service = get_recommendation_service()
    app.cache_manager = get_cache_manager()

    # Register routes using closures to access app services
    register_routes(app)

    return app


def register_routes(app):
    recommendation_service = app.recommendation_service
    cache_manager = app.cache_manager


# Create default app instance for running the server directly or for WSGI servers
app = create_app()

# Expose services at module level for route functions that reference them
recommendation_service = app.recommendation_service
cache_manager = app.cache_manager


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "NewsXpress ML Recommendation API",
        "models_loaded": recommendation_service.models_loaded,
        "cache_enabled": cache_manager.enabled
    })


@app.route('/api/recommendations/similar/<article_id>', methods=['GET'])
def get_similar_articles(article_id):
    """
    Get articles similar to the specified article
    Query params: top_n (default: 10)
    """
    try:
        top_n = int(request.args.get('top_n', 10))
        exclude_ids = request.args.getlist('exclude')
        
        # Check cache first
        cache_key = f"rec:similar:{article_id}:n={top_n}"
        cached_result = cache_manager.get(cache_key)
        
        if cached_result:
            logger.info(f"Cache hit for similar articles: {article_id}")
            return jsonify({
                "success": True,
                "article_id": article_id,
                "recommendations": cached_result,
                "from_cache": True
            })
        
        # Get recommendations
        recommendations = recommendation_service.get_similar_articles(
            article_id=article_id,
            top_n=top_n,
            exclude_ids=exclude_ids
        )
        
        # Cache for 30 minutes
        cache_manager.set(cache_key, recommendations, ttl_seconds=1800)
        
        return jsonify({
            "success": True,
            "article_id": article_id,
            "recommendations": recommendations,
            "from_cache": False
        })
        
    except Exception as e:
        logger.error(f"Error in get_similar_articles: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/recommendations/personalized/<user_id>', methods=['GET'])
def get_personalized_recommendations(user_id):
    """
    Get personalized recommendations for user
    Query params: top_n (default: 10), method (collaborative/hybrid)
    """
    try:
        top_n = int(request.args.get('top_n', 10))
        method = request.args.get('method', 'hybrid')  # collaborative, hybrid
        exclude_ids = request.args.getlist('exclude')
        
        # Check cache
        cache_key = f"rec:{method}:{user_id}:n={top_n}"
        cached_result = cache_manager.get(cache_key)
        
        if cached_result:
            logger.info(f"Cache hit for personalized recs: {user_id}")
            return jsonify({
                "success": True,
                "user_id": user_id,
                "method": method,
                "recommendations": cached_result,
                "from_cache": True
            })
        
        # Get recommendations based on method
        if method == 'collaborative':
            recommendations = recommendation_service.get_collaborative_recommendations(
                user_id=user_id,
                top_n=top_n,
                exclude_ids=exclude_ids
            )
        else:  # hybrid
            # Get recent articles from request body if provided
            recent_articles = request.json.get('recent_articles', []) if request.json else []
            recommendations = recommendation_service.get_hybrid_recommendations(
                user_id=user_id,
                recent_article_ids=recent_articles,
                top_n=top_n,
                exclude_ids=exclude_ids
            )
        
        # Cache for 15 minutes (shorter for personalized)
        cache_manager.set(cache_key, recommendations, ttl_seconds=900)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "method": method,
            "recommendations": recommendations,
            "from_cache": False
        })
        
    except Exception as e:
        logger.error(f"Error in get_personalized_recommendations: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/recommendations/trending', methods=['GET'])
def get_trending():
    """
    Get trending articles
    Query params: top_n (default: 10), days (default: 7)
    """
    try:
        top_n = int(request.args.get('top_n', 10))
        days = int(request.args.get('days', 7))
        
        # Check cache
        cache_key = f"rec:trending:n={top_n}:days={days}"
        cached_result = cache_manager.get(cache_key)
        
        if cached_result:
            return jsonify({
                "success": True,
                "recommendations": cached_result,
                "from_cache": True
            })
        
        recommendations = recommendation_service.get_trending_articles(
            top_n=top_n,
            time_window_days=days
        )
        
        # Cache for 5 minutes
        cache_manager.set(cache_key, recommendations, ttl_seconds=300)
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "from_cache": False
        })
        
    except Exception as e:
        logger.error(f"Error in get_trending: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear cache for specific user or article"""
    try:
        data = request.json
        user_id = data.get('user_id')
        article_id = data.get('article_id')
        
        if user_id:
            cache_manager.clear_user_cache(user_id)
            return jsonify({
                "success": True,
                "message": f"Cache cleared for user {user_id}"
            })
        
        if article_id:
            cache_manager.clear_article_cache(article_id)
            return jsonify({
                "success": True,
                "message": f"Cache cleared for article {article_id}"
            })
        
        return jsonify({
            "success": False,
            "error": "Please provide user_id or article_id"
        }), 400
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = cache_manager.get_cache_stats()
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/models/info', methods=['GET'])
def get_models_info():
    """Get information about loaded models"""
    try:
        metadata_path = Path(__file__).resolve().parent / 'models' / 'training_metadata.csv'
        
        info = {
            "models_loaded": recommendation_service.models_loaded,
            "content_based_available": recommendation_service.sig_matrix is not None,
            "collaborative_available": recommendation_service.user_sim_matrix is not None,
        }
        
        if metadata_path.exists():
            try:
                import pandas as pd
                metadata = pd.read_csv(metadata_path).iloc[0].to_dict()
                info.update(metadata)
            except Exception as e:
                logger.warning(f"Could not read models metadata: {e}")
        
        return jsonify({
            "success": True,
            "info": info
        })
        
    except Exception as e:
        logger.error(f"Error getting models info: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('ML_API_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting ML Recommendation API on port {port}")
    # Prefer a production WSGI server. If `waitress` is available, use it when not in debug.
    if not debug:
        try:
            from waitress import serve
            logger.info('Using waitress WSGI server')
            serve(app, host='0.0.0.0', port=port)
        except Exception:
            logger.info('waitress not available; falling back to Flask built-in server')
            app.run(host='0.0.0.0', port=port, debug=debug)
    else:
        app.run(host='0.0.0.0', port=port, debug=debug)
