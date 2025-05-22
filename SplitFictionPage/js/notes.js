// notes.js - Creates note elements with DOM-based visual structure
import { createPortalCounterpart } from './portal-effects.js';

/**
 * Create draggable notes for both players
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} makeClickDraggable - Function to make elements draggable
 */
export function createNotes(config, elements, makeClickDraggable) {
    // Create Player A notes
    config.playerANotes.forEach(noteNumber => {
        const noteElement = createNoteElement(noteNumber, 'a', config, elements, makeClickDraggable);
        elements.playerASide.appendChild(noteElement);
        createPortalCounterpart(noteElement, noteNumber, 'a', elements);
        createVisualNestedIndicators(noteElement, noteNumber, config);
    });

    // Create Player B notes
    config.playerBNotes.forEach(noteNumber => {
        const noteElement = createNoteElement(noteNumber, 'b', config, elements, makeClickDraggable);
        elements.playerBSide.appendChild(noteElement);
        createPortalCounterpart(noteElement, noteNumber, 'b', elements);
        createVisualNestedIndicators(noteElement, noteNumber, config);
    });

    // Set initial positioning and visibility for nested objects
    positionNestedObjects(config);
    updateNestedVisibility(config);
}

/**
 * Function to get shape class based on note number
 * @param {number} noteNumber - The note number
 * @returns {string} The shape class name
 */
export function getShapeForNote(noteNumber) {
    // Assign shapes based on note numbers
    if ([1, 3, 5].includes(noteNumber)) {
        return 'shape-triangle';
    } else if (noteNumber === 2) {
        return 'shape-diamond';
    } else if (noteNumber === 4) {
        return 'shape-circle';
    } else {
        return 'shape-square'; // Default shape
    }
}

/**
 * Function to create a note element with the appropriate shape
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} makeClickDraggable - Function to make elements draggable
 * @returns {HTMLElement} The note element
 */
function createNoteElement(noteNumber, player, config, elements, makeClickDraggable) {
    const noteElement = document.createElement('div');

    // Get shape class based on note number
    const shapeClass = getShapeForNote(noteNumber);

    // Apply all necessary classes including shape and hollow state
    noteElement.className = `note note-${player} ${shapeClass} hollow draggable`;
    noteElement.setAttribute('data-note', noteNumber);
    noteElement.setAttribute('data-player', player);

    // Create border element
    const borderElement = document.createElement('div');
    borderElement.className = 'note-border';
    noteElement.appendChild(borderElement);

    // Create fill element
    const fillElement = document.createElement('div');
    fillElement.className = 'note-fill';
    noteElement.appendChild(fillElement);

    // Create a span for the text to allow separate styling/positioning
    const textSpan = document.createElement('span');
    textSpan.textContent = noteNumber;
    noteElement.appendChild(textSpan);

    // Check if this is a nested object
    const parentNoteNumber = findParentNote(noteNumber, config);

    if (parentNoteNumber) {
        // This is a nested object - don't position it yet, will be positioned by positionNestedObjects
        noteElement.style.left = `0px`;
        noteElement.style.top = `0px`;
    } else {
        // Position regular notes initially
        if (player === 'a') {
            // Position Player A notes on the left side
            const index = config.playerANotes.indexOf(noteNumber);
            const row = Math.floor(index / 2);
            const col = index % 2;
            noteElement.style.left = `${100 + (col * 100)}px`;
            noteElement.style.top = `${100 + (row * 100)}px`;
        } else {
            // Position Player B notes on the right side
            const index = config.playerBNotes.indexOf(noteNumber);
            const row = Math.floor(index / 2);
            const col = index % 2;
            const rightOffset = elements.appContainer.offsetWidth - 180;
            noteElement.style.left = `${rightOffset - (col * 100)}px`;
            noteElement.style.top = `${100 + (row * 100)}px`;
        }
    }

    // Make notes draggable with click
    makeClickDraggable(noteElement);

    return noteElement;
}

/**
 * Position nested objects at their parent's exact position
 * @param {Object} config - Application configuration
 */
function positionNestedObjects(config) {
    Object.entries(config.nestedItems).forEach(([parentNoteStr, nestedItems]) => {
        const parentNoteNumber = parseInt(parentNoteStr);
        const parentNotes = document.querySelectorAll(`[data-note="${parentNoteNumber}"]:not(.nested-visual)`);

        parentNotes.forEach(parentNote => {
            const parentLeft = parentNote.style.left;
            const parentTop = parentNote.style.top;

            nestedItems.forEach(nestedNoteNumber => {
                const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);
                nestedObjects.forEach(nestedObject => {
                    nestedObject.style.left = parentLeft;
                    nestedObject.style.top = parentTop;
                });
            });
        });
    });
}

