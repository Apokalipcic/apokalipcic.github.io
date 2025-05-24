// portal-effects.js - Manages portal transition effects with improved validation and cleanup

import { checkNoteSide } from './note-drag.js';
import { getShapeForNote } from './notes.js';

// Global state for crossover detection with validation
let crossOverDetection = {
    isActive: false,
    currentArea: null
};

/**
 * Validate elements structure for portal operations
 * @param {Object} elements - DOM elements object
 * @returns {boolean} Whether elements are valid
 */
function validateElements(elements) {
    return elements &&
        elements.divider &&
        elements.playerASide &&
        elements.playerBSide;
}

/**
 * Initialize crossover detection for a note with validation
 * @param {HTMLElement} noteElement - The note element
 * @param {string} player - The player identifier ('a' or 'b')
 */
export function initCrossoverDetection(noteElement, player) {
    if (!noteElement || !['a', 'b'].includes(player)) {
        console.warn('Invalid parameters for crossover detection');
        return;
    }

    crossOverDetection.isActive = true;
    crossOverDetection.currentArea = player;
}

/**
 * Update portal effects during dragging with improved validation
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 * @param {number} currentX - Current X position
 * @param {HTMLElement} activeNote - The active note
 * @param {Object} elements - DOM elements object with divider
 */
export function updatePortalEffectsDuringDrag(portalCounterpart, currentX, activeNote, elements) {
    if (!portalCounterpart || !activeNote || !validateElements(elements)) {
        console.warn('Invalid parameters for portal effects update');
        return;
    }

    try {
        const dividerPosition = parseInt(elements.divider.style.left);
        if (isNaN(dividerPosition)) {
            console.warn('Invalid divider position');
            return;
        }

        const noteRect = activeNote.getBoundingClientRect();
        if (!noteRect.width) {
            console.warn('Active note has no dimensions');
            return;
        }

        const noteWidth = noteRect.width;
        const originalSide = activeNote.getAttribute('data-player');

        if (!['a', 'b'].includes(originalSide)) {
            console.warn('Invalid original side for active note');
            return;
        }

        if (originalSide === 'a') {
            handleLeftToRightCrossing(portalCounterpart, currentX, noteWidth, dividerPosition);
        } else {
            handleRightToLeftCrossing(portalCounterpart, currentX, noteWidth, dividerPosition);
        }

        // Update crossover detection
        const noteSide = checkNoteSide(currentX + noteWidth / 2);
        crossOverDetection.currentArea = noteSide;
    } catch (error) {
        console.error('Error updating portal effects:', error);
    }
}

/**
 * Handle effects when crossing from left to right with validation
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 */
function handleLeftToRightCrossing(portalCounterpart, currentX, noteWidth, dividerPosition) {
    try {
        if (currentX + noteWidth > dividerPosition) {
            const overlapAmount = currentX + noteWidth - dividerPosition;
            const overlapPercent = Math.min(Math.max((overlapAmount / noteWidth) * 100, 0), 100);

            showCounterpartWithClipping(portalCounterpart, `inset(0 0 0 ${100 - overlapPercent}%)`);
        } else {
            hideCounterpart(portalCounterpart);
        }
    } catch (error) {
        console.warn('Error in left to right crossing:', error);
        hideCounterpart(portalCounterpart);
    }
}

/**
 * Handle effects when crossing from right to left with validation
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {number} currentX - Current X position
 * @param {number} noteWidth - Width of the note
 * @param {number} dividerPosition - Position of the divider
 */
function handleRightToLeftCrossing(portalCounterpart, currentX, noteWidth, dividerPosition) {
    try {
        if (currentX < dividerPosition) {
            const overlapAmount = dividerPosition - currentX;
            const overlapPercent = Math.min(Math.max((overlapAmount / noteWidth) * 100, 0), 100);

            showCounterpartWithClipping(portalCounterpart, `inset(0 ${100 - overlapPercent}% 0 0)`);
        } else {
            hideCounterpart(portalCounterpart);
        }
    } catch (error) {
        console.warn('Error in right to left crossing:', error);
        hideCounterpart(portalCounterpart);
    }
}

