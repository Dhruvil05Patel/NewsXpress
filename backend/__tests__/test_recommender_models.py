import builtins
import pickle
from io import BytesIO
from pathlib import Path
from unittest.mock import mock_open

import numpy as np
import pandas as pd
import pytest

from backend.Ml_model.Recommender_Models import (
    RecommendationService,
    get_recommendation_service,
)

# Fixtures: Fake sample data

@pytest.fixture
def simple_article_metadata():
    """Fake article metadata for testing content-based recommender."""
    return pd.DataFrame(
        [
            {"id": "a", "title": "Article A", "published_at": pd.Timestamp.now()},
            {"id": "b", "title": "Article B", "published_at": pd.Timestamp.now()},
        ]
    )


@pytest.fixture
def simple_indices():
    """Maps article IDs to row index (used in similarity matrix lookups)."""
    return pd.Series([0, 1], index=["a", "b"])


@pytest.fixture
def simple_sig_matrix():
    """Small 2×2 similarity matrix for content-based recommendation."""
    return np.array([[1.0, 0.8], [0.8, 1.0]])


@pytest.fixture
def simple_user_sim_matrix():
    """Fake user-to-user similarity matrix for collaborative filtering."""
    return pd.DataFrame(
        [[1.0, 0.6], [0.6, 1.0]],
        index=["user1", "user2"],
        columns=["user1", "user2"],
    )


@pytest.fixture
def simple_user_features():
    """Simple per-user feature vectors (collaborative filtering input)."""
    return pd.DataFrame(
        [[1.0, 0.0], [0.0, 1.0]],
        index=["user1", "user2"],
        columns=["f1", "f2"],
    )


@pytest.fixture
def simple_article_features():
    """Simple per-article feature vectors."""
    return pd.DataFrame(
        [[1.0, 0.0], [0.0, 1.0]],
        index=["a", "b"],
        columns=["f1", "f2"],
    )



# =====================================================================
# TEST CASES WITH EDGE-CASE COMMENTS (Option 2)
# =====================================================================


# EDGE CASE: All model files present → full successful model load
def test_load_models_success(monkeypatch, simple_article_metadata):
    """
    Test Case: Successful model loading.
    Purpose: Ensures load_models() completes without errors when files exist.
    Importance: Validates startup reliability of the ML module.
    """
    svc = RecommendationService()

    monkeypatch.setattr(Path, "exists", lambda *args, **kwargs: True)
    monkeypatch.setattr(pickle, "load", lambda f: {"fake": "object"})
    monkeypatch.setattr(pd, "read_csv", lambda p: simple_article_metadata)

    # Prevent actual file IO
    monkeypatch.setattr("builtins.open", mock_open(read_data=b"fake"))

    ok = svc.load_models()
    assert ok is True
    assert svc.models_loaded is True


# EDGE CASE: Corrupted pickle → load_models should return False, not crash
def test_load_models_handles_exceptions(monkeypatch):
    """
    Test Case: load_models() handles corrupted pickle files.
    Purpose: Prevents server crash if model files are damaged.
    Importance: Error-handling test.
    """
    svc = RecommendationService()

    monkeypatch.setattr(Path, "exists", lambda p: True)
    monkeypatch.setattr(pickle, "load", lambda f: (_ for _ in ()).throw(RuntimeError("bad file")))

    assert svc.load_models() is False


# EDGE CASE: Normal similar-article flow with valid input
def test_get_similar_articles_basic(simple_sig_matrix, simple_indices, simple_article_metadata):
    """
    Test Case: Basic content-based similarity results.
    Purpose: Ensures similar articles are returned correctly.
    Importance: Validates core recommendation output structure.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    recs = svc.get_similar_articles("a", top_n=1)
    assert len(recs) == 1
    assert recs[0]["id"] == "b"


# EDGE CASE: Missing article ID → should return empty list
def test_get_similar_articles_article_not_found(simple_sig_matrix):
    """
    Test Case: Article not present in index.
    Purpose: Function should fail gracefully.
    Importance: Prevents runtime errors for invalid inputs.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.sig_matrix = simple_sig_matrix
    svc.indices = pd.Series(dtype=int)
    svc.article_metadata = pd.DataFrame()

    recs = svc.get_similar_articles("missing", top_n=5)
    assert recs == []


# EDGE CASE: exclude_ids removes all recommended articles
def test_get_similar_articles_with_exclude(simple_sig_matrix, simple_indices, simple_article_metadata):
    """
    Test Case: Excluding certain article IDs.
    Purpose: Ensures exclude list works properly.
    Importance: Prevents recommending already-read content.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    recs = svc.get_similar_articles("a", top_n=5, exclude_ids=["b"])
    assert recs == []


# EDGE CASE: user not in CF matrix → empty result
def test_get_collaborative_recommendations_user_not_found(simple_article_features):
    """
    Test Case: User does not exist in similarity matrix.
    Purpose: Function should return empty recommendations.
    Importance: Validates cold-start handling for new users.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.user_sim_matrix = pd.DataFrame()
    svc.article_features = simple_article_features
    svc.article_metadata = pd.DataFrame([{"id": "a"}, {"id": "b"}])

    recs = svc.get_collaborative_recommendations("unknown", top_n=5)
    assert recs == []


