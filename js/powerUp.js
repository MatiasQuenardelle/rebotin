export class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = 'laser'; // For now, only laser power-up
        this.fallSpeed = 2;
        this.rotation = 0;
        this.pulseTimer = 0;
    }

    update() {
        this.y += this.fallSpeed;
        this.rotation += 0.05;
        this.pulseTimer += 0.1;
    }

    checkCollision(paddle) {
        return (
            this.x + this.width / 2 > paddle.x &&
            this.x - this.width / 2 < paddle.x + paddle.width &&
            this.y + this.height / 2 > paddle.y &&
            this.y - this.height / 2 < paddle.y + paddle.height
        );
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const pulse = 1 + Math.sin(this.pulseTimer) * 0.1;
        ctx.scale(pulse, pulse);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4444';

        // Outer capsule
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
        ctx.fill();

        // Inner gradient
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
        ctx.fill();

        // Laser icon (lightning bolt shape)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-3, -8);
        ctx.lineTo(4, -2);
        ctx.lineTo(0, -2);
        ctx.lineTo(3, 8);
        ctx.lineTo(-4, 2);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
