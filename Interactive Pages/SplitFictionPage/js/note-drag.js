// note-drag.js - Handles note dragging and dropping with improved error handling and nested visibility logic

import { addNoteToCell, removeNoteFromCell } from './sequencer.js';
import { getShapeForNote, updateVisibilityAfterExtraction } from './notes.js';
import {
    updatePortalEffectsDuringDrag,
    hideCounterpart,
    createPortalCounterpart
} from './portal-effects.js';

// Global dragging state - kept for compatibility but with validation
let activeNote = null;
let offsetX = 0;
let offsetY = 0;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let isAnimating = false;
let animationFrameId = null;
let globalElements = null;
let globalState = null;

// Movement speed factors
const MOVEMENT_SPEED = 0.1;
const MIN_DISTANCE_THRESHOLD = 0;

/**
 * Validate global references are set
 * @returns {boolean} Whether globals are valid
 */
function validateGlobals() {
    return globalElements &&
        globalState &&
        globalElements.appContainer &&
        globalElements.divider;
}

/**
 * Check if a note has nested children
 * @param {number} noteNumber - The note number to check
 * @returns {boolean} Whether the note has nested children
 */
function hasNestedChildren(noteNumber) {
    // Only check current relationships, ignore static config
    return globalState.nestedRelationships &&
        Object.values(globalState.nestedRelationships).includes(noteNumber);
}

/**
 * Hide visual nested children when drag starts
 * @param {HTMLElement} element - The note element being dragged
 */
function hideVisualNestedChildren(element) {
    if (!element) return;

    try {
        const visualIndicators = element.querySelectorAll('.nested-visual');
        visualIndicators.forEach(indicator => {
            indicator.style.display = 'none';
        });
    } catch (error) {
        console.warn('Error hiding visual nested children:', error);
    }
}

/**
 * Show/hide visual nested children based on current side vs their native side
 * @param {HTMLElement} element - The note element
 * @param {string} currentSide - Current side ('a' or 'b')
 */
function updateVisualNestedChildrenVisibility(element, currentSide) {
    if (!element || !globalElements.config) return;

    try {
        const noteNumber = parseInt(element.getAttribute('data-note'));
        if (isNaN(noteNumber)) return;

        // Determine the note's TRUE native screen from config
        const noteNativeScreen = globalElements.config.playerANotes.includes(noteNumber) ? 'a' : 'b';

        const visualIndicators = element.querySelectorAll('.nested-visual');
        visualIndicators.forEach(indicator => {
            try {
                const nestedNoteNumber = parseInt(indicator.getAttribute('data-note'));
                if (isNaN(nestedNoteNumber)) return;

                // Nested item's native screen is opposite of parent's native screen
                const nestedNativeScreen = noteNativeScreen === 'a' ? 'b' : 'a';

                // Show if current side is opposite of nested item's native screen
                // Hide if current side is same as nested item's native screen
                const shouldShow = currentSide !== nestedNativeScreen;
                indicator.style.display = shouldShow ? '' : 'none';
            } catch (error) {
                console.warn('Error updating individual visual indicator:', error);
            }
        });
    } catch (error) {
        console.warn('Error updating visual nested children visibility:', error);
    }
}

/**
 * Make an element draggable with click/touch
 * @param {HTMLElement} element - The element to make draggable
 */