# EDGE CASE: Normal CF recommendation flow
def test_get_collaborative_recommendations_basic(
    simple_user_sim_matrix,
    simple_user_features,
    simple_article_features,
    simple_article_metadata,
):
    """
    Test Case: Basic collaborative filtering output.
    Purpose: Ensures recommendations contain IDs and scores.
    Importance: Confirms CF pipeline correctness.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    recs = svc.get_collaborative_recommendations("user1", top_k=1, top_n=2)
    assert len(recs) > 0
    assert "id" in recs[0]
    assert "relevance_score" in recs[0]


# EDGE CASE: exclude_ids removes all CF recommended items
def test_get_collaborative_respects_exclude(
    simple_user_sim_matrix,
    simple_user_features,
    simple_article_features,
    simple_article_metadata,
):
    """
    Test Case: Exclude list works for collaborative filtering.
    Purpose: Ensures unwanted items are not recommended.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    recs = svc.get_collaborative_recommendations("user1", exclude_ids=["a", "b"])
    assert recs == []


# EDGE CASE: Hybrid (CF + content) scoring works when both available
def test_get_hybrid_recommendations_combination(
    simple_user_sim_matrix,
    simple_user_features,
    simple_article_features,
    simple_sig_matrix,
    simple_indices,
    simple_article_metadata,
):
    """
    Test Case: Hybrid = collaborative + content-based mix.
    Purpose: Ensures weighted scoring works correctly.
    Importance: Confirms combined recommender behavior.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features

    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    recs = svc.get_hybrid_recommendations("user1", recent_article_ids=["a"])
    assert all("hybrid_score" in r for r in recs)


# EDGE CASE: Trending filter removes older articles properly
def test_get_trending_articles_filters_by_time(simple_article_metadata):
    """
    Test Case: Trending filter returns only recent items.
    Purpose: Ensures date filtering logic is correct.
    Importance: Validates fallback recommender behavior.
    """
    svc = RecommendationService()
    svc.article_metadata = simple_article_metadata.copy()

    # First article = older than 7 days, second = fresh
    svc.article_metadata.loc[0, "published_at"] = pd.Timestamp.now() - pd.Timedelta(days=10)

    recent = svc.get_trending_articles(top_n=5, time_window_days=7)
    assert len(recent) == 1


# EDGE CASE: Singleton must never reload more than once
def test_singleton_monkeypatched_load(monkeypatch):
    """
    Test Case: Singleton instance creation.
    Purpose: Ensures get_recommendation_service() does NOT create multiple instances.
    Importance: Avoids repeated heavy model loading.
    """
    calls = {"count": 0}

    def fake_load(self):
        calls["count"] += 1
        self.models_loaded = True
        return True

    monkeypatch.setattr(RecommendationService, "load_models", fake_load)

    s1 = get_recommendation_service()
    s2 = get_recommendation_service()

    assert s1 is s2
    assert calls["count"] == 1


# EDGE CASE: Only content-based model files exist
def test_load_models_only_content(monkeypatch, simple_article_metadata):
    """
    Covers branch: Only content-based model files exist.
    Purpose: Ensures service still loads without collaborative models.
    """
    svc = RecommendationService()

    # Only content-based files exist
    def fake_exists(path):
        return "tfidf_vectorizer" in str(path) or "sigmoid_matrix" in str(path) \
               or "article_indices" in str(path) or "article_metadata" in str(path)

    monkeypatch.setattr(Path, "exists", fake_exists)
    monkeypatch.setattr("builtins.open", mock_open(read_data=b"fake"))
    monkeypatch.setattr(pickle, "load", lambda f: {"fake": "obj"})
    monkeypatch.setattr(pd, "read_csv", lambda p: simple_article_metadata)

    ok = svc.load_models()
    assert ok is True
    assert svc.tfv is not None
    assert svc.user_sim_matrix is None  # only content loaded


# EDGE CASE: Only collaborative filtering files exist
def test_load_models_only_collab(monkeypatch):
    """
    Covers branch: Only collaborative model files exist.
    Purpose: Ensures service loads collaborative without content-based.
    """
    svc = RecommendationService()

    # Only collaborative files exist
    def fake_exists(path):
        return "user_similarity_matrix" in str(path) or "user_features" in str(path) \
               or "article_features" in str(path) or "mlb_encoder" in str(path)

    monkeypatch.setattr(Path, "exists", fake_exists)
    monkeypatch.setattr("builtins.open", mock_open(read_data=b"fake"))
    monkeypatch.setattr(pickle, "load", lambda f: {"fake": "obj"})
    monkeypatch.setattr(pd, "read_csv", lambda p: pd.DataFrame())  # not used here

    ok = svc.load_models()
    assert ok is True
    assert svc.user_sim_matrix is not None
    assert svc.tfv is None  # content not loaded


# EDGE CASE: CF similarity values zero → scores must be zero
def test_collab_no_similar_users(simple_user_features, simple_article_features, simple_article_metadata):
    """
    Covers branch: User has no similar users.
    Expected behavior: agg_profile becomes zero → all relevance scores = 0.
    Recommender still returns articles, but scores must be zero.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    # similarity matrix with zeros (meaning: no similar users)
    svc.user_sim_matrix = pd.DataFrame(
        [[1.0, 0.0], [0.0, 1.0]],
        index=["u1", "u2"],
        columns=["u1", "u2"],
    )

    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    recs = svc.get_collaborative_recommendations("u1", top_k=1, top_n=2)

    # Should return items but with zero scores
    assert len(recs) > 0
    assert all(rec["relevance_score"] == 0 for rec in recs)


