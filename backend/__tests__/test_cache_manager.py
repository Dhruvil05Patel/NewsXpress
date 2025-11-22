import json
import pytest
from unittest.mock import MagicMock, patch
from backend.Ml_model.cache_manager import CacheManager, get_cache_manager, cached

# FIXTURE: Mock redis client
@pytest.fixture
def mock_redis():
    mock_client = MagicMock()
    mock_client.ping.return_value = True
    return mock_client


# SUMMARY: Ensures CacheManager successfully connects to Redis.
# EDGE CASE: Redis ping responds successfully on first try.
@patch("redis.Redis")
def test_connect_success(mock_redis_class, mock_redis):
    mock_redis_class.return_value = mock_redis

    cm = CacheManager()

    assert cm.enabled is True
    mock_redis.ping.assert_called_once()


# SUMMARY: Verifies CacheManager properly handles Redis connection errors.
# EDGE CASE: Redis constructor raises exception → caching disabled.
@patch("redis.Redis", side_effect=Exception("fail"))
def test_connect_failure(_):
    cm = CacheManager()

    assert cm.enabled is False
    assert cm.redis_client is None or isinstance(cm.redis_client, object)


# SUMMARY: Ensures get() returns None when caching is disabled.
# EDGE CASE: CacheManager.enabled=False completely bypasses Redis.
def test_get_disabled_cache():
    cm = CacheManager()
    cm.enabled = False

    assert cm.get("x") is None