export function makeClickDraggable(element) {
    if (!element) {
        console.warn('Cannot make null element draggable');
        return;
    }

    const startDrag = function (e) {
        if (!validateGlobals()) {
            console.warn('Global references not properly initialized');
            return;
        }

        try {
            e.preventDefault();

            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                console.warn('Element has no dimensions, cannot drag');
                return;
            }

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            currentX = rect.left;
            currentY = rect.top;
            targetX = currentX;
            targetY = currentY;

            const noteNumber = parseInt(element.getAttribute('data-note'));
            if (isNaN(noteNumber)) {
                console.warn('Element missing valid data-note attribute');
                return;
            }

            // Check if this nested object is being extracted
            if (globalState.nestedRelationships && globalState.nestedRelationships[noteNumber]) {
                extractFromParent(noteNumber);
            }

            // Hide visual nested children when drag starts
            hideVisualNestedChildren(element);

            // Set as active element
            activeNote = element;
            element.classList.add('dragging');
            element.classList.remove('hollow');

            // Set dragging state for other functions
            globalState.draggedNote = element;
            globalState.draggedNoteData = {
                note: noteNumber,
                player: element.getAttribute('data-player') || 'a'
            };

            element.style.zIndex = '30';
            globalElements.appContainer.classList.add('dragging-active');

            // Start the animation loop if not already running
            if (!isAnimating) {
                isAnimating = true;
                animateMovement();
            }
        } catch (error) {
            console.error('Error starting drag:', error);
        }
    };

    // Event listeners with error handling
    element.addEventListener('mousedown', startDrag);

    element.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length !== 1) return;

        try {
            const touch = e.touches[0];
            startDrag({
                preventDefault: () => e.preventDefault(),
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        } catch (error) {
            console.error('Error in touch start:', error);
        }
    });
}

/**
 * Extract nested object from parent with validation
 * @param {number} nestedNoteNumber - The nested note number to extract
 */
function extractFromParent(nestedNoteNumber) {
    if (!globalState.nestedRelationships) {
        console.warn('No nested relationships available');
        return;
    }

    try {
        const parentNoteNumber = globalState.nestedRelationships[nestedNoteNumber];
        if (!parentNoteNumber) return;

        // Remove visual indicator from parent
        const parentNotes = document.querySelectorAll(`[data-note="${parentNoteNumber}"]:not(.nested-visual)`);
        parentNotes.forEach(parentNote => {
            try {
                const visualIndicator = parentNote.querySelector(`.nested-visual[data-note="${nestedNoteNumber}"]`);
                if (visualIndicator) {
                    parentNote.removeChild(visualIndicator);

                    if (!parentNote.querySelector('.nested-visual')) {
                        parentNote.classList.remove('has-nested-child');
                    }
                }
            } catch (error) {
                console.warn('Error removing visual indicator:', error);
            }
        });

        // Remove from nested relationships
        delete globalState.nestedRelationships[nestedNoteNumber];

        // Make nested object visible and draggable
        const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);
        nestedObjects.forEach(note => {
            note.classList.remove('nested-hidden');
        });

        // Use imported function to update visibility after extraction
        if (globalElements.config) {
            updateVisibilityAfterExtraction(nestedNoteNumber, globalElements.config);
        }
    } catch (error) {
        console.error('Error extracting from parent:', error);
    }
}

