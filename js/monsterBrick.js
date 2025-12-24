import { Monster } from './monster.js';

export class MonsterBrick {
    constructor(x, y, width = 60, height = 20) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = true;
        this.color = '#4a0e4e'; // Dark purple
        this.glowColor = '#9333ea';
        this.points = 30;
        this.indestructible = false;

        // Monster inside
        this.monster = new Monster(
            x + width / 2 - 8,
            y + height / 2 - 10
        );

        // Animation
        this.pulseTimer = 0;
        this.shakeOffset = 0;
    }

    hit() {
        if (this.alive && !this.indestructible) {
            this.alive = false;
            // Don't free the monster here - let game.js handle it
            // this.monster.free();
            return this.points;
        }
        return 0;
    }

    update() {
        this.pulseTimer += 0.1;
        this.shakeOffset = Math.sin(this.pulseTimer * 3) * 1;
    }

    getMonster() {
        return this.monster;
    }

    render(ctx) {
        if (!this.alive) return;

        ctx.save();

        const shake = this.shakeOffset;
        const pulse = 1 + Math.sin(this.pulseTimer) * 0.05;

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glowColor;

        // Main brick body with pulse
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(
            this.x + shake,
            this.y,
            this.width * pulse,
            this.height * pulse,
            4
        );
        ctx.fill();

        // Evil pattern overlay
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(
                this.x + shake + 5 + i * 18,
                this.y + 5,
                2,
                this.height * pulse - 10
            );
        }

        // Warning symbol (skull or danger)
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠', this.x + this.width / 2 + shake, this.y + this.height / 2);

        // Render trapped monster (peek through bars)
        if (this.monster.state === 'trapped') {
            ctx.globalAlpha = 0.6;

            // Just show the eyes peeking
            const monsterX = this.x + this.width / 2 - 8 + shake;
            const monsterY = this.y + this.height / 2 - 4;

            // Eyes
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(monsterX + 3, monsterY, 3, 3);
            ctx.fillRect(monsterX + 10, monsterY, 3, 3);

            // Red pupils
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(monsterX + 4, monsterY + 1, 2, 2);
            ctx.fillRect(monsterX + 11, monsterY + 1, 2, 2);

            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }
}
