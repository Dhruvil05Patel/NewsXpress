# backend/__tests__/test_api_server.py
import os
import json
import tempfile
from pathlib import Path
import pytest
from unittest.mock import MagicMock

# import the Flask app factory and module to monkeypatch module-level vars
import importlib

API_MODULE = "backend.Ml_model.api_server"
api = importlib.import_module(API_MODULE)
from backend.Ml_model.api_server import create_app  # noqa: E402


@pytest.fixture(autouse=True)
def clear_env_vars(monkeypatch):
    # ensure env vars don't leak between tests
    monkeypatch.delenv("ML_API_ALLOWED_ORIGINS", raising=False)
    monkeypatch.delenv("ML_API_PORT", raising=False)
    yield


@pytest.fixture
def fake_recommendation_service():
    svc = MagicMock()
    # default behaviors
    svc.models_loaded = True
    svc.sig_matrix = True
    svc.user_sim_matrix = True

    svc.get_similar_articles.return_value = [{"id": "b", "score": 0.9}]
    svc.get_collaborative_recommendations.return_value = [{"id": "a", "relevance_score": 0.7}]
    svc.get_hybrid_recommendations.return_value = [{"id": "a", "hybrid_score": 0.8}]
    svc.get_trending_articles.return_value = [{"id": "t1"}]
    return svc


@pytest.fixture
def fake_cache_manager():
    cache = MagicMock()
    cache.enabled = True
    # default: cache miss on .get()
    cache.get.return_value = None
    cache.set.return_value = True
    cache.clear_user_cache.return_value = None
    cache.clear_article_cache.return_value = None
    cache.get_cache_stats.return_value = {"enabled": True, "keyspace_hits": 0, "keyspace_misses": 0, "hit_rate": 0.0}
    return cache


@pytest.fixture
def app(fake_recommendation_service, fake_cache_manager, monkeypatch, tmp_path):
    """
    Create Flask app with module-level recommendation_service and cache_manager monkeypatched.
    """
    # monkeypatch module-level names used by route functions
    monkeypatch.setattr(api, "recommendation_service", fake_recommendation_service)
    monkeypatch.setattr(api, "cache_manager", fake_cache_manager)

    # ensure models metadata path is inside a temp dir for tests that may touch it
    # The api reads: Path(__file__).resolve().parent / 'models' / 'training_metadata.csv'
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    monkeypatch.setattr(Path(__file__).resolve().parent.__class__, "exists", lambda self: False, raising=False)

    # create the app (CORS default)
    flask_app = create_app()
    flask_app.config["TESTING"] = True
    yield flask_app


