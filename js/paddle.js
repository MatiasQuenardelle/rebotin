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
    }

    update(input, deltaTime = 16) {
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

    render(ctx) {
        ctx.save();

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
