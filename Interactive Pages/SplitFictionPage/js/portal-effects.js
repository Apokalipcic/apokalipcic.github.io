// portal-effects.js - Manages portal transition effects when notes cross boundaries

import { checkNoteSide } from './note-drag.js';
import { getShapeForNote } from './notes.js';

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

    // Handle crossing effects based on original side
    if (originalSide === 'a') {
        handleLeftToRightCrossing(
            activeNote,
            portalCounterpart,
            currentX,
            noteWidth,
            dividerPosition
        );
    } else { // originalSide === 'b'
        handleRightToLeftCrossing(
            activeNote,
            portalCounterpart,
            currentX,
            noteWidth,
            dividerPosition
        );
    }

    // Track which side the note is currently on
    const noteSide = checkNoteSide(currentX + noteWidth / 2, elements);
    crossOverDetection.currentArea = noteSide;
}

/**
 * Update portal effects during dragging (for use in note-drag.js)
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 * @param {number} currentX - Current X position
 * @param {HTMLElement} activeNote - The active note
 * @param {Object} elements - DOM elements object with divider
 */
export function updatePortalEffectsDuringDrag(portalCounterpart, currentX, activeNote, elements) {
    // Get divider position
    const dividerPosition = parseInt(elements.divider.style.left);

    // Get note dimensions
    const noteRect = activeNote.getBoundingClientRect();
    const noteWidth = noteRect.width;

    // Get original player side
    const originalSide = activeNote.getAttribute('data-player');

    // Get border and fill elements
    const borderElement = portalCounterpart.querySelector('.note-border');
    const fillElement = portalCounterpart.querySelector('.note-fill');

    // Check if crossing the divider
    if (originalSide === 'a') {
        // Handle crossing from left to right
        if (currentX + noteWidth > dividerPosition) {
            const overlapAmount = currentX + noteWidth - dividerPosition;
            const overlapPercent = (overlapAmount / noteWidth) * 100;

            // Make the counterpart visible
            portalCounterpart.style.opacity = "1";

            // Create clip-path value based on how much is overlapping
            const clipPathValue = `inset(0 0 0 ${100 - overlapPercent}%)`;

            // Apply clip-path ONLY to child elements, not the parent
            if (borderElement) borderElement.style.clipPath = clipPathValue;
            if (fillElement) fillElement.style.clipPath = clipPathValue;

            portalCounterpart.classList.add('portal-active');
            portalCounterpart.classList.add('crossing-divider');
            portalCounterpart.classList.remove('hollow');
        } else {
            // Not crossing, hide counterpart
            hideCounterpart(portalCounterpart);
        }
    } else { // originalSide === 'b'
        // Handle crossing from right to left
        if (currentX < dividerPosition) {
            const overlapAmount = dividerPosition - currentX;
            const overlapPercent = (overlapAmount / noteWidth) * 100;

            // Make the counterpart visible
            portalCounterpart.style.opacity = "1";

            // Create clip-path value based on how much is overlapping
            const clipPathValue = `inset(0 ${100 - overlapPercent}% 0 0)`;

            // Apply clip-path ONLY to child elements, not the parent
            if (borderElement) borderElement.style.clipPath = clipPathValue;
            if (fillElement) fillElement.style.clipPath = clipPathValue;

            portalCounterpart.classList.add('portal-active');
            portalCounterpart.classList.add('crossing-divider');
            portalCounterpart.classList.remove('hollow');
        } else {
            // Not crossing, hide counterpart
            hideCounterpart(portalCounterpart);
        }
    }
}

/**
 * Handle effects when crossing from left to right
 * @param {HTMLElement} activeNote - The active note
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 */
function handleLeftToRightCrossing(
    activeNote,
    portalCounterpart,
    currentX,
    noteWidth,
    dividerPosition
) {
    if (currentX + noteWidth > dividerPosition) {
        // Crossing from left to right
        const overlapAmount = currentX + noteWidth - dividerPosition;
        const overlapPercent = (overlapAmount / noteWidth) * 100;

        // Make counterpart visible
        portalCounterpart.style.opacity = "1";
        portalCounterpart.classList.add('portal-active');

        // Remove hollow state to show filled version
        portalCounterpart.classList.remove('hollow');

        // Get border and fill elements
        const borderElement = portalCounterpart.querySelector('.note-border');
        const fillElement = portalCounterpart.querySelector('.note-fill');

        // Apply clipping to create the reveal effect
        const clipPathValue = `inset(0 0 0 ${100 - overlapPercent}%)`;

        // Apply clip-path ONLY to child elements, not the parent
        if (borderElement) borderElement.style.clipPath = clipPathValue;
        if (fillElement) fillElement.style.clipPath = clipPathValue;

        portalCounterpart.classList.add('crossing-divider');
    } else {
        // Not crossing, hide counterpart
        hideCounterpart(portalCounterpart);
    }
}

