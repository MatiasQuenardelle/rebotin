import { Brick, BRICK_COLORS } from './brick.js';
import { PrisonBrick } from './prisonBrick.js';

const LEVEL_PATTERNS = [
    // Level 1 - Easy intro with nephew at bottom
    [
        'RRRR  RRRR',
        'OOOO  OOOO',
        'YYYY  YYYY',
        'GGGG  GGGG',
        'CCCCPCCCCC'
    ],
    // Level 2 - Pyramid with nephew at top
    [
        '    PR    ',
        '   RRRR   ',
        '  OOOOOO  ',
        ' YYYYYYYY ',
        'GGGGGGGGGG',
        'CCCCCCCCCC'
    ],
    // Level 3 - Checkerboard pattern
    [
        'R R R R R ',
        ' O O O O O',
        'Y Y P Y Y ',
        ' G G G G G',
        'C C C C C ',
        ' R R R R R'
    ],
    // Level 4 - Diamond with steel borders
    [
        'X   RR   X',
        'X  OOOO  X',
        'X YYPYYY X',
        'X  GGGG  X',
        'X   CC   X',
        'X        X'
    ],
    // Level 5 - Fortress walls
    [
        'XRRRXXRRRX',
        'XOOOXXOOOX',
        'X  P    X ',
        'XYYYYYYYYX',
        'XGGGGGGGGX',
        'XCCCCCCCCX'
    ],
    // Level 6 - Zigzag with trapped nephew
    [
        'RRRRRX    ',
        '    XOOOOO',
        'YYYYYX    ',
        '    XGGGPG',
        'CCCCCX    ',
        '    XRRRRR'
    ],
    // Level 7 - Maze pattern
    [
        'XRXRXRXRXR',
        'O O O O O ',
        'XYXYXYXYXY',
        ' G G G G G',
        'XCXCXPXCXC',
        'R R R R R '
    ],
    // Level 8 - Castle with protected nephew
    [
        '  XRRRRX  ',
        ' XOOOOOOX ',
        'XYYYYYYYY X',
        'XGGG  GGGX',
        'X  XPPX  X',
        'XCCCCCCCCX',
        'XXXXXXXXXX'
    ],
    // Level 9 - Ultimate challenge
    [
        'XRXRXRXRXR',
        'OXOXOXOXOX',
        'XYXYXYXYXY',
        'GXGXPXGXGX',
        'XCXCXCXCXC',
        'RXRXRXRXRX',
        'XOXOXOXOXO'
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
    const brickHeight = 25;
    const cols = 10;
    const totalGapWidth = brickGap * (cols - 1);
    const brickWidth = (canvasWidth - padding * 2 - totalGapWidth) / cols;

    const startY = 60;

    for (let row = 0; row < pattern.length; row++) {
        const rowPattern = pattern[row];
        for (let col = 0; col < Math.min(rowPattern.length, cols); col++) {
            const char = rowPattern[col];
            const x = padding + col * (brickWidth + brickGap);
            const y = startY + row * (brickHeight + brickGap);

            if (char === 'P') {
                // Create prison brick with nephew (only one per level)
                if (!prisonBrick) {
                    prisonBrick = new PrisonBrick(x, y, brickWidth, brickHeight);
                    bricks.push(prisonBrick);
                }
            } else if (char === 'X') {
                // Indestructible steel brick
                bricks.push(new Brick(x, y, brickWidth, brickHeight, '#5a5a6a', 0, true));
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
