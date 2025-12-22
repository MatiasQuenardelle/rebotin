import { Brick, BRICK_COLORS } from './brick.js';
import { PrisonBrick } from './prisonBrick.js';

const LEVEL_PATTERNS = [
    // Level 1 - Classic layout with trapped nephew!
    [
        'RRRR  RRRR',
        'RRRR  RRRR',
        'OOOO  OOOO',
        'YYYY  YYYY',
        'GGGGGGGGG ',
        'CCCCCPCCCC'  // P = Prison with nephew
    ],
    // Level 2 - Pyramid with nephew at top
    [
        '    RP    ',  // Nephew trapped at the peak!
        '   RRRR   ',
        '  OOOOOO  ',
        ' YYYYYYYY ',
        'GGGGGGGGGG',
        'CCCCCCCCCC'
    ],
    // Level 3 - Checkerboard
    [
        'R R R R R ',
        ' R R R R R',
        'O O P O O ',  // Nephew hidden in the middle
        ' Y Y Y Y Y',
        'G G G G G ',
        ' C C C C C'
    ],
    // Level 4 - Diamond with nephew in center
    [
        '    RR    ',
        '   OOOO   ',
        '  YYPYY   ',  // Nephew in diamond center
        '   GGGG   ',
        '    CC    ',
        '          '
    ],
    // Level 5 - Full grid with well-protected nephew
    [
        'RRRRRRRRRR',
        'OOOOOOOOOO',
        'YYYYYYYYYY',
        'GGGGPGGGGG',  // Nephew deep in the grid
        'CCCCCCCCCC',
        'RRRRRRRRRR',
        'OOOOOOOOOO'
    ]
];

const COLOR_MAP = {
    'R': BRICK_COLORS.red,
    'O': BRICK_COLORS.orange,
    'Y': BRICK_COLORS.yellow,
    'G': BRICK_COLORS.green,
    'C': BRICK_COLORS.cyan
};

export function createLevel(levelNumber, canvasWidth) {
    const pattern = LEVEL_PATTERNS[(levelNumber - 1) % LEVEL_PATTERNS.length];
    const bricks = [];
    let prisonBrick = null;

    const padding = 30;
    const brickGap = 4;
    const brickHeight = 25; // Taller to fit nephew
    const cols = 10;
    const totalGapWidth = brickGap * (cols - 1);
    const brickWidth = (canvasWidth - padding * 2 - totalGapWidth) / cols;

    const startY = 60;

    for (let row = 0; row < pattern.length; row++) {
        const rowPattern = pattern[row];
        for (let col = 0; col < rowPattern.length; col++) {
            const char = rowPattern[col];
            const x = padding + col * (brickWidth + brickGap);
            const y = startY + row * (brickHeight + brickGap);

            if (char === 'P') {
                // Create prison brick with nephew (only one per level)
                if (!prisonBrick) {
                    prisonBrick = new PrisonBrick(x, y, brickWidth, brickHeight);
                    bricks.push(prisonBrick);
                }
            } else if (char !== ' ' && COLOR_MAP[char]) {
                const brickInfo = COLOR_MAP[char];
                bricks.push(new Brick(x, y, brickWidth, brickHeight, brickInfo.color, brickInfo.points));
            }
        }
    }

    return { bricks, prisonBrick };
}

export function getTotalLevels() {
    return LEVEL_PATTERNS.length;
}
