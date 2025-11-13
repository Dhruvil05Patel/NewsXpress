"""
Scheduler for Periodic Model Retraining
Trains models on a schedule (daily, weekly, monthly)
"""
import os
import sys
import schedule
import time
from datetime import datetime
from pathlib import Path
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from train_models import ModelTrainer
from cache_manager import get_cache_manager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class RetrainingScheduler:
    def __init__(self):
        self.trainer = ModelTrainer()
        self.cache_manager = get_cache_manager()
    
    def retrain_models(self):
        """Execute model retraining"""
        logger.info("=" * 60)
        logger.info(f"Starting scheduled model retraining at {datetime.now()}")
        logger.info("=" * 60)
        
        try:
            # Train models
            success = self.trainer.train_all()
            
            if success:
                logger.info("✅ Model retraining completed successfully")
                
                # Clear all recommendation caches
                logger.info("Clearing recommendation caches...")
                self.cache_manager.delete_pattern("rec:*")
                logger.info("✅ Caches cleared")
                
                # Reload models in running services (they will auto-reload on next request)
                logger.info("Models will be reloaded on next API request")
                
            else:
                logger.error("❌ Model retraining failed")
            
        except Exception as e:
            logger.error(f"❌ Error during retraining: {e}")
            import traceback
            traceback.print_exc()
    
    def run_daily(self, hour=2, minute=0):
        """Schedule daily retraining"""
        schedule_time = f"{hour:02d}:{minute:02d}"
        schedule.every().day.at(schedule_time).do(self.retrain_models)
        logger.info(f"📅 Scheduled daily retraining at {schedule_time}")
    
    def run_weekly(self, day='monday', hour=2, minute=0):
        """Schedule weekly retraining"""
        schedule_time = f"{hour:02d}:{minute:02d}"
        getattr(schedule.every(), day.lower()).at(schedule_time).do(self.retrain_models)
        logger.info(f"📅 Scheduled weekly retraining on {day} at {schedule_time}")
    
    def run_monthly(self, day=1, hour=2, minute=0):
        """
        Schedule monthly retraining (approximated with monthly check)
        """
        def monthly_job():
            if datetime.now().day == day:
                self.retrain_models()
        
        schedule_time = f"{hour:02d}:{minute:02d}"
        schedule.every().day.at(schedule_time).do(monthly_job)
        logger.info(f"📅 Scheduled monthly retraining on day {day} at {schedule_time}")
    
    def start(self):
        """Start the scheduler"""
        logger.info("🚀 Starting retraining scheduler")
        logger.info("Press Ctrl+C to stop")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("🛑 Scheduler stopped")


def main():
    """Main scheduler function"""
    scheduler = RetrainingScheduler()
    
    # Get schedule configuration from environment
    schedule_type = os.getenv('RETRAIN_SCHEDULE', 'weekly').lower()
    
    if schedule_type == 'daily':
        hour = int(os.getenv('RETRAIN_HOUR', 2))
        minute = int(os.getenv('RETRAIN_MINUTE', 0))
        scheduler.run_daily(hour=hour, minute=minute)
        
    elif schedule_type == 'weekly':
        day = os.getenv('RETRAIN_DAY', 'sunday')
        hour = int(os.getenv('RETRAIN_HOUR', 2))
        minute = int(os.getenv('RETRAIN_MINUTE', 0))
        scheduler.run_weekly(day=day, hour=hour, minute=minute)
        
    elif schedule_type == 'monthly':
        day = int(os.getenv('RETRAIN_DAY', 1))
        hour = int(os.getenv('RETRAIN_HOUR', 2))
        minute = int(os.getenv('RETRAIN_MINUTE', 0))
        scheduler.run_monthly(day=day, hour=hour, minute=minute)
    
    else:
        logger.error(f"Invalid schedule type: {schedule_type}")
        logger.info("Valid types: daily, weekly, monthly")
        sys.exit(1)
    
    # Run immediately if requested
    if os.getenv('RETRAIN_ON_START', 'false').lower() == 'true':
        logger.info("Running initial training...")
        scheduler.retrain_models()
    
    # Start scheduler
    scheduler.start()


if __name__ == '__main__':
    main()
