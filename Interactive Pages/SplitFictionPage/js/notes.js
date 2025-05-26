// notes.js - Creates note elements with improved validation and error handling
import { createPortalCounterpart } from './portal-effects.js';

/**
 * Validate configuration structure
 * @param {Object} config - Configuration object
 * @returns {boolean} Whether config is valid
 */
function validateConfig(config) {
    return config &&
        Array.isArray(config.playerANotes) &&
        Array.isArray(config.playerBNotes) &&
        config.nestedItems &&
        typeof config.nestedItems === 'object';
}

/**
 * Validate elements structure
 * @param {Object} elements - Elements object
 * @returns {boolean} Whether elements are valid
 */
function validateElements(elements) {
    return elements &&
        elements.playerASide &&
        elements.playerBSide &&
        elements.appContainer;
}

/**
 * Create draggable notes for both players with validation
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} makeClickDraggable - Function to make elements draggable
 */
export function createNotes(config, elements, makeClickDraggable) {
    if (!validateConfig(config)) {
        console.error('Invalid configuration provided to createNotes');
        return;
    }

    if (!validateElements(elements)) {
        console.error('Invalid elements provided to createNotes');
        return;
    }

    if (typeof makeClickDraggable !== 'function') {
        console.error('makeClickDraggable must be a function');
        return;
    }

    // Create Player A notes with error handling
    config.playerANotes.forEach(noteNumber => {
        try {
            const noteElement = createNoteElement(noteNumber, 'a', config, elements, makeClickDraggable);
            if (noteElement) {
                elements.playerASide.appendChild(noteElement);
                createPortalCounterpart(noteElement, noteNumber, 'a', elements);
                createVisualNestedIndicators(noteElement, noteNumber, config);
            }
        } catch (error) {
            console.warn(`Failed to create Player A note ${noteNumber}:`, error);
        }
    });

    // Create Player B notes with error handling
    config.playerBNotes.forEach(noteNumber => {
        try {
            const noteElement = createNoteElement(noteNumber, 'b', config, elements, makeClickDraggable);
            if (noteElement) {
                elements.playerBSide.appendChild(noteElement);
                createPortalCounterpart(noteElement, noteNumber, 'b', elements);
                createVisualNestedIndicators(noteElement, noteNumber, config);
            }
        } catch (error) {
            console.warn(`Failed to create Player B note ${noteNumber}:`, error);
        }
    });

    // Set positioning and visibility with validation
    try {
        positionNestedObjects(config);
        updateNestedVisibility(config);
    } catch (error) {
        console.warn('Failed to set up nested object positioning:', error);
    }
}

/**
 * Function to get shape class based on note number with validation
 * @param {number} noteNumber - The note number
 * @returns {string} The shape class name
 */
export function getShapeForNote(noteNumber) {
    if (typeof noteNumber !== 'number' || isNaN(noteNumber)) {
        console.warn('Invalid note number provided to getShapeForNote:', noteNumber);
        return 'shape-square'; // Default fallback
    }

    if ([1, 5].includes(noteNumber)) {
        return 'shape-triangle';
    } else if (noteNumber === 2) {
        return 'shape-diamond';
    } else if (noteNumber === 4) {
        return 'shape-circle';
    } else {
        return 'shape-square';
    }
}

/**
 * Create a note element with proper validation and error handling
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} makeClickDraggable - Function to make elements draggable
 * @returns {HTMLElement|null} The note element or null if creation failed
 */
function createNoteElement(noteNumber, player, config, elements, makeClickDraggable) {
    if (!['a', 'b'].includes(player)) {
        console.warn('Invalid player identifier:', player);
        return null;
    }

    if (!elements.appContainer) {
        console.warn('App container not available for positioning calculations');
        return null;
    }

    try {
        const noteElement = document.createElement('div');
        const shapeClass = getShapeForNote(noteNumber);

        noteElement.className = `note note-${player} ${shapeClass} hollow draggable`;
        noteElement.setAttribute('data-note', noteNumber);
        noteElement.setAttribute('data-player', player);

        // Create DOM structure safely
        const borderElement = document.createElement('div');
        borderElement.className = 'note-border';
        noteElement.appendChild(borderElement);

        const fillElement = document.createElement('div');
        fillElement.className = 'note-fill';
        noteElement.appendChild(fillElement);

        const textSpan = document.createElement('span');
        textSpan.textContent = noteNumber;
        noteElement.appendChild(textSpan);

        // Position the note with bounds checking
        if (!positionNoteElement(noteElement, noteNumber, player, config, elements)) {
            console.warn(`Failed to position note ${noteNumber}`);
            return null;
        }

        // Make draggable with error handling
        try {
            makeClickDraggable(noteElement);
        } catch (error) {
            console.warn(`Failed to make note ${noteNumber} draggable:`, error);
        }

        return noteElement;
    } catch (error) {
        console.error(`Failed to create note element ${noteNumber}:`, error);
        return null;
    }
}

/**
 * Position a note element with validation
 * @param {HTMLElement} noteElement - The note element
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @returns {boolean} Whether positioning was successful
 */
