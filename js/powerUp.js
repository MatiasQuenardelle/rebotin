export class PowerUp {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;

        // Random type if not specified
        const types = ['laser', 'inverse', 'expand', 'shrink', 'destroyer', 'sticky'];
        this.type = type || types[Math.floor(Math.random() * types.length)];

        this.fallSpeed = 2;
        this.rotation = 0;
        this.pulseTimer = 0;

        // Type-specific properties
        this.config = this.getTypeConfig();
    }

    getTypeConfig() {
        const configs = {
            laser: {
                color: '#ff4444',
                glowColor: '#ff4444',
                icon: 'laser'
            },
            inverse: {
                color: '#9b59b6',
                glowColor: '#9b59b6',
                icon: 'inverse'
            },
            expand: {
                color: '#2ecc71',
                glowColor: '#2ecc71',
                icon: 'expand'
            },
            shrink: {
                color: '#e74c3c',
                glowColor: '#e74c3c',
                icon: 'shrink'
            },
            destroyer: {
                color: '#ff9500',
                glowColor: '#ff9500',
                icon: 'destroyer'
            },
            sticky: {
                color: '#00a8ff',
                glowColor: '#00a8ff',
                icon: 'sticky'
            }
        };
        return configs[this.type] || configs.laser;
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
        ctx.shadowColor = this.config.glowColor;

        // Outer capsule
        ctx.fillStyle = this.config.color;
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

        // Draw type-specific icon
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        this.drawIcon(ctx);

        ctx.restore();
    }

    drawIcon(ctx) {
        switch (this.config.icon) {
            case 'laser':
                // Lightning bolt shape
                ctx.beginPath();
                ctx.moveTo(-3, -8);
                ctx.lineTo(4, -2);
                ctx.lineTo(0, -2);
                ctx.lineTo(3, 8);
                ctx.lineTo(-4, 2);
                ctx.lineTo(0, 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'inverse':
                // Crossed arrows (inverted controls)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                // Arrow pointing right (labeled left)
                ctx.beginPath();
                ctx.moveTo(-7, -5);
                ctx.lineTo(2, -5);
                ctx.lineTo(-2, -8);
                ctx.moveTo(2, -5);
                ctx.lineTo(-2, -2);
                ctx.stroke();
                // Arrow pointing left (labeled right)
                ctx.beginPath();
                ctx.moveTo(7, 5);
                ctx.lineTo(-2, 5);
                ctx.lineTo(2, 2);
                ctx.moveTo(-2, 5);
                ctx.lineTo(2, 8);
                ctx.stroke();
                break;

            case 'expand':
                // Double arrows pointing outward (expand)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                // Left arrow
                ctx.beginPath();
                ctx.moveTo(-2, 0);
                ctx.lineTo(-7, 0);
                ctx.lineTo(-4, -3);
                ctx.moveTo(-7, 0);
                ctx.lineTo(-4, 3);
                ctx.stroke();
                // Right arrow
                ctx.beginPath();
                ctx.moveTo(2, 0);
                ctx.lineTo(7, 0);
                ctx.lineTo(4, -3);
                ctx.moveTo(7, 0);
                ctx.lineTo(4, 3);
                ctx.stroke();
                break;

            case 'shrink':
                // Double arrows pointing inward (shrink)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                // Left arrow
                ctx.beginPath();
                ctx.moveTo(-7, 0);
                ctx.lineTo(-2, 0);
                ctx.lineTo(-5, -3);
                ctx.moveTo(-2, 0);
                ctx.lineTo(-5, 3);
                ctx.stroke();
                // Right arrow
                ctx.beginPath();
                ctx.moveTo(7, 0);
                ctx.lineTo(2, 0);
                ctx.lineTo(5, -3);
                ctx.moveTo(2, 0);
                ctx.lineTo(5, 3);
                ctx.stroke();
                break;

            case 'destroyer':
                // Explosion/star burst icon
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                // Draw explosion rays
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * 7;
                    const y = Math.sin(angle) * 7;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                // Center circle
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'sticky':
                // Target/crosshair icon
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                // Outer circle
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.stroke();
                // Inner circle
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.stroke();
                // Crosshair lines
                ctx.beginPath();
                ctx.moveTo(-9, 0);
                ctx.lineTo(-7, 0);
                ctx.moveTo(7, 0);
                ctx.lineTo(9, 0);
                ctx.moveTo(0, -9);
                ctx.lineTo(0, -7);
                ctx.moveTo(0, 7);
                ctx.lineTo(0, 9);
                ctx.stroke();
                break;
        }
    }
}
