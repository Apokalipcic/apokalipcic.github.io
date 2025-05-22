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
        // Create note element - ATTACH DIRECTLY TO PLAYER SIDE
        const noteElement = createNoteElement(noteNumber, 'a', config, elements, makeClickDraggable);
        elements.playerASide.appendChild(noteElement); // Change: Use playerASide instead of notesAreaA

        // Create portal counterpart for each note - using imported function
        createPortalCounterpart(noteElement, noteNumber, 'a', elements);
    });

    // Create Player B notes
    config.playerBNotes.forEach(noteNumber => {
        // Create note element - ATTACH DIRECTLY TO PLAYER SIDE
        const noteElement = createNoteElement(noteNumber, 'b', config, elements, makeClickDraggable);
        elements.playerBSide.appendChild(noteElement); // Change: Use playerBSide instead of notesAreaB

        // Create portal counterpart for each note - using imported function
        createPortalCounterpart(noteElement, noteNumber, 'b', elements);
    });
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

    // Position notes initially
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

    // Make notes draggable with click
    makeClickDraggable(noteElement);

    return noteElement;
}