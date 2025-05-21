// note-drag.js - Handles note dragging and dropping

import { addNoteToCell, removeNoteFromCell } from './sequencer.js';
import { getShapeForNote } from './notes.js';

// Global dragging state
let activeNote = null;
let offsetX = 0;
let offsetY = 0;
let targetX = 0;  // Target position for smooth movement
let targetY = 0;
let currentX = 0; // Current position during animation
let currentY = 0;
let isAnimating = false;
let animationFrameId = null;
let globalElements = null; // Reference to the elements object
let globalState = null;    // Reference to the state object

// Movement speed factors
const MOVEMENT_SPEED = 0.1; // Adjust this value to control speed
const MIN_DISTANCE_THRESHOLD = 0;

/**
 * Make an element draggable with click/touch
 * @param {HTMLElement} element - The element to make draggable
 */
export function makeClickDraggable(element) {
    // Event handler for starting a drag operation
    const startDrag = function (e) {
        e.preventDefault(); // Prevent default browser drag

        // Get offset within the element
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Initialize current position
        currentX = rect.left;
        currentY = rect.top;

        // Set initial target (same as current)
        targetX = currentX;
        targetY = currentY;

        // Set as active element
        activeNote = element;
        element.classList.add('dragging');

        // Fill the shape by removing hollow class
        element.classList.remove('hollow');

        // Set dragging state for other functions
        globalState.draggedNote = element;
        globalState.draggedNoteData = {
            note: parseInt(element.getAttribute('data-note')),
            player: element.getAttribute('data-player')
        };

        // Set high z-index to be above all panels
        element.style.zIndex = '30';

        // Add dragging class to container to disable pointer events
        globalElements.appContainer.classList.add('dragging-active');

        // Start the animation loop if not already running
        if (!isAnimating) {
            isAnimating = true;
            animateMovement();
        }
    };

    // Pick up on first click or touch
    element.addEventListener('mousedown', startDrag);

    // Touch version
    element.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        startDrag({
            preventDefault: () => e.preventDefault(),
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });
}

/**
 * Set up note drag events on document
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 */
export function setupNoteDragEvents(elements, state) {
    // Store references to elements and state for global access
    globalElements = elements;
    globalState = state;

    // Global document mouse move
    document.addEventListener('mousemove', function (e) {
        if (activeNote) {
            // Update the target position (where the note should move to)
            targetX = e.clientX - offsetX;
            targetY = e.clientY - offsetY;
        }
    });

    // Touch move
    document.addEventListener('touchmove', function (e) {
        if (activeNote) {
            const touch = e.touches[0];
            // Update the target position (where the note should move to)
            targetX = touch.clientX - offsetX;
            targetY = touch.clientY - offsetY;
            e.preventDefault(); // Prevent scrolling
        }
    });

    // Mouse up - drop the element
    document.addEventListener('mouseup', function (e) {
        if (activeNote) {
            dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
        }
    });

    // Touch end
    document.addEventListener('touchend', function (e) {
        if (activeNote) {
            dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
        }
    });
}

/**
 * Animate the movement of the active note
 */
function animateMovement() {
    if (!isAnimating || !activeNote) {
        isAnimating = false;
        return;
    }

    // Calculate distance to target
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    // Check if movement is small enough to stop
    if (Math.abs(dx) < MIN_DISTANCE_THRESHOLD && Math.abs(dy) < MIN_DISTANCE_THRESHOLD) {
        // Just set to exact target
        currentX = targetX;
        currentY = targetY;
    } else {
        // Move a percentage of the distance to the target (smooth follow)
        currentX += dx * MOVEMENT_SPEED;
        currentY += dy * MOVEMENT_SPEED;
    }

    // Update the position of the active note
    activeNote.style.left = `${currentX}px`;
    activeNote.style.top = `${currentY}px`;

    // Get the portal counterpart
    const counterpartId = activeNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    if (portalCounterpart) {
        // Update position of counterpart
        portalCounterpart.style.left = `${currentX}px`;
        portalCounterpart.style.top = `${currentY}px`;

        // Handle portal effects
        updatePortalEffects(portalCounterpart, currentX, activeNote);
    }

    // Get note dimensions for center calculation
    const rect = activeNote.getBoundingClientRect();

    // Check which side the note is on for drop targeting
    const noteSide = checkNoteSide(currentX + rect.width / 2);

    // Check if over any sequencer cell - based on the NOTE'S actual position
    checkDropTargets(currentX + rect.width / 2, currentY + rect.height / 2);

    // Continue the animation loop
    animationFrameId = requestAnimationFrame(animateMovement);
}

