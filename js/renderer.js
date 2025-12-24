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

        // Animated gradient background overlay
        const time = Date.now() / 1000;
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 20, 40, 0.85)');
        gradient.addColorStop(0.5, 'rgba(0, 10, 30, 0.90)');
        gradient.addColorStop(1, 'rgba(0, 0, 20, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Decorative animated stars/particles in background
        for (let i = 0; i < 20; i++) {
            const x = (this.width / 20 * i + time * 10 * (i % 3 + 1)) % this.width;
            const y = (this.height / 15 * (i % 15) + time * 5 * (i % 2 + 1)) % this.height;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time + i) * 0.1})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Main title box with border
        const boxWidth = 500;
        const boxHeight = 320;
        const boxX = (this.width - boxWidth) / 2;
        const boxY = (this.height - boxHeight) / 2 - 20;

        // Glowing border
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.beginPath();
        this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 15);
        this.ctx.stroke();

        // Inner glow
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.roundRect(boxX + 5, boxY + 5, boxWidth - 10, boxHeight - 10, 12);
        this.ctx.stroke();

        // Main title with pulsing effect
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        this.ctx.font = `bold ${64 * pulse}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fillText('REBOTÍN', this.width / 2, boxY + 70);

        // Decorative line
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ff6b9d';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2 - 150, boxY + 115);
        this.ctx.lineTo(this.width / 2 + 150, boxY + 115);
        this.ctx.stroke();

        // Subtitle - rescue mission
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.font = 'bold 22px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText('~ Misión de Rescate ~', this.width / 2, boxY + 145);

        // Mission text with icon-style emphasis
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#ffaa00';
        this.ctx.font = 'bold 17px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffdd66';
        this.ctx.fillText('¡Libera a tu hermano o hermana', this.width / 2, boxY + 190);
        this.ctx.fillText('de la prisión y rescátalos!', this.width / 2, boxY + 215);

        // Animated instruction text
        const instructionAlpha = 0.7 + Math.sin(time * 3) * 0.3;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${instructionAlpha})`;
        this.ctx.fillText('▶ Presiona ESPACIO o toca para comenzar ◀', this.width / 2, boxY + 270);

        this.ctx.restore();
    }

    drawCharacterSelect() {
        this.ctx.save();

        // Animated gradient background
        const time = Date.now() / 1000;
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 20, 40, 0.90)');
        gradient.addColorStop(0.5, 'rgba(0, 10, 30, 0.92)');
        gradient.addColorStop(1, 'rgba(0, 0, 20, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Title with glow
        this.ctx.font = 'bold 40px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fillText('¿A quién deseas rescatar?', this.width / 2, this.height / 2 - 100);

        // Subtitle
        this.ctx.shadowBlur = 10;
        this.ctx.font = '18px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffdd66';
        this.ctx.fillText('Elige a tu hermano o hermana', this.width / 2, this.height / 2 - 55);

        // Button dimensions
        const btnWidth = 180;
        const btnHeight = 70;
        const felipeX = this.width / 2 - btnWidth - 30;
        const julietaX = this.width / 2 + 30;
        const btnY = this.height / 2 + 10;

        // Felipe button with hover effect simulation
        const felipePulse = 1 + Math.sin(time * 3) * 0.05;

        // Felipe button border
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#4a90d9';
        this.ctx.strokeStyle = '#6ab0f9';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(felipeX - 2, btnY - 2, btnWidth + 4, btnHeight + 4, 12);
        this.ctx.stroke();

        // Felipe button fill
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#4a90d9';
        this.ctx.beginPath();
        this.ctx.roundRect(felipeX, btnY, btnWidth, btnHeight, 10);
        this.ctx.fill();

        // Felipe icon (♂)
        this.ctx.shadowBlur = 5;
        this.ctx.font = 'bold 32px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('♂', felipeX + btnWidth / 2, btnY + 25);

        // Felipe text
        this.ctx.shadowBlur = 3;
        this.ctx.font = `bold ${26 * felipePulse}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Felipe', felipeX + btnWidth / 2, btnY + 52);

        // Julieta button with hover effect simulation
        const julietaPulse = 1 + Math.sin(time * 3 + Math.PI) * 0.05;

        // Julieta button border
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff6b9d';
        this.ctx.strokeStyle = '#ff8bb5';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(julietaX - 2, btnY - 2, btnWidth + 4, btnHeight + 4, 12);
        this.ctx.stroke();

        // Julieta button fill
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.beginPath();
        this.ctx.roundRect(julietaX, btnY, btnWidth, btnHeight, 10);
        this.ctx.fill();

        // Julieta icon (♀)
        this.ctx.shadowBlur = 5;
        this.ctx.font = 'bold 32px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('♀', julietaX + btnWidth / 2, btnY + 25);

        // Julieta text
        this.ctx.shadowBlur = 3;
        this.ctx.font = `bold ${26 * julietaPulse}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Julieta', julietaX + btnWidth / 2, btnY + 52);

        // Instruction text
        const instructionAlpha = 0.6 + Math.sin(time * 2.5) * 0.3;
        this.ctx.shadowBlur = 5;
        this.ctx.font = '16px "Segoe UI", sans-serif';
        this.ctx.fillStyle = `rgba(255, 255, 255, ${instructionAlpha})`;
        this.ctx.fillText('Haz clic en tu elección', this.width / 2, this.height / 2 + 120);

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
        const backdropHeight = 60;
        const backdropX = (this.width - backdropWidth) / 2;
        const backdropY = 60;
        this.ctx.beginPath();
        this.ctx.roundRect(backdropX, backdropY, backdropWidth, backdropHeight, 15);
        this.ctx.fill();

        // Level complete message (centered)
        const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#2ecc71';
        this.ctx.font = `bold ${28 * pulse}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`¡NIVEL ${level} COMPLETADO!`, this.width / 2, 90);

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
