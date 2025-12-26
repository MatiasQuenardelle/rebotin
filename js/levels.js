import { Brick, BRICK_COLORS } from './brick.js';
import { PrisonBrick } from './prisonBrick.js';
import { MonsterBrick } from './monsterBrick.js';

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
    // Level 8 - Castle with protected nephew (fixed: fewer unbreakable blocks)
    [
        '  XRRRRX  ',
        ' XOOOOOOX ',
        ' YYYYYYYYY',
        ' GGG  GGG ',
        '   XPPX   ',
        ' CCCCCCC  ',
        'X        X'
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

export function createLevel(levelNumber, canvasWidth, characterName = 'Felipe', speedMultiplier = 1) {
    const pattern = LEVEL_PATTERNS[(levelNumber - 1) % LEVEL_PATTERNS.length];
    const bricks = [];
    let prisonBrick = null;
    const monsterBricks = [];

    const padding = 30;
    const brickGap = 4;
    const brickHeight = 25;
    const cols = 10;
    const totalGapWidth = brickGap * (cols - 1);
    const brickWidth = (canvasWidth - padding * 2 - totalGapWidth) / cols;

    const startY = 60;

    // First pass: collect all potential breakable brick positions
    const breakableBrickPositions = [];

    for (let row = 0; row < pattern.length; row++) {
        const rowPattern = pattern[row];
        for (let col = 0; col < Math.min(rowPattern.length, cols); col++) {
            const char = rowPattern[col];
            const x = padding + col * (brickWidth + brickGap);
            const y = startY + row * (brickHeight + brickGap);

            if (char === 'P') {
                // Mark this position as a potential prison brick location
                breakableBrickPositions.push({ x, y, row, col });
            } else if (char !== ' ' && char !== 'X' && COLOR_MAP[char]) {
                // This is a breakable brick position
                breakableBrickPositions.push({ x, y, row, col, color: char });
            }
        }
    }

    // Randomly select one breakable position for the prison brick
    let prisonPosition = null;
    const monsterPositions = [];

    if (breakableBrickPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * breakableBrickPositions.length);
        prisonPosition = breakableBrickPositions[randomIndex];

        // Select 1-3 random positions for monster bricks (avoiding prison brick position)
        const numMonsters = Math.min(
            1 + Math.floor(Math.random() * 3), // 1-3 monsters
            breakableBrickPositions.length - 1 // Leave room for prison brick
        );

        const availablePositions = breakableBrickPositions.filter(
            pos => pos !== prisonPosition
        );

        for (let i = 0; i < numMonsters && availablePositions.length > 0; i++) {
            const randIdx = Math.floor(Math.random() * availablePositions.length);
            monsterPositions.push(availablePositions[randIdx]);
            availablePositions.splice(randIdx, 1);
        }
    }

    // Second pass: create the actual bricks
    for (let row = 0; row < pattern.length; row++) {
        const rowPattern = pattern[row];
        for (let col = 0; col < Math.min(rowPattern.length, cols); col++) {
            const char = rowPattern[col];
            const x = padding + col * (brickWidth + brickGap);
            const y = startY + row * (brickHeight + brickGap);

            // Check if this position was selected for the prison brick
            const isPrisonPosition = prisonPosition && prisonPosition.row === row && prisonPosition.col === col;
            const isMonsterPosition = monsterPositions.some(pos => pos.row === row && pos.col === col);

            if (isPrisonPosition && !prisonBrick) {
                // Create prison brick at this random position
                prisonBrick = new PrisonBrick(x, y, brickWidth, brickHeight, characterName, speedMultiplier, canvasWidth);
                bricks.push(prisonBrick);
            } else if (isMonsterPosition) {
                // Create monster brick at this position
                const monsterBrick = new MonsterBrick(x, y, brickWidth, brickHeight, speedMultiplier, canvasWidth);
                monsterBricks.push(monsterBrick);
                bricks.push(monsterBrick);
            } else if (char === 'X') {
                // Indestructible steel brick
                bricks.push(new Brick(x, y, brickWidth, brickHeight, '#5a5a6a', 0, true));
            } else if (char !== ' ' && char !== 'P' && COLOR_MAP[char]) {
                // Regular breakable brick (skip 'P' markers since we placed prison randomly)
                const brickInfo = COLOR_MAP[char];
                bricks.push(new Brick(x, y, brickWidth, brickHeight, brickInfo.color, brickInfo.points));
            }
        }
    }

    return { bricks, prisonBrick, monsterBricks };
}

export function getTotalLevels() {
    return LEVEL_PATTERNS.length;
}
