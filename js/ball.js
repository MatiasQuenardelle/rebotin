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

        // Destroyer mode (ball destroys all blocks in path)
        this.destroyerMode = false;

        // Sticky mode (ball sticks to paddle)
        this.stickyMode = false;
        this.isStuck = false;
        this.stickyOffsetX = 0; // Offset from paddle center when stuck
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(paddle) {
        if (!this.launched) {
            if (this.isStuck) {
                // Keep ball at the offset position where it landed
                this.x = paddle.x + this.stickyOffsetX;
            } else {
                // Normal pre-launch: center on paddle
                this.x = paddle.getCenterX();
            }
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
        // If sticky mode is active, stick to paddle instead of bouncing
        if (this.stickyMode && !this.isStuck) {
            this.isStuck = true;
            this.launched = false;
            // Store the offset from paddle left edge where the ball landed
            this.stickyOffsetX = this.x - paddle.x;
            // Clamp to paddle bounds
            this.stickyOffsetX = Math.max(this.radius, Math.min(this.stickyOffsetX, paddle.width - this.radius));
            this.dx = 0;
            this.dy = 0;
            return;
        }

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

    enableDestroyerMode() {
        this.destroyerMode = true;
        this.color = '#ff9500'; // Orange color for destroyer
    }

    disableDestroyerMode() {
        this.destroyerMode = false;
        this.color = '#ffffff'; // Back to white
    }

    enableStickyMode() {
        this.stickyMode = true;
        this.color = '#00a8ff'; // Blue color for sticky
    }

    disableStickyMode() {
        this.stickyMode = false;
        this.isStuck = false;
        this.color = '#ffffff'; // Back to white
    }

    launchFromSticky(paddle) {
        if (this.isStuck) {
            this.isStuck = false;
            this.launched = true;

            // Calculate launch angle based on where ball is on paddle (same as bounce physics)
            const hitPoint = this.stickyOffsetX / paddle.width;
            const angle = (hitPoint - 0.5) * 140 * (Math.PI / 180); // -70 to +70 degrees from center

            this.dx = Math.sin(angle) * this.speed;
            this.dy = -Math.abs(Math.cos(angle) * this.speed);

            // Ensure minimum vertical speed
            if (Math.abs(this.dy) < this.speed * 0.3) {
                this.dy = -this.speed * 0.3;
            }
        }
    }

    render(ctx) {
        ctx.save();

        // Draw aim indicator when ball is not launched (larger and more visible)
        if (!this.launched) {
            const lineLength = 150; // Longer trajectory line
            const pulseTime = Date.now() / 500;
            const pulseAlpha = 0.4 + Math.sin(pulseTime) * 0.3;

            // Draw a thick dashed line showing trajectory
            ctx.strokeStyle = `rgba(0, 212, 255, ${pulseAlpha})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 10]);
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - lineLength);
            ctx.stroke();

            // Draw arrow head at the end
            const arrowSize = 15;
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(0, 212, 255, ${pulseAlpha})`;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - lineLength);
            ctx.lineTo(this.x - arrowSize / 2, this.y - lineLength + arrowSize);
            ctx.lineTo(this.x + arrowSize / 2, this.y - lineLength + arrowSize);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.setLineDash([]);
        }

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

        // Draw main ball with glow (make it bigger and more visible)
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.destroyerMode ? 'rgba(255, 149, 0, 0.9)' :
                         this.stickyMode ? 'rgba(0, 168, 255, 0.9)' :
                         'rgba(255, 255, 255, 0.9)';

        // Destroyer mode: draw explosion rays
        if (this.destroyerMode && this.launched) {
            ctx.strokeStyle = '#ff9500';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff9500';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + Date.now() / 200;
                const x1 = this.x + Math.cos(angle) * this.radius;
                const y1 = this.y + Math.sin(angle) * this.radius;
                const x2 = this.x + Math.cos(angle) * (this.radius * 2);
                const y2 = this.y + Math.sin(angle) * (this.radius * 2);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        // Sticky mode: draw target rings
        if (this.stickyMode) {
            ctx.strokeStyle = '#00a8ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00a8ff';
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2 * pulse, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Inner highlight
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        ctx.restore();
    }

    isOutOfBounds() {
        return this.y > this.canvasHeight + this.radius;
    }
}
