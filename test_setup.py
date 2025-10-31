#!/usr/bin/env python3
"""
Quick setup test to verify the backend can be imported correctly
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from main import app
    print("Backend imports successfully!")
    print(f"FastAPI app created: {app.title}")
    print("All dependencies are installed correctly")
except ImportError as e:
    print(f" Import error: {e}")
    print("\nPlease install dependencies:")
    print("  cd backend")
    print("  pip install -r requirements.txt")
    sys.exit(1)

print("\n Setup complete! You can now run:")
print("  bash start_backend.sh")
print("\nOr manually:")
print("  cd backend")
print("  uvicorn main:app --reload")

