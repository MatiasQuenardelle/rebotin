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
        this.gyro = {
            enabled: false,
            available: false,
            gamma: 0,  // left-right tilt (-90 to 90 degrees)
            sensitivity: 3,  // multiplier for tilt sensitivity
            deadzone: 2  // degrees of tilt to ignore (prevents drift)
        };
        this.useMouseControl = true;
        this.useGyroControl = false;

        this.setupEventListeners();
        this.checkGyroAvailability();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mouseenter', () => this.useMouseControl = true);

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
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

    handleTouchStart(e) {
        e.preventDefault();
        this.mouse.clicked = true;  // Tap to launch ball

        // Also update touch position for non-gyro fallback
        if (!this.useGyroControl && e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            this.mouse.x = (e.touches[0].clientX - rect.left) * scaleX;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        // Only use touch position if gyro is not enabled
        if (!this.useGyroControl && e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            this.mouse.x = (e.touches[0].clientX - rect.left) * scaleX;
            this.useMouseControl = true;
        }
    }

    checkGyroAvailability() {
        // Check if DeviceOrientationEvent is available
        if (window.DeviceOrientationEvent) {
            this.gyro.available = true;
        }
    }

    async requestGyroPermission() {
        if (!this.gyro.available) {
            return false;
        }

        // iOS 13+ requires explicit permission request
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    this.enableGyro();
                    return true;
                }
            } catch (error) {
                console.error('Gyro permission error:', error);
                return false;
            }
        } else {
            // Android and older iOS - just enable it
            this.enableGyro();
            return true;
        }
        return false;
    }

    enableGyro() {
        this.gyro.enabled = true;
        this.useGyroControl = true;
        this.useMouseControl = false;

        window.addEventListener('deviceorientation', (e) => this.handleDeviceOrientation(e));
    }

    handleDeviceOrientation(e) {
        if (!this.gyro.enabled) return;

        // gamma is the left-to-right tilt in degrees (-90 to 90)
        // When holding phone horizontally (landscape), gamma controls left/right
        let gamma = e.gamma || 0;

        // Apply deadzone to prevent drift
        if (Math.abs(gamma) < this.gyro.deadzone) {
            gamma = 0;
        }

        this.gyro.gamma = gamma;
    }

    isGyroAvailable() {
        return this.gyro.available;
    }

    isGyroEnabled() {
        return this.gyro.enabled;
    }

    isLaunchPressed() {
        const launched = this.keys.space || this.mouse.clicked;
        this.mouse.clicked = false;
        return launched;
    }

    getMovement() {
        if (this.useGyroControl && this.gyro.enabled) {
            return {
                type: 'gyro',
                gamma: this.gyro.gamma,
                sensitivity: this.gyro.sensitivity
            };
        }
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