/**
 * Show counterpart with clipping effect
 * @param {HTMLElement} portalCounterpart - The portal counterpart
 * @param {string} clipPathValue - CSS clip-path value
 */
function showCounterpartWithClipping(portalCounterpart, clipPathValue) {
    if (!portalCounterpart) return;

    try {
        portalCounterpart.style.opacity = "1";
        portalCounterpart.classList.add('portal-active');
        portalCounterpart.classList.add('crossing-divider');
        portalCounterpart.classList.remove('hollow');

        const borderElement = portalCounterpart.querySelector('.note-border');
        const fillElement = portalCounterpart.querySelector('.note-fill');

        if (borderElement) borderElement.style.clipPath = clipPathValue;
        if (fillElement) fillElement.style.clipPath = clipPathValue;
    } catch (error) {
        console.warn('Error showing counterpart with clipping:', error);
    }
}

/**
 * Hide a portal counterpart with validation
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 */
export function hideCounterpart(portalCounterpart) {
    if (!portalCounterpart) return;

    try {
        portalCounterpart.style.opacity = "0";
        portalCounterpart.classList.remove('portal-active');
        portalCounterpart.classList.add('hollow');
        portalCounterpart.classList.remove('crossing-divider');

        const borderElement = portalCounterpart.querySelector('.note-border');
        const fillElement = portalCounterpart.querySelector('.note-fill');

        if (borderElement) borderElement.style.clipPath = "";
        if (fillElement) fillElement.style.clipPath = "";
    } catch (error) {
        console.warn('Error hiding counterpart:', error);
    }
}

/**
 * Create all portal counterparts for notes with validation
 * @param {NodeList} notes - Collection of note elements
 * @param {Object} elements - DOM elements
 */
export function createAllPortalCounterparts(notes, elements) {
    if (!notes || !validateElements(elements)) {
        console.warn('Invalid parameters for creating portal counterparts');
        return;
    }

    notes.forEach(note => {
        try {
            const noteNumber = parseInt(note.getAttribute('data-note'));
            const player = note.getAttribute('data-player');

            if (isNaN(noteNumber) || !['a', 'b'].includes(player)) {
                console.warn('Invalid note data for counterpart creation');
                return;
            }

            createPortalCounterpart(note, noteNumber, player, elements);
        } catch (error) {
            console.warn('Error creating counterpart for note:', error);
        }
    });
}

/**
 * Create a portal counterpart for a note with improved validation
 * @param {HTMLElement} noteElement - The original note element
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Object} elements - DOM elements
 * @returns {HTMLElement|null} The portal counterpart element or null
 */
export function createPortalCounterpart(noteElement, noteNumber, player, elements) {
    if (!noteElement || !['a', 'b'].includes(player) || !validateElements(elements)) {
        console.warn('Invalid parameters for portal counterpart creation');
        return null;
    }

    if (isNaN(noteNumber)) {
        console.warn('Invalid note number for counterpart creation');
        return null;
    }

    try {
        const oppositePlayer = player === 'a' ? 'b' : 'a';
        const shapeClass = getShapeForNote(noteNumber);

        const portalCounterpart = document.createElement('div');
        portalCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
        portalCounterpart.setAttribute('data-note', noteNumber);
        portalCounterpart.setAttribute('data-counterpart-for', player);

        // Create DOM structure safely
        const borderElement = document.createElement('div');
        borderElement.className = 'note-border';
        portalCounterpart.appendChild(borderElement);

        const fillElement = document.createElement('div');
        fillElement.className = 'note-fill';
        portalCounterpart.appendChild(fillElement);

        const counterpartTextSpan = document.createElement('span');
        counterpartTextSpan.textContent = noteNumber;
        portalCounterpart.appendChild(counterpartTextSpan);

        // Copy visual nested indicators
        copyVisualIndicatorsToCounterpart(noteElement, portalCounterpart);

        // Set up linking
        const counterpartId = `counterpart-${player}-${noteNumber}`;
        noteElement.setAttribute('data-counterpart-id', counterpartId);
        portalCounterpart.id = counterpartId;

        // Position counterpart at same location
        portalCounterpart.style.left = noteElement.style.left || '0px';
        portalCounterpart.style.top = noteElement.style.top || '0px';
        portalCounterpart.style.opacity = "0";

        // Add to appropriate container
        const targetContainer = player === 'a' ? elements.playerBSide : elements.playerASide;
        targetContainer.appendChild(portalCounterpart);

        return portalCounterpart;
    } catch (error) {
        console.error('Error creating portal counterpart:', error);
        return null;
    }
}

