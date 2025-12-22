export class Renderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGameArea() {
        this.ctx.save();

        // Subtle inner border
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(18, 48, this.width - 36, this.height - 66, 8);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawHUD(score, level, lives) {
        this.ctx.save();

        this.ctx.font = 'bold 18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textBaseline = 'top';

        // Score (left)
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${score}`, 30, 18);

        // Level (center)
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`LEVEL ${level}`, this.width / 2, 18);

        // Lives (right)
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LIVES: ${lives}`, this.width - 30, 18);

        this.ctx.restore();
    }

    drawControls() {
        this.ctx.save();

        this.ctx.font = '12px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('MOUSE / ARROW KEYS to move  |  CLICK / SPACE to launch', this.width / 2, this.height - 8);

        this.ctx.restore();
    }

    drawStartScreen() {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Title
        this.ctx.font = 'bold 48px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fillText('BREAKOUT', this.width / 2, this.height / 2 - 50);

        // Instructions
        this.ctx.shadowBlur = 0;
        this.ctx.font = '20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Click or press SPACE to start', this.width / 2, this.height / 2 + 30);

        this.ctx.restore();
    }

    drawGameOver(score) {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Game Over text
        this.ctx.font = 'bold 48px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

        // Final score
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Final Score: ${score}`, this.width / 2, this.height / 2 + 20);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Click or press SPACE to play again', this.width / 2, this.height / 2 + 70);

        this.ctx.restore();
    }

    drawLevelComplete(level) {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Level Complete text
        this.ctx.font = 'bold 36px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.fillText(`LEVEL ${level} COMPLETE!`, this.width / 2, this.height / 2 - 30);

        // Continue instruction
        this.ctx.shadowBlur = 0;
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Click or press SPACE to continue', this.width / 2, this.height / 2 + 30);

        this.ctx.restore();
    }

    drawWinScreen(score) {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Victory text
        this.ctx.font = 'bold 48px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#f1c40f';
        this.ctx.fillText('YOU WIN!', this.width / 2, this.height / 2 - 50);

        // Final score
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Final Score: ${score}`, this.width / 2, this.height / 2 + 20);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Click or press SPACE to play again', this.width / 2, this.height / 2 + 70);

        this.ctx.restore();
    }
}
