export class Laser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 12;
        this.alive = true;
    }

    update() {
        this.y -= this.speed;
    }

    render(ctx) {
        if (!this.alive) return;

        ctx.save();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff4444';

        // Main laser beam
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#ff4444');
        gradient.addColorStop(1, '#ffaaaa');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x - this.width / 2, this.y - this.height, this.width, this.height, 2);
        ctx.fill();

        // Core (brighter center)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(this.x - 1, this.y - this.height + 2, 2, this.height - 4, 1);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height,
            width: this.width,
            height: this.height
        };
    }
}