/**
 * Copy visual indicators to portal counterparts with validation
 * @param {HTMLElement} originalNote - Original note element
 * @param {HTMLElement} portalCounterpart - Portal counterpart element
 */
function copyVisualIndicatorsToCounterpart(originalNote, portalCounterpart) {
    if (!originalNote || !portalCounterpart) return;

    try {
        const visualIndicators = originalNote.querySelectorAll('.nested-visual');

        visualIndicators.forEach(indicator => {
            try {
                const indicatorClone = indicator.cloneNode(true);
                portalCounterpart.appendChild(indicatorClone);
            } catch (error) {
                console.warn('Error cloning visual indicator:', error);
            }
        });

        if (originalNote.classList.contains('has-nested-child')) {
            portalCounterpart.classList.add('has-nested-child');
        }
    } catch (error) {
        console.warn('Error copying visual indicators to counterpart:', error);
    }
}

/**
 * Update portal counterpart visual indicators with validation
 * @param {number} noteNumber - Note number
 * @param {string} player - Player identifier
 * @param {Object} elements - DOM elements
 */
export function updatePortalCounterpartIndicators(noteNumber, player, elements) {
    if (isNaN(noteNumber) || !['a', 'b'].includes(player) || !validateElements(elements)) {
        console.warn('Invalid parameters for updating counterpart indicators');
        return;
    }

    try {
        const counterpartId = `counterpart-${player}-${noteNumber}`;
        const portalCounterpart = document.getElementById(counterpartId);
        const originalNote = document.querySelector(`[data-note="${noteNumber}"][data-player="${player}"]:not(.portal-counterpart):not(.nested-visual)`);

        if (!portalCounterpart || !originalNote) {
            console.warn('Could not find counterpart or original note for indicator update');
            return;
        }

        // Remove existing visual indicators
        const existingIndicators = portalCounterpart.querySelectorAll('.nested-visual');
        existingIndicators.forEach(indicator => {
            try {
                indicator.remove();
            } catch (error) {
                console.warn('Error removing visual indicator:', error);
            }
        });

        // Remove has-nested-child class
        portalCounterpart.classList.remove('has-nested-child');

        // Copy current visual indicators from original
        copyVisualIndicatorsToCounterpart(originalNote, portalCounterpart);
    } catch (error) {
        console.warn('Error updating counterpart indicators:', error);
    }
}

/**
 * Reset all portal effects with cleanup
 * @param {Object} elements - DOM elements
 */
export function resetPortalEffects(elements) {
    try {
        // Reset crossover detection
        crossOverDetection.isActive = false;
        crossOverDetection.currentArea = null;

        // Hide all portal counterparts
        const counterparts = document.querySelectorAll('.portal-counterpart');
        counterparts.forEach(counterpart => {
            hideCounterpart(counterpart);
        });
    } catch (error) {
        console.warn('Error resetting portal effects:', error);
    }
}

/**
 * Cleanup portal effects for page unload
 */
export function cleanupPortalEffects() {
    try {
        resetPortalEffects();

        // Clear global state
        crossOverDetection.isActive = false;
        crossOverDetection.currentArea = null;
    } catch (error) {
        console.warn('Error cleaning up portal effects:', error);
    }
}