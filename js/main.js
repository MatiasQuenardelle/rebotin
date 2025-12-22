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
const isMobile = 'ontouchstart' in window;
if (input.isGyroAvailable() && isMobile) {
    gyroBtn.classList.remove('hidden');

    // Auto-enable tilt on mobile by default
    (async () => {
        const enabled = await input.requestGyroPermission();
        if (enabled) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = 'Tilt: ON';
        }
    })();
}

// Gyro button click handler - works as a toggle
gyroBtn.addEventListener('click', async () => {
    if (input.isGyroEnabled()) {
        // Turn off
        input.disableGyro();
        gyroBtn.classList.remove('active');
        gyroBtn.textContent = 'Tilt: OFF';
    } else {
        // Turn on (may need permission if first time)
        const enabled = await input.requestGyroPermission();
        if (enabled) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = 'Tilt: ON';
        } else {
            alert('Could not enable tilt controls. Please allow motion sensor access.');
        }
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

// PWA Install prompt handling
let deferredPrompt = null;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const installDismiss = document.getElementById('installDismiss');

// Check if we're already in standalone mode
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.matchMedia('(display-mode: fullscreen)').matches ||
                     window.navigator.standalone === true;

// Listen for the beforeinstallprompt event (Chrome/Edge/Android)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Only show prompt on mobile and if not already installed
    if (isMobile && !isStandalone && !localStorage.getItem('installPromptDismissed')) {
        installPrompt.classList.remove('hidden');
    }
});

// Handle install button click
installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Android/Chrome install prompt
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // iOS - show instructions
        alert('To install: tap the Share button, then "Add to Home Screen"');
    }
});

// Handle dismiss button
installDismiss?.addEventListener('click', () => {
    installPrompt.classList.add('hidden');
    localStorage.setItem('installPromptDismissed', 'true');
});

// Show iOS install hint on mobile Safari after a delay
if (isMobile && /iPhone|iPad|iPod/.test(navigator.userAgent) && !isStandalone) {
    if (!localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => {
            installPrompt.classList.remove('hidden');
        }, 3000);
    }
}

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
