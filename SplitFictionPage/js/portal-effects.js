// portal-effects.js - Manages portal transition effects when notes cross boundaries

import { checkNoteSide } from './note-drag.js';

// Global state for crossover detection
let crossOverDetection = {
    isActive: false,
    currentArea: null // 'a' or 'b'
};

/**
 * Initialize crossover detection for a note
 * @param {HTMLElement} noteElement - The note element
 * @param {string} player - The player identifier ('a' or 'b')
 */
export function initCrossoverDetection(noteElement, player) {
    crossOverDetection.isActive = true;
    crossOverDetection.currentArea = player;
}

/**
 * Update portal effects when notes are being dragged
 * @param {HTMLElement} activeNote - The currently active note
 * @param {number} currentX - Current X position of the note
 * @param {number} currentY - Current Y position of the note
 * @param {Object} elements - DOM elements
 */
export function updatePortalEffects(activeNote, currentX, currentY, elements) {
    // Get the portal counterpart
    const counterpartId = activeNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    if (!portalCounterpart) return;

    // Update position of counterpart to match the active note
    portalCounterpart.style.left = `${currentX}px`;
    portalCounterpart.style.top = `${currentY}px`;

    // Get divider position
    const dividerPosition = parseInt(elements.divider.style.left);

    // Get note dimensions
    const noteRect = activeNote.getBoundingClientRect();
    const noteWidth = noteRect.width;

    // Get original player side
    const originalSide = activeNote.getAttribute('data-player');

    // Check if the active note is a triangle
    const isTriangle = activeNote.classList.contains('shape-triangle');

    // Handle crossing effects based on original side
    if (originalSide === 'a') {
        handleLeftToRightCrossing(
            activeNote, 
            portalCounterpart, 
            currentX, 
            noteWidth, 
            dividerPosition, 
            isTriangle
        );
    } else { // originalSide === 'b'
        handleRightToLeftCrossing(
            activeNote, 
            portalCounterpart, 
            currentX, 
            noteWidth, 
            dividerPosition, 
            isTriangle
        );
    }

    // Track which side the note is currently on
    const noteSide = checkNoteSide(currentX + noteWidth / 2, elements);
    crossOverDetection.currentArea = noteSide;
}

/**
 * Handle effects when crossing from left to right
 * @param {HTMLElement} activeNote - The active note
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 * @param {boolean} isTriangle - Whether the note is a triangle shape
 */
function handleLeftToRightCrossing(
    activeNote, 
    portalCounterpart, 
    currentX, 
    noteWidth, 
    dividerPosition, 
    isTriangle
) {
    if (currentX + noteWidth > dividerPosition) {
        // Crossing from left to right
        const overlapAmount = currentX + noteWidth - dividerPosition;
        const overlapPercent = (overlapAmount / noteWidth) * 100;

        // Special handling for triangles
        if (isTriangle) {
            // Make sure the counterpart is fully visible when crossing
            portalCounterpart.style.opacity = overlapPercent > 10 ? "1" : "0";
            portalCounterpart.classList.add('portal-active');

            // For triangles we use a different approach to show the partial visibility
            portalCounterpart.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';

            // Remove hollow state to show filled version
            portalCounterpart.classList.remove('hollow');
        } else {
            // Standard handling for other shapes
            portalCounterpart.style.opacity = "1";
            portalCounterpart.style.clipPath = `inset(0 0 0 ${100 - overlapPercent}%)`;
            portalCounterpart.classList.add('portal-active');
            portalCounterpart.classList.remove('hollow');
        }
    } else {
        // Not crossing, hide counterpart
        hideCounterpart(portalCounterpart, isTriangle);
    }
}

/**
 * Handle effects when crossing from right to left
 * @param {HTMLElement} activeNote - The active note
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 * @param {boolean} isTriangle - Whether the note is a triangle shape
 */
