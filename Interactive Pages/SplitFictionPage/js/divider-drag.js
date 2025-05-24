// divider-drag.js - Handles divider dragging functionality with improved validation and cleanup

/**
 * Validate elements for divider functionality
 * @param {Object} elements - DOM elements
 * @returns {boolean} Whether elements are valid
 */
function validateElements(elements) {
    return elements &&
        elements.divider &&
        elements.appContainer &&
        elements.playerASide &&
        elements.playerBSide;
}

/**
 * Validate update function
 * @param {Function} updateScreenSplit - Screen split update function
 * @returns {boolean} Whether function is valid
 */
function validateUpdateFunction(updateScreenSplit) {
    return typeof updateScreenSplit === 'function';
}

// Global state for divider dragging
let dividerState = {
    isDragging: false,
    startX: 0,
    startPosition: 50,
    elements: null,
    updateScreenSplit: null
};

// Portal flow state
let portalFlowState = {
    offset: 0,
    intervalId: null,
    isActive: false
};

/**
 * Set up the divider drag functionality with validation
 * @param {Object} elements - DOM elements
 * @param {Function} updateScreenSplit - Function to update screen splitting
 */
export function setupDividerDrag(elements, updateScreenSplit) {
    if (!validateElements(elements)) {
        console.error('Invalid elements provided to setupDividerDrag');
        return;
    }

    if (!validateUpdateFunction(updateScreenSplit)) {
        console.error('Invalid updateScreenSplit function provided');
        return;
    }

    // Store references for event handlers
    dividerState.elements = elements;
    dividerState.updateScreenSplit = updateScreenSplit;

    try {
        // Mouse events
        elements.divider.addEventListener('mousedown', startDividerDrag);
        document.addEventListener('mousemove', moveDivider);
        document.addEventListener('mouseup', stopDividerDrag);

        // Touch events for mobile with validation
        elements.divider.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', stopDividerDrag);

        // Window resize handling
        window.addEventListener('resize', handleResize);

        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);

        console.log('Divider drag events set up successfully');
    } catch (error) {
        console.error('Error setting up divider drag events:', error);
    }
}

/**
 * Handle touch start with validation
 * @param {TouchEvent} e - Touch event
 */
function handleTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) {
        return; // Only handle single touch
    }

    try {
        const touch = e.touches[0];
        startDividerDrag({ clientX: touch.clientX });
        e.preventDefault();
    } catch (error) {
        console.error('Error handling touch start:', error);
    }
}

/**
 * Handle touch move with validation
 * @param {TouchEvent} e - Touch event
 */
function handleTouchMove(e) {
    if (!dividerState.isDragging || !e.touches || e.touches.length !== 1) {
        return;
    }

    try {
        const touch = e.touches[0];
        moveDivider({ clientX: touch.clientX });
        e.preventDefault(); // Prevent scrolling while dragging
    } catch (error) {
        console.error('Error handling touch move:', error);
    }
}

/**
 * Start dragging the divider with validation
 * @param {Event} e - The mouse/touch event
 */
function startDividerDrag(e) {
    if (!dividerState.elements || dividerState.isDragging) {
        return;
    }

    try {
        dividerState.isDragging = true;
        dividerState.startX = e.clientX || 0;

        // Get current position from the divider's left value with validation
        const dividerLeftStr = dividerState.elements.divider.style.left;
        const containerWidth = dividerState.elements.appContainer.offsetWidth;

        if (!containerWidth) {
            console.warn('Container has no width for divider positioning');
            dividerState.isDragging = false;
            return;
        }

        let dividerLeft = containerWidth / 2; // Default to center
        if (dividerLeftStr && dividerLeftStr.includes('px')) {
            const parsed = parseInt(dividerLeftStr);
            if (!isNaN(parsed)) {
                dividerLeft = parsed;
            }
        }

        dividerState.startPosition = Math.max(0, Math.min(100, (dividerLeft / containerWidth) * 100));

        dividerState.elements.divider.classList.add('dragging');
    } catch (error) {
        console.error('Error starting divider drag:', error);
        dividerState.isDragging = false;
    }
}

/**
 * Move the divider based on mouse/touch position with validation
 * @param {Event} e - The mouse/touch event
 */
