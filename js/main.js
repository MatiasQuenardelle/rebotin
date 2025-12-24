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

// Side controls and weapon wheel elements
const sideControls = document.getElementById('sideControls');
const tiltBtn = document.getElementById('tiltBtn');
const laserBtn = document.getElementById('laserBtn');
const expandBtn = document.getElementById('expandBtn');
const shrinkBtn = document.getElementById('shrinkBtn');
const inverseBtn = document.getElementById('inverseBtn');
const destroyerBtn = document.getElementById('destroyerBtn');
const stickyBtn = document.getElementById('stickyBtn');
const weaponWheel = document.getElementById('weaponWheel');
const wheelItems = document.querySelectorAll('.wheel-item');

// Show gyro button if device supports it (mobile devices)
const isMobile = 'ontouchstart' in window;
if (input.isGyroAvailable() && isMobile) {
    gyroBtn.classList.remove('hidden');
    tiltBtn.classList.remove('hidden');

    // Auto-enable tilt on mobile by default
    (async () => {
        const enabled = await input.requestGyroPermission();
        if (enabled) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = 'Tilt: ON';
            tiltBtn.classList.add('active');
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
        tiltBtn.classList.remove('active');
    } else {
        // Turn on (may need permission if first time)
        const enabled = await input.requestGyroPermission();
        if (enabled) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = 'Tilt: ON';
            tiltBtn.classList.add('active');
        } else {
            alert('Could not enable tilt controls. Please allow motion sensor access.');
        }
    }
});

// Tilt button (side control) click handler - same as gyro button
tiltBtn.addEventListener('click', async () => {
    if (input.isGyroEnabled()) {
        // Turn off
        input.disableGyro();
        gyroBtn.classList.remove('active');
        gyroBtn.textContent = 'Tilt: OFF';
        tiltBtn.classList.remove('active');
    } else {
        // Turn on (may need permission if first time)
        const enabled = await input.requestGyroPermission();
        if (enabled) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = 'Tilt: ON';
            tiltBtn.classList.add('active');
        } else {
            alert('Could not enable tilt controls. Please allow motion sensor access.');
        }
    }
});

// Weapon wheel interaction handlers
wheelItems.forEach(item => {
    item.addEventListener('click', () => {
        const weapon = item.dataset.weapon;

        // Only allow activation during gameplay
        if (game.state !== game.states.PLAYING) {
            return;
        }

        // Activate the corresponding power-up if we have it
        if (weapon === 'laser' && game.laserActive) {
            // Manual laser fire when wheel item is clicked
            if (game.ball.launched) {
                game.fireLasers();
            }
        }

        // Visual feedback
        item.classList.add('active');
        setTimeout(() => item.classList.remove('active'), 300);
    });
});

// Update weapon wheel state based on active power-ups
function updateWeaponWheel() {
    wheelItems.forEach(item => {
        const weapon = item.dataset.weapon;

        // Enable/disable based on active power-ups
        if (weapon === 'laser') {
            if (game.laserActive) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        } else if (weapon === 'expand') {
            if (game.paddle.sizeModifier > 1 && game.paddle.sizeTimer > 0) {
                item.classList.remove('disabled');
                item.classList.add('active');
            } else {
                item.classList.add('disabled');
                item.classList.remove('active');
            }
        } else if (weapon === 'shrink') {
            if (game.paddle.sizeModifier < 1 && game.paddle.sizeTimer > 0) {
                item.classList.remove('disabled');
                item.classList.add('active');
            } else {
                item.classList.add('disabled');
                item.classList.remove('active');
            }
        } else if (weapon === 'inverse') {
            if (game.paddle.inverseControls && game.paddle.inverseTimer > 0) {
                item.classList.remove('disabled');
                item.classList.add('active');
            } else {
                item.classList.add('disabled');
                item.classList.remove('active');
            }
        }
    });

    // Update side control buttons
    if (game.laserActive) {
        laserBtn.classList.remove('disabled');
        laserBtn.classList.add('active');
    } else {
        laserBtn.classList.add('disabled');
        laserBtn.classList.remove('active');
    }

    if (game.paddle.sizeModifier > 1 && game.paddle.sizeTimer > 0) {
        expandBtn.classList.remove('disabled');
        expandBtn.classList.add('active');
    } else {
        expandBtn.classList.add('disabled');
        expandBtn.classList.remove('active');
    }

    if (game.paddle.sizeModifier < 1 && game.paddle.sizeTimer > 0) {
        shrinkBtn.classList.remove('disabled');
        shrinkBtn.classList.add('active');
    } else {
        shrinkBtn.classList.add('disabled');
        shrinkBtn.classList.remove('active');
    }

    if (game.paddle.inverseControls && game.paddle.inverseTimer > 0) {
        inverseBtn.classList.remove('disabled');
        inverseBtn.classList.add('active');
    } else {
        inverseBtn.classList.add('disabled');
        inverseBtn.classList.remove('active');
    }

    if (game.destroyerActive) {
        destroyerBtn.classList.remove('disabled');
        destroyerBtn.classList.add('active');
    } else {
        destroyerBtn.classList.add('disabled');
        destroyerBtn.classList.remove('active');
    }

    if (game.stickyActive) {
        stickyBtn.classList.remove('disabled');
        stickyBtn.classList.add('active');
    } else {
        stickyBtn.classList.add('disabled');
        stickyBtn.classList.remove('active');
    }
}

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

async function toggleFullscreen() {
    if (!isFullscreen) {
        // Enter fullscreen
        const elem = gameContainer;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen({ navigationUI: "hide" });
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
            // Lock screen orientation to landscape on mobile for better experience
            if (screen.orientation && screen.orientation.lock) {
                try {
                    await screen.orientation.lock('landscape').catch(() => {
                        // Orientation lock not supported or failed, continue anyway
                    });
                } catch (e) {
                    // Ignore orientation lock errors
                }
            }
        } catch (err) {
            console.warn('Fullscreen request failed:', err);
        }
    } else {
        // Exit fullscreen
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
            // Unlock orientation when exiting fullscreen
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        } catch (err) {
            console.warn('Exit fullscreen failed:', err);
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
let frameCount = 0;
let lastLoggedState = null;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Log first few frames and any abnormal deltaTime
    if (frameCount < 5 || deltaTime > 100) {
        console.log(`[MAIN] Frame ${frameCount}: deltaTime=${deltaTime.toFixed(2)}ms, timestamp=${timestamp.toFixed(2)}, state=${game.state}`);
    }

    // Log state changes
    if (lastLoggedState !== game.state) {
        console.log(`[MAIN] ===== STATE CHANGE: ${lastLoggedState} -> ${game.state} ===== (frame ${frameCount}, deltaTime=${deltaTime.toFixed(2)}ms)`);
        lastLoggedState = game.state;
    }

    frameCount++;

    game.update(deltaTime);
    game.render();

    // Update weapon wheel UI state
    updateWeaponWheel();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);