function positionNoteElement(noteElement, noteNumber, player, config, elements) {
    try {
        if (isNestedNote(noteNumber, config)) {
            // Nested notes start at origin, will be positioned later
            noteElement.style.left = '0px';
            noteElement.style.top = '0px';
            return true;
        }

        const containerWidth = elements.appContainer.offsetWidth;
        const containerHeight = elements.appContainer.offsetHeight;

        if (!containerWidth || !containerHeight) {
            console.warn('Container has no dimensions for positioning');
            return false;
        }

        if (player === 'a') {
            const index = config.playerANotes.indexOf(noteNumber);
            if (index === -1) {
                console.warn(`Note ${noteNumber} not found in playerANotes`);
                return false;
            }

            const row = Math.floor(index / 2);
            const col = index % 2;
            const left = Math.min(100 + (col * 100), containerWidth - 100);
            const top = Math.min(100 + (row * 100), containerHeight - 100);

            noteElement.style.left = `${left}px`;
            noteElement.style.top = `${top}px`;
        } else {
            const index = config.playerBNotes.indexOf(noteNumber);
            if (index === -1) {
                console.warn(`Note ${noteNumber} not found in playerBNotes`);
                return false;
            }

            const row = Math.floor(index / 2);
            const col = index % 2;
            const rightOffset = Math.max(containerWidth - 180, 100);
            const left = Math.max(rightOffset - (col * 100), 100);
            const top = Math.min(100 + (row * 100), containerHeight - 100);

            noteElement.style.left = `${left}px`;
            noteElement.style.top = `${top}px`;
        }

        return true;
    } catch (error) {
        console.error('Error positioning note element:', error);
        return false;
    }
}

/**
 * Check if a note is nested
 * @param {number} noteNumber - The note number
 * @param {Object} config - Application configuration
 * @returns {boolean} Whether the note is nested
 */
function isNestedNote(noteNumber, config) {
    if (!config.nestedItems) return false;

    return Object.values(config.nestedItems).some(children =>
        Array.isArray(children) && children.includes(noteNumber)
    );
}

/**
 * Position nested objects at their parent's position with validation
 * @param {Object} config - Application configuration
 */
function positionNestedObjects(config) {
    if (!config.nestedItems) return;

    Object.entries(config.nestedItems).forEach(([parentNoteStr, nestedItems]) => {
        try {
            const parentNoteNumber = parseInt(parentNoteStr);
            if (isNaN(parentNoteNumber)) {
                console.warn('Invalid parent note number:', parentNoteStr);
                return;
            }

            if (!Array.isArray(nestedItems)) {
                console.warn('Nested items must be an array for parent:', parentNoteNumber);
                return;
            }

            const parentNotes = document.querySelectorAll(`[data-note="${parentNoteNumber}"]:not(.nested-visual)`);
            if (!parentNotes.length) {
                console.warn(`No parent note found for: ${parentNoteNumber}`);
                return;
            }

            parentNotes.forEach(parentNote => {
                const parentLeft = parentNote.style.left;
                const parentTop = parentNote.style.top;

                if (!parentLeft || !parentTop) {
                    console.warn(`Parent note ${parentNoteNumber} missing position`);
                    return;
                }

                nestedItems.forEach(nestedNoteNumber => {
                    const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);
                    nestedObjects.forEach(nestedObject => {
                        nestedObject.style.left = parentLeft;
                        nestedObject.style.top = parentTop;
                    });
                });
            });
        } catch (error) {
            console.warn(`Error positioning nested objects for parent ${parentNoteStr}:`, error);
        }
    });
}

/**
 * Create visual indicators for nested items with validation
 * @param {HTMLElement} parentElement - The parent note element
 * @param {number} parentNoteNumber - The parent note number
 * @param {Object} config - Application configuration
 */
function createVisualNestedIndicators(parentElement, parentNoteNumber, config) {
    if (!parentElement || !config.nestedItems || !config.nestedItems[parentNoteNumber]) {
        return;
    }

    try {
        parentElement.classList.add('has-nested-child');

        const nestedItems = config.nestedItems[parentNoteNumber];
        if (!Array.isArray(nestedItems)) {
            console.warn(`Nested items for ${parentNoteNumber} is not an array`);
            return;
        }

        nestedItems.forEach(nestedNoteNumber => {
            try {
                const visualIndicator = createVisualIndicator(nestedNoteNumber, parentElement);
                if (visualIndicator) {
                    parentElement.appendChild(visualIndicator);
                }
            } catch (error) {
                console.warn(`Failed to create visual indicator for nested note ${nestedNoteNumber}:`, error);
            }
        });
    } catch (error) {
        console.warn(`Error creating nested indicators for parent ${parentNoteNumber}:`, error);
    }
}

/**
 * Create a visual indicator element for a nested item with validation
 * @param {number} nestedNoteNumber - The nested note number
 * @param {HTMLElement} parentElement - The parent element
 * @returns {HTMLElement|null} The visual indicator element or null
 */
