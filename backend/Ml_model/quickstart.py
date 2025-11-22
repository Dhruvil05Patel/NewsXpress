"""
Quick start script to train models and start ML API
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a shell command and report status"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, text=True, 
                              capture_output=True)
        print(result.stdout)
        print(f"✅ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("\n" + "="*60)
    print("🚀 NewsXpress ML Quick Start")
    print("="*60)
    
    ml_dir = Path(__file__).resolve().parent
    os.chdir(ml_dir)
    
    # Step 1: Train models
    print("\n📚 Step 1: Training ML models...")
    print("This may take a few minutes depending on your data size...")
    if not run_command("python train_models.py", "Model Training"):
        print("\n⚠️  Model training failed. Check your database connection and data.")
        sys.exit(1)
    
    # Step 2: Check models
    models_dir = ml_dir / 'models'
    required_files = [
        'tfidf_vectorizer.pkl',
        'sigmoid_matrix.pkl',
        'article_indices.pkl',
        'article_metadata.csv'
    ]
    
    print("\n📦 Step 2: Verifying trained models...")
    all_exist = True
    for file in required_files:
        if (models_dir / file).exists():
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} - MISSING")
            all_exist = False
    
    if not all_exist:
        print("\n⚠️  Some model files are missing. Please check training logs.")
        sys.exit(1)
    
    # Step 3: Start ML API (optional)
    print("\n" + "="*60)
    print("🎉 Setup Complete!")
    print("="*60)
    print("\nYour ML models are trained and ready to use!")
    print("\nTo start the ML API server, run:")
    print("  python api_server.py")
    print("\nTo start the retraining scheduler, run:")
    print("  python retrain_scheduler.py")
    print("\nFor more options, see README.md")
    print("")

if __name__ == '__main__':
    main()
