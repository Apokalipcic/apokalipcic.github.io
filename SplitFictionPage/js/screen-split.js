// screen-split.js - Handles screen splitting and panel clipping

/**
 * Initialize the screen split
 * @param {Object} elements - DOM elements
 * @param {number} initialPositionPercent - Initial position percentage (0-100)
 */
export function initializeScreenSplit(elements, initialPositionPercent = 50) {
    updateScreenSplit(initialPositionPercent, elements);

    // Set the appropriate z-index values
    elements.playerASide.style.zIndex = 2;
    elements.playerBSide.style.zIndex = 1;
    elements.divider.style.zIndex = 10;
}

/**
 * Update the screen split based on divider position
 * @param {number} positionPercent - Divider position as percentage (0-100)
 * @param {Object} elements - DOM elements
 */
export function updateScreenSplit(positionPercent, elements) {
    // Clip the player A side (left)
    elements.playerASide.style.clipPath = `inset(0 ${100 - positionPercent}% 0 0)`;
    
    // Clip the player B side (right)
    elements.playerBSide.style.clipPath = `inset(0 0 0 ${positionPercent}%)`;
}

/**
 * Apply special screen splitting effects
 * @param {Object} elements - DOM elements
 * @param {string} effect - The effect to apply ('wave', 'zigzag', 'curved')
 * @param {number} positionPercent - Divider position as percentage (0-100)
 */
export function applySpecialSplitEffect(elements, effect, positionPercent) {
    switch(effect) {
        case 'wave':
            applyWaveEffect(elements, positionPercent);
            break;
        case 'zigzag':
            applyZigzagEffect(elements, positionPercent);
            break;
        case 'curved':
            applyCurvedEffect(elements, positionPercent);
            break;
        default:
            // Default straight line
            updateScreenSplit(positionPercent, elements);
    }
}

/**
 * Apply a wave effect to the split
 * @param {Object} elements - DOM elements
 * @param {number} positionPercent - Divider position as percentage (0-100)
 */
function applyWaveEffect(elements, positionPercent) {
    const amplitude = 5; // Wave amplitude in percentage
    const frequency = 3; // Number of waves
    
    // Create SVG path for wave
    const wavePath = createWavePath(positionPercent, amplitude, frequency);
    
    // Apply clip paths with the wave effect
    elements.playerASide.style.clipPath = `path('${wavePath.left}')`;
    elements.playerBSide.style.clipPath = `path('${wavePath.right}')`;
}

/**
 * Create wave paths for left and right panels
 * @param {number} positionPercent - Divider position as percentage
 * @param {number} amplitude - Wave amplitude
 * @param {number} frequency - Number of waves
 * @returns {Object} Left and right path strings
 */
function createWavePath(positionPercent, amplitude, frequency) {
    // Calculate position in viewport coordinates
    const position = positionPercent / 100;
    
    // Create wave path
    let leftPath = `M${position * 100},0 `;
    let rightPath = `M${position * 100},0 `;
    
    // Add wave segments
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
        const y = (i / segments) * 100;
        const waveX = amplitude * Math.sin((y / 100) * Math.PI * 2 * frequency);
        
        leftPath += `L${position * 100 + waveX},${y} `;
        rightPath += `L${position * 100 + waveX},${y} `;
    }
    
    // Close the paths
    leftPath += `L0,100 L0,0 Z`;
    rightPath += `L100,100 L100,0 Z`;
    
    return { left: leftPath, right: rightPath };
}

/**
 * Apply a zigzag effect to the split
 * @param {Object} elements - DOM elements
 * @param {number} positionPercent - Divider position as percentage (0-100)
 */
function applyZigzagEffect(elements, positionPercent) {
    const amplitude = 3; // Zigzag amplitude in percentage
    const segments = 10; // Number of zigzag segments
    
    // Create SVG path for zigzag
    const zigzagPath = createZigzagPath(positionPercent, amplitude, segments);
    
    // Apply clip paths with the zigzag effect
    elements.playerASide.style.clipPath = `path('${zigzagPath.left}')`;
    elements.playerBSide.style.clipPath = `path('${zigzagPath.right}')`;
}

/**
 * Create zigzag paths for left and right panels
 * @param {number} positionPercent - Divider position as percentage
 * @param {number} amplitude - Zigzag amplitude
 * @param {number} segments - Number of zigzag segments
 * @returns {Object} Left and right path strings
 */
function createZigzagPath(positionPercent, amplitude, segments) {
    // Calculate position in viewport coordinates
    const position = positionPercent / 100;
    
    // Create zigzag path
    let leftPath = `M${position * 100},0 `;
    let rightPath = `M${position * 100},0 `;
    
    // Add zigzag segments
    for (let i = 1; i <= segments; i++) {
        const y = (i / segments) * 100;
        const x = (i % 2 === 0) ? position * 100 + amplitude : position * 100 - amplitude;
        
        leftPath += `L${x},${y} `;
        rightPath += `L${x},${y} `;
    }
    
    // Close the paths
    leftPath += `L0,100 L0,0 Z`;
    rightPath += `L100,100 L100,0 Z`;
    
    return { left: leftPath, right: rightPath };
}

/**
 * Apply a curved effect to the split
 * @param {Object} elements - DOM elements
 * @param {number} positionPercent - Divider position as percentage (0-100)
 */
function applyCurvedEffect(elements, positionPercent) {
    const curvature = 15; // Curve amount in percentage
    
    // Create SVG path for curve
    const curvedPath = createCurvedPath(positionPercent, curvature);
    
    // Apply clip paths with the curved effect
    elements.playerASide.style.clipPath = `path('${curvedPath.left}')`;
    elements.playerBSide.style.clipPath = `path('${curvedPath.right}')`;
}

/**
 * Create curved paths for left and right panels
 * @param {number} positionPercent - Divider position as percentage
 * @param {number} curvature - Amount of curvature
 * @returns {Object} Left and right path strings
 */
function createCurvedPath(positionPercent, curvature) {
    // Calculate position in viewport coordinates
    const position = positionPercent / 100;
    
    // Create curved path using cubic bezier
    const leftPath = `
        M${position * 100},0 
        C${(position + curvature/100) * 100},33 ${(position - curvature/100) * 100},66 ${position * 100},100 
        L0,100 L0,0 Z
    `;
    
    const rightPath = `
        M${position * 100},0 
        C${(position + curvature/100) * 100},33 ${(position - curvature/100) * 100},66 ${position * 100},100 
        L100,100 L100,0 Z
    `;
    
    return { left: leftPath, right: rightPath };
}
