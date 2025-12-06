/**
 * Inverted Pendulum Simulation
 * PID Control Demo using HTML5 Canvas
 */

(function() {
    'use strict';

    // ============================================
    // Physical Constants and Parameters
    // ============================================
    const PARAMS = {
        M: 1.0,      // Cart mass [kg]
        m: 0.1,      // Pendulum mass [kg]
        l: 0.5,      // Pendulum length [m]
        g: 9.81,     // Gravity [m/s^2]
        dt: 0.01,    // Time step [s]
        friction: 0.1 // Cart friction coefficient
    };

    // ============================================
    // State Variables
    // ============================================
    let state = {
        x: 0,        // Cart position [m]
        xDot: 0,     // Cart velocity [m/s]
        theta: 0,    // Pendulum angle [rad] (0 = upright)
        thetaDot: 0, // Angular velocity [rad/s]
        integral: 0, // Integral term for PID
        time: 0
    };

    // Control gains
    let gains = {
        Kp: 50,
        Ki: 0,
        Kd: 20
    };

    let initialTheta = 10 * Math.PI / 180; // 10 degrees
    let isRunning = false;
    let animationId = null;

    // ============================================
    // Canvas Setup
    // ============================================
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');

    // Scale: pixels per meter
    const SCALE = 100;
    const CART_WIDTH = 80;
    const CART_HEIGHT = 40;
    const WHEEL_RADIUS = 10;
    const PENDULUM_LENGTH = PARAMS.l * SCALE;
    const BOB_RADIUS = 15;

    // ============================================
    // Physics Engine
    // ============================================
    
    /**
     * Compute derivatives of state variables
     * Using equations of motion for inverted pendulum
     */
    function computeDerivatives(state, u) {
        const { M, m, l, g, friction } = PARAMS;
        const { x, xDot, theta, thetaDot } = state;
        
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        // Denominator for equations
        const denom = M + m - m * cosTheta * cosTheta;
        
        // Cart acceleration
        const xDDot = (u - friction * xDot + m * l * thetaDot * thetaDot * sinTheta 
                       - m * g * sinTheta * cosTheta) / denom;
        
        // Angular acceleration
        const thetaDDot = ((M + m) * g * sinTheta - cosTheta * (u - friction * xDot + m * l * thetaDot * thetaDot * sinTheta)) 
                          / (l * denom);
        
        return {
            xDot: xDot,
            xDDot: xDDot,
            thetaDot: thetaDot,
            thetaDDot: thetaDDot
        };
    }

    /**
     * PID Controller
     */
    function computeControl(state) {
        const { Kp, Ki, Kd } = gains;
        const { theta, thetaDot, integral } = state;
        
        // PID control law
        const u = Kp * theta + Ki * integral + Kd * thetaDot;
        
        // Clamp control input
        return Math.max(-50, Math.min(50, u));
    }

    /**
     * Runge-Kutta 4th order integration step
     */
    function rk4Step(state, u, dt) {
        const k1 = computeDerivatives(state, u);
        
        const state2 = {
            x: state.x + k1.xDot * dt / 2,
            xDot: state.xDot + k1.xDDot * dt / 2,
            theta: state.theta + k1.thetaDot * dt / 2,
            thetaDot: state.thetaDot + k1.thetaDDot * dt / 2
        };
        const k2 = computeDerivatives(state2, u);
        
        const state3 = {
            x: state.x + k2.xDot * dt / 2,
            xDot: state.xDot + k2.xDDot * dt / 2,
            theta: state.theta + k2.thetaDot * dt / 2,
            thetaDot: state.thetaDot + k2.thetaDDot * dt / 2
        };
        const k3 = computeDerivatives(state3, u);
        
        const state4 = {
            x: state.x + k3.xDot * dt,
            xDot: state.xDot + k3.xDDot * dt,
            theta: state.theta + k3.thetaDot * dt,
            thetaDot: state.thetaDot + k3.thetaDDot * dt
        };
        const k4 = computeDerivatives(state4, u);
        
        return {
            x: state.x + (k1.xDot + 2*k2.xDot + 2*k3.xDot + k4.xDot) * dt / 6,
            xDot: state.xDot + (k1.xDDot + 2*k2.xDDot + 2*k3.xDDot + k4.xDDot) * dt / 6,
            theta: state.theta + (k1.thetaDot + 2*k2.thetaDot + 2*k3.thetaDot + k4.thetaDot) * dt / 6,
            thetaDot: state.thetaDot + (k1.thetaDDot + 2*k2.thetaDDot + 2*k3.thetaDDot + k4.thetaDDot) * dt / 6,
            integral: state.integral + state.theta * dt,
            time: state.time + dt
        };
    }

    // ============================================
    // Rendering
    // ============================================
    
    function render(state, u) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw ground
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height - 30);
        ctx.lineTo(width, height - 30);
        ctx.stroke();
        
        // Draw track
        ctx.strokeStyle = '#cbd5e0';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height - 30 - WHEEL_RADIUS);
        ctx.lineTo(width, height - 30 - WHEEL_RADIUS);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cart position in pixels (centered)
        const cartX = width / 2 + state.x * SCALE;
        const cartY = height - 30 - WHEEL_RADIUS - CART_HEIGHT / 2;
        
        // Draw cart
        ctx.fillStyle = '#1a365d';
        ctx.fillRect(cartX - CART_WIDTH / 2, cartY - CART_HEIGHT / 2, CART_WIDTH, CART_HEIGHT);
        
        // Draw wheels
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(cartX - CART_WIDTH / 3, cartY + CART_HEIGHT / 2, WHEEL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cartX + CART_WIDTH / 3, cartY + CART_HEIGHT / 2, WHEEL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Pendulum pivot point
        const pivotX = cartX;
        const pivotY = cartY - CART_HEIGHT / 2;
        
        // Pendulum bob position (theta = 0 is upright)
        const bobX = pivotX + PENDULUM_LENGTH * Math.sin(state.theta);
        const bobY = pivotY - PENDULUM_LENGTH * Math.cos(state.theta);
        
        // Draw pendulum rod
        ctx.strokeStyle = '#2c5282';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        
        // Draw pivot
        ctx.fillStyle = '#718096';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bob
        ctx.fillStyle = '#c53030';
        ctx.beginPath();
        ctx.arc(bobX, bobY, BOB_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw control force indicator
        const forceScale = 2;
        const forceLength = u * forceScale;
        if (Math.abs(forceLength) > 1) {
            ctx.strokeStyle = '#48bb78';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cartX, cartY);
            ctx.lineTo(cartX + forceLength, cartY);
            ctx.stroke();
            
            // Arrow head
            const arrowDir = forceLength > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(cartX + forceLength, cartY);
            ctx.lineTo(cartX + forceLength - 8 * arrowDir, cartY - 5);
            ctx.lineTo(cartX + forceLength - 8 * arrowDir, cartY + 5);
            ctx.closePath();
            ctx.fillStyle = '#48bb78';
            ctx.fill();
        }
        
        // Draw reference line (upright position)
        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX, pivotY - PENDULUM_LENGTH - 10);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ============================================
    // UI Update
    // ============================================
    
    function updateStateDisplay(state, u) {
        document.getElementById('state-theta').textContent = (state.theta * 180 / Math.PI).toFixed(2);
        document.getElementById('state-omega').textContent = state.thetaDot.toFixed(2);
        document.getElementById('state-x').textContent = state.x.toFixed(2);
        document.getElementById('state-u').textContent = u.toFixed(2);
    }

    // ============================================
    // Animation Loop
    // ============================================
    
    let lastTime = 0;
    let controlInput = 0;
    
    function simulate(timestamp) {
        if (!isRunning) return;
        
        // Fixed timestep simulation
        const stepsPerFrame = 2;
        for (let i = 0; i < stepsPerFrame; i++) {
            controlInput = computeControl(state);
            state = rk4Step(state, controlInput, PARAMS.dt);
        }
        
        // Bound cart position
        if (Math.abs(state.x) > 2.5) {
            state.x = Math.sign(state.x) * 2.5;
            state.xDot = 0;
        }
        
        // Check for fallen pendulum
        if (Math.abs(state.theta) > Math.PI / 2) {
            // Pendulum has fallen - stop simulation
            isRunning = false;
            document.getElementById('start-btn').textContent = 'Start';
        }
        
        render(state, controlInput);
        updateStateDisplay(state, controlInput);
        
        if (isRunning) {
            animationId = requestAnimationFrame(simulate);
        }
    }

    // ============================================
    // Event Handlers
    // ============================================
    
    function resetState() {
        state = {
            x: 0,
            xDot: 0,
            theta: initialTheta,
            thetaDot: 0,
            integral: 0,
            time: 0
        };
        controlInput = 0;
        render(state, 0);
        updateStateDisplay(state, 0);
    }

    // Slider handlers
    document.getElementById('kp-slider').addEventListener('input', function(e) {
        gains.Kp = parseFloat(e.target.value);
        document.getElementById('kp-value').textContent = gains.Kp;
    });

    document.getElementById('ki-slider').addEventListener('input', function(e) {
        gains.Ki = parseFloat(e.target.value);
        document.getElementById('ki-value').textContent = gains.Ki;
    });

    document.getElementById('kd-slider').addEventListener('input', function(e) {
        gains.Kd = parseFloat(e.target.value);
        document.getElementById('kd-value').textContent = gains.Kd;
    });

    document.getElementById('theta0-slider').addEventListener('input', function(e) {
        const deg = parseFloat(e.target.value);
        initialTheta = deg * Math.PI / 180;
        document.getElementById('theta0-value').textContent = deg;
        if (!isRunning) {
            state.theta = initialTheta;
            render(state, 0);
            updateStateDisplay(state, 0);
        }
    });

    // Button handlers
    document.getElementById('start-btn').addEventListener('click', function() {
        if (isRunning) {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            this.textContent = 'Start';
        } else {
            isRunning = true;
            this.textContent = 'Pause';
            animationId = requestAnimationFrame(simulate);
        }
    });

    document.getElementById('reset-btn').addEventListener('click', function() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        document.getElementById('start-btn').textContent = 'Start';
        resetState();
    });

    // ============================================
    // Initialization
    // ============================================
    
    function init() {
        resetState();
    }

    init();

})();
