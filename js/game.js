import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { createLevel, getTotalLevels } from './levels.js';
import { ballWallCollision, ballPaddleCollision, ballBrickCollision, laserBrickCollision } from './collision.js';
import { Renderer } from './renderer.js';
import { PowerUp } from './powerUp.js';
import { Laser } from './laser.js';

export class Game {
    constructor(canvas, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = input;
        this.renderer = new Renderer(this.ctx, canvas.width, canvas.height);

        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            RESCUE_PHASE: 'rescuePhase',  // Ball gone, focus on catching nephew
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

        // Power-ups
        this.powerUps = [];
        this.lasers = [];
        this.laserActive = false;
        this.laserTimer = 0;
        this.laserDuration = 8000; // 8 seconds of laser power
        this.laserCooldown = 0;
        this.laserFireRate = 200; // ms between shots

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
        // Reset power-ups
        this.powerUps = [];
        this.lasers = [];
        this.laserActive = false;
        this.laserTimer = 0;
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

    update(deltaTime = 16) {
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

        // Handle rescue phase - ball is gone, just catch the nephew
        if (this.state === this.states.RESCUE_PHASE) {
            this.paddle.update(this.input);

            if (this.nephew) {
                this.nephew.update(this.paddle, this.canvas.height);

                if (this.nephew.state === 'rescued' && !this.nephewRescued) {
                    this.nephewRescued = true;
                    this.score += 200;
                    this.state = this.states.LEVEL_COMPLETE;
                }

                if (this.nephew.state === 'lost') {
                    this.state = this.states.NEPHEW_LOST;
                }
            }
            return;
        }

        if (this.state !== this.states.PLAYING) return;

        // Update paddle
        this.paddle.update(this.input);

        // Update laser timer
        if (this.laserActive) {
            this.laserTimer -= deltaTime;
            this.laserCooldown -= deltaTime;

            // Auto-fire lasers
            if (this.laserCooldown <= 0) {
                this.fireLasers();
                this.laserCooldown = this.laserFireRate;
            }

            if (this.laserTimer <= 0) {
                this.laserActive = false;
                this.paddle.laserMode = false;
            }
        }

        // Update lasers
        this.lasers = this.lasers.filter(laser => {
            laser.update();
            return laser.y > 0 && laser.alive;
        });

        // Check laser-brick collisions
        for (const laser of this.lasers) {
            const hitBrick = laserBrickCollision(laser, this.bricks);
            if (hitBrick && hitBrick.alive && !hitBrick.indestructible) {
                this.score += hitBrick.hit();
                laser.alive = false;

                // Chance to spawn power-up
                this.trySpawnPowerUp(hitBrick);
            }
        }

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
            // Indestructible bricks don't get destroyed
            if (!hitBrick.indestructible) {
                this.score += hitBrick.hit();

                // Chance to spawn power-up
                this.trySpawnPowerUp(hitBrick);

                // Check if we freed the nephew
                if (hitBrick === this.prisonBrick && !this.nephewFreed) {
                    this.nephewFreed = true;
                    this.score += 50;
                    // Enter rescue phase - ball disappears
                    this.state = this.states.RESCUE_PHASE;
                    return;
                }
            }
        }

        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();

            // Check if collected by paddle
            if (powerUp.checkCollision(this.paddle)) {
                this.activatePowerUp(powerUp);
                return false;
            }

            // Remove if off screen
            return powerUp.y < this.canvas.height + 20;
        });

        // Update prison brick animation
        if (this.prisonBrick && this.prisonBrick.alive) {
            this.prisonBrick.update();
        }

        // Update nephew if freed (shouldn't happen in PLAYING state anymore)
        if (this.nephew && this.nephewFreed) {
            this.nephew.update(this.paddle, this.canvas.height);
        }

        // Check for ball out of bounds
        if (this.ball.isOutOfBounds()) {
            this.loseLife();
        }

        // Check for level complete (all breakable bricks destroyed)
        if (this.checkWin()) {
            this.state = this.states.LEVEL_COMPLETE;
        }
    }

    trySpawnPowerUp(brick) {
        // 15% chance to spawn a power-up
        if (Math.random() < 0.15) {
            const powerUp = new PowerUp(
                brick.x + brick.width / 2,
                brick.y + brick.height / 2
            );
            this.powerUps.push(powerUp);
        }
    }

    activatePowerUp(powerUp) {
        if (powerUp.type === 'laser') {
            this.laserActive = true;
            this.laserTimer = this.laserDuration;
            this.paddle.laserMode = true;
            this.score += 25;
        }
    }

    fireLasers() {
        // Fire from both sides of paddle
        const leftLaser = new Laser(this.paddle.x + 5, this.paddle.y);
        const rightLaser = new Laser(this.paddle.x + this.paddle.width - 5, this.paddle.y);
        this.lasers.push(leftLaser, rightLaser);
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
        // Only check breakable bricks (not indestructible)
        const allBricksDestroyed = this.bricks.every(brick => !brick.alive || brick.indestructible);
        // In rescue phase, just need to catch nephew
        if (this.state === this.states.RESCUE_PHASE) {
            return this.nephewRescued;
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

        // Draw lasers
        for (const laser of this.lasers) {
            laser.render(this.ctx);
        }

        // Draw power-ups
        for (const powerUp of this.powerUps) {
            powerUp.render(this.ctx);
        }

        // Draw falling nephew (after bricks, before paddle)
        if (this.nephew && this.nephewFreed && this.nephew.state !== 'trapped') {
            this.nephew.render(this.ctx);
        }

        // Draw paddle
        this.paddle.render(this.ctx);

        // Only draw ball if not in rescue phase
        if (this.state !== this.states.RESCUE_PHASE) {
            this.ball.render(this.ctx);
        }

        // Draw rescued nephew on paddle
        if (this.nephew && this.nephewRescued) {
            this.nephew.render(this.ctx);
        }

        // Draw HUD
        this.renderer.drawHUD(this.score, this.level, this.lives);
        this.renderer.drawControls();

        // Draw rescue status indicator
        if (this.nephew && (this.state === this.states.PLAYING || this.state === this.states.RESCUE_PHASE)) {
            this.renderer.drawRescueStatus(this.nephewFreed, this.nephewRescued);
        }

        // Draw laser timer
        if (this.laserActive) {
            this.renderer.drawLaserTimer(this.laserTimer / this.laserDuration);
        }

        // Draw rescue phase message
        if (this.state === this.states.RESCUE_PHASE) {
            this.renderer.drawRescueMessage();
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
