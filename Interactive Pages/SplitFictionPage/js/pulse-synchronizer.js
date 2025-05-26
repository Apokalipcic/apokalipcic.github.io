// pulse-synchronizer.js - Synchronized pulse system for sequencer notes

// Global pulse state
let pulseState = {
    isActive: false,
    intervalId: null,
    bpm: 116, // Default BPM (matches your 0.517s timing)
    phase: 0, // 0 or 1 for pulse phase
    diamondRotation: 45, // Track cumulative diamond rotation
    config: {
        // Animation configuration for each shape
        'shape-diamond': {
            transforms: {
                active: 'rotate({rotation}deg) scale(1.2)',
                rest: 'rotate({rotation}deg) scale(1)'
            },
            effects: {
                active: {},
                rest: {}
            }
        },
        'shape-triangle': {
            transforms: {
                active: 'rotate(5deg) scale(1.2)',
                rest: 'rotate(-5deg) scale(1)'
            },
            effects: {
                active: { filter: 'brightness(1.2) saturate(1.3)' },
                rest: { filter: 'brightness(1) saturate(1)' }
            }
        },
        'shape-circle': {
            transforms: {
                active: 'scale(1.2)',
                rest: 'scale(1)'
            },
            effects: {
                active: {
                    boxShadow: '0 0 20px 8px rgba(255, 255, 255, 0.4)',
                    filter: 'brightness(1.3)'
                },
                rest: {
                    boxShadow: '0 0 10px 3px rgba(255, 255, 255, 0.2)',
                    filter: 'brightness(1)'
                }
            }
        },
        'shape-square': {
            transforms: {
                active: 'scale(1.2)',
                rest: 'scale(1)'
            },
            effects: {
                active: {},
                rest: {}
            }
        }
    }
};

/**
 * Calculate interval from BPM (beats per minute)
 * @param {number} bpm - Beats per minute
 * @returns {number} Interval in milliseconds
 */
function bpmToInterval(bpm) {
    return (60 / bpm) * 1000; // Convert to milliseconds
}

/**
 * Apply synchronized pulse to all notes with .has-note class
 */
function applySynchronizedPulse() {
    try {
        const hasNoteElements = document.querySelectorAll('.sequencer-cell.has-note');

        // Increment diamond rotation on each beat (every two phases)
        if (pulseState.phase === 0) {
            pulseState.diamondRotation += 45;
            // Keep rotation within reasonable bounds (reset every full rotation)
            if (pulseState.diamondRotation >= 360) {
                pulseState.diamondRotation = pulseState.diamondRotation % 360;
            }
        }

        hasNoteElements.forEach(element => {
            const noteShape = element.getAttribute('data-note-shape') || 'shape-square';
            const shapeConfig = pulseState.config[noteShape] || pulseState.config['shape-square'];
            const phase = pulseState.phase === 0 ? 'active' : 'rest';

            // Apply opacity change for all shapes
            element.style.opacity = phase === 'active' ? '1' : '0.8';

            // Apply shape-specific transform
            let transform = shapeConfig.transforms[phase];

            // Replace {rotation} placeholder for diamonds with current rotation
            if (noteShape === 'shape-diamond') {
                transform = transform.replace('{rotation}', pulseState.diamondRotation);
            }

            element.style.transform = transform;

            // Apply additional shape-specific effects
            const effects = shapeConfig.effects[phase];
            Object.entries(effects).forEach(([property, value]) => {
                element.style[property] = value;
            });

            // Reset properties that aren't specified in current phase
            const allProperties = ['boxShadow', 'filter'];
            allProperties.forEach(prop => {
                if (!(prop in effects)) {
                    element.style[prop] = '';
                }
            });
        });

        // Toggle phase for next pulse
        pulseState.phase = pulseState.phase === 0 ? 1 : 0;
    } catch (error) {
        console.error('Error applying synchronized pulse:', error);
    }
}