/**
 * Update portal effects when crossing boundary
 * @param {HTMLElement} portalCounterpart - The portal counterpart element
 * @param {number} currentX - Current X position
 * @param {HTMLElement} activeNote - The active note
 */
function updatePortalEffects(portalCounterpart, currentX, activeNote) {
    // Get divider position
    const dividerPosition = parseInt(globalElements.divider.style.left);

    // Get note dimensions
    const noteRect = activeNote.getBoundingClientRect();
    const noteWidth = noteRect.width;

    // Get original player side
    const originalSide = activeNote.getAttribute('data-player');

    // Check if the active note is a triangle
    const isTriangle = activeNote.classList.contains('shape-triangle');

    // Check if crossing the divider
    if (originalSide === 'a') {
        // Handle crossing from left to right
        if (currentX + noteWidth > dividerPosition) {
            const overlapAmount = currentX + noteWidth - dividerPosition;
            const overlapPercent = (overlapAmount / noteWidth) * 100;

            // Special handling for triangles
            if (isTriangle) {
                portalCounterpart.style.opacity = overlapPercent > 10 ? "1" : "0";
                portalCounterpart.classList.add('portal-active');
                portalCounterpart.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';
                portalCounterpart.classList.remove('hollow');
            } else {
                portalCounterpart.style.opacity = "1";
                portalCounterpart.style.clipPath = `inset(0 0 0 ${100 - overlapPercent}%)`;
                portalCounterpart.classList.add('portal-active');
                portalCounterpart.classList.remove('hollow');
            }
        } else {
            // Not crossing, hide counterpart
            hideCounterpart(portalCounterpart, isTriangle);
        }
    } else { // originalSide === 'b'
        // Handle crossing from right to left
        if (currentX < dividerPosition) {
            const overlapAmount = dividerPosition - currentX;
            const overlapPercent = (overlapAmount / noteWidth) * 100;

            // Special handling for triangles
            if (isTriangle) {
                portalCounterpart.style.opacity = overlapPercent > 10 ? "1" : "0";
                portalCounterpart.classList.add('portal-active');
                portalCounterpart.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)';
                portalCounterpart.classList.remove('hollow');
            } else {
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
 * Check which side of the divider a position is on
 * @param {number} x - The x-coordinate
 * @returns {string} The side ('a' or 'b')
 */
export function checkNoteSide(x) {
    const dividerPosition = parseInt(globalElements.divider.style.left);
    return x < dividerPosition ? 'a' : 'b';
}

/**
 * Check if the dragged note is over a valid drop target
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function checkDropTargets(x, y) {
    if (!globalState.draggedNote) return;

    // Remove highlight from all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => cell.classList.remove('drag-over'));

    // Check if the note is over any cell
    cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        const inBounds = (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );

        // If in bounds and a valid target, highlight the cell
        if (inBounds) {
            const validTarget = isValidDropTarget(cell);
            if (validTarget) {
                cell.classList.add('drag-over');
            }
        }
    });
}

/**
 * Check if a cell is a valid drop target for the current dragged note
 * @param {HTMLElement} cell - The cell element
 * @returns {boolean} Whether the cell is a valid drop target
 */
function isValidDropTarget(cell) {
    if (!globalState.draggedNoteData) return false;

    const cellPlayer = cell.getAttribute('data-player');
    const notePlayer = globalState.draggedNoteData.player;
    const cellPosition = parseInt(cell.getAttribute('data-position'));
    const noteNumber = globalState.draggedNoteData.note;

    // Notes can only be dropped in cells belonging to the same player
    // AND the note number must match the cell position
    return cellPlayer === notePlayer && noteNumber === cellPosition;
}

/**
 * Drop the active note
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function dropActiveNote(x, y) {
    // Stop the animation
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Check for drop on a cell
    const dropCell = document.querySelector('.sequencer-cell.drag-over');

    // Get the portal counterpart
    const counterpartId = activeNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    if (dropCell) {
        // Note is dropped on a cell - keep it filled
        handleDrop(dropCell);
    } else if (x && y) {
        // Return to hollow state when not dropped on a cell
        activeNote.classList.add('hollow');

        // Handle possibly dropping on opposite side
        handleCrossSideDrop(x, y);
    }

    // Reset active note appearance
    activeNote.style.zIndex = '5';

    // Hide portal counterpart
    if (portalCounterpart) {
        portalCounterpart.classList.remove('portal-active');
        portalCounterpart.classList.add('hollow');
    }

    // Remove dragging class
    activeNote.classList.remove('dragging');
    activeNote = null;

    // Clear drag state
    globalState.draggedNote = null;
    globalState.draggedNoteData = null;

    // Remove highlight from all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => cell.classList.remove('drag-over'));

    // Remove dragging-active class from container
    globalElements.appContainer.classList.remove('dragging-active');
}

/**
 * Handle dropping a note on the opposite side
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function handleCrossSideDrop(x, y) {
    // Get divider position
    const dividerPosition = parseInt(globalElements.divider.style.left);

    // Note is dropped outside a cell - let it stay where it was dropped
    const player = checkNoteSide(x);
    const noteNumber = parseInt(activeNote.getAttribute('data-note'));
    const originalPlayer = activeNote.getAttribute('data-player');

    // If dropped on the opposite side, update the note's player attribute
    if (player !== originalPlayer) {
        // Update the note to reflect its new side
        activeNote.setAttribute('data-player', player);
        activeNote.classList.remove(`note-${originalPlayer}`);
        activeNote.classList.add(`note-${player}`);

        // Move the note to the appropriate container
        const targetContainer = player === 'a' ? globalElements.playerASide : globalElements.playerBSide;

        // Remove from current container and add to target container
        if (activeNote.parentNode) {
            activeNote.parentNode.removeChild(activeNote);
        }
        targetContainer.appendChild(activeNote);

        // Get the portal counterpart
        const counterpartId = activeNote.getAttribute('data-counterpart-id');
        const portalCounterpart = document.getElementById(counterpartId);

        // Remove the portal counterpart from its container
        if (portalCounterpart && portalCounterpart.parentNode) {
            portalCounterpart.parentNode.removeChild(portalCounterpart);
        }

        // Create a new portal counterpart for the transferred note
        const oppositePlayer = player === 'a' ? 'b' : 'a';
        const shapeClass = getShapeForNote(noteNumber);
        const newCounterpart = document.createElement('div');
        newCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
        newCounterpart.setAttribute('data-note', noteNumber);
        newCounterpart.setAttribute('data-counterpart-for', player);
        newCounterpart.id = `counterpart-${player}-${noteNumber}`;

        // Add span for text
        const textSpan = document.createElement('span');
        textSpan.textContent = noteNumber;
        newCounterpart.appendChild(textSpan);

        newCounterpart.style.left = activeNote.style.left;
        newCounterpart.style.top = activeNote.style.top;

        // Add the new portal counterpart to the opposite side
        const counterpartContainer = player === 'a' ? globalElements.playerBSide : globalElements.playerASide;
        counterpartContainer.appendChild(newCounterpart);

        // Update the link in the original note
        activeNote.setAttribute('data-counterpart-id', `counterpart-${player}-${noteNumber}`);
    }
}

/**
 * Handle dropping a note on a cell
 * @param {HTMLElement} cell - The cell element
 */
function handleDrop(cell) {
    if (!globalState.draggedNoteData) return;

    // Stop the animation
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const position = parseInt(cell.getAttribute('data-position'));
    const player = cell.getAttribute('data-player');
    const noteNumber = globalState.draggedNoteData.note;

    // Remove existing note in this cell if any
    removeNoteFromCell(cell, globalState);

    // Add the new note to the cell
    addNoteToCell(cell, noteNumber, player, getShapeForNote, globalState);

    // Move the original note to the appropriate side based on the drop position
    const draggedNote = globalState.draggedNote;

    // Get the portal counterpart
    const counterpartId = draggedNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    // Remove the portal counterpart if it exists
    if (portalCounterpart && portalCounterpart.parentNode) {
        portalCounterpart.parentNode.removeChild(portalCounterpart);
    }

    // Remove the dragged note from wherever it is
    if (draggedNote.parentNode) {
        draggedNote.parentNode.removeChild(draggedNote);
    }
}