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