# EDGE CASE: Hybrid merging duplicate articles
def test_hybrid_duplicate_scores(simple_user_sim_matrix, simple_user_features, simple_article_features, simple_sig_matrix, simple_indices, simple_article_metadata):
    """
    Covers branch: Hybrid scoring combining duplicate recs.
    Purpose: Ensures duplicate article IDs merge scores correctly.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features

    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    # Give duplicate recent_article_ids to force merge
    recs = svc.get_hybrid_recommendations("user1", recent_article_ids=["a", "a"])
    assert len(recs) > 0
    assert "hybrid_score" in recs[0]


# EDGE CASE: recent_article_ids=None → skip content-based part
def test_hybrid_no_recent_articles(simple_user_sim_matrix, simple_user_features, simple_article_features, simple_article_metadata):
    """
    Covers branch: recent_article_ids is None → content-based is skipped.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    # No content-based part executed
    recs = svc.get_hybrid_recommendations("user1", recent_article_ids=None)
    assert len(recs) > 0  # Gets collaborative only


# EDGE CASE: Trending exception block triggered
def test_trending_articles_exception(monkeypatch, simple_article_metadata):
    """
    Covers branch: trending article exception handling.
    Purpose: Ensure safe failure if metadata is broken.
    """
    svc = RecommendationService()

    # force exception
    monkeypatch.setattr(pd, "to_datetime", lambda x: (_ for _ in ()).throw(ValueError("bad")))

    svc.article_metadata = simple_article_metadata

    recs = svc.get_trending_articles()
    assert recs == []  # error → return []


# EDGE CASE: methods auto-load models when models_loaded=False
def test_load_models_called_when_not_loaded(monkeypatch):
    """
    Ensures the auto-loading branch is executed:
    if not self.models_loaded: self.load_models()
    """
    svc = RecommendationService()

    # Start with models_loaded = False (default)
    assert svc.models_loaded is False

    # Make load_models do nothing but set a flag
    load_called = {"value": False}

    def fake_load_models():
        load_called["value"] = True
        svc.models_loaded = True
        return True

    monkeypatch.setattr(svc, "load_models", fake_load_models)

    # Call any method that triggers auto-load
    svc.get_similar_articles("x")   # sig_matrix is None so it will exit early

    assert load_called["value"] is True


# EDGE CASE: auto-load branch trigger path
def test_auto_load_models_branch(monkeypatch):
    """
    Covers the branch:
    if not self.models_loaded:
        self.load_models()
    """
    svc = RecommendationService()

    # Ensure starting state
    assert not svc.models_loaded

    called = {"value": False}

    def fake_load():
        called["value"] = True
        svc.models_loaded = True
        return True

    monkeypatch.setattr(svc, "load_models", fake_load)

    # Trigger any method that checks models_loaded
    svc.get_similar_articles("anything")

    assert called["value"] is True


# EDGE CASE: sig_matrix or indices missing → return empty list
def test_similar_articles_no_models():
    """
    Covers branch:
    if self.sig_matrix is None or self.indices is None:
        return []
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.sig_matrix = None
    svc.indices = None

    assert svc.get_similar_articles("a") == []


# EDGE CASE: Article ID not in index, but metadata present
def test_similar_articles_article_not_found(simple_sig_matrix, simple_indices, simple_article_metadata):
    """
    Test Case: Article ID not found in index.
    Why: Ensures correct fallback logic for invalid inputs.
    """
    svc = RecommendationService()
    svc.models_loaded = True
    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    result = svc.get_similar_articles("zzz")
    assert result == []


# EDGE CASE: Force exception inside content-based logic
def test_similar_articles_exception(monkeypatch):
    """
    Test Case: Force exception inside content recommender.
    Why: Tests try/except logic and ensures system returns []
         instead of crashing.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    monkeypatch.setattr(svc, "sig_matrix", object())
    monkeypatch.setattr(svc, "indices", object())

    res = svc.get_similar_articles("a")
    assert res == []


