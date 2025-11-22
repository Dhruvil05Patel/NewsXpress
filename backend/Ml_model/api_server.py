"""
Flask API Server for ML Recommendations
Provides REST API endpoints for personalized recommendation service
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from Recommender_Models import get_recommendation_service
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
    from flask import current_app
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        svc = current_app.recommendation_service
        cache = current_app.cache_manager
        return jsonify({
            "status": "healthy",
            "service": "NewsXpress ML Recommendation API",
            "models_loaded": svc.models_loaded,
            "cache_enabled": cache.enabled
        })


    # Unified recommendations endpoint - supports all methods
    @app.route('/api/recommendations', methods=['GET', 'POST'])
    def get_recommendations():
        try:
            svc = current_app.recommendation_service
            cache = current_app.cache_manager
            
            # Parse params from GET or POST
            if request.method == 'POST':
                params = request.json or {}
            else:
                params = request.args.to_dict()
                params['exclude'] = request.args.getlist('exclude')
            
            user_id = params.get('user_id')
            article_id = params.get('article_id')
            method = params.get('method', 'hybrid')
            top_n = int(params.get('top_n', 10))
            exclude_ids = params.get('exclude', [])
            
            # Build cache key
            cache_key = f"rec:{method}:u={user_id}:a={article_id}:n={top_n}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                logger.info(f"Cache hit: {cache_key}")
                return jsonify({
                    "success": True,
                    "recommendations": cached_result,
                    "method": method,
                    "from_cache": True
                })
            
            # Route to appropriate method
            if method == 'content' and article_id:
                recommendations = svc.get_similar_articles(
                    article_id=article_id,
                    top_n=top_n,
                    exclude_ids=exclude_ids
                )
            elif method == 'collaborative' and user_id:
                recommendations = svc.get_collaborative_recommendations(
                    user_id=user_id,
                    top_n=top_n,
                    exclude_ids=exclude_ids
                )
            elif method == 'hybrid' and user_id:
                recent_articles = params.get('recent_articles', [])
                recommendations = svc.get_hybrid_recommendations(
                    user_id=user_id,
                    recent_article_ids=recent_articles,
                    top_n=top_n,
                    exclude_ids=exclude_ids
                )
            elif method == 'trending':
                recommendations = svc.get_trending_articles(
                    top_n=top_n,
                    time_window_days=int(params.get('days', 7))
                )
            else:
                # Fallback to trending if invalid params
                logger.warning(f"Invalid method/params: {method}, user_id={user_id}, article_id={article_id}")
                recommendations = svc.get_trending_articles(top_n=top_n)
            
            # Cache with appropriate TTL
            ttl = 900 if user_id else 1800  # 15 min for personalized, 30 min for others
            cache.set(cache_key, recommendations, ttl_seconds=ttl)
            
            return jsonify({
                "success": True,
                "recommendations": recommendations,
                "method": method,
                "from_cache": False
            })
            
        except Exception as e:
            logger.error(f"Error in get_recommendations: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": str(e),
                "message": "Failed to fetch recommendations"
            }), 500

    @app.route('/api/recommendations/similar/<article_id>', methods=['GET'])
    def get_similar_articles(article_id):
        return get_recommendations()




    @app.route('/api/recommendations/personalized/<user_id>', methods=['GET', 'POST'])
    def get_personalized_recommendations_legacy(user_id):
        return get_recommendations()

    @app.route('/api/track', methods=['POST'])
    def track_activity():
        try:
            data = request.json
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            # Validate required fields
            if 'article_id' not in data or 'activity_type' not in data:
                return jsonify({
                    "success": False,
                    "error": "Missing required fields: article_id, activity_type"
                }), 400
            
            # Log activity (eventually to DB, for now to JSON log)
            activity_log_path = Path(__file__).resolve().parent / 'data' / 'activity_logs.jsonl'
            activity_log_path.parent.mkdir(exist_ok=True)
            
            # Add timestamp if missing
            if 'timestamp' not in data:
                from datetime import datetime
                data['timestamp'] = datetime.utcnow().isoformat()
            
            # Append to JSONL file
            try:
                import json
                with open(activity_log_path, 'a') as f:
                    f.write(json.dumps(data) + '\n')
                logger.info(f"Tracked {data['activity_type']} on article {data['article_id']}")
            except Exception as log_err:
                logger.warning(f"Could not write to activity log: {log_err}")
            
            return jsonify({
                "success": True,
                "message": "Activity tracked successfully"
            }), 200
            
        except Exception as e:
            logger.error(f"Error tracking activity: {e}")
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
            svc = current_app.recommendation_service
            cache = current_app.cache_manager
            
            top_n = int(request.args.get('top_n', 10))
            days = int(request.args.get('days', 7))
            
            # Check cache
            cache_key = f"rec:trending:n={top_n}:days={days}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                return jsonify({
                    "success": True,
                    "recommendations": cached_result,
                    "from_cache": True
                })
            
            recommendations = svc.get_trending_articles(
                top_n=top_n,
                time_window_days=days
            )
            
            # Cache for 5 minutes
            cache.set(cache_key, recommendations, ttl_seconds=300)
            
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
            cache = current_app.cache_manager
            
            data = request.json
            user_id = data.get('user_id')
            article_id = data.get('article_id')
            
            if user_id:
                cache.clear_user_cache(user_id)
                return jsonify({
                    "success": True,
                    "message": f"Cache cleared for user {user_id}"
                })
            
            if article_id:
                cache.clear_article_cache(article_id)
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
            cache = current_app.cache_manager
            stats = cache.get_cache_stats()
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
            svc = current_app.recommendation_service
            metadata_path = Path(__file__).resolve().parent / 'models' / 'training_metadata.csv'
            
            info = {
                "models_loaded": svc.models_loaded,
                "content_based_available": svc.sig_matrix is not None,
                "collaborative_available": svc.user_sim_matrix is not None,
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


# Create default app instance for running the server directly or for WSGI servers
app = create_app()


if __name__ == '__main__':
    # Support PORT environment variable from Render, or use ML_API_PORT
    port = int(os.environ.get('PORT', os.getenv('ML_API_PORT', 5001)))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting ML Recommendation API on port {port}")
    logger.info(f"Environment: {'development' if debug else 'production'}")
    
    # Run with Flask development server (use gunicorn in production)
    # Command for Render: gunicorn --bind 0.0.0.0:$PORT api_server:app
    app.run(host='0.0.0.0', port=port, debug=debug)
