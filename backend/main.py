from datetime import datetime, timedelta
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./brex_challenge.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    total_clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Click(Base):
    __tablename__ = "clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="Brex Click Challenge API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserCreate(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    total_clicks: int
    
    class Config:
        from_attributes = True

class ClickCreate(BaseModel):
    userName: str
    timestamp: int

class ClickResponse(BaseModel):
    id: int
    user_name: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    name: str
    total_clicks: int
    
    class Config:
        from_attributes = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Routes

@app.get("/")
def read_root():
    return {"message": "Brex Click Challenge API", "version": "1.0.0"}

# USER CRUD OPERATIONS

@app.post("/api/users", response_model=UserResponse)
def create_user(user: UserCreate, db=Depends(get_db)):
    """Create a new user"""
    # Check if user already exists
    existing = db.query(User).filter(User.name == user.name).first()
    if existing:
        return existing
    
    db_user = User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db=Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return users

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db=Depends(get_db)):
    """Get a specific user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db=Depends(get_db)):
    """Update a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.name = user.name
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# CLICK OPERATIONS

@app.post("/api/clicks", response_model=ClickResponse)
def create_click(click: ClickCreate, db=Depends(get_db)):
    """Record a click"""
    # Check if user exists
    user = db.query(User).filter(User.name == click.userName).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check for rate limiting (anti-cheat)
    recent_clicks = db.query(Click).filter(
        Click.user_name == click.userName
    ).order_by(Click.timestamp.desc()).limit(5).all()
    
    if len(recent_clicks) >= 5:
        time_diff = (datetime.utcnow() - recent_clicks[4].timestamp).total_seconds()
        if time_diff < 0.5:
            raise HTTPException(status_code=429, detail="Too many clicks! Slow down.")
    
    # Create click record
    db_click = Click(
        user_name=click.userName,
        timestamp=datetime.fromtimestamp(click.timestamp / 1000)
    )
    db.add(db_click)
    
    # Update user's total clicks
    user.total_clicks += 1
    db.commit()
    db.refresh(db_click)
    
    return db_click

@app.get("/api/clicks", response_model=List[ClickResponse])
def get_clicks(limit: int = 100, db=Depends(get_db)):
    """Get all clicks (limited)"""
    clicks = db.query(Click).order_by(Click.timestamp.desc()).limit(limit).all()
    return clicks

@app.get("/api/clicks/{click_id}", response_model=ClickResponse)
def get_click(click_id: int, db=Depends(get_db)):
    """Get a specific click by ID"""
    click = db.query(Click).filter(Click.id == click_id).first()
    if not click:
        raise HTTPException(status_code=404, detail="Click not found")
    return click

# LEADERBOARD

@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(limit: int = 10, db=Depends(get_db)):
    """Get top users by total clicks"""
    users = db.query(User).order_by(User.total_clicks.desc()).limit(limit).all()
    return [
        LeaderboardEntry(name=user.name, total_clicks=user.total_clicks)
        for user in users
    ]

# USER STATISTICS

@app.get("/api/stats/{user_name}")
def get_user_stats(user_name: str, db=Depends(get_db)):
    """Get statistics for a specific user"""
    user = db.query(User).filter(User.name == user_name).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate rank
    rank = db.query(User).filter(User.total_clicks > user.total_clicks).count() + 1
    
    # Count today's clicks
    today = datetime.utcnow().date()
    today_clicks = db.query(Click).filter(
        Click.user_name == user_name,
        Click.timestamp >= datetime.combine(today, datetime.min.time())
    ).count()
    
    return {
        "name": user.name,
        "total_clicks": user.total_clicks,
        "rank": rank,
        "today_clicks": today_clicks,
        "created_at": user.created_at
    }
