export class Nephew {
    constructor(x, y, characterName = 'Felipe') {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 20;
        this.characterName = characterName;
        this.isJulieta = characterName === 'Julieta';

        // States: trapped, falling, rescued, lost
        this.state = 'trapped';

        // Falling physics
        this.fallSpeed = 1.5;
        this.swayAmplitude = 15;
        this.swaySpeed = 0.05;
        this.swayOffset = 0;
        this.startX = x;

        // Parachute
        this.parachuteOpen = false;
        this.parachuteSize = 0;
        this.maxParachuteSize = 24;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.waveTimer = 0;

        // Celebration effects
        this.sparkles = [];
        this.hearts = [];
    }

    free() {
        this.state = 'falling';
        this.parachuteOpen = true;
        // Create initial sparkles when freed
        for (let i = 0; i < 8; i++) {
            this.sparkles.push({
                x: this.x + Math.random() * 20 - 10,
                y: this.y + Math.random() * 20 - 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 1,
                life: 1,
                size: Math.random() * 3 + 2
            });
        }
    }

    rescue() {
        this.state = 'rescued';
        // Create celebration hearts
        for (let i = 0; i < 5; i++) {
            this.hearts.push({
                x: this.x,
                y: this.y,
                vy: -Math.random() * 2 - 1,
                vx: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 8 + 6
            });
        }
    }

