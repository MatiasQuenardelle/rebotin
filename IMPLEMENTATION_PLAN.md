# Breakout Game - Implementation Plan

## Status: COMPLETE

All game files have been implemented and are ready to play.

---

## Overview
A classic Breakout/Arkanoid arcade game built with HTML5 Canvas, featuring a retro-modern visual style with glowing effects, particle trails, and vibrant colors.

## Visual Reference Analysis
Based on the reference image, the game features:
- **Background**: Dark navy blue (#0a0a1a area, #1a1a2e outer)
- **Game Area**: Rounded rectangle with subtle border/glow
- **HUD**: Score (left), Level (center), Lives (right) - white text
- **Bricks**: 5 color rows from top to bottom:
  - Red (#e74c3c) - 2 rows
  - Orange (#f39c12)
  - Yellow (#f1c40f)
  - Green (#2ecc71)
  - Cyan (#00d4ff)
- **Paddle**: Glowing cyan (#00d4ff) with glow effect
- **Ball**: White with comet/trail effect
- **Controls**: Mouse/Arrow Keys for movement, Space/Click to launch

## Architecture

### File Structure
```
breakout-game/
├── index.html          # Main HTML file with canvas
├── css/
│   └── styles.css      # Styling for page layout and canvas container
├── js/
│   ├── main.js         # Entry point, game initialization
│   ├── game.js         # Main game loop and state management
│   ├── paddle.js       # Paddle class
│   ├── ball.js         # Ball class with trail effect
│   ├── brick.js        # Brick class
│   ├── levels.js       # Level configurations
│   ├── collision.js    # Collision detection utilities
│   ├── renderer.js     # Canvas rendering functions
│   └── input.js        # Input handling (keyboard/mouse)
├── IMPLEMENTATION_PLAN.md
└── README.md
```

### Module Responsibilities

#### main.js
- Initialize canvas and context
- Create Game instance
- Start game loop

#### game.js (Game Class)
- **State Management**: menu, playing, paused, gameOver, levelComplete
- **Properties**: score, level, lives, paddle, ball, bricks[]
- **Methods**:
  - `init()` - Initialize/reset game state
  - `update(deltaTime)` - Update all game objects
  - `render()` - Draw all game objects
  - `startLevel(levelNum)` - Load level configuration
  - `loseLife()` - Handle ball lost
  - `checkWin()` - Check if all bricks destroyed

#### paddle.js (Paddle Class)
- **Properties**: x, y, width, height, speed, color, glowColor
- **Methods**:
  - `update(input)` - Move based on input
  - `render(ctx)` - Draw paddle with glow effect
  - `clampToCanvas()` - Keep paddle in bounds

#### ball.js (Ball Class)
- **Properties**: x, y, radius, dx, dy, speed, trailPositions[]
- **Methods**:
  - `update()` - Move ball, update trail
  - `render(ctx)` - Draw ball with comet trail
  - `launch(angle)` - Initial launch from paddle
  - `bounceX/Y()` - Reverse direction
  - `reset()` - Return to paddle

#### brick.js (Brick Class)
- **Properties**: x, y, width, height, color, alive, points
- **Methods**:
  - `render(ctx)` - Draw brick with rounded corners
  - `hit()` - Mark as destroyed

#### levels.js
- Level configurations as 2D arrays
- Color mapping by row
- Progressive difficulty (more bricks, patterns)

#### collision.js
- `ballPaddle(ball, paddle)` - Returns collision info
- `ballBrick(ball, brick)` - Returns collision info
- `ballWalls(ball, canvas)` - Returns which wall hit

#### renderer.js
- `drawBackground(ctx)` - Dark gradient background
- `drawGameArea(ctx)` - Rounded rectangle border
- `drawHUD(ctx, score, level, lives)` - Top HUD display
- `drawControls(ctx)` - Bottom control hints
- `drawGlow(ctx, obj, color)` - Glow effect helper

#### input.js (Input Class)
- Track keyboard state (left/right arrows)
- Track mouse position
- Track mouse click / space for launch
- Provide unified input interface

## Game Mechanics

### Ball Physics
- **Speed**: Starts at 5 pixels/frame, increases slightly each level
- **Angle**: Launch at random angle between 45-135 degrees upward
- **Bounce**: Reflects off walls, paddle, and bricks
- **Paddle Angle**: Hit position on paddle affects bounce angle
  - Center = straight up
  - Edges = angled outward

### Scoring
- Red bricks: 10 points
- Orange bricks: 15 points
- Yellow bricks: 20 points
- Green bricks: 25 points
- Cyan bricks: 30 points

### Lives System
- Start with 3 lives
- Lose a life when ball falls below paddle
- Game over when lives = 0

### Level Progression
- Level 1: Standard 5-row brick layout
- Higher levels: Different patterns, more bricks
- Ball speed increases each level

## Visual Effects

### Ball Trail Effect
- Store last 10-15 ball positions
- Draw circles with decreasing opacity and size
- Creates comet/motion blur effect

### Paddle Glow
- Use `shadowBlur` and `shadowColor` for CSS glow
- Cyan glow (#00d4ff) with blur radius 15-20px

### Brick Styling
- Rounded corners (radius 3-4px)
- Slight 3D effect with lighter top edge
- Small gap between bricks (2px)

## Step-by-Step Build Plan

### Phase 1: Project Setup
1. Create folder structure
2. Create index.html with canvas element
3. Create styles.css with dark theme
4. Create main.js entry point

### Phase 2: Core Game Structure
5. Implement Input class (input.js)
6. Implement Paddle class (paddle.js)
7. Implement Ball class with basic movement (ball.js)
8. Implement basic game loop in Game class (game.js)

### Phase 3: Collision & Bricks
9. Implement Brick class (brick.js)
10. Implement collision detection (collision.js)
11. Add ball-paddle collision with angle calculation
12. Add ball-brick collision and destruction

### Phase 4: Game Logic
13. Implement levels configuration (levels.js)
14. Add score tracking
15. Add lives system
16. Add level progression
17. Add game states (playing, paused, game over)

### Phase 5: Visual Polish
18. Implement renderer utilities (renderer.js)
19. Add ball trail effect
20. Add paddle glow effect
21. Add HUD rendering
22. Add start/game over screens

### Phase 6: Final Touches
23. Add keyboard controls
24. Add mouse controls
25. Fine-tune physics and difficulty
26. Test and debug
27. Write README.md

## Canvas Dimensions
- Canvas: 800 x 600 pixels
- Game area padding: 20px
- Playable area: 760 x 560 pixels

## Color Palette
```javascript
const COLORS = {
  background: '#0a0a1a',
  backgroundOuter: '#1a1a2e',
  gameArea: '#0d1117',
  text: '#ffffff',
  paddle: '#00d4ff',
  ball: '#ffffff',
  brickRed: '#e74c3c',
  brickOrange: '#f39c12',
  brickYellow: '#f1c40f',
  brickGreen: '#2ecc71',
  brickCyan: '#00d4ff'
};
```

## Technical Considerations

### Performance
- Use requestAnimationFrame for smooth 60fps
- Only redraw changed areas if needed
- Limit trail array size to prevent memory issues

### Responsiveness
- Canvas sized to fit container
- Scale drawing for different screen sizes (future enhancement)

### Browser Compatibility
- Use standard Canvas 2D API
- ES6 modules with type="module"
- Works in all modern browsers
