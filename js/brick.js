export class Brick {
    constructor(x, y, width, height, color, points, indestructible = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.points = points;
        this.alive = true;
        this.cornerRadius = 4;
        this.indestructible = indestructible;
        this.hitFlash = 0;
    }

    hit() {
        if (this.indestructible) {
            this.hitFlash = 1;
            return 0;
        }
        this.alive = false;
        return this.points;
    }

    render(ctx) {
        if (!this.alive) return;

        ctx.save();

        // Update hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= 0.1;
        }

        if (this.indestructible) {
            // Indestructible brick - metal/steel look
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(150, 150, 170, 0.5)';

            // Base metal color
            ctx.fillStyle = '#5a5a6a';
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
            ctx.fill();

            // Metal gradient
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, 'rgba(200, 200, 220, 0.4)');
            gradient.addColorStop(0.3, 'rgba(100, 100, 120, 0.2)');
            gradient.addColorStop(0.7, 'rgba(50, 50, 60, 0.3)');
            gradient.addColorStop(1, 'rgba(30, 30, 40, 0.4)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
            ctx.fill();

            // Bolt/rivet decorations
            ctx.fillStyle = '#3a3a4a';
            const boltSize = 3;
            ctx.beginPath();
            ctx.arc(this.x + 6, this.y + this.height / 2, boltSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.width - 6, this.y + this.height / 2, boltSize, 0, Math.PI * 2);
            ctx.fill();

            // Bolt highlights
            ctx.fillStyle = '#7a7a8a';
            ctx.beginPath();
            ctx.arc(this.x + 5, this.y + this.height / 2 - 1, 1.5, 0, Math.PI * 2);
            ctx.arc(this.x + this.width - 7, this.y + this.height / 2 - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Hit flash effect
            if (this.hitFlash > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash * 0.5})`;
                ctx.beginPath();
                ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
                ctx.fill();
            }

            // Border
            ctx.strokeStyle = '#8a8a9a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, this.cornerRadius);
            ctx.stroke();
        } else {
            // Normal breakable brick
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
        }

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
