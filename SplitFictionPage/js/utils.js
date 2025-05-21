// utils.js - Utility functions for the application

/**
 * Limit a value to a range
 * @param {number} value - The value to limit
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Check if an element is in an array
 * @param {*} element - The element to check
 * @param {Array} array - The array to search in
 * @returns {boolean} Whether the element is in the array
 */
export function isInArray(element, array) {
    return array.includes(element);
}

/**
 * Get the position of an element relative to the document
 * @param {HTMLElement} element - The element
 * @returns {Object} The position with top and left properties
 */
export function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    };
}

/**
 * Check if two elements are overlapping
 * @param {HTMLElement} element1 - First element
 * @param {HTMLElement} element2 - Second element
 * @returns {boolean} Whether the elements overlap
 */
export function areElementsOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

/**
 * Create an animation frame loop
 * @param {Function} callback - Function to call on each frame
 * @returns {Object} Control object with start, stop, and isRunning methods
 */
export function createAnimationLoop(callback) {
    let animationFrameId = null;
    let isRunning = false;
    
    function animate() {
        callback();
        if (isRunning) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }
    
    return {
        start: function() {
            if (!isRunning) {
                isRunning = true;
                animationFrameId = requestAnimationFrame(animate);
            }
        },
        stop: function() {
            isRunning = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        },
        get isRunning() {
            return isRunning;
        }
    };
}

/**
 * Create a debounced function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
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
 * Create a throttled function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} A unique ID
 */
export function generateUniqueId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a time duration in milliseconds to mm:ss format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate beats per minute to milliseconds per beat
 * @param {number} bpm - Beats per minute
 * @returns {number} Milliseconds per beat
 */
export function bpmToMs(bpm) {
    return 60000 / bpm;
}
