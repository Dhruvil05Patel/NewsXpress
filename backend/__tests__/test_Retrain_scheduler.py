
import os
import sys
import schedule
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime
import backend.Ml_model.Retrain_scheduler as rs


# TC1 – Successful retraining
def test_retrain_models_success(monkeypatch, caplog):
    """TC1: Cache should clear and logs should show success."""
    mock_trainer = MagicMock()
    mock_trainer.train_all.return_value = True

    mock_cache = MagicMock()

    monkeypatch.setattr(rs, "ModelTrainer", lambda: mock_trainer)
    monkeypatch.setattr(rs, "get_cache_manager", lambda: mock_cache)

    with caplog.at_level(rs.logging.INFO):
        scheduler = rs.RetrainingScheduler()
        scheduler.retrain_models()

    mock_trainer.train_all.assert_called_once()
    mock_cache.delete_pattern.assert_called_once_with("rec:*")
    assert "successfully" in caplog.text.lower()


# TC1 – Failed retraining
def test_retrain_models_failure(monkeypatch, caplog):
    """TC1: Training failure should log error and not clear cache."""
    mock_trainer = MagicMock()
    mock_trainer.train_all.return_value = False

    mock_cache = MagicMock()

    monkeypatch.setattr(rs, "ModelTrainer", lambda: mock_trainer)
    monkeypatch.setattr(rs, "get_cache_manager", lambda: mock_cache)

    with caplog.at_level(rs.logging.ERROR):
        scheduler = rs.RetrainingScheduler()
        scheduler.retrain_models()

    mock_cache.delete_pattern.assert_not_called()
    assert "failed" in caplog.text.lower()


# TC1 – Retraining exception edge case
def test_retrain_models_exception(monkeypatch, caplog):
    """TC1 (edge case): Exception during training should be logged."""
    mock_trainer = MagicMock()
    mock_trainer.train_all.side_effect = Exception("boom")

    monkeypatch.setattr(rs, "ModelTrainer", lambda: mock_trainer)
    monkeypatch.setattr(rs, "get_cache_manager", lambda: MagicMock())

    with caplog.at_level(rs.logging.ERROR):
        scheduler = rs.RetrainingScheduler()
        scheduler.retrain_models()

    assert "error during retraining" in caplog.text.lower()


# TC2 – Daily scheduling setup
def test_run_daily(monkeypatch):
    """TC2: run_daily should configure daily schedule correctly."""
    mock_day = MagicMock()
    mock_every = MagicMock()
    mock_every.day = mock_day

    monkeypatch.setattr(schedule, "every", lambda: mock_every)

    scheduler = rs.RetrainingScheduler()
    scheduler.retrain_models = MagicMock()

    scheduler.run_daily(hour=3, minute=30)

    mock_day.at.assert_called_once_with("03:30")
    mock_day.at.return_value.do.assert_called_once()


# TC2 – Weekly scheduling setup
def test_run_weekly(monkeypatch):
    """TC2: run_weekly should configure weekly schedule correctly."""
    mock_day = MagicMock()
    mock_every = MagicMock()
    setattr(mock_every, "monday", mock_day)

    monkeypatch.setattr(schedule, "every", lambda: mock_every)

    scheduler = rs.RetrainingScheduler()
    scheduler.retrain_models = MagicMock()

    scheduler.run_weekly(day="monday", hour=4, minute=0)

    mock_day.at.assert_called_once_with("04:00")
    mock_day.at.return_value.do.assert_called_once()


# TC2 – Monthly schedule executes on matching day
def test_run_monthly_executes(monkeypatch):
    """TC2 (edge case): Monthly job should run only when day matches."""
    scheduler = rs.RetrainingScheduler()
    scheduler.retrain_models = MagicMock()

    monkeypatch.setattr(rs, "datetime", MagicMock(now=lambda: datetime(2025, 1, 5)))

    mock_at = MagicMock()
    mock_day = MagicMock(at=lambda t: mock_at)
    mock_every = MagicMock()
    mock_every.day = mock_day

    monkeypatch.setattr(schedule, "every", lambda: mock_every)

    scheduler.run_monthly(day=5, hour=2, minute=0)

    job_func = mock_at.do.call_args[0][0]
    job_func()

    scheduler.retrain_models.assert_called_once()


