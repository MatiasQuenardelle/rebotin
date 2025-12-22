import { Nephew } from './nephew.js';

export class PrisonBrick {
    constructor(x, y, width, height, characterName = 'Felipe') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = 100; // Special brick worth more points!
        this.alive = true;
        this.cornerRadius = 4;
        this.characterName = characterName;

        // Create character centered in brick
        this.nephew = new Nephew(
            x + (width - 16) / 2,
            y + (height - 20) / 2 + 2,
            characterName
        );

        // Animation
        this.glowTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Prison bar animation
        this.barShake = 0;
    }

    hit() {
        this.alive = false;
        // Free the nephew!
        this.nephew.x = this.x + (this.width - 16) / 2;
        this.nephew.y = this.y + this.height / 2;
        this.nephew.startX = this.nephew.x;
        this.nephew.free();
        return this.points;
    }

    update() {
        this.glowTimer += 0.05;

        if (this.alive) {
            // Occasional shake to show nephew is trapped
            this.shakeTimer += 0.02;
            if (Math.sin(this.shakeTimer * 3) > 0.95) {
                this.shakeIntensity = 2;
                this.barShake = Math.random() * 2 - 1;
            } else {
                this.shakeIntensity *= 0.9;
                this.barShake *= 0.9;
            }
        }
    }

    render(ctx) {
        if (!this.alive) return;

        ctx.save();

        const shake = this.shakeIntensity * (Math.random() - 0.5);

        // Pulsing glow effect to draw attention
        const glowIntensity = 0.3 + Math.sin(this.glowTimer) * 0.2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(255, 200, 100, ${glowIntensity})`;

        // Draw brick background (darker stone color)
        ctx.fillStyle = '#4a4a5a';
        ctx.beginPath();
        ctx.roundRect(this.x + shake, this.y, this.width, this.height, this.cornerRadius);
        ctx.fill();

        // Stone texture effect
        ctx.fillStyle = '#3a3a4a';
        for (let i = 0; i < 3; i++) {
            const bx = this.x + 5 + i * (this.width / 3);
            const by = this.y + 3;
            ctx.fillRect(bx + shake, by, this.width / 4, this.height / 3);
        }
        for (let i = 0; i < 2; i++) {
            const bx = this.x + this.width / 6 + i * (this.width / 2.5);
            const by = this.y + this.height / 2;
            ctx.fillRect(bx + shake, by, this.width / 4, this.height / 3);
        }

        // Draw nephew inside (before bars)
        ctx.shadowBlur = 0;
        this.nephew.render(ctx);

        // Draw prison bars
        ctx.strokeStyle = '#666677';
        ctx.lineWidth = 3;
        const barSpacing = this.width / 5;
        for (let i = 1; i < 5; i++) {
            ctx.beginPath();
            const barX = this.x + i * barSpacing + this.barShake;
            ctx.moveTo(barX + shake, this.y + 2);
            ctx.lineTo(barX + shake, this.y + this.height - 2);
            ctx.stroke();
        }

        // Horizontal bars
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 4 + shake, this.y + this.height / 3);
        ctx.lineTo(this.x + this.width - 4 + shake, this.y + this.height / 3);
        ctx.moveTo(this.x + 4 + shake, this.y + this.height * 2 / 3);
        ctx.lineTo(this.x + this.width - 4 + shake, this.y + this.height * 2 / 3);
        ctx.stroke();

        // Bar highlights
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            ctx.beginPath();
            const barX = this.x + i * barSpacing - 1 + this.barShake;
            ctx.moveTo(barX + shake, this.y + 2);
            ctx.lineTo(barX + shake, this.y + this.height - 2);
            ctx.stroke();
        }

        // Border glow
        ctx.strokeStyle = `rgba(255, 200, 100, ${glowIntensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x + shake, this.y, this.width, this.height, this.cornerRadius);
        ctx.stroke();

        // "HELP!" text floating above occasionally
        if (Math.sin(this.glowTimer * 2) > 0.7) {
            ctx.font = 'bold 8px "Segoe UI", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('HELP!', this.x + this.width / 2, this.y - 5);
        }

        ctx.restore();
    }

    getNephew() {
        return this.nephew;
    }
}
