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
        this.fireworks = [];
        this.confetti = [];
        this.stars = [];

        // Celebration timing
        this.celebrationTimer = 0;
        this.celebrationDuration = 3000; // 3 seconds of celebration
        this.celebrationComplete = false;
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
        this.celebrationTimer = 0;
        this.celebrationComplete = false;

        // Create initial celebration effects
        this.createCelebrationEffects();
    }

    createCelebrationEffects() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y;

        // Create hearts around character
        for (let i = 0; i < 8; i++) {
            this.hearts.push({
                x: centerX + (Math.random() - 0.5) * 30,
                y: centerY + (Math.random() - 0.5) * 20,
                vy: -Math.random() * 2 - 1,
                vx: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 8 + 6
            });
        }

        // Create fireworks bursts
        this.createFireworkBurst(centerX - 60, centerY - 40, '#ff6b6b');
        this.createFireworkBurst(centerX + 60, centerY - 40, '#ffd93d');
        this.createFireworkBurst(centerX, centerY - 70, '#6bcb77');

        // Create star burst around character
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.stars.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1,
                size: Math.random() * 4 + 3,
                color: ['#ffd700', '#ff6b9d', '#00ffff', '#ff69b4'][Math.floor(Math.random() * 4)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }

        // Create confetti shower
        for (let i = 0; i < 20; i++) {
            this.confetti.push({
                x: centerX + (Math.random() - 0.5) * 100,
                y: centerY - 50 - Math.random() * 30,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2 + 1,
                life: 1,
                size: Math.random() * 6 + 4,
                color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4ecdc4', '#ff6b9d', '#a855f7'][Math.floor(Math.random() * 6)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    createFireworkBurst(x, y, baseColor) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            this.fireworks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: Math.random() * 3 + 2,
                color: baseColor,
                trail: []
            });
        }
    }

    spawnMoreEffects() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y;

        // Random firework bursts (more frequent)
        if (Math.random() < 0.25) {
            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = -30 - Math.random() * 100;
            const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4ecdc4', '#ff6b9d', '#a855f7'];
            this.createFireworkBurst(centerX + offsetX, centerY + offsetY, colors[Math.floor(Math.random() * colors.length)]);
        }

        // More confetti (more frequent)
        if (Math.random() < 0.5) {
            this.confetti.push({
                x: centerX + (Math.random() - 0.5) * 150,
                y: centerY - 80,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 1.5 + 0.5,
                life: 1,
                size: Math.random() * 8 + 5,
                color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4ecdc4', '#ff6b9d', '#a855f7'][Math.floor(Math.random() * 6)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                wobble: Math.random() * Math.PI * 2
            });
        }

        // More hearts (more frequent)
        if (Math.random() < 0.35) {
            this.hearts.push({
                x: centerX + (Math.random() - 0.5) * 60,
                y: centerY,
                vy: -Math.random() * 2.5 - 1,
                vx: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 10 + 8
            });
        }

        // Add stars burst occasionally
        if (Math.random() < 0.15) {
            const angle = Math.random() * Math.PI * 2;
            this.stars.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 1,
                size: Math.random() * 5 + 4,
                color: ['#ffd700', '#ff6b9d', '#00ffff', '#ff69b4', '#7fff00'][Math.floor(Math.random() * 5)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.4
            });
        }
    }

    update(paddle, canvasHeight, deltaTime = 16) {
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

        // Update fireworks
        this.fireworks = this.fireworks.filter(f => {
            // Store trail position
            f.trail.push({ x: f.x, y: f.y });
            if (f.trail.length > 5) f.trail.shift();

            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.05; // gravity
            f.vx *= 0.99; // air resistance
            f.life -= 0.02;
            return f.life > 0;
        });

        // Update stars
        this.stars = this.stars.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.98;
            s.vy *= 0.98;
            s.rotation += s.rotationSpeed;
            s.life -= 0.015;
            return s.life > 0;
        });

        // Update confetti
        this.confetti = this.confetti.filter(c => {
            c.wobble += 0.1;
            c.x += c.vx + Math.sin(c.wobble) * 0.5;
            c.y += c.vy;
            c.rotation += c.rotationSpeed;
            c.life -= 0.008;
            return c.life > 0;
        });

        // Handle celebration timer
        if (this.state === 'rescued' && !this.celebrationComplete) {
            this.celebrationTimer += deltaTime;

            // Keep spawning effects during celebration
            this.spawnMoreEffects();

            if (this.celebrationTimer >= this.celebrationDuration) {
                this.celebrationComplete = true;
            }
        }

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
            this.drawStar(ctx, s.x, s.y, s.size, 4);
            ctx.fill();
        });

        // Draw fireworks with trails
        this.fireworks.forEach(f => {
            // Draw trail
            f.trail.forEach((t, i) => {
                ctx.globalAlpha = (i / f.trail.length) * f.life * 0.5;
                ctx.fillStyle = f.color;
                ctx.beginPath();
                ctx.arc(t.x, t.y, f.size * (i / f.trail.length), 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw main particle
            ctx.globalAlpha = f.life;
            ctx.fillStyle = f.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = f.color;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw stars
        this.stars.forEach(s => {
            ctx.globalAlpha = s.life;
            ctx.fillStyle = s.color;
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.shadowBlur = 6;
            ctx.shadowColor = s.color;
            ctx.beginPath();
            this.drawStar(ctx, 0, 0, s.size, 5);
            ctx.fill();
            ctx.restore();
            ctx.shadowBlur = 0;
        });

        // Draw confetti
        this.confetti.forEach(c => {
            ctx.globalAlpha = c.life;
            ctx.fillStyle = c.color;
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            // Draw rectangle confetti
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
        });

        // Draw hearts
        this.hearts.forEach(h => {
            ctx.globalAlpha = h.life;
            ctx.fillStyle = '#ff6b9d';
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ff6b9d';
            this.drawHeart(ctx, h.x, h.y, h.size);
            ctx.shadowBlur = 0;
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
