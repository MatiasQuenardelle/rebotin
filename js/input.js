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
            gamma: 0,  // left-right tilt in portrait
            beta: 0,   // front-back tilt (used in landscape)
            tilt: 0,   // actual tilt value to use for movement
            sensitivity: 2.5,  // multiplier for tilt sensitivity (portrait)
            landscapeSensitivity: 4.5,  // higher sensitivity for landscape (less phone tilt needed)
            deadzone: 3  // degrees of tilt to ignore (prevents drift)
        };
        this.useMouseControl = true;
        this.useGyroControl = false;
        this.screenOrientation = 0;  // Track screen orientation

        this.setupEventListeners();
        this.checkGyroAvailability();
        this.setupOrientationListener();
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
        // Track if we've received valid gyro data
        this.gyro.hasValidData = false;
        this.gyro.verificationAttempts = 0;
    }

    setupOrientationListener() {
        // Get initial orientation
        this.updateScreenOrientation();

        // Listen for orientation changes
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                this.updateScreenOrientation();
            });
        }
        // Fallback for older browsers
        window.addEventListener('orientationchange', () => {
            this.updateScreenOrientation();
        });
        // Additional fallback using resize (helps on iPad)
        window.addEventListener('resize', () => {
            this.updateScreenOrientation();
        });
    }

    updateScreenOrientation() {
        if (window.screen && window.screen.orientation) {
            // Modern API - use type if angle isn't reliable
            const angle = window.screen.orientation.angle;
            const type = window.screen.orientation.type;

            // On iPad, use type string as it's more reliable
            if (type.includes('landscape')) {
                // Determine which landscape based on type or angle
                if (type === 'landscape-primary' || angle === 90) {
                    this.screenOrientation = 90;
                } else {
                    this.screenOrientation = -90;
                }
            } else {
                // Portrait
                this.screenOrientation = 0;
            }
        } else if (window.orientation !== undefined) {
            // Legacy fallback
            this.screenOrientation = window.orientation;
        } else {
            // Ultimate fallback: detect from window dimensions
            if (window.innerWidth > window.innerHeight) {
                this.screenOrientation = 90;  // Assume landscape
            } else {
                this.screenOrientation = 0;   // Portrait
            }
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
        this.gyro.hasValidData = false;

        // Only add the listener once
        if (!this.gyroListenerAdded) {
            window.addEventListener('deviceorientation', (e) => this.handleDeviceOrientation(e));
            this.gyroListenerAdded = true;
        }
    }

    // Verify that gyro is actually receiving sensor data
    // Returns a promise that resolves to true if working, false if not
    verifyGyroWorking(timeoutMs = 1500) {
        return new Promise((resolve) => {
            // If we already have valid data, return immediately
            if (this.gyro.hasValidData) {
                resolve(true);
                return;
            }

            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (this.gyro.hasValidData) {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (Date.now() - startTime >= timeoutMs) {
                    clearInterval(checkInterval);
                    console.warn('Gyroscope enabled but no valid sensor data received');
                    resolve(false);
                }
            }, 100);
        });
    }

    disableGyro() {
        this.gyro.enabled = false;
        this.useGyroControl = false;
        this.useMouseControl = true;
    }

    toggleGyro() {
        if (this.gyro.enabled) {
            this.disableGyro();
            return false;
        } else {
            this.enableGyro();
            return true;
        }
    }

    handleDeviceOrientation(e) {
        if (!this.gyro.enabled) return;

        // Check if we have actual sensor data (not null/undefined)
        // iPad Pro and some devices may report DeviceOrientationEvent but with null values
        const hasGamma = e.gamma !== null && e.gamma !== undefined;
        const hasBeta = e.beta !== null && e.beta !== undefined;

        // Track if we've ever received valid data
        if (hasGamma || hasBeta) {
            this.gyro.hasValidData = true;
        }

        // Store raw values - use 0 as fallback only if sensor data is unavailable
        const gamma = hasGamma ? e.gamma : 0;  // left-right tilt (-90 to 90)
        const beta = hasBeta ? e.beta : 0;    // front-back tilt (-180 to 180)

        this.gyro.gamma = gamma;
        this.gyro.beta = beta;

        // Determine which axis to use based on screen orientation
        // In portrait: gamma controls left-right
        // In landscape: beta controls left-right (adjusted for orientation)
        let tilt = 0;

        if (this.screenOrientation === 90) {
            // Landscape with home button on right
            tilt = beta;
        } else if (this.screenOrientation === -90 || this.screenOrientation === 270) {
            // Landscape with home button on left
            tilt = -beta;
        } else {
            // Portrait mode (0 or 180) - was working fine
            tilt = gamma;
        }

        // Apply deadzone to prevent drift
        if (Math.abs(tilt) < this.gyro.deadzone) {
            tilt = 0;
        }

        this.gyro.tilt = tilt;
    }

    isGyroAvailable() {
        return this.gyro.available;
    }

    isGyroEnabled() {
        return this.gyro.enabled;
    }

    // Check if gyro has received valid data since being enabled
    hasGyroValidData() {
        return this.gyro.hasValidData;
    }

    // Debug method to log current gyro state (useful for troubleshooting iPad issues)
    debugGyroState() {
        console.log('Gyro Debug:', {
            available: this.gyro.available,
            enabled: this.gyro.enabled,
            hasValidData: this.gyro.hasValidData,
            gamma: this.gyro.gamma,
            beta: this.gyro.beta,
            tilt: this.gyro.tilt,
            screenOrientation: this.screenOrientation,
            useGyroControl: this.useGyroControl
        });
    }

    isLaunchPressed() {
        const launched = this.keys.space || this.mouse.clicked;
        this.mouse.clicked = false;
        return launched;
    }

    getMovement() {
        if (this.useGyroControl && this.gyro.enabled) {
            // Use higher sensitivity in landscape mode
            const isLandscape = this.screenOrientation === 90 ||
                               this.screenOrientation === -90 ||
                               this.screenOrientation === 270;
            const sensitivity = isLandscape ? this.gyro.landscapeSensitivity : this.gyro.sensitivity;
            return {
                type: 'gyro',
                tilt: this.gyro.tilt,  // Use calculated tilt (works in both portrait and landscape)
                sensitivity: sensitivity
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