function moveDivider(e) {
    if (!dividerState.isDragging || !dividerState.elements) {
        return;
    }

    try {
        const containerWidth = dividerState.elements.appContainer.offsetWidth;
        const mouseX = e.clientX || 0;

        if (!containerWidth) {
            console.warn('Container width unavailable during divider move');
            return;
        }

        // Calculate percentage position (0-100) with bounds checking
        const deltaX = mouseX - dividerState.startX;
        const deltaPercent = (deltaX / containerWidth) * 100;
        let newPosition = dividerState.startPosition + deltaPercent;

        // Clamp to valid range
        newPosition = Math.max(0, Math.min(100, newPosition));

        // Update divider position
        const dividerPos = (newPosition / 100) * containerWidth;
        dividerState.elements.divider.style.left = `${dividerPos}px`;

        // Update screen split with error handling
        if (dividerState.updateScreenSplit) {
            try {
                dividerState.updateScreenSplit(newPosition, dividerState.elements);
            } catch (error) {
                console.warn('Error updating screen split:', error);
                // Fallback to basic behavior
                fallbackUpdateScreenSplit(newPosition);
            }
        } else {
            fallbackUpdateScreenSplit(newPosition);
        }
    } catch (error) {
        console.error('Error moving divider:', error);
    }
}

/**
 * Fallback screen split update
 * @param {number} newPosition - New position percentage
 */
function fallbackUpdateScreenSplit(newPosition) {
    if (!dividerState.elements) return;

    try {
        if (dividerState.elements.playerASide) {
            dividerState.elements.playerASide.style.clipPath = `inset(0 ${100 - newPosition}% 0 0)`;
        }
        if (dividerState.elements.playerBSide) {
            dividerState.elements.playerBSide.style.clipPath = `inset(0 0 0 ${newPosition}%)`;
        }
    } catch (error) {
        console.warn('Error in fallback screen split update:', error);
    }
}

/**
 * Stop dragging the divider
 */
function stopDividerDrag() {
    if (!dividerState.isDragging) {
        return;
    }

    try {
        dividerState.isDragging = false;

        if (dividerState.elements && dividerState.elements.divider) {
            dividerState.elements.divider.classList.remove('dragging');
        }
    } catch (error) {
        console.error('Error stopping divider drag:', error);
    }
}

/**
 * Handle window resize events with validation
 */
function handleResize() {
    if (!dividerState.elements) return;

    try {
        const containerWidth = dividerState.elements.appContainer.offsetWidth;
        if (!containerWidth) {
            console.warn('Container width unavailable during resize');
            return;
        }

        // Get current percentage position
        const dividerLeftStr = dividerState.elements.divider.style.left;
        let currentPosition = 50; // Default to center

        if (dividerLeftStr && dividerLeftStr.includes('px')) {
            const parsed = parseInt(dividerLeftStr);
            if (!isNaN(parsed)) {
                currentPosition = Math.max(0, Math.min(100, (parsed / containerWidth) * 100));
            }
        }

        // Recalculate divider position based on percentage
        const newLeft = (currentPosition / 100) * containerWidth;
        dividerState.elements.divider.style.left = `${newLeft}px`;

        // Update screen split with error handling
        if (dividerState.updateScreenSplit) {
            try {
                dividerState.updateScreenSplit(currentPosition, dividerState.elements);
            } catch (error) {
                console.warn('Error updating screen split during resize:', error);
                fallbackUpdateScreenSplit(currentPosition);
            }
        }
    } catch (error) {
        console.error('Error handling resize:', error);
    }
}

/**
 * Initialize the divider position with validation
 * @param {Object} elements - DOM elements
 * @param {number} initialPositionPercent - Initial position percentage (0-100)
 */
export function initializeDividerPosition(elements, initialPositionPercent = 50) {
    if (!validateElements(elements)) {
        console.error('Invalid elements provided to initializeDividerPosition');
        return;
    }

    if (typeof initialPositionPercent !== 'number' ||
        initialPositionPercent < 0 ||
        initialPositionPercent > 100) {
        console.warn('Invalid initial position, using 50%');
        initialPositionPercent = 50;
    }

    try {
        const containerWidth = elements.appContainer.offsetWidth;
        if (!containerWidth) {
            console.warn('Container has no width, deferring divider positioning');
            // Try again after a short delay
            setTimeout(() => initializeDividerPosition(elements, initialPositionPercent), 100);
            return;
        }

        const dividerPos = (initialPositionPercent / 100) * containerWidth;
        elements.divider.style.left = `${dividerPos}px`;

        console.log(`Divider positioned at ${initialPositionPercent}% (${dividerPos}px)`);
    } catch (error) {
        console.error('Error initializing divider position:', error);
    }
}

