export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {
            left: false,
            right: false,
            space: false
        };
        this.mouse = {
            x: canvas.width / 2,
            y: 0,
            clicked: false
        };
        this.useMouseControl = true;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseenter', () => this.useMouseControl = true);
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.keys.left = true;
            this.useMouseControl = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.keys.right = true;
            this.useMouseControl = false;
        }
        if (e.key === ' ') {
            this.keys.space = true;
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.keys.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.keys.right = false;
        }
        if (e.key === ' ') {
            this.keys.space = false;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleClick(e) {
        this.mouse.clicked = true;
    }

    isLaunchPressed() {
        const launched = this.keys.space || this.mouse.clicked;
        this.mouse.clicked = false;
        return launched;
    }

    getMovement() {
        if (this.useMouseControl) {
            return { type: 'mouse', x: this.mouse.x };
        }
        return {
            type: 'keyboard',
            left: this.keys.left,
            right: this.keys.right
        };
    }
}
