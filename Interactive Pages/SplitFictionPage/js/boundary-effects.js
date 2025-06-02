// boundary-effects.js - Responsive invisible laser boundary visualization system

// Global state for boundary effects
let boundaryState = {
    isActive: false,
    segments: [],
    segmentIdCounter: 0,
    container: null,
    noteSize: 80, // Default note size
    marginPercent: 0.05, // 5% margin
    segmentLength: 120,
    fadeDuration: 50,
    cachedBoundaries: null,
    lastContainerSize: { width: 0, height: 0 },
    resizeObserver: null
};

/**
 * Initialize the boundary effects system with responsive handling
 * @param {HTMLElement} container - The container element to add boundaries to
 * @param {Object} options - Configuration options
 */
export function initializeBoundaryEffects(container, options = {}) {
    if (!container) {
        console.warn('Container element required for boundary effects');
        return;
    }

    boundaryState.container = container;
    boundaryState.noteSize = options.noteSize || 80;
    boundaryState.marginPercent = options.marginPercent || 0.05;
    boundaryState.segmentLength = options.segmentLength || 120;
    boundaryState.fadeDuration = options.fadeDuration || 50;
    boundaryState.isActive = true;

    // Ensure container has relative positioning for absolute children
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    // Set up responsive monitoring
    setupResponsiveHandling();

    // Initial boundary calculation
    invalidateBoundaryCache();

    console.log('Responsive boundary effects initialized');
}

/**
 * Set up responsive handling for window resize and container changes
 */
function setupResponsiveHandling() {
    if (!boundaryState.container) return;

    // Window resize listener
    const handleResize = debounce(() => {
        invalidateBoundaryCache();
        updateAllSegmentPositions();
    }, 100);

    window.addEventListener('resize', handleResize);

    // ResizeObserver for container size changes (more reliable than window resize)
    if (typeof ResizeObserver !== 'undefined') {
        boundaryState.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === boundaryState.container) {
                    invalidateBoundaryCache();
                    updateAllSegmentPositions();
                }
            }
        });
        boundaryState.resizeObserver.observe(boundaryState.container);
    }

    // Store resize cleanup for later
    boundaryState.resizeCleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (boundaryState.resizeObserver) {
            boundaryState.resizeObserver.disconnect();
            boundaryState.resizeObserver = null;
        }
    };
}

/**
 * Debounce function to limit resize event frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Calculate boundary positions with caching and responsive handling
 * @param {boolean} forceRecalculate - Force recalculation even if cached
 * @returns {Object} Boundary positions
 */
function calculateBoundaries(forceRecalculate = false) {
    if (!boundaryState.container) return null;

    // Check if we need to recalculate
    const containerRect = boundaryState.container.getBoundingClientRect();
    const currentSize = { width: containerRect.width, height: containerRect.height };

    const sizeChanged =
        currentSize.width !== boundaryState.lastContainerSize.width ||
        currentSize.height !== boundaryState.lastContainerSize.height;

    if (!forceRecalculate && boundaryState.cachedBoundaries && !sizeChanged) {
        return boundaryState.cachedBoundaries;
    }

    // Update last known size
    boundaryState.lastContainerSize = currentSize;

    const containerStyle = getComputedStyle(boundaryState.container);

    // Get container's internal dimensions (excluding borders/padding)
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
    const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
    const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
    const borderLeft = parseFloat(containerStyle.borderLeftWidth) || 0;
    const borderTop = parseFloat(containerStyle.borderTopWidth) || 0;
    const borderRight = parseFloat(containerStyle.borderRightWidth) || 0;
    const borderBottom = parseFloat(containerStyle.borderBottomWidth) || 0;

    const width = containerRect.width - paddingLeft - paddingRight - borderLeft - borderRight;
    const height = containerRect.height - paddingTop - paddingBottom - borderTop - borderBottom;

    const margin = boundaryState.marginPercent;

    // Cache the calculated boundaries
    boundaryState.cachedBoundaries = {
        minX: width * margin,
        maxX: width * (1 - margin) - boundaryState.noteSize,
        minY: height * margin,
        maxY: height * (1 - margin) - boundaryState.noteSize,
        containerWidth: width,
        containerHeight: height,
        // Store viewport info for debugging
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
    };

    return boundaryState.cachedBoundaries;
}

