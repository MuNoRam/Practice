// Dynamic Game State Management
let customMinutesSetting = 5; 
let p1Time = customMinutesSetting * 60;
let p2Time = customMinutesSetting * 60;
let activePlayer = null; 
let isMatchRunning = false;
let timerInterval = null;

let audioCtx = null;

// Cache DOM elements
const p1Box = document.getElementById('player1');
const p2Box = document.getElementById('player2');
const p1Display = document.getElementById('p1Display');
const p2Display = document.getElementById('p2Display');
const startBtn = document.getElementById('startBtn');
const configRow = document.getElementById('configRow');
const customMinsInput = document.getElementById('customMins');

// Initialize browser audio engine cleanly on interaction
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// 🔊 Sound 1: Satisfying mechanical clock plunger click
function playClickSound() {
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04); 

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04); 

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
        console.log("Audio layout bypass", e);
    }
}

// 🚨 Sound 2: Rhythmic alert beep for the final 10 seconds
function playAlertBeep() {
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.type = 'sine';
        // High, piercing warning frequency pitch
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime); 

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // Subtle but clear volume boundary
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08); // Short clean chirp

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.log("Audio alert bypass", e);
    }
}

function startMatch() {
    if (!isMatchRunning && activePlayer === null) {
        playClickSound();

        isMatchRunning = true;
        activePlayer = 1; 
        updateVisuals();
        runEngine();
        
        startBtn.textContent = "Running";
        startBtn.style.opacity = "0.5";
        configRow.classList.add('disabled'); 
    }
}

function runEngine() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isMatchRunning) return;

        if (activePlayer === 1) {
            if (p1Time > 0) {
                p1Time--;
                // Check for 10-second Red Alert boundary
                if (p1Time <= 10) {
                    p1Box.classList.add('low-time');
                    playAlertBeep(); // Trigger the urgency audio countdown
                }
            } else {
                flagOut(1);
            }
        } else if (activePlayer === 2) {
            if (p2Time > 0) {
                p2Time--;
                // Check for 10-second Red Alert boundary
                if (p2Time <= 10) {
                    p2Box.classList.add('low-time');
                    playAlertBeep(); // Trigger the urgency audio countdown
                }
            } else {
                flagOut(2);
            }
        }
        renderTimeStrings();
    }, 1000);
}

function handleClockTap(playerNum) {
    if (!isMatchRunning) return; 
    
    if (playerNum === 1 && activePlayer === 1) {
        playClickSound(); 
        activePlayer = 2;
        updateVisuals();
    } else if (playerNum === 2 && activePlayer === 2) {
        playClickSound(); 
        activePlayer = 1;
        updateVisuals();
    }
}

function setTimePreset(minutes) {
    customMinutesSetting = minutes;
    customMinsInput.value = minutes;
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active-preset');
        if(btn.textContent === `${minutes}m`) {
            btn.classList.add('active-preset');
        }
    });
    
    applyNewTimeConfig();
}

function handleCustomTimeChange(value) {
    let minutes = parseInt(value);
    if (isNaN(minutes) || minutes < 1) minutes = 1;
    if (minutes > 180) minutes = 180;
    
    customMinutesSetting = minutes;
    customMinsInput.value = minutes;
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active-preset');
        if(btn.textContent === `${minutes}m`) {
            btn.classList.add('active-preset');
        }
    });
    
    applyNewTimeConfig();
}

function applyNewTimeConfig() {
    p1Time = customMinutesSetting * 60;
    p2Time = customMinutesSetting * 60;
    renderTimeStrings();
}

function flagOut(losingPlayer) {
    isMatchRunning = false;
    clearInterval(timerInterval);
    
    p1Box.classList.remove('low-time');
    p2Box.classList.remove('low-time');
    
    if (losingPlayer === 1) p1Box.classList.add('flagged');
    if (losingPlayer === 2) p2Box.classList.add('flagged');
}

function updateVisuals() {
    if (activePlayer === 1) {
        p1Box.classList.add('active');
        p2Box.classList.remove('active');
    } else if (activePlayer === 2) {
        p2Box.classList.add('active');
        p1Box.classList.remove('active');
    }
}

function renderTimeStrings() {
    p1Display.textContent = formatTime(p1Time);
    p2Display.textContent = formatTime(p2Time);
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resetMatch() {
    clearInterval(timerInterval);
    activePlayer = null;
    isMatchRunning = false;
    
    applyNewTimeConfig(); 
    
    // Clear all classes safely
    p1Box.className = "player-box";
    p2Box.className = "player-box";
    configRow.classList.remove('disabled'); 
    
    startBtn.textContent = "Start";
    startBtn.style.opacity = "1";
}

renderTimeStrings();