/**
 * Handle effects when crossing from right to left
 * @param {HTMLElement} activeNote - The active note
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 */
function handleRightToLeftCrossing(
    activeNote,
    portalCounterpart,
    currentX,
    noteWidth,
    dividerPosition
) {
    if (currentX < dividerPosition) {
        // Crossing from right to left
        const overlapAmount = dividerPosition - currentX;
        const overlapPercent = (overlapAmount / noteWidth) * 100;

        // Make counterpart visible
        portalCounterpart.style.opacity = "1";
        portalCounterpart.classList.add('portal-active');

        // Remove hollow state to show filled version
        portalCounterpart.classList.remove('hollow');

        // Get border and fill elements
        const borderElement = portalCounterpart.querySelector('.note-border');
        const fillElement = portalCounterpart.querySelector('.note-fill');

        // Apply clipping to create the reveal effect
        const clipPathValue = `inset(0 ${100 - overlapPercent}% 0 0)`;

        // Apply clip-path ONLY to child elements, not the parent
        if (borderElement) borderElement.style.clipPath = clipPathValue;
        if (fillElement) fillElement.style.clipPath = clipPathValue;

        portalCounterpart.classList.add('crossing-divider');
    } else {
        // Not crossing, hide counterpart
        hideCounterpart(portalCounterpart);
    }
}

/**
 * Hide a portal counterpart
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 */
export function hideCounterpart(portalCounterpart) {
    portalCounterpart.style.opacity = "0";
    portalCounterpart.classList.remove('portal-active');
    portalCounterpart.classList.add('hollow');
    portalCounterpart.classList.remove('crossing-divider');

    // Get border and fill elements
    const borderElement = portalCounterpart.querySelector('.note-border');
    const fillElement = portalCounterpart.querySelector('.note-fill');

    // Reset clip-path ONLY on child elements
    if (borderElement) borderElement.style.clipPath = "";
    if (fillElement) fillElement.style.clipPath = "";

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
export function createPortalCounterpart(noteElement, noteNumber, player, elements) {
    const oppositePlayer = player === 'a' ? 'b' : 'a';
    const shapeClass = getShapeForNote(noteNumber);
    const portalCounterpart = document.createElement('div');
    portalCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
    portalCounterpart.setAttribute('data-note', noteNumber);
    portalCounterpart.setAttribute('data-counterpart-for', player);

    // Create border element
    const borderElement = document.createElement('div');
    borderElement.className = 'note-border';
    portalCounterpart.appendChild(borderElement);

    // Create fill element
    const fillElement = document.createElement('div');
    fillElement.className = 'note-fill';
    portalCounterpart.appendChild(fillElement);

    // Add span for text
    const counterpartTextSpan = document.createElement('span');
    counterpartTextSpan.textContent = noteNumber;
    portalCounterpart.appendChild(counterpartTextSpan);

    // Copy visual nested indicators to portal counterpart
    copyVisualIndicatorsToCounterpart(noteElement, portalCounterpart);

    // Link the notes
    const counterpartId = `counterpart-${player}-${noteNumber}`;
    noteElement.setAttribute('data-counterpart-id', counterpartId);
    portalCounterpart.id = counterpartId;

    // Position the counterpart at the EXACT same position
    portalCounterpart.style.left = noteElement.style.left;
    portalCounterpart.style.top = noteElement.style.top;

    // Initially hide the counterpart (opacity 0)
    portalCounterpart.style.opacity = "0";

    // Add to appropriate container
    if (player === 'a') {
        elements.playerBSide.appendChild(portalCounterpart);
    } else {
        elements.playerASide.appendChild(portalCounterpart);
    }

    return portalCounterpart;
}

// New function to copy visual indicators to portal counterparts
function copyVisualIndicatorsToCounterpart(originalNote, portalCounterpart) {
    const visualIndicators = originalNote.querySelectorAll('.nested-visual');

    visualIndicators.forEach(indicator => {
        const indicatorClone = indicator.cloneNode(true);
        portalCounterpart.appendChild(indicatorClone);
    });

    // Copy has-nested-child class if present
    if (originalNote.classList.contains('has-nested-child')) {
        portalCounterpart.classList.add('has-nested-child');
    }
}

// Add new function to update portal counterpart visual indicators
export function updatePortalCounterpartIndicators(noteNumber, player, elements) {
    const counterpartId = `counterpart-${player}-${noteNumber}`;
    const portalCounterpart = document.getElementById(counterpartId);
    const originalNote = document.querySelector(`[data-note="${noteNumber}"][data-player="${player}"]:not(.portal-counterpart):not(.nested-visual)`);

    if (portalCounterpart && originalNote) {
        // Remove existing visual indicators from counterpart
        const existingIndicators = portalCounterpart.querySelectorAll('.nested-visual');
        existingIndicators.forEach(indicator => indicator.remove());

        // Remove has-nested-child class
        portalCounterpart.classList.remove('has-nested-child');

        // Copy current visual indicators from original
        copyVisualIndicatorsToCounterpart(originalNote, portalCounterpart);
    }
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
        hideCounterpart(counterpart);
    });
}