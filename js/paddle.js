export class Paddle {
    constructor(canvasWidth, canvasHeight) {
        this.baseWidth = 100;
        this.width = 100;
        this.height = 15;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 40;
        this.speed = 8;
        this.color = '#00d4ff';
        this.glowColor = 'rgba(0, 212, 255, 0.8)';
        this.canvasWidth = canvasWidth;
        this.laserMode = false;
        this.laserPulse = 0;

        // Power-up effects
        this.inverseControls = false;
        this.inverseTimer = 0;
        this.sizeModifier = 1; // 1 = normal, >1 = expanded, <1 = shrunk
        this.sizeTimer = 0;

        // Explosion and fire effects
        this.explosionParticles = [];
        this.fireParticles = [];
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 1500; // 1.5 seconds
    }

    update(input, deltaTime = 16) {
        // Update explosion timer
        if (this.isExploding) {
            this.explosionTimer += deltaTime;
            if (this.explosionTimer >= this.explosionDuration) {
                this.isExploding = false;
                this.explosionTimer = 0;
                this.explosionParticles = [];
                this.fireParticles = [];
            }
        }

        // Update explosion particles
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.vx *= 0.98; // air resistance
            p.life -= 0.015;
            return p.life > 0;
        });

        // Update fire particles
        this.fireParticles = this.fireParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.05; // Fire rises
            p.vx *= 0.95;
            p.size *= 0.98; // Shrink over time
            p.life -= 0.012;
            return p.life > 0 && p.size > 0.5;
        });

        // Update power-up timers
        if (this.inverseTimer > 0) {
            this.inverseTimer -= deltaTime;
            if (this.inverseTimer <= 0) {
                this.inverseControls = false;
            }
        }

        if (this.sizeTimer > 0) {
            this.sizeTimer -= deltaTime;
            if (this.sizeTimer <= 0) {
                // Restore original size
                const centerX = this.x + this.width / 2;
                this.sizeModifier = 1;
                this.width = this.baseWidth;
                this.x = centerX - this.width / 2;
            }
        }

        const movement = input.getMovement();
        const invertMultiplier = this.inverseControls ? -1 : 1;

        if (movement.type === 'gyro') {
            // Convert tilt angle to paddle movement
            // tilt ranges from -90 to 90, multiply by sensitivity
            const tiltMovement = movement.tilt * movement.sensitivity;
            this.x += tiltMovement * 0.15 * invertMultiplier;  // Scale for smooth movement
        } else if (movement.type === 'mouse') {
            if (this.inverseControls) {
                // Invert mouse position
                const invertedX = this.canvasWidth - movement.x;
                this.x = invertedX - this.width / 2;
            } else {
                this.x = movement.x - this.width / 2;
            }
        } else {
            if (movement.left) {
                this.x += this.speed * -invertMultiplier;
            }
            if (movement.right) {
                this.x += this.speed * invertMultiplier;
            }
        }

        this.clampToCanvas();
    }

    clampToCanvas() {
        if (this.x < 20) {
            this.x = 20;
        }
        if (this.x + this.width > this.canvasWidth - 20) {
            this.x = this.canvasWidth - 20 - this.width;
        }
    }

    applyInverseControls(duration = 8000) {
        this.inverseControls = true;
        this.inverseTimer = duration;
    }

    applyExpand(duration = 10000) {
        const centerX = this.x + this.width / 2;
        this.sizeModifier = 1.5;
        this.width = this.baseWidth * this.sizeModifier;
        this.x = centerX - this.width / 2;
        this.sizeTimer = duration;
    }

    applyShrink(duration = 10000) {
        const centerX = this.x + this.width / 2;
        this.sizeModifier = 0.6;
        this.width = this.baseWidth * this.sizeModifier;
        this.x = centerX - this.width / 2;
        this.sizeTimer = duration;
    }

    explode() {
        this.isExploding = true;
        this.explosionTimer = 0;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Create explosion particles (debris from paddle)
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.explosionParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // Slight upward bias
                life: 1,
                size: Math.random() * 4 + 2,
                color: ['#ff6600', '#ff8800', '#ffaa00', '#00d4ff', '#0099cc'][Math.floor(Math.random() * 5)]
            });
        }

        // Create fire particles
        for (let i = 0; i < 50; i++) {
            const offsetX = (Math.random() - 0.5) * this.width;
            const offsetY = (Math.random() - 0.5) * this.height;
            this.fireParticles.push({
                x: centerX + offsetX,
                y: centerY + offsetY,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 1, // Fire rises upward
                life: 1,
                size: Math.random() * 6 + 3,
                color: ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'][Math.floor(Math.random() * 5)]
            });
        }

        // Add smoke particles
        for (let i = 0; i < 25; i++) {
            const offsetX = (Math.random() - 0.5) * this.width * 1.5;
            const offsetY = (Math.random() - 0.5) * this.height;
            this.explosionParticles.push({
                x: centerX + offsetX,
                y: centerY + offsetY,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 1.5 - 0.5, // Smoke rises
                life: 1,
                size: Math.random() * 8 + 4,
                color: '#555555',
                isSmoke: true
            });
        }
    }

    render(ctx) {
        ctx.save();

        // Draw fire particles first (behind explosion particles)
        this.fireParticles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw explosion particles
        this.explosionParticles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;

            if (p.isSmoke) {
                ctx.shadowBlur = 12;
                ctx.shadowColor = p.color;
            } else {
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Reset alpha and shadow
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (this.laserMode) {
            this.laserPulse += 0.15;
        }

        // Determine paddle color based on active power-ups
        let paddleColor = this.color;
        let glowColor = this.glowColor;

        if (this.laserMode) {
            paddleColor = '#ff4444';
            glowColor = 'rgba(255, 68, 68, 0.8)';
        } else if (this.inverseControls) {
            paddleColor = '#9b59b6';
            glowColor = 'rgba(155, 89, 182, 0.8)';
        } else if (this.sizeModifier > 1) {
            paddleColor = '#2ecc71';
            glowColor = 'rgba(46, 204, 113, 0.8)';
        } else if (this.sizeModifier < 1) {
            paddleColor = '#e74c3c';
            glowColor = 'rgba(231, 76, 60, 0.8)';
        }

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = glowColor;

        // Draw paddle with rounded corners
        ctx.fillStyle = paddleColor;
        ctx.beginPath();
        const radius = this.height / 2;
        ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        // Inner highlight
        ctx.shadowBlur = 0;
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        // Draw laser cannons when in laser mode
        if (this.laserMode) {
            const pulse = 1 + Math.sin(this.laserPulse) * 0.2;

            // Left cannon
            ctx.fillStyle = '#ffaaaa';
            ctx.beginPath();
            ctx.arc(this.x + 5, this.y, 4 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Right cannon
            ctx.beginPath();
            ctx.arc(this.x + this.width - 5, this.y, 4 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Cannon glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff4444';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + 5, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.width - 5, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    reset(canvasWidth) {
        this.x = (canvasWidth - this.width) / 2;
        // Reset power-up effects
        this.inverseControls = false;
        this.inverseTimer = 0;
        this.sizeModifier = 1;
        this.sizeTimer = 0;
        this.width = this.baseWidth;
        this.laserMode = false;
        this.laserPulse = 0;
    }
}
