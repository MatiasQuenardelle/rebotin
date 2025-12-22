import { Game } from './game.js';
import { Input } from './input.js';

// Check for nephew mode (hides speed controls)
const urlParams = new URLSearchParams(window.location.search);
const nephewMode = urlParams.has('nephew') || urlParams.has('kids');

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Create input handler
const input = new Input(canvas);

// Create game instance
const game = new Game(canvas, input);

// Speed controls setup
const speedControls = document.getElementById('speedControls');
const speedButtons = document.querySelectorAll('.speed-btn');
const gyroBtn = document.getElementById('gyroBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameContainer = document.querySelector('.game-container');

// Hide controls in nephew mode
if (nephewMode) {
    speedControls.classList.add('hidden');
}

// Show gyro button if device supports it (mobile devices)
if (input.isGyroAvailable() && 'ontouchstart' in window) {
    gyroBtn.classList.remove('hidden');
}

// Gyro button click handler
gyroBtn.addEventListener('click', async () => {
    const enabled = await input.requestGyroPermission();
    if (enabled) {
        gyroBtn.classList.add('active');
        gyroBtn.textContent = 'Tilt: ON';
    } else {
        alert('Could not enable tilt controls. Please allow motion sensor access.');
    }
});

// Speed button click handlers
speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const speedMultiplier = parseFloat(btn.dataset.speed);

        // Update active button
        speedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update game speed
        game.setSpeedMultiplier(speedMultiplier);
    });
});

// Fullscreen functionality
let isFullscreen = false;

function toggleFullscreen() {
    if (!isFullscreen) {
        // Enter fullscreen
        const elem = gameContainer;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenState() {
    const fullscreenElement = document.fullscreenElement ||
                              document.webkitFullscreenElement ||
                              document.msFullscreenElement;

    isFullscreen = !!fullscreenElement;

    if (isFullscreen) {
        gameContainer.classList.add('fullscreen');
        fullscreenBtn.classList.add('active');
        fullscreenBtn.textContent = 'Exit';
    } else {
        gameContainer.classList.remove('fullscreen');
        fullscreenBtn.classList.remove('active');
        fullscreenBtn.textContent = 'Fullscreen';
    }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenState);
document.addEventListener('webkitfullscreenchange', updateFullscreenState);
document.addEventListener('msfullscreenchange', updateFullscreenState);

// Character selection click handler
canvas.addEventListener('click', (e) => {
    if (game.state === game.states.CHARACTER_SELECT) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (game.isClickOnFelipe(x, y)) {
            game.selectCharacter('Felipe');
        } else if (game.isClickOnJulieta(x, y)) {
            game.selectCharacter('Julieta');
        }
    }
});

// Touch support for character selection
canvas.addEventListener('touchend', (e) => {
    if (game.state === game.states.CHARACTER_SELECT && e.changedTouches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const touch = e.changedTouches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        if (game.isClickOnFelipe(x, y)) {
            game.selectCharacter('Felipe');
        } else if (game.isClickOnJulieta(x, y)) {
            game.selectCharacter('Julieta');
        }
    }
});

// Game loop
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    game.update(deltaTime);
    game.render();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