    update(paddle, canvasHeight) {
        this.animTimer += 0.1;
        this.waveTimer += 0.15;

        // Update sparkles
        this.sparkles = this.sparkles.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.02;
            return s.life > 0;
        });

        // Update hearts
        this.hearts = this.hearts.filter(h => {
            h.x += h.vx;
            h.y += h.vy;
            h.life -= 0.015;
            return h.life > 0;
        });

        if (this.state === 'falling') {
            // Open parachute animation
            if (this.parachuteSize < this.maxParachuteSize) {
                this.parachuteSize += 2;
            }

            // Gentle swaying motion
            this.swayOffset += this.swaySpeed;
            this.x = this.startX + Math.sin(this.swayOffset) * this.swayAmplitude;

            // Fall down slowly
            this.y += this.fallSpeed;

            // Check if landed on paddle
            const nephewBottom = this.y + this.height;
            const nephewCenterX = this.x + this.width / 2;

            if (nephewBottom >= paddle.y &&
                nephewBottom <= paddle.y + paddle.height + 10 &&
                nephewCenterX >= paddle.x &&
                nephewCenterX <= paddle.x + paddle.width) {
                this.rescue();
                this.y = paddle.y - this.height;
            }

            // Check if fell off screen
            if (this.y > canvasHeight) {
                this.state = 'lost';
            }
        }

        if (this.state === 'rescued') {
            // Bounce slightly on paddle
            this.animFrame = Math.floor(this.animTimer) % 2;
        }
    }

    render(ctx) {
        ctx.save();

        // Draw sparkles
        this.sparkles.forEach(s => {
            ctx.globalAlpha = s.life;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            // Star shape
            this.drawStar(ctx, s.x, s.y, s.size, 4);
            ctx.fill();
        });

        // Draw hearts
        this.hearts.forEach(h => {
            ctx.globalAlpha = h.life;
            ctx.fillStyle = '#ff6b9d';
            this.drawHeart(ctx, h.x, h.y, h.size);
        });

        ctx.globalAlpha = 1;

        if (this.state === 'falling' || this.state === 'rescued') {
            // Draw parachute
            this.drawParachute(ctx);
        }

        // Draw nephew pixel art
        this.drawNephew(ctx);

        ctx.restore();
    }

    drawParachute(ctx) {
        const size = this.parachuteSize;
        const centerX = this.x + this.width / 2;
        const topY = this.y - size - 5;

        // Parachute canopy (cute dome shape)
        ctx.fillStyle = '#ff6b9d'; // Pink parachute
        ctx.beginPath();
        ctx.arc(centerX, topY + size/2, size, Math.PI, 0, false);
        ctx.fill();

        // Stripes on parachute
        ctx.fillStyle = '#ffb3d1';
        for (let i = -2; i <= 2; i += 2) {
            ctx.beginPath();
            ctx.arc(centerX + i * 4, topY + size/2, size, Math.PI + 0.3, Math.PI + 0.5, false);
            ctx.arc(centerX + i * 4, topY + size/2, size * 0.3, Math.PI + 0.5, Math.PI + 0.3, true);
            ctx.fill();
        }

        // Parachute strings
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - size + 2, topY + size/2);
        ctx.lineTo(centerX - 4, this.y);
        ctx.moveTo(centerX + size - 2, topY + size/2);
        ctx.lineTo(centerX + 4, this.y);
        ctx.moveTo(centerX, topY);
        ctx.lineTo(centerX, this.y);
        ctx.stroke();
    }

    drawNephew(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const isWaving = this.state === 'trapped' || this.state === 'rescued';
        const waveUp = Math.sin(this.waveTimer) > 0;

        // Pixel art character (16x20 pixels scaled)
        const scale = 1;

        if (this.isJulieta) {
            // Julieta - girl with longer hair and pink dress

            // Hair (dark brown, longer)
            ctx.fillStyle = '#5c3317';
            this.drawPixel(ctx, x + 4, y, 8, 4, scale); // Top hair
            this.drawPixel(ctx, x + 2, y + 2, 2, 8, scale); // Left side long hair
            this.drawPixel(ctx, x + 12, y + 2, 2, 8, scale); // Right side long hair
            this.drawPixel(ctx, x + 1, y + 6, 2, 6, scale); // Extra left hair
            this.drawPixel(ctx, x + 13, y + 6, 2, 6, scale); // Extra right hair

            // Hair bow (pink)
            ctx.fillStyle = '#ff6b9d';
            this.drawPixel(ctx, x + 10, y + 1, 3, 2, scale);
            this.drawPixel(ctx, x + 11, y, 1, 1, scale);
            this.drawPixel(ctx, x + 11, y + 3, 1, 1, scale);

            // Face (skin tone)
            ctx.fillStyle = '#ffcc99';
            this.drawPixel(ctx, x + 4, y + 4, 8, 8, scale);

            // Eyes (slightly bigger/cuter)
            ctx.fillStyle = '#000000';
            this.drawPixel(ctx, x + 5, y + 6, 2, 2, scale);
            this.drawPixel(ctx, x + 9, y + 6, 2, 2, scale);

            // Eye shine
            ctx.fillStyle = '#ffffff';
            this.drawPixel(ctx, x + 5, y + 6, 1, 1, scale);
            this.drawPixel(ctx, x + 9, y + 6, 1, 1, scale);

            // Eyelashes
            ctx.fillStyle = '#000000';
            this.drawPixel(ctx, x + 4, y + 5, 1, 1, scale);
            this.drawPixel(ctx, x + 11, y + 5, 1, 1, scale);

            // Cheeks (blush)
            ctx.fillStyle = '#ffaaaa';
            this.drawPixel(ctx, x + 3, y + 8, 2, 2, scale);
            this.drawPixel(ctx, x + 11, y + 8, 2, 2, scale);

            // Smile
            ctx.fillStyle = '#ff6666';
            if (this.state === 'rescued') {
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
                this.drawPixel(ctx, x + 5, y + 9, 1, 1, scale);
                this.drawPixel(ctx, x + 10, y + 9, 1, 1, scale);
            } else if (this.state === 'trapped') {
                ctx.fillStyle = '#cc6666';
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
            } else {
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
            }

            // Body (pink dress)
            ctx.fillStyle = '#ff6b9d';
            this.drawPixel(ctx, x + 4, y + 12, 8, 6, scale);

            // Dress detail (lighter pink)
            ctx.fillStyle = '#ff99b8';
            this.drawPixel(ctx, x + 6, y + 13, 4, 1, scale);

            // Arms
            ctx.fillStyle = '#ffcc99';
            if (isWaving && waveUp) {
                this.drawPixel(ctx, x + 1, y + 10, 3, 2, scale);
                this.drawPixel(ctx, x + 12, y + 13, 3, 2, scale);
            } else {
                this.drawPixel(ctx, x + 1, y + 13, 3, 2, scale);
                this.drawPixel(ctx, x + 12, y + 13, 3, 2, scale);
            }

            // Legs (dress bottom / darker pink)
            ctx.fillStyle = '#d94f7a';
            this.drawPixel(ctx, x + 4, y + 18, 3, 2, scale);
            this.drawPixel(ctx, x + 9, y + 18, 3, 2, scale);
        } else {
            // Felipe - boy with short hair and blue shirt

            // Hair (brown)
            ctx.fillStyle = '#8b4513';
            this.drawPixel(ctx, x + 4, y, 8, 4, scale); // Top hair
            this.drawPixel(ctx, x + 2, y + 2, 2, 4, scale); // Left side hair
            this.drawPixel(ctx, x + 12, y + 2, 2, 4, scale); // Right side hair

            // Face (skin tone)
            ctx.fillStyle = '#ffcc99';
            this.drawPixel(ctx, x + 4, y + 4, 8, 8, scale);

            // Eyes
            ctx.fillStyle = '#000000';
            this.drawPixel(ctx, x + 5, y + 6, 2, 2, scale);
            this.drawPixel(ctx, x + 9, y + 6, 2, 2, scale);

            // Eye shine
            ctx.fillStyle = '#ffffff';
            this.drawPixel(ctx, x + 5, y + 6, 1, 1, scale);
            this.drawPixel(ctx, x + 9, y + 6, 1, 1, scale);

            // Cheeks (blush)
            ctx.fillStyle = '#ffaaaa';
            this.drawPixel(ctx, x + 3, y + 8, 2, 2, scale);
            this.drawPixel(ctx, x + 11, y + 8, 2, 2, scale);

            // Smile
            ctx.fillStyle = '#ff6666';
            if (this.state === 'rescued') {
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
                this.drawPixel(ctx, x + 5, y + 9, 1, 1, scale);
                this.drawPixel(ctx, x + 10, y + 9, 1, 1, scale);
            } else if (this.state === 'trapped') {
                ctx.fillStyle = '#cc6666';
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
            } else {
                this.drawPixel(ctx, x + 6, y + 10, 4, 1, scale);
            }

            // Body (blue shirt)
            ctx.fillStyle = '#4a90d9';
            this.drawPixel(ctx, x + 4, y + 12, 8, 6, scale);

            // Shirt detail
            ctx.fillStyle = '#3a7bc8';
            this.drawPixel(ctx, x + 7, y + 13, 2, 4, scale);

            // Arms
            ctx.fillStyle = '#ffcc99';
            if (isWaving && waveUp) {
                this.drawPixel(ctx, x + 1, y + 10, 3, 2, scale);
                this.drawPixel(ctx, x + 12, y + 13, 3, 2, scale);
            } else {
                this.drawPixel(ctx, x + 1, y + 13, 3, 2, scale);
                this.drawPixel(ctx, x + 12, y + 13, 3, 2, scale);
            }

            // Legs (darker blue pants)
            ctx.fillStyle = '#2c5aa0';
            this.drawPixel(ctx, x + 4, y + 18, 3, 2, scale);
            this.drawPixel(ctx, x + 9, y + 18, 3, 2, scale);
        }
    }

    drawPixel(ctx, x, y, w, h, scale) {
        ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
    }

    drawStar(ctx, x, y, size, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? size : size / 2;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    drawHeart(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y + size / 4);
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.7, x, y + size);
        ctx.bezierCurveTo(x, y + size * 0.7, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
        ctx.fill();
    }

    // Get bounds for positioning in brick
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
