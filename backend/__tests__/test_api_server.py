import pytest
from unittest.mock import MagicMock, patch
from backend.Ml_model.api_server import create_app

# FIXTURE: Flask Test Client

@pytest.fixture
def client():
    """Create test client with mocked recommendation + cache managers."""
    with patch("backend.Ml_model.api_server.get_recommendation_service") as mock_reco_svc, \
         patch("backend.Ml_model.api_server.get_cache_manager") as mock_cache_mgr:

        # Mock recommendation service
        mock_svc = MagicMock()
        mock_svc.models_loaded = True
        mock_svc.sig_matrix = True
        mock_svc.user_sim_matrix = True
        mock_svc.get_similar_articles.return_value = ["a1", "a2"]
        mock_svc.get_collaborative_recommendations.return_value = ["c1", "c2"]
        mock_svc.get_hybrid_recommendations.return_value = ["h1", "h2"]
        mock_svc.get_trending_articles.return_value = ["t1", "t2"]

        mock_reco_svc.return_value = mock_svc

        # Mock cache manager
        mock_cache = MagicMock()
        mock_cache.enabled = True
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        mock_cache.get_cache_stats.return_value = {"hits": 0, "miss": 1}
        mock_cache.clear_user_cache.return_value = True
        mock_cache.clear_article_cache.return_value = True

        mock_cache_mgr.return_value = mock_cache

        app = create_app({})
        app.testing = True
        yield app.test_client()



# TEST CASES


def test_health_check(client):
    """TC: Health endpoint should return status=healthy"""
    resp = client.get("/health")
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["status"] == "healthy"
    assert "models_loaded" in data



# Similar Articles


def test_similar_articles_no_cache(client):
    """TC: Normal similar articles request when cache miss"""
    resp = client.get("/api/recommendations/similar/123?top_n=5")
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["from_cache"] is False
    assert data["recommendations"] == ["a1", "a2"]


def test_similar_articles_invalid_top_n(client):
    """Edge TC: Non-integer top_n should error"""
    resp = client.get("/api/recommendations/similar/123?top_n=abc")
    assert resp.status_code == 500


def test_similar_articles_service_error(client):
    """Edge TC: Simulate exception inside get_similar_articles"""
    with patch("backend.Ml_model.api_server.get_recommendation_service") as mock_service:
        svc = MagicMock()
        svc.get_similar_articles.side_effect = Exception("fail")
        mock_service.return_value = svc

        app = create_app({})
        app.testing = True
        c = app.test_client()

        resp = c.get("/api/recommendations/similar/99")
        assert resp.status_code == 500



# Personalized Recommendations


def test_personalized_hybrid(client):
    """TC: Hybrid recommendation"""
    resp = client.post(
        "/api/recommendations/personalized/u1?top_n=3",
        json={"recent_articles": ["r1", "r2"]}
    )
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["method"] == "hybrid"
    assert data["recommendations"] == ["h1", "h2"]


def test_personalized_collaborative(client):
    """TC: Collaborative mode"""
    resp = client.get("/api/recommendations/personalized/u1?method=collaborative")
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["method"] == "collaborative"
    assert data["recommendations"] == ["c1", "c2"]


def test_personalized_invalid_top_n(client):
    """Edge TC: Invalid top_n"""
    resp = client.get("/api/recommendations/personalized/u1?top_n=hello")
    assert resp.status_code == 500



# Trending Articles


def test_trending_articles(client):
    """TC: Normal trending fetch"""
    resp = client.get("/api/recommendations/trending?days=3")
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["recommendations"] == ["t1", "t2"]


def test_trending_invalid_days(client):
    """Edge TC: Non-integer days"""
    resp = client.get("/api/recommendations/trending?days=xyz")
    assert resp.status_code == 500



# Cache Clear


def test_cache_clear_user(client):
    """TC: Clear user cache"""
    resp = client.post("/api/cache/clear", json={"user_id": "u1"})
    data = resp.get_json()
    assert resp.status_code == 200
    assert "user u1" in data["message"]


def test_cache_clear_article(client):
    """TC: Clear article cache"""
    resp = client.post("/api/cache/clear", json={"article_id": "a22"})
    data = resp.get_json()
    assert resp.status_code == 200
    assert "article a22" in data["message"]


def test_cache_clear_missing_fields(client):
    """Edge TC: Missing both fields -> 400"""
    resp = client.post("/api/cache/clear", json={})
    assert resp.status_code == 400



# Cache Stats


def test_cache_stats(client):
    """TC: Cache stats endpoint"""
    resp = client.get("/api/cache/stats")
    data = resp.get_json()
    assert resp.status_code == 200
    assert "stats" in data



