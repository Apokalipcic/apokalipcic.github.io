// utils.js - Essential utility functions with improved validation

/**
 * Limit a value to a range with validation
 * @param {number} value - The value to limit
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
    // Validate inputs
    if (typeof value !== 'number' || isNaN(value)) {
        console.warn('Invalid value provided to clamp:', value);
        return 0;
    }

    if (typeof min !== 'number' || isNaN(min)) {
        console.warn('Invalid min value provided to clamp:', min);
        min = 0;
    }

    if (typeof max !== 'number' || isNaN(max)) {
        console.warn('Invalid max value provided to clamp:', max);
        max = 1;
    }

    if (min > max) {
        console.warn('Min value greater than max value in clamp, swapping');
        [min, max] = [max, min];
    }

    return Math.max(min, Math.min(max, value));
}

/**
 * Check if an element is in an array with validation
 * @param {*} element - The element to check
 * @param {Array} array - The array to search in
 * @returns {boolean} Whether the element is in the array
 */
export function isInArray(element, array) {
    if (!Array.isArray(array)) {
        console.warn('Non-array provided to isInArray:', array);
        return false;
    }

    try {
        return array.includes(element);
    } catch (error) {
        console.warn('Error checking array inclusion:', error);
        return false;
    }
}

/**
 * Get the position of an element relative to the document with validation
 * @param {HTMLElement} element - The element
 * @returns {Object|null} The position with top and left properties, or null if invalid
 */
export function getElementPosition(element) {
    if (!element || !element.getBoundingClientRect) {
        console.warn('Invalid element provided to getElementPosition');
        return null;
    }

    try {
        const rect = element.getBoundingClientRect();

        // Validate rect properties
        if (typeof rect.top !== 'number' || typeof rect.left !== 'number') {
            console.warn('Invalid bounding rect from element');
            return null;
        }

        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: rect.width || 0,
            height: rect.height || 0
        };
    } catch (error) {
        console.error('Error getting element position:', error);
        return null;
    }
}

/**
 * Check if two elements are overlapping with validation
 * @param {HTMLElement} element1 - First element
 * @param {HTMLElement} element2 - Second element
 * @returns {boolean} Whether the elements overlap
 */
export function areElementsOverlapping(element1, element2) {
    if (!element1 || !element2 ||
        !element1.getBoundingClientRect ||
        !element2.getBoundingClientRect) {
        console.warn('Invalid elements provided to areElementsOverlapping');
        return false;
    }

    try {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        // Validate rect properties
        const requiredProps = ['top', 'left', 'bottom', 'right'];
        const isValidRect = (rect) => requiredProps.every(prop =>
            typeof rect[prop] === 'number' && !isNaN(rect[prop])
        );

        if (!isValidRect(rect1) || !isValidRect(rect2)) {
            console.warn('Invalid bounding rects in overlap check');
            return false;
        }

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    } catch (error) {
        console.error('Error checking element overlap:', error);
        return false;
    }
}

/**
 * Format a time duration in milliseconds to mm:ss format with validation
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms) {
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
        console.warn('Invalid milliseconds provided to formatTime:', ms);
        return '00:00';
    }

    try {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Ensure values are within reasonable bounds
        const clampedMinutes = Math.min(99, Math.max(0, minutes));
        const clampedSeconds = Math.min(59, Math.max(0, seconds));

        return `${clampedMinutes.toString().padStart(2, '0')}:${clampedSeconds.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '00:00';
    }
}

/**
 * Calculate beats per minute to milliseconds per beat with validation
 * @param {number} bpm - Beats per minute
 * @returns {number} Milliseconds per beat
 */
export function bpmToMs(bpm) {
    if (typeof bpm !== 'number' || isNaN(bpm) || bpm <= 0) {
        console.warn('Invalid BPM provided to bpmToMs:', bpm);
        return 500; // Default to 120 BPM equivalent
    }

    // Reasonable BPM bounds (30-300 BPM)
    const clampedBpm = clamp(bpm, 30, 300);

    if (clampedBpm !== bpm) {
        console.warn(`BPM ${bpm} clamped to ${clampedBpm} (reasonable range: 30-300)`);
    }

    try {
        return 60000 / clampedBpm;
    } catch (error) {
        console.error('Error converting BPM to milliseconds:', error);
        return 500; // Fallback
    }
}