def test_health_endpoint(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()

    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "healthy"
    assert "models_loaded" in data
    assert "cache_enabled" in data


def test_get_similar_articles_cache_hit(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    # Simulate cache hit
    fake_cache_manager.get.return_value = [{"id": "cached1", "score": 0.99}]

    resp = client.get("/api/recommendations/similar/ART123?top_n=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is True
    assert data["recommendations"][0]["id"] == "cached1"


def test_get_similar_articles_cache_miss_and_set(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    # cache.get returns None by default (miss)
    fake_recommendation_service.get_similar_articles.return_value = [{"id": "b", "score": 0.9}]

    resp = client.get("/api/recommendations/similar/ART123?top_n=2&exclude=x")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is False
    assert isinstance(data["recommendations"], list)
    # ensure set() was called to store result in cache
    assert fake_cache_manager.set.called


def test_get_similar_articles_exception(app, fake_recommendation_service, fake_cache_manager, monkeypatch):
    client = app.test_client()
    # Make recommendation service raise
    fake_recommendation_service.get_similar_articles.side_effect = RuntimeError("boom")

    resp = client.get("/api/recommendations/similar/ART123")
    assert resp.status_code == 500
    data = resp.get_json()
    assert data["success"] is False
    assert "boom" in data["error"]


def test_get_personalized_collaborative_cache_hit(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get.return_value = [{"id": "cached_collab"}]
    resp = client.get("/api/recommendations/personalized/user1?method=collaborative&top_n=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is True
    assert data["method"] == "collaborative"


def test_get_personalized_collaborative_miss(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get.return_value = None
    fake_recommendation_service.get_collaborative_recommendations.return_value = [{"id": "c1", "relevance_score": 0.5}]

    resp = client.get("/api/recommendations/personalized/user1?method=collaborative&top_n=3")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is False
    assert data["method"] == "collaborative"
    assert fake_cache_manager.set.called


def test_get_personalized_hybrid_with_request_body(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get.return_value = None
    # Test hybrid branch with JSON body (recent_articles)
    body = {"recent_articles": ["a", "b"]}
    resp = client.post("/api/recommendations/personalized/user1?method=hybrid&top_n=2",
                       data=json.dumps(body),
                       content_type="application/json")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["method"] == "hybrid"
    assert data["from_cache"] is False
    assert fake_recommendation_service.get_hybrid_recommendations.called
    assert fake_cache_manager.set.called


def test_get_personalized_hybrid_no_json(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    # No JSON body should default recent_articles = []
    resp = client.get("/api/recommendations/personalized/user1?method=hybrid&top_n=2")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["method"] == "hybrid"
    assert fake_recommendation_service.get_hybrid_recommendations.called


def test_get_trending_cache_hit(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get.return_value = [{"id": "cached_trend"}]

    resp = client.get("/api/recommendations/trending?top_n=5&days=3")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is True
    assert data["recommendations"][0]["id"] == "cached_trend"


def test_get_trending_cache_miss(app, fake_recommendation_service, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get.return_value = None
    fake_recommendation_service.get_trending_articles.return_value = [{"id": "t1"}]

    resp = client.get("/api/recommendations/trending?top_n=3&days=7")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["from_cache"] is False
    assert fake_cache_manager.set.called


def test_clear_cache_user(app, fake_cache_manager):
    client = app.test_client()
    # Clear user cache via POST JSON
    body = {"user_id": "user123"}
    resp = client.post("/api/cache/clear", data=json.dumps(body), content_type="application/json")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "Cache cleared for user" in data["message"]
    assert fake_cache_manager.clear_user_cache.called


def test_clear_cache_article(app, fake_cache_manager):
    client = app.test_client()
    body = {"article_id": "ART1"}
    resp = client.post("/api/cache/clear", data=json.dumps(body), content_type="application/json")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "Cache cleared for article" in data["message"]
    assert fake_cache_manager.clear_article_cache.called


def test_clear_cache_missing_params(app):
    client = app.test_client()
    body = {}
    resp = client.post("/api/cache/clear", data=json.dumps(body), content_type="application/json")
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False


def test_get_cache_stats(app, fake_cache_manager):
    client = app.test_client()
    fake_cache_manager.get_cache_stats.return_value = {"enabled": True, "keyspace_hits": 1, "keyspace_misses": 0, "hit_rate": 100.0}
    resp = client.get("/api/cache/stats")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "stats" in data


def test_get_models_info_no_metadata(app, monkeypatch, fake_recommendation_service, tmp_path):
    client = app.test_client()
    # Ensure the metadata path does not exist. We need to override Path logic inside module.
    module_file = Path(api.__file__)
    models_path = module_file.resolve().parent / "models"
    # ensure no metadata file
    monkeypatch.setattr(models_path, "exists", lambda: False, raising=False)
    resp = client.get("/api/models/info")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "info" in data
    assert "models_loaded" in data["info"]


def test_get_models_info_with_metadata(tmp_path, monkeypatch, app, fake_recommendation_service):
    # create a temporary models folder and CSV file that the endpoint will read
    module_file = Path(api.__file__)
    models_dir = module_file.resolve().parent / "models"
    models_dir.mkdir(exist_ok=True)
    csv_path = models_dir / "training_metadata.csv"
    csv_content = "version,notes\nv1,ok\n"
    csv_path.write_text(csv_content)

    client = app.test_client()
    resp = client.get("/api/models/info")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "info" in data

    # cleanup
    csv_path.unlink()


def test_models_info_read_error(monkeypatch, app, fake_recommendation_service):
    # create fake path that exists but pd.read_csv raises
    module_file = Path(api.__file__)
    models_dir = module_file.resolve().parent / "models"
    models_dir.mkdir(exist_ok=True)
    csv_path = models_dir / "training_metadata.csv"
    csv_path.write_text("bad,data\n")

    # monkeypatch pandas to raise on read_csv
    import pandas as pd
    monkeypatch.setattr("pandas.read_csv", lambda p: (_ for _ in ()).throw(RuntimeError("bad csv")), raising=True)

    client = app.test_client()
    resp = client.get("/api/models/info")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "info" in data

    # cleanup
    try:
        csv_path.unlink()
    except Exception:
        pass


def test_cors_allowed_origins(monkeypatch):
    # When ML_API_ALLOWED_ORIGINS is set, CORS should accept those origins.
    monkeypatch.setenv("ML_API_ALLOWED_ORIGINS", "https://example.com, https://foo.com")
    # Re-import module to ensure create_app reads the env var
    import importlib
    importlib.reload(api)
    app2 = api.create_app()
    client = app2.test_client()
    # Simple request to ensure app starts with CORS configured
    resp = client.get("/health")
    assert resp.status_code == 200