/**
 * Set up note drag events on document with validation
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 */
export function setupNoteDragEvents(elements, state, config) {
    if (!elements || !state || !config) {
        console.error('Missing required parameters for setupNoteDragEvents');
        return;
    }

    globalElements = elements;
    globalState = state;
    globalElements.config = config;

    try {
        // Global document mouse move
        document.addEventListener('mousemove', function (e) {
            if (activeNote) {
                targetX = e.clientX - offsetX;
                targetY = e.clientY - offsetY;
            }
        });

        // Touch move
        document.addEventListener('touchmove', function (e) {
            if (activeNote && e.touches && e.touches.length === 1) {
                const touch = e.touches[0];
                targetX = touch.clientX - offsetX;
                targetY = touch.clientY - offsetY;
                e.preventDefault();
            }
        });

        // Mouse up - drop the element
        document.addEventListener('mouseup', function (e) {
            if (activeNote) {
                try {
                    dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
                } catch (error) {
                    console.error('Error during mouse up drop:', error);
                }
            }
        });

        // Touch end
        document.addEventListener('touchend', function (e) {
            if (activeNote) {
                try {
                    dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
                } catch (error) {
                    console.error('Error during touch end drop:', error);
                }
            }
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);

    } catch (error) {
        console.error('Error setting up note drag events:', error);
    }
}

/**
 * Animate the movement of the active note - PRESERVING CRITICAL NESTED VISIBILITY LOGIC
 */
function animateMovement() {
    if (!isAnimating || !activeNote) {
        isAnimating = false;
        return;
    }

    try {
        // Calculate distance to target
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        if (Math.abs(dx) < MIN_DISTANCE_THRESHOLD && Math.abs(dy) < MIN_DISTANCE_THRESHOLD) {
            currentX = targetX;
            currentY = targetY;
        } else {
            currentX += dx * MOVEMENT_SPEED;
            currentY += dy * MOVEMENT_SPEED;
        }

        // Update the position of the active note
        activeNote.style.left = `${currentX}px`;
        activeNote.style.top = `${currentY}px`;

        // Update positions of linked nested objects
        updateLinkedNestedPositions();

        // Get the portal counterpart
        const counterpartId = activeNote.getAttribute('data-counterpart-id');
        const portalCounterpart = counterpartId ? document.getElementById(counterpartId) : null;

        if (portalCounterpart) {
            portalCounterpart.style.left = `${currentX}px`;
            portalCounterpart.style.top = `${currentY}px`;

            if (validateGlobals()) {
                updatePortalEffectsDuringDrag(portalCounterpart, currentX, activeNote, globalElements);
            }
        }

        // Get note dimensions for center calculation
        const rect = activeNote.getBoundingClientRect();
        const noteSide = checkNoteSide(currentX + rect.width / 2);

        // CRITICAL NESTED VISIBILITY LOGIC - PRESERVED FROM ORIGINAL
        if (globalState.draggedNoteData && globalState.draggedNoteData.player !== noteSide) {
            globalState.draggedNoteData.player = noteSide;

            // Handle nested object visibility when crossing screens
            const activeNoteNumber = parseInt(activeNote.getAttribute('data-note'));

            if (globalElements.config && globalElements.config.playerANotes && globalElements.config.playerBNotes) {
                // Determine the note's TRUE native screen from config
                const activeNoteNativeScreen = globalElements.config.playerANotes.includes(activeNoteNumber) ? 'a' : 'b';

                // Check if this note has nested items
                if (globalElements.config.nestedItems && globalElements.config.nestedItems[activeNoteNumber]) {
                    const nestedItems = globalElements.config.nestedItems[activeNoteNumber];

                    nestedItems.forEach(nestedNoteNumber => {
                        try {
                            // Determine the nested item's native screen (opposite of its parent's TRUE native screen)
                            const nestedItemNativeScreen = activeNoteNativeScreen === 'a' ? 'b' : 'a';

                            // If we're moving TO the nested item's native screen, hide it
                            // If we're moving AWAY from the nested item's native screen, show it
                            const shouldHide = noteSide === nestedItemNativeScreen;

                            // Handle actual nested objects that are following
                            const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual):not(.note-in-cell)`);
                            nestedObjects.forEach(nestedObject => {
                                // Only handle objects that are still linked (not extracted)
                                if (globalState.nestedRelationships && globalState.nestedRelationships[nestedNoteNumber] === activeNoteNumber) {
                                    if (shouldHide) {
                                        nestedObject.style.display = 'none';
                                    } else {
                                        // Only show if not multi-level nested
                                        if (!nestedObject.classList.contains('nested-hidden')) {
                                            nestedObject.style.display = '';
                                        }
                                    }
                                }
                            });
                        } catch (error) {
                            console.warn(`Error handling nested visibility for note ${nestedNoteNumber}:`, error);
                        }
                    });
                }
            }
        }

        // Check if over any sequencer cell
        checkDropTargets(currentX + rect.width / 2, currentY + rect.height / 2);

        // Continue the animation loop
        animationFrameId = requestAnimationFrame(animateMovement);
    } catch (error) {
        console.error('Error in animation movement:', error);
        isAnimating = false;
    }
}

/**
 * Update positions of linked nested objects
 */
function updateLinkedNestedPositions() {
    if (!activeNote || !globalState.nestedRelationships) return;

    try {
        const activeNoteNumber = parseInt(activeNote.getAttribute('data-note'));

        Object.entries(globalState.nestedRelationships).forEach(([nestedNoteStr, parentNoteNumber]) => {
            if (parentNoteNumber === activeNoteNumber) {
                const nestedNoteNumber = parseInt(nestedNoteStr);
                const nestedObjects = document.querySelectorAll(`[data-note="${nestedNoteNumber}"]:not(.nested-visual)`);

                nestedObjects.forEach(nestedObject => {
                    nestedObject.style.left = `${currentX}px`;
                    nestedObject.style.top = `${currentY}px`;

                    const counterpartId = nestedObject.getAttribute('data-counterpart-id');
                    const portalCounterpart = counterpartId ? document.getElementById(counterpartId) : null;
                    if (portalCounterpart) {
                        portalCounterpart.style.left = `${currentX}px`;
                        portalCounterpart.style.top = `${currentY}px`;
                    }
                });
            }
        });
    } catch (error) {
        console.warn('Error updating linked nested positions:', error);
    }
}

/**
 * Check which side of the divider a position is on
 * @param {number} x - The x-coordinate
 * @returns {string} The side ('a' or 'b')
 */
export function checkNoteSide(x) {
    if (!validateGlobals()) {
        return 'a'; // Default fallback
    }

    try {
        const dividerPosition = parseInt(globalElements.divider.style.left);
        if (isNaN(dividerPosition)) {
            console.warn('Invalid divider position');
            return 'a';
        }
        return x < dividerPosition ? 'a' : 'b';
    } catch (error) {
        console.warn('Error checking note side:', error);
        return 'a';
    }
}

/**
 * Check if the dragged note is over a valid drop target
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function checkDropTargets(x, y) {
    if (!globalState.draggedNote) return;

    try {
        const cells = document.querySelectorAll('.sequencer-cell');
        cells.forEach(cell => cell.classList.remove('drag-over'));

        cells.forEach(cell => {
            try {
                const rect = cell.getBoundingClientRect();
                const inBounds = (
                    x >= rect.left &&
                    x <= rect.right &&
                    y >= rect.top &&
                    y <= rect.bottom
                );

                if (inBounds && isValidDropTarget(cell)) {
                    cell.classList.add('drag-over');
                }
            } catch (error) {
                console.warn('Error checking drop target:', error);
            }
        });
    } catch (error) {
        console.warn('Error in checkDropTargets:', error);
    }
}

/**
 * Check if a cell is a valid drop target - FORBIDS NOTES WITH NESTED CHILDREN
 * @param {HTMLElement} cell - The cell element
 * @returns {boolean} Whether the cell is a valid drop target
 */
function isValidDropTarget(cell) {
    if (!globalState.draggedNoteData || !cell) return false;

    try {
        const cellPlayer = cell.getAttribute('data-player');
        const notePlayer = globalState.draggedNoteData.player;
        const cellPosition = parseInt(cell.getAttribute('data-position'));
        const noteNumber = globalState.draggedNoteData.note;

        // Check basic drop rules
        const basicRulesValid = cellPlayer === notePlayer && noteNumber === cellPosition;
        if (!basicRulesValid) return false;

        // FORBID dropping notes with nested children
        if (hasNestedChildren(noteNumber)) {
            return false;
        }

        return true;
    } catch (error) {
        console.warn('Error validating drop target:', error);
        return false;
    }
}

/**
 * Drop the active note
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function dropActiveNote(x, y) {
    try {
        // Stop the animation
        isAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        const dropCell = document.querySelector('.sequencer-cell.drag-over');
        const counterpartId = activeNote ? activeNote.getAttribute('data-counterpart-id') : null;
        const portalCounterpart = counterpartId ? document.getElementById(counterpartId) : null;

        if (dropCell) {
            handleDrop(dropCell);
        } else if (x && y) {
            if (activeNote) {
                activeNote.classList.add('hollow');
            }
            handleCrossSideDrop(x, y);
        }

        // Reset active note appearance
        if (activeNote) {
            activeNote.style.zIndex = '5';
        }

        // Hide portal counterpart
        if (portalCounterpart) {
            hideCounterpart(portalCounterpart);
        }

        // Remove dragging class
        if (activeNote) {
            activeNote.classList.remove('dragging');
        }
        activeNote = null;

        // Clear drag state
        if (globalState) {
            globalState.draggedNote = null;
            globalState.draggedNoteData = null;
        }

        // Remove highlights
        const cells = document.querySelectorAll('.sequencer-cell');
        cells.forEach(cell => cell.classList.remove('drag-over'));

        // Remove dragging-active class
        if (globalElements && globalElements.appContainer) {
            globalElements.appContainer.classList.remove('dragging-active');
        }
    } catch (error) {
        console.error('Error dropping active note:', error);
    }
}

/**
 * Handle dropping a note on the opposite side - WITH NEW VISUAL NESTED CHILDREN LOGIC
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 */
function handleCrossSideDrop(x, y) {
    if (!activeNote || !validateGlobals()) return;

    try {
        const player = checkNoteSide(x);
        const noteNumber = parseInt(activeNote.getAttribute('data-note'));
        const originalPlayer = activeNote.getAttribute('data-player');

        if (player !== originalPlayer) {
            // Update the note to reflect its new side
            activeNote.setAttribute('data-player', player);
            activeNote.classList.remove(`note-${originalPlayer}`);
            activeNote.classList.add(`note-${player}`);

            // Move to appropriate container
            const targetContainer = player === 'a' ? globalElements.playerASide : globalElements.playerBSide;

            if (activeNote.parentNode) {
                activeNote.parentNode.removeChild(activeNote);
            }
            targetContainer.appendChild(activeNote);

            // Handle portal counterpart
            const counterpartId = activeNote.getAttribute('data-counterpart-id');
            const portalCounterpart = counterpartId ? document.getElementById(counterpartId) : null;

            if (portalCounterpart && portalCounterpart.parentNode) {
                portalCounterpart.parentNode.removeChild(portalCounterpart);
            }

            // Create new portal counterpart
            createPortalCounterpart(activeNote, noteNumber, player, globalElements);
            activeNote.setAttribute('data-counterpart-id', `counterpart-${player}-${noteNumber}`);
        }

        // Update visual nested children visibility based on new side
        updateVisualNestedChildrenVisibility(activeNote, player);

    } catch (error) {
        console.error('Error handling cross side drop:', error);
    }
}

/**
 * Handle dropping a note on a cell - HIDES ALL VISUAL CHILDREN
 * @param {HTMLElement} cell - The cell element
 */
function handleDrop(cell) {
    if (!globalState.draggedNoteData) return;

    try {
        isAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        const position = parseInt(cell.getAttribute('data-position'));
        const player = cell.getAttribute('data-player');
        const noteNumber = globalState.draggedNoteData.note;

        removeNoteFromCell(cell, globalState);
        addNoteToCell(cell, noteNumber, player, getShapeForNote, globalState);

        const draggedNote = globalState.draggedNote;
        if (draggedNote) {
            const counterpartId = draggedNote.getAttribute('data-counterpart-id');
            const portalCounterpart = counterpartId ? document.getElementById(counterpartId) : null;

            if (portalCounterpart && portalCounterpart.parentNode) {
                portalCounterpart.parentNode.removeChild(portalCounterpart);
            }

            if (draggedNote.parentNode) {
                draggedNote.parentNode.removeChild(draggedNote);
            }
        }
    } catch (error) {
        console.error('Error handling drop:', error);
    }
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
    try {
        isAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Clear global state
        activeNote = null;
        globalElements = null;
        globalState = null;

        console.log('Note drag cleanup completed');
    } catch (error) {
        console.error('Error during note drag cleanup:', error);
    }
}