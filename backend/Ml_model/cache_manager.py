"""
Redis Cache Manager for Recommendations
Caches recommendation results to reduce computation time
"""
import os
import json
import redis
import logging
from datetime import timedelta
from functools import wraps

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.enabled = False
        self.connect()
    
    def connect(self):
        """Connect to Redis server"""
        try:
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_password = os.getenv('REDIS_PASSWORD', None)
            redis_db = int(os.getenv('REDIS_DB', 0))
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                db=redis_db,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            
            # Test connection
            self.redis_client.ping()
            self.enabled = True
            logger.info(f"✅ Connected to Redis at {redis_host}:{redis_port}")
            
        except Exception as e:
            logger.warning(f"⚠️  Redis connection failed: {e}. Caching disabled.")
            self.enabled = False
    
    def get(self, key):
        """Get value from cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache GET error: {e}")
            return None
    
    def set(self, key, value, ttl_seconds=3600):
        """Set value in cache with TTL"""
        if not self.enabled:
            return False
        
        try:
            serialized = json.dumps(value)
            self.redis_client.setex(key, ttl_seconds, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache SET error: {e}")
            return False
    
    def delete(self, key):
        """Delete key from cache"""
        if not self.enabled:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache DELETE error: {e}")
            return False
    
    def delete_pattern(self, pattern):
        """Delete all keys matching pattern"""
        if not self.enabled:
            return False
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache DELETE PATTERN error: {e}")
            return False
    
    def clear_user_cache(self, user_id):
        """Clear all cached recommendations for a user"""
        patterns = [
            f"rec:collab:{user_id}:*",
            f"rec:hybrid:{user_id}:*",
        ]
        for pattern in patterns:
            self.delete_pattern(pattern)
    
    def clear_article_cache(self, article_id):
        """Clear cached similar articles"""
        self.delete_pattern(f"rec:similar:{article_id}:*")
    
    def get_cache_stats(self):
        """Get cache statistics"""
        if not self.enabled:
            return {"enabled": False}
        
        try:
            info = self.redis_client.info('stats')
            return {
                "enabled": True,
                "keyspace_hits": info.get('keyspace_hits', 0),
                "keyspace_misses": info.get('keyspace_misses', 0),
                "hit_rate": (
                    info.get('keyspace_hits', 0) / 
                    (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1))
                ) * 100
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"enabled": True, "error": str(e)}


# Singleton instance
_cache_manager = None

def get_cache_manager():
    """Get or create cache manager instance"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager


def cached(key_prefix, ttl_seconds=3600):
    """
    Decorator to cache function results
    
    Usage:
        @cached('rec:similar', ttl_seconds=1800)
        def get_similar_articles(article_id, top_n=10):
            # ... computation
            return results
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache_manager()
            
            # Build cache key from function args
            cache_key_parts = [key_prefix, func.__name__]
            cache_key_parts.extend([str(arg) for arg in args])
            cache_key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            cache_key = ":".join(cache_key_parts)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_result
            
            # Cache miss - compute and cache
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            
            return result
        
        return wrapper
    return decorator


# Example usage
if __name__ == '__main__':
    cache = get_cache_manager()
    
    # Test basic operations
    cache.set('test_key', {'data': 'test_value'}, ttl_seconds=60)
    result = cache.get('test_key')
    print(f"Cached value: {result}")
    
    # Test decorator
    @cached('test', ttl_seconds=10)
    def expensive_computation(n):
        print(f"Computing for n={n}...")
        return [i**2 for i in range(n)]
    
    print(expensive_computation(5))  # Cache miss
    print(expensive_computation(5))  # Cache hit
    
    # Get stats
    stats = cache.get_cache_stats()
    print(f"Cache stats: {stats}")
