// API Configuration
const API_BASE = 'http://localhost:8000/api';

// Global State
let userName = '';
let clickCount = 0;
let sessionClicks = 0;
let sessionStartTime = null;
let sessionTimer = null;
let timeLimit = 10; // Default 10 seconds
let timeRemaining = 10;
let currentPowerUp = null;
let powerUpTimer = null;

// DOM Elements
const nameForm = document.getElementById('nameForm');
const gameScreen = document.getElementById('gameScreen');
const nameInput = document.getElementById('nameInput');
const playerNameDisplay = document.getElementById('playerName');
const totalClicksDisplay = document.getElementById('totalClicks');
const clickRateDisplay = document.getElementById('clickRate');
const sessionTimeDisplay = document.getElementById('sessionTime');
const leaderboardContainer = document.getElementById('leaderboard');
const powerUpIndicator = document.getElementById('powerUpIndicator');

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

// Handle Time Selection
function selectTime(seconds) {
    timeLimit = seconds;
    timeRemaining = seconds;
    
    // Update button styles
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.time) === seconds) {
            btn.classList.add('active');
        }
    });
}

// Handle Start Game
async function handleStart() {
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    
    userName = name;
    playerNameDisplay.textContent = userName;
    
    // Initialize user in backend
    try {
        await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: userName })
        });
    } catch (error) {
        console.error('Error initializing user:', error);
    }
    
    // Switch screens
    nameForm.classList.remove('active');
    gameScreen.classList.add('active');
    
    // Start timer
    timeRemaining = timeLimit;
    startSessionTimer();
}

// Handle Click
async function handleClick() {
    if (!userName || timeRemaining <= 0) return;
    
    let multiplier = 1;
    
    // Apply power-up effects
    if (currentPowerUp === 'double') {
        multiplier = 2;
    } else if (currentPowerUp === 'mega') {
        multiplier = 5;
    }
    
    sessionClicks += multiplier;
    clickCount += multiplier;
    
    // Update display
    totalClicksDisplay.textContent = clickCount;
    
    // Randomly spawn power-ups (5% chance)
    if (Math.random() < 0.05 && !currentPowerUp) {
        activateRandomPowerUp();
    }
    
    // Send click to backend (only count 1 for backend, power-ups are frontend only)
    try {
        const response = await fetch(`${API_BASE}/clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: userName,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            if (response.status === 429) {
                alert(error.detail || 'Too fast! Slow down.');
                // Count the click but show message
            }
        }
    } catch (error) {
        console.error('Error recording click:', error);
        // Still count the click even if backend fails
    }
}

// Start Session Timer
function startSessionTimer() {
    sessionStartTime = Date.now();
    
    sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        timeRemaining = timeLimit - elapsed;
        
        // Update display
        if (timeRemaining > 0) {
            sessionTimeDisplay.textContent = `${timeRemaining}s`;
        } else {
            sessionTimeDisplay.textContent = '0s';
        }
        
        // Visual urgency effects when time is running low
        const contentWrapper = document.querySelector('.content-wrapper');
        const clickBtn = document.getElementById('clickBtn');
        
        // Start shaking when 3 seconds or less remain
        if (timeRemaining <= 3 && timeRemaining > 0) {
            if (!contentWrapper.classList.contains('shake')) {
                contentWrapper.classList.add('shake');
                clickBtn.classList.add('shake');
                // Make timer red and pulse
                sessionTimeDisplay.style.color = '#ff4444';
                sessionTimeDisplay.style.animation = 'pulse 0.5s infinite';
            }
        } else {
            contentWrapper.classList.remove('shake');
            clickBtn.classList.remove('shake');
            sessionTimeDisplay.style.color = '';
            sessionTimeDisplay.style.animation = '';
        }
        
        // Calculate clicks per second
        if (elapsed > 0) {
            const cps = (sessionClicks / elapsed).toFixed(2);
            clickRateDisplay.textContent = cps;
        }
        
        // Check if time limit reached
        if (timeRemaining <= 0) {
            endChallenge();
        }
    }, 100);
}

// End Challenge
function endChallenge() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
    
    // Clear power-up
    deactivatePowerUp();
    
    // Clear shake effects
    const contentWrapper = document.querySelector('.content-wrapper');
    const clickBtn = document.getElementById('clickBtn');
    contentWrapper.classList.remove('shake');
    clickBtn.classList.remove('shake');
    
    // Disable click button
    clickBtn.disabled = true;
    clickBtn.textContent = '⏱ Time\'s Up!';
    clickBtn.style.opacity = '0.6';
    
    // Show results after a moment
    setTimeout(() => {
        alert(`Challenge Complete!\n\nYou clicked ${sessionClicks} times in ${timeLimit} seconds!\nAverage: ${(sessionClicks / timeLimit).toFixed(2)} clicks/second`);
        handleReset();
    }, 1000);
}

// Handle Reset
function handleReset() {
    // Clear timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
    
    // Reset state
    userName = '';
    clickCount = 0;
    sessionClicks = 0;
    sessionStartTime = null;
    timeRemaining = timeLimit;
    currentPowerUp = null;
    
    // Clear power-up timer
    if (powerUpTimer) clearTimeout(powerUpTimer);
    
    // Re-enable click button
    const clickBtn = document.getElementById('clickBtn');
    clickBtn.disabled = false;
    clickBtn.textContent = 'CLICK ME';
    clickBtn.style.opacity = '1';
    
    // Reset displays
    nameInput.value = '';
    totalClicksDisplay.textContent = '0';
    clickRateDisplay.textContent = '0';
    sessionTimeDisplay.textContent = `${timeLimit}s`;
    
    // Clear any shake effects
    const contentWrapper = document.querySelector('.content-wrapper');
    contentWrapper.classList.remove('shake');
    clickBtn.classList.remove('shake');
    sessionTimeDisplay.style.color = '';
    sessionTimeDisplay.style.animation = '';
    
    // Clear power-up indicator
    powerUpIndicator.classList.add('hidden');
    powerUpIndicator.classList.remove('double', 'slowmo', 'mega');
    powerUpIndicator.textContent = '';
    
    // Switch screens
    gameScreen.classList.remove('active');
    nameForm.classList.add('active');
    nameInput.focus();
    
    // Reload leaderboard
    loadLeaderboard();
}

// Load Leaderboard
async function loadLeaderboard() {
    leaderboardContainer.innerHTML = '<div class="empty-state">Loading...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const data = await response.json();
        
        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<div class="empty-state">No entries yet. Be the first!</div>';
            return;
        }
        
        leaderboardContainer.innerHTML = '';
        
        data.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            // Highlight current user
            if (entry.name === userName) {
                item.classList.add('current-user');
            }
            
            item.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="name">${entry.name}</span>
                <span class="score">${entry.total_clicks} clicks</span>
            `;
            
            leaderboardContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardContainer.innerHTML = `<div class="empty-state">Error loading leaderboard: ${error.message}</div>`;
    }
}

// Auto-refresh leaderboard every 30 seconds
setInterval(() => {
    loadLeaderboard();
}, 30000);

// Allow Enter key to submit name
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleStart();
    }
});

