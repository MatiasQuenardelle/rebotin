export class Ball {
    constructor(canvasWidth, canvasHeight) {
        this.radius = 8;
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        this.baseSpeed = 6;
        this.speed = this.baseSpeed;
        this.dx = 0;
        this.dy = 0;
        this.launched = false;
        this.color = '#ffffff';
        this.trailPositions = [];
        this.maxTrailLength = 12;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.speedMultiplier = 1;
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(paddle) {
        if (!this.launched) {
            this.x = paddle.getCenterX();
            this.y = paddle.y - this.radius - 2;
            return;
        }

        // Update trail
        this.trailPositions.unshift({ x: this.x, y: this.y });
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.pop();
        }

        // Move ball (apply speed multiplier)
        this.x += this.dx * this.speedMultiplier;
        this.y += this.dy * this.speedMultiplier;
    }

    launch() {
        if (this.launched) return;

        this.launched = true;
        const angle = (Math.random() * 70 + 55) * (Math.PI / 180); // 55-125 degrees
        this.dx = Math.cos(angle) * this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.dy = -Math.abs(Math.sin(angle) * this.speed);
    }

    bounceX() {
        this.dx = -this.dx;
    }

    bounceY() {
        this.dy = -this.dy;
    }

    bounceOffPaddle(paddle) {
        const hitPoint = (this.x - paddle.x) / paddle.width;
        const angle = (hitPoint - 0.5) * 140 * (Math.PI / 180); // -70 to +70 degrees from center

        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.abs(Math.cos(angle) * this.speed);

        // Ensure minimum vertical speed
        if (Math.abs(this.dy) < this.speed * 0.3) {
            this.dy = -this.speed * 0.3;
        }
    }

    reset(paddle) {
        this.launched = false;
        this.x = paddle.getCenterX();
        this.y = paddle.y - this.radius - 2;
        this.dx = 0;
        this.dy = 0;
        this.trailPositions = [];
    }

    increaseSpeed(amount = 0.5) {
        this.speed = Math.min(this.speed + amount, 12);
    }

    render(ctx) {
        ctx.save();

        // Draw trail
        for (let i = 0; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = 1 - (i / this.maxTrailLength);
            const size = this.radius * (1 - i / this.maxTrailLength * 0.7);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            ctx.fill();
        }

        // Draw main ball with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.restore();
    }

    isOutOfBounds() {
        return this.y > this.canvasHeight + this.radius;
    }
}