function createVisualIndicator(nestedNoteNumber, parentElement) {
    if (!parentElement) {
        console.warn('Parent element required for visual indicator');
        return null;
    }

    try {
        const parentPlayer = parentElement.getAttribute('data-player');
        if (!['a', 'b'].includes(parentPlayer)) {
            console.warn('Invalid parent player for visual indicator');
            return null;
        }

        const nestedPlayer = parentPlayer === 'a' ? 'b' : 'a';
        const shapeClass = getShapeForNote(nestedNoteNumber);

        const visualElement = document.createElement('div');
        visualElement.className = `note note-${nestedPlayer} ${shapeClass} nested-visual hollow`;
        visualElement.setAttribute('data-note', nestedNoteNumber);

        const borderElement = document.createElement('div');
        borderElement.className = 'note-border';
        visualElement.appendChild(borderElement);

        const fillElement = document.createElement('div');
        fillElement.className = 'note-fill';
        visualElement.appendChild(fillElement);

        const textSpan = document.createElement('span');
        textSpan.textContent = nestedNoteNumber;
        visualElement.appendChild(textSpan);

        return visualElement;
    } catch (error) {
        console.error('Error creating visual indicator:', error);
        return null;
    }
}

/**
 * Update visibility for nested objects with improved logic
 * @param {Object} config - Application configuration
 */
function updateNestedVisibility(config) {
    if (!config.nestedItems) return;

    Object.entries(config.nestedItems).forEach(([parent, nestedItems]) => {
        if (!Array.isArray(nestedItems)) return;

        nestedItems.forEach(nestedNoteNumber => {
            try {
                const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);
                const shouldHide = isMultiLevelNested(nestedNoteNumber, config);

                nestedObjects.forEach(note => {
                    if (shouldHide) {
                        note.classList.add('nested-hidden');
                    } else {
                        note.classList.remove('nested-hidden');
                    }
                });
            } catch (error) {
                console.warn(`Error updating visibility for nested note ${nestedNoteNumber}:`, error);
            }
        });
    });
}

/**
 * Check if a note is multi-level nested with improved validation
 * @param {number} noteNumber - The note number to check
 * @param {Object} config - Application configuration
 * @returns {boolean} Whether the note should be hidden
 */
function isMultiLevelNested(noteNumber, config) {
    if (!config.nestedItems) return false;

    try {
        const parentNote = findParentNote(noteNumber, config);
        if (!parentNote) return false;

        // Check if parent has visual indicator (meaning it's still attached)
        const parentElements = document.querySelectorAll(`[data-note="${parentNote}"]:not(.nested-visual)`);
        const parentHasVisualIndicator = Array.from(parentElements).some(parent =>
            parent.querySelector(`.nested-visual[data-note="${noteNumber}"]`)
        );

        if (!parentHasVisualIndicator) return false;

        // Check if parent itself is nested
        const grandParentNote = findParentNote(parentNote, config);
        if (!grandParentNote) return false;

        // Check if grandparent has visual indicator for parent
        const grandParentElements = document.querySelectorAll(`[data-note="${grandParentNote}"]:not(.nested-visual)`);
        return Array.from(grandParentElements).some(grandParent =>
            grandParent.querySelector(`.nested-visual[data-note="${parentNote}"]`)
        );
    } catch (error) {
        console.warn(`Error checking multi-level nesting for note ${noteNumber}:`, error);
        return false;
    }
}

/**
 * Find the parent note number for a given note with validation
 * @param {number} noteNumber - The note number to find parent for
 * @param {Object} config - Application configuration
 * @returns {number|null} The parent note number or null if no parent
 */
function findParentNote(noteNumber, config) {
    if (!config.nestedItems || typeof noteNumber !== 'number') return null;

    try {
        for (const [parent, nestedItems] of Object.entries(config.nestedItems)) {
            if (Array.isArray(nestedItems) && nestedItems.includes(noteNumber)) {
                const parentNumber = parseInt(parent);
                return isNaN(parentNumber) ? null : parentNumber;
            }
        }
        return null;
    } catch (error) {
        console.warn(`Error finding parent for note ${noteNumber}:`, error);
        return null;
    }
}

/**
 * Update visibility after extraction with validation
 * @param {number} extractedNoteNumber - The note number that was extracted
 * @param {Object} config - Application configuration
 */
export function updateVisibilityAfterExtraction(extractedNoteNumber, config) {
    if (!config.nestedItems || typeof extractedNoteNumber !== 'number') return;

    try {
        // Make direct children of extracted note visible
        const childItems = config.nestedItems[extractedNoteNumber];
        if (Array.isArray(childItems)) {
            childItems.forEach(childNoteNumber => {
                const childObjects = document.querySelectorAll(`[data-note="${childNoteNumber}"]:not(.nested-visual)`);
                childObjects.forEach(note => note.classList.remove('nested-hidden'));
            });
        }

        // Update all nested objects visibility
        updateNestedVisibility(config);
    } catch (error) {
        console.warn(`Error updating visibility after extraction of note ${extractedNoteNumber}:`, error);
    }
}