// Brex Easter Egg
function triggerBrexEasterEgg() {
    const brexTitle = document.querySelector('.brex-title');
    brexTitle.classList.add('active');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        brexTitle.classList.remove('active');
    }, 500);
    
    // Create confetti explosion
    createConfettiExplosion();
    
    // Play a fun sound effect (optional - just a visual for now)
    console.log('🎉 Brex Easter Egg Activated! 🎉');
}

function createConfettiExplosion() {
    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Power-up Functions
function activateRandomPowerUp() {
    const powerUps = ['double', 'slowmo', 'mega'];
    const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
    currentPowerUp = randomPowerUp;
    
    // Show indicator
    powerUpIndicator.classList.remove('hidden', 'double', 'slowmo', 'mega');
    powerUpIndicator.classList.add(randomPowerUp);
    
    if (randomPowerUp === 'double') {
        powerUpIndicator.textContent = '⚡⚡ DOUBLE CLICKS ACTIVATED! ⚡⚡';
    } else if (randomPowerUp === 'slowmo') {
        powerUpIndicator.textContent = '⏱️ SLOW MOTION - TIME ADDED! ⏱️';
        // Add extra time for slowmo
        timeRemaining += 3;
    } else if (randomPowerUp === 'mega') {
        powerUpIndicator.textContent = '💥 MEGA CLICKS x5! 💥';
    }
    
    // Auto-remove after 5 seconds
    if (powerUpTimer) clearTimeout(powerUpTimer);
    powerUpTimer = setTimeout(() => {
        deactivatePowerUp();
    }, 5000);
}

function deactivatePowerUp() {
    currentPowerUp = null;
    powerUpIndicator.classList.add('hidden');
    powerUpIndicator.classList.remove('double', 'slowmo', 'mega');
    powerUpIndicator.textContent = '';
}