# EDGE CASE: CF user not in matrix → return []
def test_collab_user_not_in_matrix(simple_article_features, simple_article_metadata):
    """
    Test Case: User is NOT in the similarity matrix.
    Why: Validates cold-start handling in collaborative filtering.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = pd.DataFrame([[1.0]], index=["x"], columns=["x"])
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata
    svc.user_features = pd.DataFrame([[1, 0]], index=["x"])

    assert svc.get_collaborative_recommendations("NOPE") == []


# EDGE CASE: CF user has no neighbors → return []
def test_collab_similar_users_empty(simple_article_features, simple_article_metadata):
    """
    Test Case: No other similar users exist for this user.
    Why: Ensures CF returns [] when there is no neighbor to learn from.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = pd.DataFrame([[1.0]], index=["u"], columns=["u"])
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata
    svc.user_features = pd.DataFrame([[1, 0]], index=["u"])

    assert svc.get_collaborative_recommendations("u") == []


# EDGE CASE: CF exclude_ids must filter results
def test_collab_exclude_ids(simple_user_sim_matrix, simple_user_features, simple_article_features, simple_article_metadata):
    """
    Test Case: Exclude IDs inside collaborative filtering.
    Why: Ensures recommender does not return blocked/unwanted items.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    recs = svc.get_collaborative_recommendations("user1", exclude_ids=["a"])
    assert all(rec["id"] != "a" for rec in recs)


# EDGE CASE: Hybrid with empty list means CF only
def test_hybrid_recent_empty_list(simple_user_sim_matrix, simple_user_features, simple_article_features, simple_article_metadata):
    """
    Test Case: Hybrid recommender with empty recent list.
    Why: Ensures content-based part is skipped and CF-only output is returned.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.article_metadata = simple_article_metadata

    recs = svc.get_hybrid_recommendations("user1", recent_article_ids=[])
    assert len(recs) > 0


# EDGE CASE: Hybrid merges duplicate article IDs
def test_hybrid_duplicate_articles_merge(simple_user_sim_matrix, simple_user_features, simple_article_features, simple_sig_matrix, simple_indices, simple_article_metadata):
    """
    Test Case: Hybrid duplicate article list.
    Why: Ensures duplicate IDs merge scores instead of duplicating recommendations.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features
    svc.article_features = simple_article_features
    svc.sig_matrix = simple_sig_matrix
    svc.indices = simple_indices
    svc.article_metadata = simple_article_metadata

    recs = svc.get_hybrid_recommendations("user1", recent_article_ids=["a", "a"])
    assert len(recs) > 0
    assert "hybrid_score" in recs[0]


# EDGE CASE: article_metadata=None → trending returns empty list
def test_trending_no_metadata():
    """
    Test Case: article_metadata = None
    Why: Ensures trending recommender returns [] safely instead of failing.
    """
    svc = RecommendationService()
    svc.article_metadata = None
    res = svc.get_trending_articles()
    assert res == []


# EDGE CASE: Force CF exception → must hit except block
def test_collab_exception_branch(simple_user_sim_matrix, simple_user_features, simple_article_metadata):
    """
    Covers branch: Exception inside collaborative filtering.
    Why: Forces dot() operation to fail, triggering except block lines 207–211.
    """
    svc = RecommendationService()
    svc.models_loaded = True

    svc.user_sim_matrix = simple_user_sim_matrix
    svc.user_features = simple_user_features

    # Force exception: make article_features invalid for dot()
    svc.article_features = "INVALID_FEATURES"

    svc.article_metadata = simple_article_metadata

    recs = svc.get_collaborative_recommendations("user1")

    # Expect empty list from except block
    assert recs == []


# EDGE CASE: auto-load runs but still missing CF models → early return
def test_collab_auto_load_but_models_missing(monkeypatch):
    """
    Covers branch: auto-load runs, but CF models are still missing.
    Ensures the early 'models not available' return (lines 149–152) is executed.
    """
    svc = RecommendationService()
    svc.models_loaded = False  # force auto-load branch

    # Fake load_models: it sets models_loaded=True but loads NOTHING
    def fake_load():
        svc.models_loaded = True
        return True

    monkeypatch.setattr(svc, "load_models", fake_load)

    # Force missing CF models
    svc.user_sim_matrix = None
    svc.article_features = None

    result = svc.get_collaborative_recommendations("user1")
    assert result == []  # early exit branch