/**
 * Invalidate boundary cache (call when container might have changed)
 */
function invalidateBoundaryCache() {
    boundaryState.cachedBoundaries = null;
}

/**
 * Update all existing segment positions (called on resize)
 */
function updateAllSegmentPositions() {
    if (!boundaryState.segments.length) return;

    const boundaries = calculateBoundaries(true);
    if (!boundaries) return;

    boundaryState.segments.forEach(segmentInfo => {
        updateSegmentPosition(segmentInfo.element, segmentInfo.type, segmentInfo.position, boundaries);
    });
}

/**
 * Create a new boundary segment
 * @param {string} type - Boundary type ('top', 'bottom', 'left', 'right')
 * @param {number} position - Position along the boundary
 * @returns {HTMLElement} The segment element
 */
function createBoundarySegment(type, position) {
    const id = boundaryState.segmentIdCounter++;
    const boundaries = calculateBoundaries();

    if (!boundaries) return null;

    const segment = document.createElement('div');
    segment.className = 'boundary-laser-segment';
    segment.setAttribute('data-boundary-id', id);
    segment.setAttribute('data-boundary-type', type);

    // Set initial styles and position
    updateSegmentPosition(segment, type, position, boundaries);
    segment.style.opacity = '0';
    segment.style.transition = `all ${boundaryState.fadeDuration}ms ease-in-out`;

    boundaryState.container.appendChild(segment);

    // Store segment info
    const segmentInfo = {
        id,
        element: segment,
        type,
        position,
        targetOpacity: 1
    };

    boundaryState.segments.push(segmentInfo);

    // Fade in
    requestAnimationFrame(() => {
        segment.style.opacity = '1';
    });

    return segment;
}

/**
 * Update segment position and styling with clean neon lines
 * @param {HTMLElement} segment - The segment element
 * @param {string} type - Boundary type
 * @param {number} position - Position along boundary
 * @param {Object} boundaries - Boundary calculations
 */
function updateSegmentPosition(segment, type, position, boundaries) {
    const segmentLength = boundaryState.segmentLength;

    if (type === 'top' || type === 'bottom') {
        // Horizontal segments
        const segmentLeft = Math.max(0, position - segmentLength / 2);
        const segmentWidth = Math.min(segmentLength, boundaries.containerWidth - segmentLeft);

        segment.style.left = `${segmentLeft}px`;
        segment.style.width = `${segmentWidth}px`;
        segment.style.height = '2px'; // Clean thin line
        segment.style.top = type === 'top' ? `${boundaries.minY}px` : `${boundaries.maxY + boundaryState.noteSize}px`;

        // Clean linear gradient background (center 100%, edges 0%)
        segment.style.background = `linear-gradient(to right, 
            rgba(255, 196, 0, 0) 0%, 
            rgba(255, 196, 0, 1) 50%, 
            rgba(255, 196, 0, 0) 100%)`;

        // Remove all borders - pure background only
        segment.style.border = 'none';

    } else {
        // Vertical segments
        const segmentTop = Math.max(0, position - segmentLength / 2);
        const segmentHeight = Math.min(segmentLength, boundaries.containerHeight - segmentTop);

        segment.style.top = `${segmentTop}px`;
        segment.style.height = `${segmentHeight}px`;
        segment.style.width = '2px'; // Clean thin line
        segment.style.left = type === 'left' ? `${boundaries.minX}px` : `${boundaries.maxX + boundaryState.noteSize}px`;

        // Clean linear gradient background (center 100%, edges 0%)
        segment.style.background = `linear-gradient(to bottom, 
            rgba(255, 196, 0, 0) 0%, 
            rgba(255, 196, 0, 1) 50%, 
            rgba(255, 196, 0, 0) 100%)`;

        // Remove all borders - pure background only
        segment.style.border = 'none';
    }
}

/**
 * Remove a boundary segment with fade out
 * @param {number} segmentId - The segment ID to remove
 */
