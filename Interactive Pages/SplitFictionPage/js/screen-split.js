// screen-split.js - Handles screen splitting and panel clipping with improved validation

/**
 * Validate elements for screen splitting
 * @param {Object} elements - DOM elements
 * @returns {boolean} Whether elements are valid
 */
function validateElements(elements) {
    return elements &&
        elements.playerASide &&
        elements.playerBSide &&
        elements.divider;
}

/**
 * Validate position percentage
 * @param {number} positionPercent - Position percentage
 * @returns {number} Clamped position percentage
 */
function validatePosition(positionPercent) {
    if (typeof positionPercent !== 'number' || isNaN(positionPercent)) {
        console.warn('Invalid position percentage, using 50%');
        return 50;
    }
    return Math.max(0, Math.min(100, positionPercent));
}

/**
 * Initialize the screen split with validation
 * @param {Object} elements - DOM elements
 * @param {number} initialPositionPercent - Initial position percentage (0-100)
 */
export function initializeScreenSplit(elements, initialPositionPercent = 50) {
    if (!validateElements(elements)) {
        console.error('Invalid elements provided to initializeScreenSplit');
        return;
    }

    const validPosition = validatePosition(initialPositionPercent);

    try {
        updateScreenSplit(validPosition, elements);

        // Set the appropriate z-index values safely
        if (elements.playerASide) {
            elements.playerASide.style.zIndex = '2';
        }
        if (elements.playerBSide) {
            elements.playerBSide.style.zIndex = '1';
        }
        if (elements.divider) {
            elements.divider.style.zIndex = '10';
        }

        console.log(`Screen split initialized at ${validPosition}%`);
    } catch (error) {
        console.error('Error initializing screen split:', error);
    }
}

/**
 * Update the screen split based on divider position with validation
 * @param {number} positionPercent - Divider position as percentage (0-100)
 * @param {Object} elements - DOM elements
 */
export function updateScreenSplit(positionPercent, elements) {
    if (!validateElements(elements)) {
        console.warn('Invalid elements provided to updateScreenSplit');
        return;
    }

    const validPosition = validatePosition(positionPercent);

    try {
        // Check if clip-path is supported
        const supportsClipPath = CSS.supports('clip-path', 'inset(0)');

        if (supportsClipPath) {
            // Use modern clip-path
            if (elements.playerASide) {
                elements.playerASide.style.clipPath = `inset(0 ${100 - validPosition}% 0 0)`;
            }
            if (elements.playerBSide) {
                elements.playerBSide.style.clipPath = `inset(0 0 0 ${validPosition}%)`;
            }
        } else {
            // Fallback for older browsers
            console.warn('clip-path not supported, using fallback positioning');
            fallbackScreenSplit(validPosition, elements);
        }
    } catch (error) {
        console.error('Error updating screen split:', error);
        // Attempt fallback
        fallbackScreenSplit(validPosition, elements);
    }
}

/**
 * Fallback screen split for browsers without clip-path support
 * @param {number} positionPercent - Position percentage
 * @param {Object} elements - DOM elements
 */
function fallbackScreenSplit(positionPercent, elements) {
    if (!elements) return;

    try {
        // Use width and overflow as fallback
        if (elements.playerASide) {
            elements.playerASide.style.width = `${positionPercent}%`;
            elements.playerASide.style.overflow = 'hidden';
        }
        if (elements.playerBSide) {
            elements.playerBSide.style.width = `${100 - positionPercent}%`;
            elements.playerBSide.style.left = `${positionPercent}%`;
            elements.playerBSide.style.overflow = 'hidden';
        }
    } catch (error) {
        console.warn('Error in fallback screen split:', error);
    }
}

/**
 * Reset screen split to default state
 * @param {Object} elements - DOM elements
 */
export function resetScreenSplit(elements) {
    if (!validateElements(elements)) {
        console.warn('Invalid elements provided to resetScreenSplit');
        return;
    }

    try {
        updateScreenSplit(50, elements);
        console.log('Screen split reset to 50%');
    } catch (error) {
        console.error('Error resetting screen split:', error);
    }
}

/**
 * Get current screen split position
 * @param {Object} elements - DOM elements
 * @returns {number} Current position percentage or 50 as fallback
 */
export function getCurrentSplitPosition(elements) {
    if (!validateElements(elements)) {
        console.warn('Invalid elements provided to getCurrentSplitPosition');
        return 50;
    }

    try {
        const playerAClipPath = elements.playerASide.style.clipPath;

        if (playerAClipPath && playerAClipPath.includes('inset')) {
            // Extract percentage from clip-path
            const match = playerAClipPath.match(/inset\(0\s+(\d+(?:\.\d+)?)%/);
            if (match) {
                const rightInset = parseFloat(match[1]);
                return 100 - rightInset;
            }
        }

        // Fallback: check width
        const playerAWidth = elements.playerASide.style.width;
        if (playerAWidth && playerAWidth.includes('%')) {
            const widthPercent = parseFloat(playerAWidth);
            if (!isNaN(widthPercent)) {
                return widthPercent;
            }
        }

        // Default fallback
        return 50;
    } catch (error) {
        console.warn('Error getting current split position:', error);
        return 50;
    }
}

/**
 * Animate screen split transition
 * @param {Object} elements - DOM elements
 * @param {number} targetPosition - Target position percentage
 * @param {number} duration - Animation duration in milliseconds
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateScreenSplit(elements, targetPosition, duration = 500) {
    return new Promise((resolve) => {
        if (!validateElements(elements)) {
            console.warn('Invalid elements provided to animateScreenSplit');
            resolve();
            return;
        }

        const validTarget = validatePosition(targetPosition);
        const validDuration = Math.max(100, Math.min(5000, duration || 500));

        try {
            const startPosition = getCurrentSplitPosition(elements);
            const startTime = Date.now();

            function animate() {
                try {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / validDuration, 1);

                    // Easing function (ease-out)
                    const easeOut = 1 - Math.pow(1 - progress, 3);

                    const currentPosition = startPosition + (validTarget - startPosition) * easeOut;
                    updateScreenSplit(currentPosition, elements);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                } catch (error) {
                    console.error('Error during screen split animation:', error);
                    resolve();
                }
            }

            animate();
        } catch (error) {
            console.error('Error starting screen split animation:', error);
            resolve();
        }
    });
}

/**
 * Check if screen split is supported
 * @returns {boolean} Whether advanced screen splitting is supported
 */
export function isScreenSplitSupported() {
    try {
        return CSS.supports('clip-path', 'inset(0)') &&
            typeof requestAnimationFrame === 'function';
    } catch (error) {
        console.warn('Error checking screen split support:', error);
        return false;
    }
}

/**
 * Cleanup screen split (reset to neutral state)
 * @param {Object} elements - DOM elements
 */
export function cleanupScreenSplit(elements) {
    if (!elements) return;

    try {
        // Reset clip paths
        if (elements.playerASide) {
            elements.playerASide.style.clipPath = '';
            elements.playerASide.style.width = '';
            elements.playerASide.style.overflow = '';
        }

        if (elements.playerBSide) {
            elements.playerBSide.style.clipPath = '';
            elements.playerBSide.style.width = '';
            elements.playerBSide.style.left = '';
            elements.playerBSide.style.overflow = '';
        }

        console.log('Screen split cleaned up');
    } catch (error) {
        console.error('Error cleaning up screen split:', error);
    }
}