# Models Info


def test_models_info(client):
    """TC: Model info endpoint"""
    resp = client.get("/api/models/info")
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["info"]["models_loaded"] is True

def test_create_app_with_allowed_origins(monkeypatch):
    """TC: App initializes with CORS origins from environment"""
    monkeypatch.setenv("ML_API_ALLOWED_ORIGINS", "http://a.com, http://b.com")

    from backend.Ml_model.api_server import create_app
    app = create_app({})

    assert app is not None

def test_similar_articles_cache_hit(client, monkeypatch):
    """TC: Test cache hit response for similar articles"""
    with patch("backend.Ml_model.api_server.get_cache_manager") as mock_cache_mgr:
        mock_cache = MagicMock()
        mock_cache.get.return_value = ["cached1", "cached2"]
        mock_cache_mgr.return_value = mock_cache

        app = create_app({})
        app.testing = True
        c = app.test_client()

        resp = c.get("/api/recommendations/similar/100")
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["from_cache"] is True
        assert data["recommendations"] == ["cached1", "cached2"]

def test_personalized_cache_hit(client):
    """TC: Cache hit for personalized recommendations"""
    with patch("backend.Ml_model.api_server.get_cache_manager") as mock_cache_mgr:
        mock_cache = MagicMock()
        mock_cache.get.return_value = ["cached_user_rec"]
        mock_cache_mgr.return_value = mock_cache

        app = create_app({})
        app.testing = True
        c = app.test_client()

        resp = c.get("/api/recommendations/personalized/u1")
        data = resp.get_json()
        assert resp.status_code == 200
        assert data["from_cache"] is True
        assert data["recommendations"] == ["cached_user_rec"]

def test_model_info_metadata_loaded(tmp_path, client):
    """TC: When training_metadata.csv exists and is valid"""
    # Create temp metadata file
    p = tmp_path / "training_metadata.csv"
    p.write_text("col1,col2\nv1,v2")

    with patch("backend.Ml_model.api_server.Path.exists", return_value=True), \
         patch("backend.Ml_model.api_server.Path.__truediv__", return_value=p):

        resp = client.get("/api/models/info")
        data = resp.get_json()

        assert resp.status_code == 200
        assert "col1" in data["info"]

def test_clear_cache_no_json(client):
    """Edge TC: clear_cache called without JSON body"""
    resp = client.post("/api/cache/clear")
    assert resp.status_code == 500

def test_clear_cache_article_error(client):
    """Edge TC: simulated error inside clear_article_cache"""
    with patch("backend.Ml_model.api_server.get_cache_manager") as mock_mgr:
        mock_cache = MagicMock()
        mock_cache.clear_article_cache.side_effect = Exception("boom")
        mock_mgr.return_value = mock_cache

        app = create_app({})
        app.testing = True
        c = app.test_client()

        resp = c.post("/api/cache/clear", json={"article_id": "a1"})
        assert resp.status_code == 500

def test_models_info_metadata_error(client):
    """Edge TC: CSV fails to load"""
    with patch("backend.Ml_model.api_server.Path.exists", return_value=True), \
         patch("pandas.read_csv", side_effect=Exception("bad csv")):

        resp = client.get("/api/models/info")
        assert resp.status_code == 200

def test_cache_stats_exception(client):
    """Edge TC: Force exception in get_cache_stats to cover lines 275-277."""
    from backend.Ml_model.api_server import create_app

    with patch("backend.Ml_model.api_server.get_cache_manager") as mock_cache_mgr:
        mock_cache = MagicMock()
        mock_cache.get_cache_stats.side_effect = Exception("cache boom!")
        mock_cache_mgr.return_value = mock_cache

        app = create_app({})
        app.testing = True
        c = app.test_client()

        resp = c.get("/api/cache/stats")
        data = resp.get_json()

        # Assert exception handler returned correct structure
        assert resp.status_code == 500
        assert data["success"] is False
        assert "cache boom!" in data["error"]

def test_models_info_exception(client):
    """Edge TC: Force exception inside /api/models/info to cover lines 309-311."""

    # This is the actual Flask app instance used by the test client
    app = client.application

    class BrokenService:
        @property
        def models_loaded(self):
            raise Exception("models info failure!")
        
        # Ensure other attributes exist if accessed
        sig_matrix = None
        user_sim_matrix = None

    # Patch the real service the endpoint will use
    app.recommendation_service = BrokenService()

    resp = client.get("/api/models/info")
    data = resp.get_json()

    # Assertions: Now the exception handler must be invoked
    assert resp.status_code == 500
    assert data["success"] is False
    assert "models info failure!" in data["error"]