/**
 * Safely parse a numeric value with fallback
 * @param {*} value - Value to parse
 * @param {number} fallback - Fallback value if parsing fails
 * @returns {number} Parsed number or fallback
 */
export function safeParseNumber(value, fallback = 0) {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }

    if (typeof fallback !== 'number' || isNaN(fallback)) {
        console.warn('Invalid fallback provided to safeParseNumber, using 0');
        return 0;
    }

    return fallback;
}

/**
 * Safely get a nested property from an object
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot-separated path (e.g., 'a.b.c')
 * @param {*} fallback - Fallback value if property not found
 * @returns {*} Property value or fallback
 */
export function safeGet(obj, path, fallback = null) {
    if (!obj || typeof obj !== 'object') {
        return fallback;
    }

    if (typeof path !== 'string') {
        console.warn('Invalid path provided to safeGet');
        return fallback;
    }

    try {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return fallback;
            }
            current = current[key];
        }

        return current !== undefined ? current : fallback;
    } catch (error) {
        console.warn('Error in safeGet:', error);
        return fallback;
    }
}

/**
 * Check if a value is a valid DOM element
 * @param {*} element - Value to check
 * @returns {boolean} Whether the value is a DOM element
 */
export function isDOMElement(element) {
    try {
        return element &&
            typeof element === 'object' &&
            element.nodeType === Node.ELEMENT_NODE &&
            typeof element.getBoundingClientRect === 'function';
    } catch (error) {
        return false;
    }
}

/**
 * Safely execute a function with error handling
 * @param {Function} fn - Function to execute
 * @param {Array} args - Arguments to pass to function
 * @param {*} fallback - Fallback value if function fails
 * @returns {*} Function result or fallback
 */
export function safeExecute(fn, args = [], fallback = null) {
    if (typeof fn !== 'function') {
        console.warn('Non-function provided to safeExecute');
        return fallback;
    }

    if (!Array.isArray(args)) {
        console.warn('Non-array args provided to safeExecute, converting');
        args = [args];
    }

    try {
        return fn(...args);
    } catch (error) {
        console.warn('Error executing function in safeExecute:', error);
        return fallback;
    }
}

/**
 * Generate a simple unique ID with validation
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} A unique ID
 */
export function generateUniqueId(prefix = '') {
    if (typeof prefix !== 'string') {
        console.warn('Invalid prefix provided to generateUniqueId, using empty string');
        prefix = '';
    }

    try {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}-${random}`;
    } catch (error) {
        console.error('Error generating unique ID:', error);
        // Fallback to simple counter-based ID
        return `${prefix}fallback-${Math.floor(Math.random() * 10000)}`;
    }
}

/**
 * Debounce a function with validation
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    if (typeof func !== 'function') {
        console.error('Non-function provided to debounce');
        return () => { };
    }

    const validWait = safeParseNumber(wait, 250);
    if (validWait < 0) {
        console.warn('Negative wait time provided to debounce, using 250ms');
    }

    let timeout;

    return function executedFunction(...args) {
        try {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, Math.max(0, validWait));
        } catch (error) {
            console.error('Error in debounced function:', error);
        }
    };
}

/**
 * Throttle a function with validation
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(func, limit) {
    if (typeof func !== 'function') {
        console.error('Non-function provided to throttle');
        return () => { };
    }

    const validLimit = safeParseNumber(limit, 250);
    if (validLimit < 0) {
        console.warn('Negative limit provided to throttle, using 250ms');
    }

    let inThrottle;

    return function executedFunction(...args) {
        try {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, Math.max(0, validLimit));
            }
        } catch (error) {
            console.error('Error in throttled function:', error);
        }
    };
}