/**
 * Customize animation for a specific shape
 * @param {string} shapeClass - Shape class (e.g., 'shape-diamond')
 * @param {Object} config - Animation configuration
 * @param {Object} config.transforms - Transform strings for active/rest phases
 * @param {Object} config.effects - CSS properties for active/rest phases
 */
export function customizeShapeAnimation(shapeClass, config) {
    if (!pulseState.config[shapeClass]) {
        console.warn(`Unknown shape class: ${shapeClass}`);
        return;
    }

    try {
        if (config.transforms) {
            pulseState.config[shapeClass].transforms = {
                ...pulseState.config[shapeClass].transforms,
                ...config.transforms
            };
        }

        if (config.effects) {
            pulseState.config[shapeClass].effects = {
                ...pulseState.config[shapeClass].effects,
                ...config.effects
            };
        }

        console.log(`Animation customized for ${shapeClass}`);
    } catch (error) {
        console.error(`Error customizing animation for ${shapeClass}:`, error);
    }
}

/**
 * Start the synchronized pulse system
 * @param {number} bpm - Optional BPM override
 */
export function startSynchronizedPulse(bpm = null) {
    if (pulseState.isActive) {
        console.warn('Pulse system already active');
        return;
    }

    try {
        if (bpm && typeof bpm === 'number' && bpm > 0) {
            pulseState.bpm = bpm;
        }

        const interval = bpmToInterval(pulseState.bpm);

        pulseState.isActive = true;
        pulseState.phase = 0;
        pulseState.diamondRotation = 45; // Reset diamond rotation

        // Apply initial pulse
        applySynchronizedPulse();

        // Set up interval for continuous pulsing
        pulseState.intervalId = setInterval(() => {
            if (pulseState.isActive) {
                applySynchronizedPulse();
            }
        }, interval);

        console.log(`Synchronized pulse started at ${pulseState.bpm} BPM (${interval}ms interval)`);
    } catch (error) {
        console.error('Error starting synchronized pulse:', error);
        pulseState.isActive = false;
    }
}

/**
 * Stop the synchronized pulse system
 */
export function stopSynchronizedPulse() {
    if (!pulseState.isActive) {
        return;
    }

    try {
        pulseState.isActive = false;

        if (pulseState.intervalId) {
            clearInterval(pulseState.intervalId);
            pulseState.intervalId = null;
        }

        // Reset all elements to normal state
        const hasNoteElements = document.querySelectorAll('.sequencer-cell.has-note');
        hasNoteElements.forEach(element => {
            element.style.transform = '';
            element.style.opacity = '';
            element.style.boxShadow = '';
            element.style.filter = '';
        });

        pulseState.phase = 0;
        console.log('Synchronized pulse stopped');
    } catch (error) {
        console.error('Error stopping synchronized pulse:', error);
    }
}

/**
 * Update BPM and restart pulse if active
 * @param {number} newBpm - New BPM value
 */
export function updatePulseBPM(newBpm) {
    if (typeof newBpm !== 'number' || newBpm <= 0) {
        console.warn('Invalid BPM value:', newBpm);
        return;
    }

    const wasActive = pulseState.isActive;

    if (wasActive) {
        stopSynchronizedPulse();
    }

    pulseState.bpm = newBpm;

    if (wasActive) {
        startSynchronizedPulse();
    }

    console.log(`Pulse BPM updated to ${newBpm}`);
}

/**
 * Get current pulse state
 * @returns {Object} Current pulse state
 */
export function getPulseState() {
    return {
        isActive: pulseState.isActive,
        bpm: pulseState.bpm,
        phase: pulseState.phase,
        diamondRotation: pulseState.diamondRotation,
        interval: bpmToInterval(pulseState.bpm)
    };
}

/**
 * Cleanup pulse system
 */
export function cleanupPulseSystem() {
    try {
        stopSynchronizedPulse();
        console.log('Pulse system cleanup completed');
    } catch (error) {
        console.error('Error during pulse system cleanup:', error);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupPulseSystem);
window.addEventListener('unload', cleanupPulseSystem);