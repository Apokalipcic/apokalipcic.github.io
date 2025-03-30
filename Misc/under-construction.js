// under-construction.js - Script to add under construction strips to elements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all elements with data-construction attribute
    initConstructionStrips();
});

/**
 * Initialize under construction strips for all elements with data-construction attribute
 */
function initConstructionStrips() {
    // Find all elements that should have construction strips
    const constructionElements = document.querySelectorAll('[data-construction]');
    
    constructionElements.forEach(element => {
        // Make the parent element position relative if it's not already
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        // Get the size from data attribute (small, default, large)
        const size = element.dataset.construction || 'default';
        
        // Create the construction strip
        const stripElement = createConstructionStrip(size);
        
        // Add the strip to the element
        element.appendChild(stripElement);
    });
}

/**
 * Create a construction strip element
 * @param {string} size - The size of the strip (small, default, large)
 * @returns {HTMLElement} The construction strip element
 */
function createConstructionStrip(size) {
    // Create the main strip container
    const strip = document.createElement('div');
    strip.className = 'under-construction-strip';
    
    // Add size class if specified and not default
    if (size !== 'default' && size) {
        strip.classList.add(size);
    }
    
    // Create the pattern container
    const pattern = document.createElement('div');
    pattern.className = 'construction-pattern';
    
    // Create the text element
    const text = document.createElement('span');
    text.className = 'construction-text';
    text.textContent = 'UNDER CONSTRUCTION';
    
    // Assemble the elements
    pattern.appendChild(text);
    strip.appendChild(pattern);
    
    return strip;
}

/**
 * Add a construction strip to an element manually (can be called from other scripts)
 * @param {HTMLElement} element - The element to add the strip to
 * @param {string} size - Optional size (small, default, large)
 */
function addConstructionStrip(element, size = 'default') {
    // Make sure the element has relative positioning
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    
    // Create and add the strip
    const strip = createConstructionStrip(size);
    element.appendChild(strip);
    
    return strip;
}

// Make the function available globally
window.addConstructionStrip = addConstructionStrip;