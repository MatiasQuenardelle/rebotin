import { Brick, BRICK_COLORS } from './brick.js';

const LEVEL_PATTERNS = [
    // Level 1 - Classic layout
    [
        'RRRRRRRRRR',
        'RRRRRRRRRR',
        'OOOOOOOOOO',
        'YYYYYYYYYY',
        'GGGGGGGGGG',
        'CCCCCCCCCC'
    ],
    // Level 2 - Pyramid
    [
        '    RR    ',
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
        'O O O O O ',
        ' Y Y Y Y Y',
        'G G G G G ',
        ' C C C C C'
    ],
    // Level 4 - Diamond
    [
        '    RR    ',
        '   OOOO   ',
        '  YYYYYY  ',
        '   GGGG   ',
        '    CC    ',
        '          '
    ],
    // Level 5 - Full grid
    [
        'RRRRRRRRRR',
        'OOOOOOOOOO',
        'YYYYYYYYYY',
        'GGGGGGGGGG',
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

    const padding = 30;
    const brickGap = 4;
    const brickHeight = 20;
    const cols = 10;
    const totalGapWidth = brickGap * (cols - 1);
    const brickWidth = (canvasWidth - padding * 2 - totalGapWidth) / cols;

    const startY = 60;

    for (let row = 0; row < pattern.length; row++) {
        const rowPattern = pattern[row];
        for (let col = 0; col < rowPattern.length; col++) {
            const char = rowPattern[col];
            if (char !== ' ' && COLOR_MAP[char]) {
                const x = padding + col * (brickWidth + brickGap);
                const y = startY + row * (brickHeight + brickGap);
                const brickInfo = COLOR_MAP[char];
                bricks.push(new Brick(x, y, brickWidth, brickHeight, brickInfo.color, brickInfo.points));
            }
        }
    }

    return bricks;
}

export function getTotalLevels() {
    return LEVEL_PATTERNS.length;
}