# TC2 – Monthly schedule skips when day does not match
def test_run_monthly_no_execute(monkeypatch):
    """TC2 (edge case): Monthly job must NOT run on wrong day."""
    scheduler = rs.RetrainingScheduler()
    scheduler.retrain_models = MagicMock()

    monkeypatch.setattr(rs, "datetime", MagicMock(now=lambda: datetime(2025, 1, 7)))

    mock_at = MagicMock()
    mock_day = MagicMock(at=lambda t: mock_at)
    mock_every = MagicMock()
    mock_every.day = mock_day

    monkeypatch.setattr(schedule, "every", lambda: mock_every)

    scheduler.run_monthly(day=5, hour=2, minute=0)

    job_func = mock_at.do.call_args[0][0]
    job_func()

    scheduler.retrain_models.assert_not_called()


# TC3 – main() daily route
def test_main_daily(monkeypatch):
    """TC3: RETRAIN_SCHEDULE=daily should call run_daily with env vars."""
    monkeypatch.setenv("RETRAIN_SCHEDULE", "daily")
    monkeypatch.setenv("RETRAIN_HOUR", "1")
    monkeypatch.setenv("RETRAIN_MINUTE", "15")

    mock_sched = MagicMock()
    mock_sched.start = lambda: None
    monkeypatch.setattr(rs, "RetrainingScheduler", lambda: mock_sched)

    rs.main()

    mock_sched.run_daily.assert_called_once_with(hour=1, minute=15)


# TC3 – Invalid schedule type
def test_main_invalid_schedule(monkeypatch):
    """TC3 (edge case): Invalid schedule should trigger sys.exit."""
    monkeypatch.setenv("RETRAIN_SCHEDULE", "nonsense")

    mock_exit = {"called": False}
    monkeypatch.setattr(sys, "exit", lambda code: mock_exit.update({"called": True}))

    mock_sched = MagicMock()
    monkeypatch.setattr(rs, "RetrainingScheduler", lambda: mock_sched)

    rs.main()

    assert mock_exit["called"] is True


# TC3 – RETRAIN_ON_START=true triggers immediate retrain
def test_main_runs_on_start(monkeypatch):
    """TC3: RETRAIN_ON_START=true should run retrain_models immediately."""
    monkeypatch.setenv("RETRAIN_SCHEDULE", "daily")
    monkeypatch.setenv("RETRAIN_ON_START", "true")

    mock_sched = MagicMock()
    mock_sched.start = lambda: None
    monkeypatch.setattr(rs, "RetrainingScheduler", lambda: mock_sched)

    rs.main()

    mock_sched.retrain_models.assert_called_once()


# TC4 – Test start() loop (infinite loop safe test)
def test_scheduler_start_runs_once(monkeypatch, caplog):
    """TC4: start() should run pending jobs at least once and stop via KeyboardInterrupt."""
    monkeypatch.setattr(rs.time, "sleep", lambda x: None)

    calls = {"count": 0}

    def run_pending_wrapper():
        calls["count"] += 1
        if calls["count"] == 2:
            raise KeyboardInterrupt()

    monkeypatch.setattr(rs.schedule, "run_pending", run_pending_wrapper)

    scheduler = rs.RetrainingScheduler()

    with caplog.at_level(rs.logging.INFO):
        scheduler.start()

    assert calls["count"] >= 1
    assert "stopped" in caplog.text.lower()


# TC3 – main() weekly routing
def test_main_weekly(monkeypatch):
    """TC3: RETRAIN_SCHEDULE=weekly should call run_weekly."""
    monkeypatch.setenv("RETRAIN_SCHEDULE", "weekly")
    monkeypatch.setenv("RETRAIN_DAY", "friday")
    monkeypatch.setenv("RETRAIN_HOUR", "7")
    monkeypatch.setenv("RETRAIN_MINUTE", "45")

    mock_sched = MagicMock()
    mock_sched.start = lambda: None
    monkeypatch.setattr(rs, "RetrainingScheduler", lambda: mock_sched)

    rs.main()

    mock_sched.run_weekly.assert_called_once_with(day="friday", hour=7, minute=45)


# TC3 – main() monthly routing
def test_main_monthly(monkeypatch):
    """TC3: RETRAIN_SCHEDULE=monthly should call run_monthly."""
    monkeypatch.setenv("RETRAIN_SCHEDULE", "monthly")
    monkeypatch.setenv("RETRAIN_DAY", "10")
    monkeypatch.setenv("RETRAIN_HOUR", "3")
    monkeypatch.setenv("RETRAIN_MINUTE", "20")

    mock_sched = MagicMock()
    mock_sched.start = lambda: None
    monkeypatch.setattr(rs, "RetrainingScheduler", lambda: mock_sched)

    rs.main()

    mock_sched.run_monthly.assert_called_once_with(day=10, hour=3, minute=20)
