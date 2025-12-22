import { Game } from './game.js';
import { Input } from './input.js';

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Create input handler
const input = new Input(canvas);

// Create game instance
const game = new Game(canvas, input);

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
