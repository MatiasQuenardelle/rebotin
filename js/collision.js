export function ballWallCollision(ball, canvasWidth, canvasHeight) {
    const padding = 20;

    // Left wall
    if (ball.x - ball.radius < padding) {
        ball.x = padding + ball.radius;
        ball.bounceX();
        return 'left';
    }

    // Right wall
    if (ball.x + ball.radius > canvasWidth - padding) {
        ball.x = canvasWidth - padding - ball.radius;
        ball.bounceX();
        return 'right';
    }

    // Top wall
    if (ball.y - ball.radius < padding + 30) { // Account for HUD
        ball.y = padding + 30 + ball.radius;
        ball.bounceY();
        return 'top';
    }

    return null;
}

export function ballPaddleCollision(ball, paddle) {
    if (!ball.launched) return false;

    // Check if ball is at paddle height
    if (ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.dy > 0) { // Ball moving down

        // Check if ball is within paddle width
        if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
            ball.y = paddle.y - ball.radius;
            ball.bounceOffPaddle(paddle);
            return true;
        }
    }

    return false;
}

export function ballBrickCollision(ball, bricks) {
    for (const brick of bricks) {
        if (!brick.alive) continue;

        // Simple AABB collision
        const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        if (distanceSquared < ball.radius * ball.radius) {
            // Determine which side was hit
            const overlapLeft = ball.x + ball.radius - brick.x;
            const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
            const overlapTop = ball.y + ball.radius - brick.y;
            const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                ball.bounceX();
            } else {
                ball.bounceY();
            }

            return brick;
        }
    }

    return null;
}

export function laserBrickCollision(laser, bricks) {
    const laserBounds = laser.getBounds();

    for (const brick of bricks) {
        if (!brick.alive) continue;

        // Simple AABB collision
        if (laserBounds.x < brick.x + brick.width &&
            laserBounds.x + laserBounds.width > brick.x &&
            laserBounds.y < brick.y + brick.height &&
            laserBounds.y + laserBounds.height > brick.y) {
            return brick;
        }
    }

    return null;
}
