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

    drawHUD(score, level, lives, landscapeMode = false) {
        this.ctx.save();

        if (landscapeMode) {
            // In landscape mode, HUD is drawn as HTML elements outside canvas
            // So we don't draw anything here on canvas
        } else {
            // Original horizontal layout at top
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
        }

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
        this.ctx.fillText('~ Edición Rescate ~', this.width / 2, this.height / 2 - 25);

        // Mission text
        this.ctx.shadowBlur = 0;
        this.ctx.font = '16px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillText('¡Libera a tu sobrino de la prisión', this.width / 2, this.height / 2 + 15);
        this.ctx.fillText('y atrápalo con tu plataforma!', this.width / 2, this.height / 2 + 35);

        // Instructions
        this.ctx.font = '20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Toca o presiona ESPACIO para comenzar', this.width / 2, this.height / 2 + 80);

        this.ctx.restore();
    }

    drawCharacterSelect() {
        this.ctx.save();

        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Title
        this.ctx.font = 'bold 36px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fillText('¿A quién quieres salvar?', this.width / 2, this.height / 2 - 60);

        // Felipe button
        const btnWidth = 150;
        const btnHeight = 50;
        const felipeX = this.width / 2 - btnWidth - 20;
        const julietaX = this.width / 2 + 20;
        const btnY = this.height / 2 + 20;

        // Felipe button
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#4a90d9';
        this.ctx.fillStyle = '#4a90d9';
        this.ctx.beginPath();
        this.ctx.roundRect(felipeX, btnY, btnWidth, btnHeight, 10);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.font = 'bold 24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Felipe', felipeX + btnWidth / 2, btnY + btnHeight / 2);

        // Julieta button
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.beginPath();
        this.ctx.roundRect(julietaX, btnY, btnWidth, btnHeight, 10);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Julieta', julietaX + btnWidth / 2, btnY + btnHeight / 2);

        this.ctx.restore();
    }

    drawGameOver(score) {
        this.ctx.save();

        // Game Over text
        this.ctx.font = 'bold 48px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.fillText('FIN DEL JUEGO', this.width / 2, this.height / 2 - 50);

        // Final score
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Puntuación: ${score}`, this.width / 2, this.height / 2 + 20);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Toca o presiona ESPACIO para jugar de nuevo', this.width / 2, this.height / 2 + 70);

        this.ctx.restore();
    }

    drawLevelCelebration(level, characterName = 'Felipe') {
        this.ctx.save();

        // NO dark overlay - let the celebration effects be fully visible!
        // Just draw a subtle backdrop behind the text so it's readable

        // Text backdrop (small rounded rect at top)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        const backdropWidth = 320;
        const backdropHeight = 80;
        const backdropX = (this.width - backdropWidth) / 2;
        const backdropY = 60;
        this.ctx.beginPath();
        this.ctx.roundRect(backdropX, backdropY, backdropWidth, backdropHeight, 15);
        this.ctx.fill();

        // Animated "RESCUED!" text at top
        const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
        this.ctx.font = `bold ${32 * pulse}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.fillText(`¡${characterName.toUpperCase()} RESCATADO${characterName === 'Julieta' ? 'A' : ''}!`, this.width / 2, 85);

        // Level complete message below
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillText(`¡NIVEL ${level} COMPLETADO!`, this.width / 2, 120);

        this.ctx.restore();
    }

    drawLevelComplete(level, characterRescued = false, characterName = 'Felipe') {
        this.ctx.save();

        // NO dark overlay - keep the game visible!
        // Just draw a subtle backdrop behind the text so it's readable

        // Text backdrop
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const backdropWidth = 450;
        const backdropHeight = 160;
        const backdropX = (this.width - backdropWidth) / 2;
        const backdropY = this.height / 2 - 80;
        this.ctx.beginPath();
        this.ctx.roundRect(backdropX, backdropY, backdropWidth, backdropHeight, 15);
        this.ctx.fill();

        // Level Complete text (centered)
        this.ctx.font = 'bold 36px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.fillText(`¡NIVEL ${level} COMPLETADO!`, this.width / 2, this.height / 2);

        // Continue instruction
        this.ctx.shadowBlur = 0;
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Toca o presiona ESPACIO para continuar', this.width / 2, this.height / 2 + 50);

        this.ctx.restore();
    }

    drawRescueStatus(characterFreed, characterRescued, characterName = 'Felipe') {
        this.ctx.save();

        this.ctx.font = 'bold 14px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        if (!characterFreed) {
            // Character still trapped
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText(`¡Rompe la prisión para liberar a ${characterName}!`, this.width / 2, 38);
        } else if (!characterRescued) {
            // Character falling - catch them!
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff6b9d';
            this.ctx.fillText(`¡ATRAPA A ${characterName.toUpperCase()}!`, this.width / 2, 38);
        } else {
            // Character safe!
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillText(`¡${characterName} a salvo! ¡Destruye los bloques restantes!`, this.width / 2, 38);
        }

        this.ctx.restore();
    }

    drawCharacterLost(score, characterName = 'Felipe') {
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
        this.ctx.fillText('¡OH NO!', this.width / 2, this.height / 2 - 60);

        // Explanation
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`¡No atrapaste a ${characterName}!`, this.width / 2, this.height / 2);

        // Final score
        this.ctx.font = '20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText(`Puntuación: ${score}`, this.width / 2, this.height / 2 + 40);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Toca o presiona ESPACIO para intentar de nuevo', this.width / 2, this.height / 2 + 90);

        this.ctx.restore();
    }

    drawWinScreen(score, characterName = 'Felipe') {
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
        this.ctx.fillText('¡GANASTE!', this.width / 2, this.height / 2 - 70);

        // All characters saved celebration
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.font = 'bold 24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText(`¡Todos los ${characterName}s rescatados!`, this.width / 2, this.height / 2 - 20);

        // Final score
        this.ctx.shadowBlur = 0;
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Puntuación Final: ${score}`, this.width / 2, this.height / 2 + 25);

        // Restart instruction
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Toca o presiona ESPACIO para jugar de nuevo', this.width / 2, this.height / 2 + 75);

        this.ctx.restore();
    }

    drawPowerUpTimers(activeTimers) {
        this.ctx.save();

        const barWidth = 100;
        const barHeight = 8;
        const barSpacing = 16;
        const startX = this.width - barWidth - 30;
        let startY = 38;

        const timerConfig = {
            laser: { color: '#ff4444', label: 'LASER' },
            inverse: { color: '#9b59b6', label: 'INVERSE' },
            expand: { color: '#2ecc71', label: 'EXPAND' },
            shrink: { color: '#e74c3c', label: 'SHRINK' },
            destroyer: { color: '#ff9500', label: 'DESTROY' },
            sticky: { color: '#00a8ff', label: 'STICKY' }
        };

        activeTimers.forEach((timer, index) => {
            const config = timerConfig[timer.type];
            const y = startY + (index * barSpacing);

            // Background
            this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            this.ctx.beginPath();
            this.ctx.roundRect(startX, y, barWidth, barHeight, 4);
            this.ctx.fill();

            // Filled portion
            const gradient = this.ctx.createLinearGradient(startX, y, startX + barWidth, y);
            gradient.addColorStop(0, config.color);
            gradient.addColorStop(1, config.color + 'aa');
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = config.color;
            this.ctx.beginPath();
            this.ctx.roundRect(startX, y, barWidth * timer.percentage, barHeight, 4);
            this.ctx.fill();

            // Label
            this.ctx.shadowBlur = 0;
            this.ctx.font = 'bold 10px "Segoe UI", sans-serif';
            this.ctx.fillStyle = config.color;
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(config.label, startX - 5, y + barHeight);
        });

        this.ctx.restore();
    }

    drawRescueMessage(characterName = 'Felipe') {
        this.ctx.save();

        // Flashing message
        const alpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;

        this.ctx.font = 'bold 28px "Segoe UI", sans-serif';
        this.ctx.fillStyle = `rgba(255, 107, 157, ${alpha})`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.fillText(`¡SALVA A ${characterName.toUpperCase()}!`, this.width / 2, this.height / 2);

        this.ctx.restore();
    }
}
