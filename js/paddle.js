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
    }

    update(input) {
        const movement = input.getMovement();

        if (movement.type === 'gyro') {
            // Convert tilt angle to paddle movement
            // gamma ranges from -90 to 90, multiply by sensitivity
            const tiltMovement = movement.gamma * movement.sensitivity;
            this.x += tiltMovement * 0.1;  // Scale down for smooth movement
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

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.glowColor;

        // Draw paddle with rounded corners
        ctx.fillStyle = this.color;
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

        ctx.restore();
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    reset(canvasWidth) {
        this.x = (canvasWidth - this.width) / 2;
    }
}
