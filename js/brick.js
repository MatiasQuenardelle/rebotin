export class Brick {
    constructor(x, y, width, height, color, points) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.points = points;
        this.alive = true;
        this.cornerRadius = 4;
    }

    hit() {
        this.alive = false;
        return this.points;
    }

    render(ctx) {
        if (!this.alive) return;

        ctx.save();

        // Draw main brick
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
        ctx.fill();

        // 3D effect - lighter top edge
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
        ctx.fill();

        // Subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(this.x + 0.5, this.y + 0.5, this.width - 1, this.height - 1, this.cornerRadius);
        ctx.stroke();

        ctx.restore();
    }
}

export const BRICK_COLORS = {
    red: { color: '#e74c3c', points: 10 },
    orange: { color: '#f39c12', points: 15 },
    yellow: { color: '#f1c40f', points: 20 },
    green: { color: '#2ecc71', points: 25 },
    cyan: { color: '#00d4ff', points: 30 }
};
