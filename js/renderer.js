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
        this.ctx.fillText('BREAKOUT', this.width / 2, this.height / 2 - 70);

        // Subtitle - rescue mission
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText('~ Rescue Edition ~', this.width / 2, this.height / 2 - 25);

        // Mission text
        this.ctx.shadowBlur = 0;
        this.ctx.font = '16px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillText('Free your nephew from the prison brick', this.width / 2, this.height / 2 + 15);
        this.ctx.fillText('and catch him with your paddle!', this.width / 2, this.height / 2 + 35);

        // Instructions
        this.ctx.font = '20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Click or press SPACE to start', this.width / 2, this.height / 2 + 80);

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

    drawLevelComplete(level, nephewRescued = false) {
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
        this.ctx.fillText(`LEVEL ${level} COMPLETE!`, this.width / 2, this.height / 2 - 50);

        // Nephew rescued celebration
        if (nephewRescued) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff6b9d';
            this.ctx.font = 'bold 24px "Segoe UI", sans-serif';
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.fillText('NEPHEW RESCUED!', this.width / 2, this.height / 2);
        }

        // Continue instruction
        this.ctx.shadowBlur = 0;
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Click or press SPACE to continue', this.width / 2, this.height / 2 + 50);

        this.ctx.restore();
    }

    drawRescueStatus(nephewFreed, nephewRescued) {
        this.ctx.save();

        this.ctx.font = 'bold 14px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        if (!nephewFreed) {
            // Nephew still trapped
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText('Break the prison to free your nephew!', this.width / 2, 38);
        } else if (!nephewRescued) {
            // Nephew falling - catch him!
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff6b9d';
            this.ctx.fillText('CATCH YOUR NEPHEW!', this.width / 2, 38);
        } else {
            // Nephew safe!
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillText('Nephew safe! Destroy remaining bricks!', this.width / 2, 38);
        }

        this.ctx.restore();
    }

    drawNephewLost(score) {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Oh no text
        this.ctx.font = 'bold 48px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.fillText('OH NO!', this.width / 2, this.height / 2 - 60);

        // Explanation
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('You missed your nephew!', this.width / 2, this.height / 2);

        // Final score
        this.ctx.font = '20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText(`Score: ${score}`, this.width / 2, this.height / 2 + 40);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Click or press SPACE to try again', this.width / 2, this.height / 2 + 90);

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
        this.ctx.fillText('YOU WIN!', this.width / 2, this.height / 2 - 70);

        // All nephews saved celebration
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.font = 'bold 24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText('All nephews rescued!', this.width / 2, this.height / 2 - 20);

        // Final score
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Final Score: ${score}`, this.width / 2, this.height / 2 + 25);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Click or press SPACE to play again', this.width / 2, this.height / 2 + 75);

        this.ctx.restore();
    }

    drawLaserTimer(percentage) {
        this.ctx.save();

        const barWidth = 100;
        const barHeight = 8;
        const x = this.width - barWidth - 30;
        const y = 38;

        // Background
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, 4);
        this.ctx.fill();

        // Filled portion
        const gradient = this.ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(1, '#ff8888');
        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#ff4444';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth * percentage, barHeight, 4);
        this.ctx.fill();

        // Label
        this.ctx.shadowBlur = 0;
        this.ctx.font = 'bold 10px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff4444';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('LASER', x - 5, y + barHeight);

        this.ctx.restore();
    }

    drawRescueMessage() {
        this.ctx.save();

        // Flashing "CATCH HIM!" message
        const alpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;

        this.ctx.font = 'bold 28px "Segoe UI", sans-serif';
        this.ctx.fillStyle = `rgba(255, 107, 157, ${alpha})`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.fillText('CATCH YOUR NEPHEW!', this.width / 2, this.height / 2);

        this.ctx.restore();
    }
}
