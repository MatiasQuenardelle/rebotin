export class Monster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 20;

        // States: trapped, falling, caught, escaped
        this.state = 'trapped';

        // Falling physics (same as nephew but slightly different)
        this.fallSpeed = 1.8; // Slightly faster than nephew
        this.swayAmplitude = 20; // More erratic movement
        this.swaySpeed = 0.08;
        this.swayOffset = 0;
        this.startX = x;

        // Wind effect properties - more pronounced wind
        this.windStrength = Math.random() * 5 + 2; // Start with random wind (2-7) - stronger for monsters
        this.windDirection = Math.random() > 0.5 ? 1 : -1; // Random initial direction
        this.windChangeTimer = 0;
        this.windChangeDuration = 35; // Changes more frequently

        // Wind particles for visual effect
        this.windParticles = [];

        // Parachute
        this.parachuteOpen = false;
        this.parachuteSize = 0;
        this.maxParachuteSize = 24;

        // Animation
        this.animTimer = 0;

        // Explosion particles when caught
        this.explosionParticles = [];
    }

    free() {
        this.state = 'falling';
        this.parachuteOpen = true;
    }

    caught() {
        this.state = 'caught';
        // Don't create explosion on monster - paddle will explode instead
    }

    createExplosion() {
        // Create explosion particles
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.explosionParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: Math.random() * 4 + 2,
                color: ['#ff0000', '#ff4400', '#ff8800', '#ffaa00'][Math.floor(Math.random() * 4)]
            });
        }

        // Add smoke particles
        for (let i = 0; i < 15; i++) {
            this.explosionParticles.push({
                x: centerX + (Math.random() - 0.5) * 20,
                y: centerY + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1,
                life: 1,
                size: Math.random() * 8 + 4,
                color: '#555555',
                isSmoke: true
            });
        }

        // Add parachute fabric pieces (torn parachute effect)
        const parachuteY = this.y - this.parachuteSize - 5;
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.explosionParticles.push({
                x: centerX + Math.cos(angle) * this.parachuteSize * 0.5,
                y: parachuteY + Math.sin(angle) * this.parachuteSize * 0.3,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // Slightly upward
                life: 1,
                size: Math.random() * 6 + 4,
                color: '#4a0e4e', // Dark purple parachute color
                isParachute: true,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        // Add parachute strings snapping
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.explosionParticles.push({
                x: centerX,
                y: parachuteY,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 2,
                life: 1,
                size: 2,
                length: 10 + Math.random() * 10,
                color: '#2a0a2e', // Dark string color
                isString: true,
                angle: angle
            });
        }
    }

    update(paddle, canvasHeight, deltaTime = 16) {
        this.animTimer += 0.1;

        // Update explosion particles
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.vx *= 0.98; // air resistance

            // Update rotation for parachute pieces
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed;
            }

            p.life -= 0.02;
            return p.life > 0;
        });

        if (this.state === 'falling') {
            // Open parachute animation
            if (this.parachuteSize < this.maxParachuteSize) {
                this.parachuteSize += 2;
            }

            // Wind effect - changes direction and strength periodically
            this.windChangeTimer++;
            if (this.windChangeTimer >= this.windChangeDuration) {
                this.windChangeTimer = 0;
                this.windDirection = Math.random() > 0.5 ? 1 : -1;
                this.windStrength = Math.random() * 5 + 2; // Stronger wind (2-7)
            }

            // Smooth wind effect
            const windForce = Math.sin(this.windChangeTimer / this.windChangeDuration * Math.PI) *
                              this.windStrength * this.windDirection;

            // Erratic swaying motion with stronger wind effect
            this.swayOffset += this.swaySpeed;
            this.x = this.startX + Math.sin(this.swayOffset) * this.swayAmplitude + windForce * 35;

            // Spawn wind particles for visual effect
            if (Math.random() < 0.35) {
                this.windParticles.push({
                    x: this.x + this.width / 2 + (Math.random() - 0.5) * 50,
                    y: this.y + Math.random() * this.height,
                    vx: this.windDirection * (2.5 + Math.random() * 4),
                    vy: (Math.random() - 0.5) * 0.8,
                    life: 1,
                    size: Math.random() * 2.5 + 1
                });
            }

            // Update wind particles
            this.windParticles = this.windParticles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                return p.life > 0;
            });

            // Fall down
            this.y += this.fallSpeed;

            // Check if caught by paddle
            const monsterBottom = this.y + this.height;
            const monsterCenterX = this.x + this.width / 2;

            if (monsterBottom >= paddle.y &&
                monsterBottom <= paddle.y + paddle.height + 10 &&
                monsterCenterX >= paddle.x &&
                monsterCenterX <= paddle.x + paddle.width) {
                this.caught();
            }

            // Check if escaped off screen
            if (this.y > canvasHeight) {
                this.state = 'escaped';
            }
        }
    }

    render(ctx) {
        ctx.save();

        // Draw wind particles
        this.windParticles.forEach(p => {
            ctx.globalAlpha = p.life * 0.5;
            ctx.fillStyle = '#d0e0f0';
            ctx.beginPath();
            // Draw elongated wind streaks
            ctx.ellipse(p.x, p.y, p.size * 4.5, p.size, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw explosion particles
        this.explosionParticles.forEach(p => {
            ctx.globalAlpha = p.life;

            if (p.isString) {
                // Draw parachute string
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(p.angle) * p.length, p.y + Math.sin(p.angle) * p.length);
                ctx.stroke();
            } else if (p.isParachute) {
                // Draw parachute fabric piece (rotated rectangle)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            } else {
                // Regular explosion particle
                ctx.fillStyle = p.color;
                if (p.isSmoke) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.color;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        ctx.globalAlpha = 1;

        // Don't draw monster if caught
        if (this.state === 'caught') {
            ctx.restore();
            return;
        }

        if (this.state === 'falling') {
            // Draw parachute (different color - dark/evil)
            this.drawParachute(ctx);
        }

        // Draw monster pixel art
        this.drawMonster(ctx);

        ctx.restore();
    }

    drawParachute(ctx) {
        const size = this.parachuteSize;
        const centerX = this.x + this.width / 2;
        const topY = this.y - size - 5;

        // Parachute canopy (dark purple/black)
        ctx.fillStyle = '#4a0e4e'; // Dark purple
        ctx.beginPath();
        ctx.arc(centerX, topY + size/2, size, Math.PI, 0, false);
        ctx.fill();

        // Evil stripes
        ctx.fillStyle = '#000000';
        for (let i = -2; i <= 2; i += 2) {
            ctx.beginPath();
            ctx.arc(centerX + i * 4, topY + size/2, size, Math.PI + 0.3, Math.PI + 0.5, false);
            ctx.arc(centerX + i * 4, topY + size/2, size * 0.3, Math.PI + 0.5, Math.PI + 0.3, true);
            ctx.fill();
        }

        // Parachute strings
        ctx.strokeStyle = '#2a0a2e';
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

    drawMonster(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        const scale = 1;
        const bobbing = Math.sin(this.animTimer) * 2;

        // Body (purple/green slime monster)
        ctx.fillStyle = '#9333ea'; // Purple
        this.drawPixel(ctx, x + 2, y + 8 + bobbing, 12, 12, scale);

        // Eyes (big scary eyes)
        ctx.fillStyle = '#ffff00'; // Yellow
        this.drawPixel(ctx, x + 3, y + 10 + bobbing, 3, 4, scale);
        this.drawPixel(ctx, x + 10, y + 10 + bobbing, 3, 4, scale);

        // Pupils (red)
        ctx.fillStyle = '#ff0000';
        this.drawPixel(ctx, x + 4, y + 11 + bobbing, 2, 2, scale);
        this.drawPixel(ctx, x + 11, y + 11 + bobbing, 2, 2, scale);

        // Angry eyebrows
        ctx.fillStyle = '#000000';
        this.drawPixel(ctx, x + 2, y + 9 + bobbing, 4, 1, scale);
        this.drawPixel(ctx, x + 10, y + 9 + bobbing, 4, 1, scale);

        // Sharp teeth
        ctx.fillStyle = '#ffffff';
        this.drawPixel(ctx, x + 5, y + 16 + bobbing, 2, 3, scale);
        this.drawPixel(ctx, x + 9, y + 16 + bobbing, 2, 3, scale);

        // Horns
        ctx.fillStyle = '#dc2626'; // Red horns
        this.drawPixel(ctx, x + 1, y + 6 + bobbing, 2, 3, scale);
        this.drawPixel(ctx, x + 13, y + 6 + bobbing, 2, 3, scale);
        this.drawPixel(ctx, x + 0, y + 4 + bobbing, 2, 2, scale);
        this.drawPixel(ctx, x + 14, y + 4 + bobbing, 2, 2, scale);

        // Arms waving menacingly
        ctx.fillStyle = '#9333ea';
        const armWave = Math.sin(this.animTimer * 2) * 2;
        this.drawPixel(ctx, x - 2, y + 10 + armWave, 3, 6, scale);
        this.drawPixel(ctx, x + 15, y + 10 - armWave, 3, 6, scale);

        // Claws
        ctx.fillStyle = '#dc2626';
        this.drawPixel(ctx, x - 3, y + 15 + armWave, 2, 2, scale);
        this.drawPixel(ctx, x + 17, y + 15 - armWave, 2, 2, scale);
    }

    drawPixel(ctx, x, y, w, h, scale) {
        ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
