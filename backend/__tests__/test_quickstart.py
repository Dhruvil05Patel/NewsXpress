
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock
import sys
import backend.Ml_model.quickstart


# Test run_command() — success case
def test_run_command_success():
    """run_command should return True when subprocess succeeds."""
    mock_result = MagicMock()
    mock_result.stdout = "OK"

    with patch("subprocess.run", return_value=mock_result):
        ok = backend.Ml_model.quickstart.run_command("echo test", "Test Command")
        assert ok is True


# Test run_command() — failure case
def test_run_command_failure():
    """run_command should return False when subprocess fails."""
    with patch("subprocess.run", side_effect=subprocess.CalledProcessError(1, "cmd", stderr="error")):
        ok = backend.Ml_model.quickstart.run_command("bad_cmd", "Failing Command")
        assert ok is False


# Edge Case: ensure stderr appears in CalledProcessError
def test_run_command_failure_stderr():
    """Ensure stderr is captured and no crash occurs."""
    with patch("subprocess.run",
               side_effect=subprocess.CalledProcessError(1, "cmd", stderr="fatal error")):
        ok = backend.Ml_model.quickstart.run_command("cmd", "Failing Command")
        assert ok is False


# Test required model file logic (all exist)
def test_required_model_files(tmp_path):
    """All required model files should exist."""
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    required_files = [
        'tfidf_vectorizer.pkl',
        'sigmoid_matrix.pkl',
        'article_indices.pkl',
        'article_metadata.csv'
    ]

    for file in required_files:
        (models_dir / file).write_text("dummy")

    for file in required_files:
        assert (models_dir / file).exists()


# Test missing model file logic
def test_missing_model_files(tmp_path):
    """If only one file exists, missing count should be 3."""
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    required_files = [
        'tfidf_vectorizer.pkl',
        'sigmoid_matrix.pkl',
        'article_indices.pkl',
        'article_metadata.csv'
    ]

    # Only create one file
    (models_dir / 'tfidf_vectorizer.pkl').write_text("dummy")

    missing = [file for file in required_files if not (models_dir / file).exists()]
    assert len(missing) == 3


# Test main() — success path
def test_main_success(monkeypatch, capsys, tmp_path):
    """
    main() should complete successfully when:
    - run_command succeeds
    - all model files exist
    - no failure triggers sys.exit
    """

    # Mock Path(__file__).resolve().parent → tmp_path
    class MockPath:
        def __init__(self, *args):
            self.path = tmp_path
        def resolve(self):
            return self
        @property
        def parent(self):
            return tmp_path
        def __truediv__(self, item):
            return tmp_path / item

    monkeypatch.setattr(backend.Ml_model.quickstart, "Path", MockPath)

    # Mock os.chdir
    monkeypatch.setattr(backend.Ml_model.quickstart.os, "chdir", lambda x: None)

    # Mock run_command → always returns True
    monkeypatch.setattr(backend.Ml_model.quickstart, "run_command", lambda cmd, desc: True)

    # Create required models directory + files
    models_dir = tmp_path / "models"
    models_dir.mkdir()

    required_files = [
        'tfidf_vectorizer.pkl',
        'sigmoid_matrix.pkl',
        'article_indices.pkl',
        'article_metadata.csv'
    ]
    for file in required_files:
        (models_dir / file).write_text("dummy")

    # Prevent sys.exit from stopping the test
    monkeypatch.setattr(sys, "exit", lambda x: None)

    backend.Ml_model.quickstart.main()

    output = capsys.readouterr().out
    assert "Setup Complete" in output


# Edge Case: main() should call sys.exit when model files missing
def test_main_missing_files_exit(monkeypatch, capsys, tmp_path):
    """main() should sys.exit when any required model file is missing."""

    # Mock Path to tmp_path
    class MockPath:
        def __init__(self, *args):
            self.path = tmp_path
        def resolve(self):
            return self
        @property
        def parent(self):
            return tmp_path
        def __truediv__(self, item):
            return tmp_path / item

    monkeypatch.setattr(backend.Ml_model.quickstart, "Path", MockPath)
    monkeypatch.setattr(backend.Ml_model.quickstart.os, "chdir", lambda x: None)

    # Mock run_command as successful
    monkeypatch.setattr(backend.Ml_model.quickstart, "run_command", lambda cmd, desc: True)

    # Create ONLY ONE required file → triggers failure
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    (models_dir / "tfidf_vectorizer.pkl").write_text("dummy")

    # Capture sys.exit call
    exit_called = {"value": False}
    def fake_exit(code):
        exit_called["value"] = True
    monkeypatch.setattr(sys, "exit", fake_exit)

    backend.Ml_model.quickstart.main()

    # Validate exit was triggered
    assert exit_called["value"] is True

    output = capsys.readouterr().out
    assert "missing" in output.lower()
