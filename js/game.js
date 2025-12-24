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
            CHARACTER_SELECT: 'characterSelect',
            PLAYING: 'playing',
            RESCUE_PHASE: 'rescuePhase',  // Ball gone, focus on catching character
            PAUSED: 'paused',
            LEVEL_CELEBRATION: 'levelCelebration',  // Show rescue animation before level complete
            LEVEL_COMPLETE: 'levelComplete',
            GAME_OVER: 'gameOver',
            WIN: 'win',
            CHARACTER_LOST: 'characterLost'
        };

        this.state = this.states.MENU;
        this.characterName = 'Felipe';  // Default, can be 'Felipe' or 'Julieta'
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
        this.laserDuration = 10000; // 10 seconds of laser power
        this.laserCooldown = 0;
        this.laserFireRate = 400; // ms between shots (slower)

        // Destroyer power-up
        this.destroyerActive = false;
        this.destroyerTimer = 0;
        this.destroyerDuration = 8000; // 8 seconds

        // Sticky ball power-up
        this.stickyActive = false;
        this.stickyTimer = 0;
        this.stickyDuration = 10000; // 10 seconds

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
        const levelData = createLevel(levelNum, this.canvas.width, this.characterName);
        this.bricks = levelData.bricks;
        this.prisonBrick = levelData.prisonBrick;
        this.nephew = this.prisonBrick ? this.prisonBrick.getNephew() : null;
        this.nephewFreed = false;
        this.nephewRescued = false;

        // Monster tracking
        this.monsterBricks = levelData.monsterBricks || [];
        this.monsters = [];
        this.monstersFreed = 0;
        // Reset power-ups
        this.powerUps = [];
        this.lasers = [];
        this.laserActive = false;
        this.laserTimer = 0;
        this.destroyerActive = false;
        this.destroyerTimer = 0;
        this.stickyActive = false;
        this.stickyTimer = 0;
        if (this.ball) {
            this.ball.disableDestroyerMode();
            this.ball.disableStickyMode();
        }
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

    selectCharacter(name) {
        this.characterName = name;
        this.reset();
    }

    update(deltaTime = 16) {
        // DEBUG: Clamp deltaTime to prevent huge jumps on first frame or after tab switch
        const originalDeltaTime = deltaTime;
        if (deltaTime > 100) {
            console.warn(`[GAME] CLAMPING deltaTime from ${deltaTime.toFixed(0)}ms to 16ms (first frame or tab switch)`);
            deltaTime = 16;
        }

        // DEBUG: Log state changes
        if (this._lastState !== this.state) {
            console.log(`[GAME STATE] Changed: ${this._lastState} -> ${this.state} (deltaTime: ${deltaTime}, original: ${originalDeltaTime?.toFixed(0)})`);
            this._lastState = this.state;
        }

        // Handle menu -> character select
        if (this.state === this.states.MENU) {
            if (this.input.isLaunchPressed()) {
                this.state = this.states.CHARACTER_SELECT;
            }
            return;
        }

        // Handle character selection (handled by click events in main.js)
        if (this.state === this.states.CHARACTER_SELECT) {
            return;
        }

        // Handle state transitions
        if (this.state === this.states.GAME_OVER ||
            this.state === this.states.WIN ||
            this.state === this.states.CHARACTER_LOST) {
            if (this.input.isLaunchPressed()) {
                this.state = this.states.CHARACTER_SELECT;
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

        // Handle level celebration - show rescue animation before level complete
        if (this.state === this.states.LEVEL_CELEBRATION) {
            // Initialize celebration frame counter if needed
            if (!this._celebrationFrameCount) {
                this._celebrationFrameCount = 0;
                this._celebrationStartTime = Date.now();
                console.log(`[LEVEL_CELEBRATION] ===== STARTING CELEBRATION =====`);
                console.log(`[LEVEL_CELEBRATION] Initial state: nephew=${!!this.nephew}, nephew.state=${this.nephew?.state}, celebrationComplete=${this.nephew?.celebrationComplete}, celebrationTimer=${this.nephew?.celebrationTimer}ms`);
            }
            this._celebrationFrameCount++;

            // Log every 10 frames or first 5 frames
            if (this._celebrationFrameCount <= 5 || this._celebrationFrameCount % 10 === 0) {
                const elapsed = Date.now() - this._celebrationStartTime;
                console.log(`[LEVEL_CELEBRATION] Frame ${this._celebrationFrameCount} (elapsed ${elapsed}ms): nephew.state=${this.nephew?.state}, timer=${this.nephew?.celebrationTimer?.toFixed(0)}/${this.nephew?.celebrationDuration}ms, complete=${this.nephew?.celebrationComplete}, deltaTime=${deltaTime?.toFixed(2)}ms`);
                console.log(`[LEVEL_CELEBRATION] Effects: hearts=${this.nephew?.hearts?.length}, fireworks=${this.nephew?.fireworks?.length}, confetti=${this.nephew?.confetti?.length}, stars=${this.nephew?.stars?.length}`);
            }

            // Keep updating the nephew animation
            if (this.nephew) {
                const prevTimer = this.nephew.celebrationTimer;
                const prevComplete = this.nephew.celebrationComplete;
                const prevState = this.nephew.state;

                this.nephew.update(this.paddle, this.canvas.height, deltaTime);

                // Log if anything changed
                if (prevTimer !== this.nephew.celebrationTimer || prevComplete !== this.nephew.celebrationComplete || prevState !== this.nephew.state) {
                    console.log(`[LEVEL_CELEBRATION] After update: state ${prevState} -> ${this.nephew.state}, timer ${prevTimer?.toFixed(0)} -> ${this.nephew.celebrationTimer?.toFixed(0)}, complete ${prevComplete} -> ${this.nephew.celebrationComplete}`);
                }

                // Transition to level complete after celebration finishes
                if (this.nephew.celebrationComplete) {
                    console.log(`[LEVEL_CELEBRATION] ===== CELEBRATION COMPLETE after ${this._celebrationFrameCount} frames =====`);
                    console.log(`[LEVEL_CELEBRATION] Total real time elapsed: ${Date.now() - this._celebrationStartTime}ms`);
                    console.log(`[LEVEL_CELEBRATION] Transitioning to LEVEL_COMPLETE`);
                    this._celebrationFrameCount = 0; // Reset for next time
                    this.state = this.states.LEVEL_COMPLETE;
                }
            } else {
                console.warn(`[LEVEL_CELEBRATION] No nephew! Transitioning to LEVEL_COMPLETE immediately`);
                this._celebrationFrameCount = 0;
                this.state = this.states.LEVEL_COMPLETE;
            }
            return;
        }

        // Handle rescue phase - ball is gone, just catch the nephew
        if (this.state === this.states.RESCUE_PHASE) {
            this.paddle.update(this.input, deltaTime);

            if (this.nephew) {
                // Log every 500ms to track progress
                if (!this._lastRescueLog || Date.now() - this._lastRescueLog > 500) {
                    console.log(`[RESCUE_PHASE] nephew.state=${this.nephew.state}, nephewRescued=${this.nephewRescued}, celebrationComplete=${this.nephew.celebrationComplete}, celebrationTimer=${this.nephew.celebrationTimer?.toFixed(0)}ms, deltaTime=${deltaTime?.toFixed(2)}ms`);
                    this._lastRescueLog = Date.now();
                }

                this.nephew.update(this.paddle, this.canvas.height, deltaTime);

                if (this.nephew.state === 'rescued' && !this.nephewRescued) {
                    console.log(`[RESCUE_PHASE] ===== NEPHEW JUST RESCUED! =====`);
                    console.log(`[RESCUE_PHASE] Setting nephewRescued = true, celebrationTimer=${this.nephew.celebrationTimer}, celebrationComplete=${this.nephew.celebrationComplete}`);
                    this.nephewRescued = true;
                    this.score += 200;
                    // Don't transition immediately - wait for celebration animation
                }

                // Transition to level celebration screen after rescue animation finishes
                if (this.nephewRescued && this.nephew.celebrationComplete) {
                    console.log(`[RESCUE_PHASE] ===== RESCUE CELEBRATION COMPLETE =====`);
                    console.log(`[RESCUE_PHASE] Transitioning to LEVEL_CELEBRATION`);
                    console.log(`[RESCUE_PHASE] Resetting: celebrationComplete=false, celebrationTimer=0`);
                    this.state = this.states.LEVEL_CELEBRATION;
                    // Keep the celebration going with fresh effects
                    this.nephew.celebrationComplete = false;
                    this.nephew.celebrationTimer = 0;
                    this.nephew.createCelebrationEffects();
                    console.log(`[RESCUE_PHASE] After reset: celebrationComplete=${this.nephew.celebrationComplete}, celebrationTimer=${this.nephew.celebrationTimer}`);
                }

                if (this.nephew.state === 'lost') {
                    console.log(`[RESCUE_PHASE] Nephew lost!`);
                    this.state = this.states.CHARACTER_LOST;
                }
            }
            return;
        }

        if (this.state !== this.states.PLAYING) return;

        // Update paddle
        this.paddle.update(this.input, deltaTime);

        // Update laser timer
        if (this.laserActive) {
            this.laserTimer -= deltaTime;
            this.laserCooldown -= deltaTime;

            // Manual fire lasers with space/click (only when ball is already launched)
            if (this.ball.launched && this.laserCooldown <= 0 && this.input.isLaunchPressed()) {
                this.fireLasers();
                this.laserCooldown = this.laserFireRate;
            }

            if (this.laserTimer <= 0) {
                this.laserActive = false;
                this.paddle.laserMode = false;
            }
        }

        // Update destroyer timer
        if (this.destroyerActive) {
            this.destroyerTimer -= deltaTime;
            if (this.destroyerTimer <= 0) {
                this.destroyerActive = false;
                this.ball.disableDestroyerMode();
            }
        }

        // Update sticky timer
        if (this.stickyActive) {
            this.stickyTimer -= deltaTime;
            // Allow launching from sticky with space/click
            if (this.ball.isStuck && this.input.isLaunchPressed()) {
                this.ball.launchFromSticky();
            }
            if (this.stickyTimer <= 0) {
                this.stickyActive = false;
                this.ball.disableStickyMode();
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

                // Check if we freed the character with laser
                if (hitBrick === this.prisonBrick && !this.nephewFreed) {
                    this.nephewFreed = true;
                    this.score += 50;
                    this.state = this.states.RESCUE_PHASE;
                    return;
                }

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
        if (this.destroyerActive) {
            // Destroyer mode: destroy ALL bricks in path without bouncing
            const hitBricks = this.bricks.filter(brick => {
                if (!brick.alive) return false;
                const dist = Math.sqrt(
                    Math.pow(this.ball.x - (brick.x + brick.width / 2), 2) +
                    Math.pow(this.ball.y - (brick.y + brick.height / 2), 2)
                );
                return dist < this.ball.radius + 20; // Extended collision range
            });

            for (const brick of hitBricks) {
                if (!brick.indestructible) {
                    this.score += brick.hit();
                    this.trySpawnPowerUp(brick);

                    // Check if we freed the nephew
                    if (brick === this.prisonBrick && !this.nephewFreed) {
                        this.nephewFreed = true;
                        this.score += 50;
                        this.state = this.states.RESCUE_PHASE;
                        return;
                    }

                    // Check if we freed a monster
                    if (this.monsterBricks.includes(brick)) {
                        const monster = brick.getMonster();
                        if (monster && monster.state === 'trapped') {
                            this.monsters.push(monster);
                            this.monstersFreed++;
                        }
                    }
                }
            }
        } else {
            // Normal mode: single brick collision with bounce
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

                    // Check if we freed a monster
                    if (this.monsterBricks.includes(hitBrick)) {
                        const monster = hitBrick.getMonster();
                        if (monster && monster.state === 'trapped') {
                            this.monsters.push(monster);
                            this.monstersFreed++;
                        }
                    }
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

        // Update monster bricks animation
        for (const monsterBrick of this.monsterBricks) {
            if (monsterBrick.alive) {
                monsterBrick.update();
            }
        }

        // Update monsters (falling)
        this.monsters = this.monsters.filter(monster => {
            monster.update(this.paddle, this.canvas.height, deltaTime);

            // Remove if caught
            if (monster.state === 'caught') {
                // Penalty for catching a monster
                this.score = Math.max(0, this.score - 100);
                this.lives = Math.max(0, this.lives - 1);
                if (this.lives <= 0) {
                    this.state = this.states.GAME_OVER;
                }
                // Keep monster briefly to show explosion, then remove
                return monster.explosionParticles.length > 0;
            }

            // Remove if escaped
            return monster.state !== 'escaped';
        });

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
            console.log(`[PLAYING] ===== WIN CONDITION MET =====`);
            console.log(`[PLAYING] checkWin() returned true! nephewRescued: ${this.nephewRescued}, nephew exists: ${!!this.nephew}`);
            console.log(`[PLAYING] Nephew details: state=${this.nephew?.state}, celebrationComplete=${this.nephew?.celebrationComplete}, celebrationTimer=${this.nephew?.celebrationTimer}`);
            console.log(`[PLAYING] CRITICAL CHECK - nephew._celebrationUpdateCount=${this.nephew?._celebrationUpdateCount}, nephew._loggedAlreadyComplete=${this.nephew?._loggedAlreadyComplete}`);

            // Start the level celebration with the character
            if (this.nephew && this.nephewRescued) {
                console.log(`[PLAYING] Starting LEVEL_CELEBRATION with rescued nephew`);
                // Position nephew on paddle for celebration
                this.nephew.x = this.paddle.x + this.paddle.width / 2 - this.nephew.width / 2;
                this.nephew.y = this.paddle.y - this.nephew.height;

                // Reset and start celebration - FORCE state to rescued
                console.log(`[PLAYING] BEFORE reset: celebrationComplete=${this.nephew.celebrationComplete}, celebrationTimer=${this.nephew.celebrationTimer}, state=${this.nephew.state}`);

                // CRITICAL: Reset all celebration tracking
                this.nephew.state = 'rescued';  // Ensure state is rescued
                this.nephew.celebrationComplete = false;
                this.nephew.celebrationTimer = 0;
                this.nephew._celebrationUpdateCount = 0;  // Reset update counter
                this.nephew._loggedAlreadyComplete = false;  // Reset log flag

                console.log(`[PLAYING] AFTER reset: celebrationComplete=${this.nephew.celebrationComplete}, celebrationTimer=${this.nephew.celebrationTimer}, state=${this.nephew.state}`);
                this.nephew.createCelebrationEffects();
                console.log(`[PLAYING] Created celebration effects, effects counts: hearts=${this.nephew.hearts?.length}, fireworks=${this.nephew.fireworks?.length}, confetti=${this.nephew.confetti?.length}, stars=${this.nephew.stars?.length}`);
                console.log(`[PLAYING] Transitioning to LEVEL_CELEBRATION NOW`);
                this.state = this.states.LEVEL_CELEBRATION;
            } else {
                // No rescued character, go straight to level complete
                console.log(`[PLAYING] No rescued nephew (nephewRescued=${this.nephewRescued}, nephew=${!!this.nephew}), going straight to LEVEL_COMPLETE`);
                this.state = this.states.LEVEL_COMPLETE;
            }
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
        this.score += 25; // Base points for collecting any power-up

        switch (powerUp.type) {
            case 'laser':
                this.laserActive = true;
                this.laserTimer = this.laserDuration;
                this.paddle.laserMode = true;
                break;

            case 'inverse':
                this.paddle.applyInverseControls(8000); // 8 seconds
                break;

            case 'expand':
                this.paddle.applyExpand(10000); // 10 seconds
                break;

            case 'shrink':
                this.paddle.applyShrink(10000); // 10 seconds
                break;

            case 'destroyer':
                this.destroyerActive = true;
                this.destroyerTimer = this.destroyerDuration;
                this.ball.enableDestroyerMode();
                break;

            case 'sticky':
                this.stickyActive = true;
                this.stickyTimer = this.stickyDuration;
                this.ball.enableStickyMode();
                break;
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
        const breakableBricks = this.bricks.filter(brick => !brick.indestructible);
        const aliveBricks = breakableBricks.filter(brick => brick.alive);
        const allBricksDestroyed = aliveBricks.length === 0;

        // In rescue phase, just need to catch nephew
        if (this.state === this.states.RESCUE_PHASE) {
            return this.nephewRescued;
        }

        // Log occasionally to avoid spam
        if (allBricksDestroyed) {
            console.log(`[checkWin] All bricks destroyed! Total breakable: ${breakableBricks.length}, Alive: ${aliveBricks.length}`);
        }

        return allBricksDestroyed;
    }

    render() {
        // Detect landscape mode for mobile
        const isLandscapeMobile = window.innerWidth > window.innerHeight && window.innerWidth <= 950;

        this.renderer.clear();
        this.renderer.drawBackground();

        // Skip game area border in landscape - it wastes vertical space
        if (!isLandscapeMobile) {
            this.renderer.drawGameArea();
        }

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
        // Skip rendering here during LEVEL_CELEBRATION to avoid duplication
        if (this.nephew && this.nephewFreed && this.nephew.state !== 'trapped' && this.state !== this.states.LEVEL_CELEBRATION) {
            this.nephew.render(this.ctx);
        }

        // Draw falling monsters
        for (const monster of this.monsters) {
            monster.render(this.ctx);
        }

        // Draw paddle
        this.paddle.render(this.ctx);

        // Only draw ball if not in rescue phase
        if (this.state !== this.states.RESCUE_PHASE) {
            this.ball.render(this.ctx);
        }

        // Draw rescued nephew on paddle (during play)
        // Skip during LEVEL_CELEBRATION to avoid duplication (handled in overlay section)
        if (this.nephew && this.nephewRescued && this.state !== this.states.LEVEL_CELEBRATION) {
            this.nephew.render(this.ctx);
        }

        // Draw HUD (use isLandscapeMobile from start of render)
        this.renderer.drawHUD(this.score, this.level, this.lives, isLandscapeMobile);

        // Only show controls hint in portrait/desktop mode
        if (!isLandscapeMobile) {
            this.renderer.drawControls();
        }

        // Draw rescue status indicator (skip in landscape - no room)
        if (!isLandscapeMobile && this.nephew && (this.state === this.states.PLAYING || this.state === this.states.RESCUE_PHASE)) {
            this.renderer.drawRescueStatus(this.nephewFreed, this.nephewRescued, this.characterName);
        }

        // Draw power-up timers
        const activeTimers = [];
        if (this.laserActive) {
            activeTimers.push({ type: 'laser', percentage: this.laserTimer / this.laserDuration });
        }
        if (this.paddle.inverseTimer > 0) {
            activeTimers.push({ type: 'inverse', percentage: this.paddle.inverseTimer / 8000 });
        }
        if (this.paddle.sizeTimer > 0) {
            const type = this.paddle.sizeModifier > 1 ? 'expand' : 'shrink';
            activeTimers.push({ type, percentage: this.paddle.sizeTimer / 10000 });
        }
        if (this.destroyerActive) {
            activeTimers.push({ type: 'destroyer', percentage: this.destroyerTimer / this.destroyerDuration });
        }
        if (this.stickyActive) {
            activeTimers.push({ type: 'sticky', percentage: this.stickyTimer / this.stickyDuration });
        }
        if (activeTimers.length > 0 && !isLandscapeMobile) {
            this.renderer.drawPowerUpTimers(activeTimers);
        }

        // Draw rescue phase message
        if (this.state === this.states.RESCUE_PHASE) {
            this.renderer.drawRescueMessage(this.characterName);
        }

        // Draw overlay screens
        if (this.state === this.states.MENU) {
            this.renderer.drawStartScreen();
        } else if (this.state === this.states.CHARACTER_SELECT) {
            this.renderer.drawCharacterSelect();
        } else if (this.state === this.states.GAME_OVER) {
            this.renderer.drawGameOver(this.score);
        } else if (this.state === this.states.LEVEL_CELEBRATION) {
            // Draw the text overlay first (no full-screen darkening)
            this.renderer.drawLevelCelebration(this.level, this.characterName);
            // Then render nephew effects ON TOP so fireworks/confetti are fully visible
            if (this.nephew) {
                this.nephew.render(this.ctx);
            }
        } else if (this.state === this.states.LEVEL_COMPLETE) {
            this.renderer.drawLevelComplete(this.level, this.nephewRescued, this.characterName);
        } else if (this.state === this.states.WIN) {
            this.renderer.drawWinScreen(this.score, this.characterName);
        } else if (this.state === this.states.CHARACTER_LOST) {
            this.renderer.drawCharacterLost(this.score, this.characterName);
        }
    }

    // Check if click is on Felipe button
    isClickOnFelipe(x, y) {
        const btnWidth = 150;
        const btnHeight = 50;
        const felipeX = this.canvas.width / 2 - btnWidth - 20;
        const felipeY = this.canvas.height / 2 + 20;
        return x >= felipeX && x <= felipeX + btnWidth && y >= felipeY && y <= felipeY + btnHeight;
    }

    // Check if click is on Julieta button
    isClickOnJulieta(x, y) {
        const btnWidth = 150;
        const btnHeight = 50;
        const julietaX = this.canvas.width / 2 + 20;
        const julietaY = this.canvas.height / 2 + 20;
        return x >= julietaX && x <= julietaX + btnWidth && y >= julietaY && y <= julietaY + btnHeight;
    }
}