/**
 * Create visual indicators for nested items inside parent notes
 * @param {HTMLElement} parentElement - The parent note element
 * @param {number} parentNoteNumber - The parent note number
 * @param {Object} config - Application configuration
 */
function createVisualNestedIndicators(parentElement, parentNoteNumber, config) {
    if (config.nestedItems[parentNoteNumber]) {
        parentElement.classList.add('has-nested-child');

        config.nestedItems[parentNoteNumber].forEach(nestedNoteNumber => {
            const visualIndicator = createVisualIndicator(nestedNoteNumber, parentElement);
            parentElement.appendChild(visualIndicator);
        });
    }
}

/**
 * Create a visual indicator element for a nested item
 * @param {number} nestedNoteNumber - The nested note number
 * @param {HTMLElement} parentElement - The parent element
 * @returns {HTMLElement} The visual indicator element
 */
function createVisualIndicator(nestedNoteNumber, parentElement) {
    const nestedPlayer = parentElement.getAttribute('data-player') === 'a' ? 'b' : 'a';
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
}

/**
 * Update visibility for nested objects - only hide multi-level nested items
 * @param {Object} config - Application configuration
 */
function updateNestedVisibility(config) {
    Object.entries(config.nestedItems).forEach(([parent, nestedItems]) => {
        nestedItems.forEach(nestedNoteNumber => {
            const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);
            nestedObjects.forEach(note => {
                if (isMultiLevelNested(nestedNoteNumber, config)) {
                    note.classList.add('nested-hidden');
                } else {
                    note.classList.remove('nested-hidden');
                }
            });
        });
    });
}

/**
 * Check if a note is multi-level nested (2+ levels deep with attached parent chain)
 * @param {number} noteNumber - The note number to check
 * @param {Object} config - Application configuration
 * @returns {boolean} Whether the note should be hidden
 */
function isMultiLevelNested(noteNumber, config) {
    const parentNote = findParentNote(noteNumber, config);
    if (!parentNote) return false;

    // Check if the parent still has visual indicator (meaning it's attached)
    const parentElements = document.querySelectorAll(`[data-note="${parentNote}"]:not(.nested-visual)`);
    const parentHasVisualIndicator = Array.from(parentElements).some(parent =>
        parent.querySelector(`.nested-visual[data-note="${noteNumber}"]`)
    );

    // If parent doesn't have visual indicator, this item is already extracted
    if (!parentHasVisualIndicator) return false;

    // Check if the parent itself is nested (making this a multi-level nested item)
    const grandParentNote = findParentNote(parentNote, config);
    if (!grandParentNote) return false; // Parent is top-level, so this is only 1-level nested

    // Check if grandparent still has visual indicator for parent
    const grandParentElements = document.querySelectorAll(`[data-note="${grandParentNote}"]:not(.nested-visual)`);
    const grandParentHasVisualIndicator = Array.from(grandParentElements).some(grandParent =>
        grandParent.querySelector(`.nested-visual[data-note="${parentNote}"]`)
    );

    // If grandparent has visual indicator for parent, then this item should be hidden
    return grandParentHasVisualIndicator;
}

/**
 * Find the parent note number for a given note
 * @param {number} noteNumber - The note number to find parent for
 * @param {Object} config - Application configuration
 * @returns {number|null} The parent note number or null if no parent
 */
function findParentNote(noteNumber, config) {
    for (const [parent, nestedItems] of Object.entries(config.nestedItems)) {
        if (nestedItems.includes(noteNumber)) {
            return parseInt(parent);
        }
    }
    return null;
}

/**
 * Update visibility after extraction to handle cascading visibility
 * @param {number} extractedNoteNumber - The note number that was extracted
 * @param {Object} config - Application configuration
 */
export function updateVisibilityAfterExtraction(extractedNoteNumber, config) {
    // Make direct children of extracted note visible
    if (config.nestedItems[extractedNoteNumber]) {
        config.nestedItems[extractedNoteNumber].forEach(childNoteNumber => {
            const childObjects = document.querySelectorAll(`[data-note="${childNoteNumber}"]:not(.nested-visual)`);
            childObjects.forEach(note => {
                note.classList.remove('nested-hidden');
            });
        });
    }

    // Update all nested objects visibility
    updateNestedVisibility(config);
}