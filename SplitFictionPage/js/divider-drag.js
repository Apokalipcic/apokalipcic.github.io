// divider-drag.js - Handles divider dragging functionality with portal effects

/**
 * Set up the divider drag functionality
 * @param {Object} elements - DOM elements
 * @param {Function} updateScreenSplit - Function to update screen splitting
 */
export function setupDividerDrag(elements, updateScreenSplit) {
    let isDraggingDivider = false;
    let startX = 0;
    let startPosition = 50; // Percentage position

    // Mouse events
    elements.divider.addEventListener('mousedown', startDividerDrag);
    document.addEventListener('mousemove', moveDivider);
    document.addEventListener('mouseup', stopDividerDrag);

    // Touch events for mobile
    elements.divider.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        startDividerDrag({ clientX: touch.clientX });
        e.preventDefault();
    });

    document.addEventListener('touchmove', function (e) {
        if (!isDraggingDivider) return;
        const touch = e.touches[0];
        moveDivider({ clientX: touch.clientX });
        e.preventDefault(); // Prevent scrolling while dragging
    });

    document.addEventListener('touchend', stopDividerDrag);

    /**
     * Start dragging the divider
     * @param {Event} e - The mouse/touch event
     */
    function startDividerDrag(e) {
        isDraggingDivider = true;
        startX = e.clientX;

        // Get current position from the divider's left value
        const dividerLeft = parseInt(elements.divider.style.left) || elements.appContainer.offsetWidth / 2;
        startPosition = (dividerLeft / elements.appContainer.offsetWidth) * 100;

        elements.divider.classList.add('dragging');
    }

    /**
     * Move the divider based on mouse/touch position
     * @param {Event} e - The mouse/touch event
     */
    function moveDivider(e) {
        if (!isDraggingDivider) return;

        const containerWidth = elements.appContainer.offsetWidth;
        const mouseX = e.clientX;

        // Calculate percentage position (0-100)
        let newPosition = startPosition + ((mouseX - startX) / containerWidth) * 100;
        newPosition = Math.max(0, Math.min(100, newPosition));

        // Update divider position
        const dividerPos = (newPosition / 100) * containerWidth;
        elements.divider.style.left = `${dividerPos}px`;

        // Update screen split if function is provided
        if (updateScreenSplit) {
            updateScreenSplit(newPosition, elements);
        } else {
            // Default behavior if no updateScreenSplit function is provided
            elements.playerASide.style.clipPath = `inset(0 ${100 - newPosition}% 0 0)`;
            elements.playerBSide.style.clipPath = `inset(0 0 0 ${newPosition}%)`;
        }
    }

    /**
     * Stop dragging the divider
     */
    function stopDividerDrag() {
        isDraggingDivider = false;
        elements.divider.classList.remove('dragging');
    }

    // Handle window resizing
    window.addEventListener('resize', handleResize);

    /**
     * Handle window resize events
     */
    function handleResize() {
        // Get current percentage position
        const dividerLeft = parseInt(elements.divider.style.left) || elements.appContainer.offsetWidth / 2;
        const currentPosition = (dividerLeft / elements.appContainer.offsetWidth) * 100;

        // Recalculate divider position based on percentage
        const newLeft = (currentPosition / 100) * elements.appContainer.offsetWidth;
        elements.divider.style.left = `${newLeft}px`;

        // Update screen split
        if (updateScreenSplit) {
            updateScreenSplit(currentPosition, elements);
        }
    }
}

/**
 * Initialize the divider position
 * @param {Object} elements - DOM elements
 * @param {number} initialPositionPercent - Initial position percentage (0-100)
 */
export function initializeDividerPosition(elements, initialPositionPercent = 50) {
    const containerWidth = elements.appContainer.offsetWidth;
    const dividerPos = (initialPositionPercent / 100) * containerWidth;
    elements.divider.style.left = `${dividerPos}px`;
}

/**
 * Get the current divider position as a percentage
 * @param {Object} elements - DOM elements
 * @returns {number} Current position as percentage (0-100)
 */
export function getDividerPositionPercent(elements) {
    const containerWidth = elements.appContainer.offsetWidth;
    const dividerLeft = parseInt(elements.divider.style.left) || containerWidth / 2;
    return (dividerLeft / containerWidth) * 100;
}

// Portal effects functionality
let portalFlowOffset = 0;
let portalFlowInterval = null;

/**
 * Initialize portal effects
 * @param {Object} elements - DOM elements
 */
export function initializePortalEffects(elements) {
    // Start the flowing energy animation
    startPortalFlow();

    // Hover effects removed - just keep the flowing animation
}

/**
 * Start the flowing energy animation
 */
function startPortalFlow() {
    const flowPath = document.getElementById('flow-path');
    if (!flowPath) return;

    portalFlowInterval = setInterval(() => {
        portalFlowOffset = (portalFlowOffset + 0.6) % 100;
        flowPath.style.strokeDashoffset = portalFlowOffset;
    }, 50);
}

/**
 * Clean up portal effects when needed
 */
export function cleanupPortalEffects() {
    if (portalFlowInterval) {
        clearInterval(portalFlowInterval);
        portalFlowInterval = null;
    }
}