# 🚀 Brex Click Challenge

A simple and fun click counter application built with vanilla JavaScript, FastAPI, and SQLite. Test your clicking speed and compete on the leaderboard!

## 🎯 Features

### Core Features
- **Click Counter**: Track your total clicks in real-time
- **Leaderboard**: Compete with other users for the top spot
- **Real-time Stats**: See your clicks per second and session time
- **User Profiles**: Simple name-based user system

### Cool Features
- **Anti-Cheat Protection**: Detects suspicious clicking patterns
- **Click Rate Tracking**: Monitor your clicks per second
- **Session Timer**: Track your clicking session duration
- **Responsive Design**: Works beautifully on mobile and desktop
- **Live Leaderboard**: Auto-refreshes every 30 seconds
- **Beautiful UI**: Modern gradient design with smooth animations

## 🛠 Tech Stack

### Frontend
- **Vanilla HTML** - Clean, simple markup
- **Vanilla CSS** - Modern gradients and animations
- **Vanilla JavaScript** - No frameworks, just pure JS
- **Fetch API** - For backend communication

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy ORM** - Database abstraction layer
- **SQLite** - Simple, file-based database

## 📋 Prerequisites

- **Python 3.8+** (for backend)
- **Web Browser** (for frontend)

## 🚀 Getting Started

### Quick Start

1. **Start the backend server**
   ```bash
   bash start_backend.sh
   ```
   The API will run on http://localhost:8000

2. **Open the frontend**
   
   Option A - Using a simple HTTP server:
   ```bash
   # Python 3
   python3 -m http.server 3000
   
   # Or Node.js (if installed)
   npx http-server -p 3000
   ```
   
   Option B - Just open `index.html` directly in your browser
   
3. **Visit** http://localhost:3000 (or the port you chose)

### Manual Setup

**Backend Setup:**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

**Frontend Setup:**
- No build process needed! Just open `index.html` in your browser
- Or use any static file server (Python's http.server, Node's http-server, etc.)

## 📡 API Endpoints

### Users (CRUD)
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get specific user
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Clicks
- `POST /api/clicks` - Record a click (includes anti-cheat)
- `GET /api/clicks` - Get all clicks
- `GET /api/clicks/{click_id}` - Get specific click

### Leaderboard
- `GET /api/leaderboard?limit=10` - Get top users by clicks

### Stats
- `GET /api/stats/{user_name}` - Get user statistics

## 🗄 Database Schema

### Users Table
```sql
- id: Integer (Primary Key)
- name: String (Unique)
- total_clicks: Integer (Default: 0)
- created_at: DateTime
```

### Clicks Table
```sql
- id: Integer (Primary Key)
- user_name: String
- timestamp: DateTime
```

The database file (`brex_challenge.db`) is automatically created on first run.

## 🎨 Project Structure

```
workshop_brex/
├── backend/
│   ├── main.py              # FastAPI application + CRUD operations
│   ├── requirements.txt     # Python dependencies
│   ├── venv/               # Virtual environment (auto-generated)
│   └── brex_challenge.db   # SQLite database (auto-generated)
├── index.html              # Main HTML file
├── styles.css              # All styles
├── script.js               # All JavaScript logic
├── start_backend.sh        # Backend startup script
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## ✨ Cool Features to Add

Here are some ideas to enhance the app:
- 🏆 Achievement badges (First 100 clicks, Speed Demon, Marathon Clicker)
- 🎯 Daily challenges with special goals
- 📊 Historical graphs showing click patterns
- 👥 Multiplayer real-time competitions
- 🎨 Themes and color customization
- 🔔 Sound effects and haptic feedback
- 📱 Progressive Web App (PWA) support
- 🔐 User authentication and profiles
- 💾 Local storage for offline mode
- 🌐 Global vs local leaderboards

## 🔧 Development

The backend uses FastAPI's automatic interactive documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

The frontend is vanilla JS - no build tools needed! Just edit the files and refresh your browser.

## 📝 Notes

- SQLite database persists all data in `backend/brex_challenge.db`
- CORS is configured for localhost:3000, 127.0.0.1:5500, and localhost:8080
- Anti-cheat limits clicks to prevent abuse
- Leaderboard auto-refreshes every 30 seconds
- All timestamps are stored in UTC

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure port 8000 is available
- Check that all Python dependencies are installed
- Verify Python version is 3.8+

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Try opening browser dev tools to see error messages

**Database issues:**
- Delete `backend/brex_challenge.db` to reset the database
- Tables are auto-created on server start

## 📄 License

MIT License - feel free to use this as a learning project!

---

**Happy Clicking! 🔥**