function handleRightToLeftCrossing(
    activeNote, 
    portalCounterpart, 
    currentX, 
    noteWidth, 
    dividerPosition, 
    isTriangle
) {
    if (currentX < dividerPosition) {
        // Crossing from right to left
        const overlapAmount = dividerPosition - currentX;
        const overlapPercent = (overlapAmount / noteWidth) * 100;

        // Special handling for triangles
        if (isTriangle) {
            // Make sure the counterpart is fully visible when crossing
            portalCounterpart.style.opacity = overlapPercent > 10 ? "1" : "0";
            portalCounterpart.classList.add('portal-active');

            // For triangles we use a different approach for right to left transition
            portalCounterpart.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';

            // Remove hollow state to show filled version
            portalCounterpart.classList.remove('hollow');
        } else {
            // Standard handling for other shapes
            portalCounterpart.style.opacity = "1";
            portalCounterpart.style.clipPath = `inset(0 ${100 - overlapPercent}% 0 0)`;
            portalCounterpart.classList.add('portal-active');
            portalCounterpart.classList.remove('hollow');
        }
    } else {
        // Not crossing, hide counterpart
        hideCounterpart(portalCounterpart, isTriangle);
    }
}

/**
 * Hide a portal counterpart
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 * @param {boolean} isTriangle - Whether the counterpart is a triangle shape
 */
function hideCounterpart(portalCounterpart, isTriangle) {
    portalCounterpart.style.opacity = "0";
    portalCounterpart.classList.remove('portal-active');
    portalCounterpart.classList.add('hollow');

    // Reset clipPath for triangles when not crossing
    if (isTriangle) {
        portalCounterpart.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';
    }
}

/**
 * Create all portal counterparts for notes
 * @param {NodeList} notes - Collection of note elements
 * @param {Object} elements - DOM elements
 */
export function createAllPortalCounterparts(notes, elements) {
    notes.forEach(note => {
        const noteNumber = parseInt(note.getAttribute('data-note'));
        const player = note.getAttribute('data-player');
        createPortalCounterpart(note, noteNumber, player, elements);
    });
}

/**
 * Create a portal counterpart for a note
 * @param {HTMLElement} noteElement - The original note element
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Object} elements - DOM elements
 * @returns {HTMLElement} The portal counterpart element
 */
function createPortalCounterpart(noteElement, noteNumber, player, elements) {
    // Get properties from the original note
    const shapeClass = noteElement.className.match(/shape-[a-z]+/)[0];
    
    // Create a portal counterpart with opposite styling
    const oppositePlayer = player === 'a' ? 'b' : 'a';
    const portalCounterpart = document.createElement('div');
    portalCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
    portalCounterpart.setAttribute('data-note', noteNumber);
    portalCounterpart.setAttribute('data-counterpart-for', player);

    // Add span for text
    const counterpartTextSpan = document.createElement('span');
    counterpartTextSpan.textContent = noteNumber;
    portalCounterpart.appendChild(counterpartTextSpan);

    // Link the notes
    const counterpartId = `counterpart-${player}-${noteNumber}`;
    noteElement.setAttribute('data-counterpart-id', counterpartId);
    portalCounterpart.id = counterpartId;

    // Copy the position
    portalCounterpart.style.left = noteElement.style.left;
    portalCounterpart.style.top = noteElement.style.top;

    // Add to appropriate container
    if (player === 'a') {
        elements.playerBSide.appendChild(portalCounterpart);
    } else {
        elements.playerASide.appendChild(portalCounterpart);
    }

    return portalCounterpart;
}

/**
 * Reset all portal effects
 * @param {Object} elements - DOM elements
 */
export function resetPortalEffects(elements) {
    // Reset crossover detection
    crossOverDetection.isActive = false;
    crossOverDetection.currentArea = null;
    
    // Hide all portal counterparts
    const counterparts = document.querySelectorAll('.portal-counterpart');
    counterparts.forEach(counterpart => {
        counterpart.style.opacity = "0";
        counterpart.classList.remove('portal-active');
        counterpart.classList.add('hollow');
    });
}