/**
 * Get the current divider position as a percentage with validation
 * @param {Object} elements - DOM elements
 * @returns {number} Current position as percentage (0-100) or 50 as fallback
 */
export function getDividerPositionPercent(elements) {
    if (!validateElements(elements)) {
        console.warn('Invalid elements provided to getDividerPositionPercent');
        return 50; // Default fallback
    }

    try {
        const containerWidth = elements.appContainer.offsetWidth;
        if (!containerWidth) {
            console.warn('Container width unavailable for position calculation');
            return 50;
        }

        const dividerLeftStr = elements.divider.style.left;
        let dividerLeft = containerWidth / 2; // Default to center

        if (dividerLeftStr && dividerLeftStr.includes('px')) {
            const parsed = parseInt(dividerLeftStr);
            if (!isNaN(parsed)) {
                dividerLeft = parsed;
            }
        }

        return Math.max(0, Math.min(100, (dividerLeft / containerWidth) * 100));
    } catch (error) {
        console.error('Error getting divider position:', error);
        return 50; // Fallback
    }
}

/**
 * Initialize portal effects with improved error handling
 * @param {Object} elements - DOM elements
 */
export function initializePortalEffects(elements) {
    if (!elements) {
        console.warn('No elements provided to initializePortalEffects');
        return;
    }

    try {
        // Start the flowing energy animation
        startPortalFlow();
        console.log('Portal effects initialized');
    } catch (error) {
        console.error('Error initializing portal effects:', error);
    }
}

/**
 * Start the flowing energy animation with validation
 */
function startPortalFlow() {
    // Clean up any existing interval
    if (portalFlowState.intervalId) {
        clearInterval(portalFlowState.intervalId);
    }

    try {
        const flowPath = document.getElementById('flow-path');
        if (!flowPath) {
            console.warn('Flow path element not found, skipping portal flow animation');
            return;
        }

        portalFlowState.isActive = true;
        portalFlowState.intervalId = setInterval(() => {
            if (!portalFlowState.isActive) {
                cleanupPortalEffects();
                return;
            }

            try {
                portalFlowState.offset = (portalFlowState.offset + 0.6) % 100;
                flowPath.style.strokeDashoffset = portalFlowState.offset;
            } catch (error) {
                console.warn('Error updating portal flow:', error);
                cleanupPortalEffects();
            }
        }, 50);

        console.log('Portal flow animation started');
    } catch (error) {
        console.error('Error starting portal flow:', error);
    }
}

/**
 * Clean up portal effects and intervals
 */
export function cleanupPortalEffects() {
    try {
        portalFlowState.isActive = false;

        if (portalFlowState.intervalId) {
            clearInterval(portalFlowState.intervalId);
            portalFlowState.intervalId = null;
        }

        portalFlowState.offset = 0;
        console.log('Portal effects cleaned up');
    } catch (error) {
        console.error('Error cleaning up portal effects:', error);
    }
}

/**
 * Complete cleanup function for page unload
 */
function cleanup() {
    try {
        // Stop divider dragging
        stopDividerDrag();

        // Clean up portal effects
        cleanupPortalEffects();

        // Remove event listeners
        if (dividerState.elements && dividerState.elements.divider) {
            dividerState.elements.divider.removeEventListener('mousedown', startDividerDrag);
            dividerState.elements.divider.removeEventListener('touchstart', handleTouchStart);
        }

        document.removeEventListener('mousemove', moveDivider);
        document.removeEventListener('mouseup', stopDividerDrag);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', stopDividerDrag);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('beforeunload', cleanup);

        // Clear state
        dividerState.elements = null;
        dividerState.updateScreenSplit = null;
        dividerState.isDragging = false;

        console.log('Divider drag cleanup completed');
    } catch (error) {
        console.error('Error during divider drag cleanup:', error);
    }
}