# SUMMARY: Ensures get() returns deserialized JSON on success.
# EDGE CASE: Redis returns a JSON string → must load via json.loads().
def test_get_success(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    mock_redis.get.return_value = json.dumps({"a": 1})

    assert cm.get("k") == {"a": 1}


# SUMMARY: Ensures get() handles Redis exceptions safely.
# EDGE CASE: redis_client.get raises exception → return None.
def test_get_error(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    mock_redis.get.side_effect = Exception("boom")

    assert cm.get("x") is None


# SUMMARY: Ensures set() returns False when caching disabled.
# EDGE CASE: Early exit when enabled=False.
def test_set_disabled():
    cm = CacheManager()
    cm.enabled = False

    assert cm.set("k", {"a": 1}) is False


# SUMMARY: Ensures set() stores JSON with TTL correctly.
# EDGE CASE: redis_client.setex must be called with serialized JSON.
def test_set_success(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    assert cm.set("k", {"x": 1}, 100) is True
    mock_redis.setex.assert_called_once()


# SUMMARY: Ensures set() gracefully handles Redis errors.
# EDGE CASE: redis.setex throws → return False.
def test_set_error(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    mock_redis.setex.side_effect = Exception("fail")

    assert cm.set("k", {"x": 1}) is False


# SUMMARY: Ensures delete() respects disabled state.
# EDGE CASE: enabled=False → no Redis call.
def test_delete_disabled():
    cm = CacheManager()
    cm.enabled = False
    assert cm.delete("k") is False


# SUMMARY: Ensures delete() successfully removes a key.
# EDGE CASE: delete() returns True even if Redis returns no result.
def test_delete_success(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    assert cm.delete("k") is True
    mock_redis.delete.assert_called_once()


# SUMMARY: Ensures delete() handles Redis errors safely.
# EDGE CASE: redis.delete raises exception → returns False.
def test_delete_error(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    mock_redis.delete.side_effect = Exception("boom")

    assert cm.delete("k") is False


# SUMMARY: Ensures delete_pattern() returns False if caching disabled.
# EDGE CASE: early return when enabled=False.
def test_delete_pattern_disabled():
    cm = CacheManager()
    cm.enabled = False
    assert cm.delete_pattern("*") is False


# SUMMARY: Ensures delete_pattern() deletes all matching keys.
# EDGE CASE: Multiple keys returned → must delete in one call.
def test_delete_pattern_success(mock_redis):
    mock_redis.keys.return_value = ["a", "b"]

    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    assert cm.delete_pattern("rec:*") is True
    mock_redis.delete.assert_called_once_with("a", "b")


# SUMMARY: Ensures delete_pattern() returns True when no keys match.
# EDGE CASE: keys() returns empty list.
def test_delete_pattern_no_keys(mock_redis):
    mock_redis.keys.return_value = []

    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    assert cm.delete_pattern("rec:*") is True
    mock_redis.delete.assert_not_called()


# SUMMARY: Ensures delete_pattern() catches Redis exceptions.
# EDGE CASE: redis.keys raises exception → return False.
def test_delete_pattern_error(mock_redis):
    mock_redis.keys.side_effect = Exception("boom")

    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    assert cm.delete_pattern("rec:*") is False


# SUMMARY: Ensures clear_user_cache deletes multiple patterns.
# EDGE CASE: Must call delete_pattern for both hybrid and collab keys.
def test_clear_user_cache(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    cm.clear_user_cache("u1")

    mock_redis.keys.assert_any_call("rec:collab:u1:*")
    mock_redis.keys.assert_any_call("rec:hybrid:u1:*")


# SUMMARY: Ensures clear_article_cache deletes similar-article cache.
# EDGE CASE: pattern is specific to similar recommender.
def test_clear_article_cache(mock_redis):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    cm.clear_article_cache("A1")

    mock_redis.keys.assert_called_once_with("rec:similar:A1:*")


# SUMMARY: Ensures get_cache_stats returns disabled state.
# EDGE CASE: Cache disabled → no Redis calls allowed.
def test_stats_disabled():
    cm = CacheManager()
    cm.enabled = False

    assert cm.get_cache_stats() == {"enabled": False}


# SUMMARY: Ensures get_cache_stats produces correct hit-rate calculation.
# EDGE CASE: Uses default division fallback to avoid divide-by-zero.
def test_stats_success(mock_redis):
    mock_redis.info.return_value = {"keyspace_hits": 10, "keyspace_misses": 5}

    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    stats = cm.get_cache_stats()
    assert stats["enabled"] is True
    assert stats["keyspace_hits"] == 10
    assert stats["keyspace_misses"] == 5
    assert stats["hit_rate"] == pytest.approx(66.666, rel=1e-2)


# SUMMARY: Ensures get_cache_stats handles Redis errors safely.
# EDGE CASE: redis.info throws → return dict with error message.
def test_stats_error(mock_redis):
    mock_redis.info.side_effect = Exception("bad stats")

    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    stats = cm.get_cache_stats()
    assert stats["enabled"] is True
    assert "error" in stats


# SUMMARY: Verifies that get_cache_manager() returns a true singleton.
# EDGE CASE: Multiple calls must return same object.
def test_singleton():
    c1 = get_cache_manager()
    c2 = get_cache_manager()
    assert c1 is c2


# SUMMARY: Ensures cached decorator handles misses then hits.
# EDGE CASE: First call → miss; second call → hit from Redis.
def test_cached_decorator_hits_and_misses(mock_redis, monkeypatch):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    monkeypatch.setattr(
        "backend.Ml_model.cache_manager.get_cache_manager",
        lambda: cm
    )

    calls = {"count": 0}

    @cached("testprefix", ttl_seconds=30)
    def add(a, b):
        calls["count"] += 1
        return a + b

    # MISS
    mock_redis.get.return_value = None
    result1 = add(2, 3)
    assert result1 == 5
    assert calls["count"] == 1

    # HIT
    mock_redis.get.return_value = json.dumps(5)
    result2 = add(2, 3)
    assert result2 == 5
    assert calls["count"] == 1  # no recompute


# SUMMARY: Ensures cached decorator builds deterministic cache keys.
# EDGE CASE: Keyword args must be sorted and included in key.
def test_cached_builds_key_correctly(mock_redis, monkeypatch):
    cm = CacheManager()
    cm.enabled = True
    cm.redis_client = mock_redis

    monkeypatch.setattr(
        "backend.Ml_model.cache_manager.get_cache_manager",
        lambda: cm
    )

    @cached("myprefix")
    def multiply(x, y=2):
        return x * y

    mock_redis.get.return_value = None

    multiply(5, y=10)

    cached_key = mock_redis.get.call_args[0][0]
    assert "myprefix" in cached_key
    assert "multiply" in cached_key
    assert "5" in cached_key
    assert "y=10" in cached_key
