import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { createLevel, getTotalLevels } from './levels.js';
import { ballWallCollision, ballPaddleCollision, ballBrickCollision } from './collision.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = input;
        this.renderer = new Renderer(this.ctx, canvas.width, canvas.height);

        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            LEVEL_COMPLETE: 'levelComplete',
            GAME_OVER: 'gameOver',
            WIN: 'win',
            NEPHEW_LOST: 'nephewLost'
        };

        this.state = this.states.MENU;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.totalLevels = getTotalLevels();

        this.paddle = null;
        this.ball = null;
        this.bricks = [];
        this.prisonBrick = null;
        this.nephew = null;
        this.nephewFreed = false;
        this.nephewRescued = false;
        this.speedMultiplier = 1;

        this.init();
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
        if (this.ball) {
            this.ball.setSpeedMultiplier(multiplier);
        }
    }

    init() {
        this.paddle = new Paddle(this.canvas.width, this.canvas.height);
        this.ball = new Ball(this.canvas.width, this.canvas.height);
        this.loadLevel(this.level);
    }

    loadLevel(levelNum) {
        const levelData = createLevel(levelNum, this.canvas.width);
        this.bricks = levelData.bricks;
        this.prisonBrick = levelData.prisonBrick;
        this.nephew = this.prisonBrick ? this.prisonBrick.getNephew() : null;
        this.nephewFreed = false;
        this.nephewRescued = false;
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.state = this.states.PLAYING;
        this.paddle.reset(this.canvas.width);
        this.ball.reset(this.paddle);
        this.ball.speed = this.ball.baseSpeed;
        this.loadLevel(this.level);
    }

    startLevel(levelNum) {
        this.level = levelNum;
        this.loadLevel(levelNum);
        this.paddle.reset(this.canvas.width);
        this.ball.reset(this.paddle);
        this.ball.increaseSpeed((levelNum - 1) * 0.3);
        this.state = this.states.PLAYING;
    }

    update() {
        // Handle state transitions
        if (this.state === this.states.MENU ||
            this.state === this.states.GAME_OVER ||
            this.state === this.states.WIN ||
            this.state === this.states.NEPHEW_LOST) {
            if (this.input.isLaunchPressed()) {
                this.reset();
            }
            return;
        }

        if (this.state === this.states.LEVEL_COMPLETE) {
            if (this.input.isLaunchPressed()) {
                if (this.level >= this.totalLevels) {
                    this.state = this.states.WIN;
                } else {
                    this.startLevel(this.level + 1);
                }
            }
            return;
        }

        if (this.state !== this.states.PLAYING) return;

        // Update paddle
        this.paddle.update(this.input);

        // Launch ball
        if (!this.ball.launched && this.input.isLaunchPressed()) {
            this.ball.launch();
        }

        // Update ball
        this.ball.update(this.paddle);

        // Check wall collisions
        ballWallCollision(this.ball, this.canvas.width, this.canvas.height);

        // Check paddle collision
        ballPaddleCollision(this.ball, this.paddle);

        // Check brick collisions
        const hitBrick = ballBrickCollision(this.ball, this.bricks);
        if (hitBrick) {
            this.score += hitBrick.hit();

            // Check if we freed the nephew
            if (hitBrick === this.prisonBrick && !this.nephewFreed) {
                this.nephewFreed = true;
                this.score += 50; // Bonus for freeing nephew!
            }
        }

        // Update prison brick animation
        if (this.prisonBrick && this.prisonBrick.alive) {
            this.prisonBrick.update();
        }

        // Update nephew if freed
        if (this.nephew && this.nephewFreed) {
            this.nephew.update(this.paddle, this.canvas.height);

            // Check if nephew was rescued
            if (this.nephew.state === 'rescued' && !this.nephewRescued) {
                this.nephewRescued = true;
                this.score += 200; // Big bonus for rescue!
            }

            // Check if nephew fell off screen
            if (this.nephew.state === 'lost') {
                this.state = this.states.NEPHEW_LOST;
            }
        }

        // Check for ball out of bounds
        if (this.ball.isOutOfBounds()) {
            this.loseLife();
        }

        // Check for level complete (all bricks destroyed AND nephew rescued)
        if (this.checkWin()) {
            this.state = this.states.LEVEL_COMPLETE;
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.state = this.states.GAME_OVER;
        } else {
            this.ball.reset(this.paddle);
        }
    }

    checkWin() {
        const allBricksDestroyed = this.bricks.every(brick => !brick.alive);
        // Must rescue nephew AND destroy all bricks to complete level
        if (this.nephew) {
            return allBricksDestroyed && this.nephewRescued;
        }
        return allBricksDestroyed;
    }

    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGameArea();

        // Draw bricks
        for (const brick of this.bricks) {
            brick.render(this.ctx);
        }

        // Draw falling nephew (after bricks, before paddle)
        if (this.nephew && this.nephewFreed && this.nephew.state !== 'trapped') {
            this.nephew.render(this.ctx);
        }

        // Draw paddle and ball
        this.paddle.render(this.ctx);
        this.ball.render(this.ctx);

        // Draw rescued nephew on paddle
        if (this.nephew && this.nephewRescued) {
            this.nephew.render(this.ctx);
        }

        // Draw HUD
        this.renderer.drawHUD(this.score, this.level, this.lives);
        this.renderer.drawControls();

        // Draw rescue status indicator
        if (this.nephew && this.state === this.states.PLAYING) {
            this.renderer.drawRescueStatus(this.nephewFreed, this.nephewRescued);
        }

        // Draw overlay screens
        if (this.state === this.states.MENU) {
            this.renderer.drawStartScreen();
        } else if (this.state === this.states.GAME_OVER) {
            this.renderer.drawGameOver(this.score);
        } else if (this.state === this.states.LEVEL_COMPLETE) {
            this.renderer.drawLevelComplete(this.level, this.nephewRescued);
        } else if (this.state === this.states.WIN) {
            this.renderer.drawWinScreen(this.score);
        } else if (this.state === this.states.NEPHEW_LOST) {
            this.renderer.drawNephewLost(this.score);
        }
    }
}
