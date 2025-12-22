export class Paddle {
    constructor(canvasWidth, canvasHeight) {
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
    }

    update(input) {
        const movement = input.getMovement();

        if (movement.type === 'gyro') {
            // Convert tilt angle to paddle movement
            // tilt ranges from -90 to 90, multiply by sensitivity
            const tiltMovement = movement.tilt * movement.sensitivity;
            this.x += tiltMovement * 0.15;  // Scale for smooth movement
        } else if (movement.type === 'mouse') {
            this.x = movement.x - this.width / 2;
        } else {
            if (movement.left) {
                this.x -= this.speed;
            }
            if (movement.right) {
                this.x += this.speed;
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

    render(ctx) {
        ctx.save();

        if (this.laserMode) {
            this.laserPulse += 0.15;
        }

        // Glow effect - red when in laser mode
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.laserMode ? 'rgba(255, 68, 68, 0.8)' : this.glowColor;

        // Draw paddle with rounded corners
        ctx.fillStyle = this.laserMode ? '#ff4444' : this.color;
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
    }
}