function removeBoundarySegment(segmentId) {
    const segmentInfo = boundaryState.segments.find(s => s.id === segmentId);
    if (!segmentInfo) return;

    // Fade out
    segmentInfo.element.style.opacity = '0';

    // Remove after fade
    setTimeout(() => {
        if (segmentInfo.element.parentNode) {
            segmentInfo.element.parentNode.removeChild(segmentInfo.element);
        }
        boundaryState.segments = boundaryState.segments.filter(s => s.id !== segmentId);
    }, boundaryState.fadeDuration + 10);
}

/**
 * Update boundary effects based on note position
 * @param {number} noteX - Note X position relative to container
 * @param {number} noteY - Note Y position relative to container  
 * @param {HTMLElement} noteElement - The note element (optional, for size reference)
 */
export function updateBoundaryEffects(noteX, noteY, noteElement = null) {
    if (!boundaryState.isActive || !boundaryState.container) return;

    // Update note size if element provided
    if (noteElement) {
        const noteRect = noteElement.getBoundingClientRect();
        if (noteRect.width > 0) {
            boundaryState.noteSize = noteRect.width;
        }
    }

    const boundaries = calculateBoundaries();
    if (!boundaries) return;

    // Determine which boundaries are being hit
    const threshold = 5; // 5px tolerance
    const activeBoundaries = {
        left: noteX <= boundaries.minX + threshold,
        right: noteX >= boundaries.maxX - threshold,
        top: noteY <= boundaries.minY + threshold,
        bottom: noteY >= boundaries.maxY - threshold
    };

    // Update existing segments or create new ones
    Object.entries(activeBoundaries).forEach(([side, isActive]) => {
        const position = (side === 'left' || side === 'right') ?
            noteY + boundaryState.noteSize / 2 : noteX + boundaryState.noteSize / 2;

        const existingSegment = boundaryState.segments.find(seg => seg.type === side);

        if (isActive) {
            if (existingSegment) {
                // Update position of existing segment
                existingSegment.position = position;
                updateSegmentPosition(existingSegment.element, side, position, boundaries);
            } else {
                // Create new segment
                createBoundarySegment(side, position);
            }
        } else if (existingSegment) {
            // Remove segment that's no longer active
            removeBoundarySegment(existingSegment.id);
        }
    });
}

/**
 * Clear all boundary effects
 */
export function clearBoundaryEffects() {
    boundaryState.segments.forEach(segmentInfo => {
        if (segmentInfo.element.parentNode) {
            segmentInfo.element.parentNode.removeChild(segmentInfo.element);
        }
    });
    boundaryState.segments = [];
}

/**
 * Check if a note position would hit boundaries (for constraint calculation)
 * @param {number} noteX - Note X position
 * @param {number} noteY - Note Y position
 * @returns {Object} Constraint result
 */
export function constrainToBoundaries(noteX, noteY) {
    const boundaries = calculateBoundaries();
    if (!boundaries) {
        return { x: noteX, y: noteY, hitBoundary: false };
    }

    const constrainedX = Math.max(boundaries.minX, Math.min(boundaries.maxX, noteX));
    const constrainedY = Math.max(boundaries.minY, Math.min(boundaries.maxY, noteY));

    return {
        x: constrainedX,
        y: constrainedY,
        hitBoundary: (noteX !== constrainedX) || (noteY !== constrainedY)
    };
}

/**
 * Cleanup boundary effects system with proper responsive cleanup
 */
export function cleanupBoundaryEffects() {
    clearBoundaryEffects();

    // Clean up responsive listeners
    if (boundaryState.resizeCleanup) {
        boundaryState.resizeCleanup();
        boundaryState.resizeCleanup = null;
    }

    // Reset state
    boundaryState.isActive = false;
    boundaryState.container = null;
    boundaryState.cachedBoundaries = null;
    boundaryState.lastContainerSize = { width: 0, height: 0 };

    console.log('Responsive boundary effects cleaned up');
}

/**
 * Get current boundary information for debugging
 * @returns {Object} Current boundary state
 */
export function getBoundaryInfo() {
    const boundaries = calculateBoundaries();
    return {
        isActive: boundaryState.isActive,
        segmentCount: boundaryState.segments.length,
        containerSize: boundaryState.lastContainerSize,
        boundaries: boundaries,
        marginPercent: boundaryState.marginPercent,
        noteSize: boundaryState.noteSize
    };
}