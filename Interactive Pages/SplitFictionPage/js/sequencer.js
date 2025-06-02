// sequencer.js - Handles sequencer grid creation with layered audio system

import { enableNote, disableNote, startLayeredPlayback, stopLayeredPlayback, hasEnabledNotes } from './audio.js';
import { startSynchronizedPulse, stopSynchronizedPulse, activateSpecialEffect, deactivateSpecialEffect } from './pulse-synchronizer.js';


/**
 * Validate configuration structure
 * @param {Object} config - Configuration object
 * @returns {boolean} Whether config is valid
 */
function validateConfig(config) {
    return config &&
        Array.isArray(config.playerACells) &&
        Array.isArray(config.playerBCells) &&
        typeof config.totalCells === 'number' &&
        config.totalCells > 0;
}

/**
 * Validate elements structure
 * @param {Object} elements - Elements object
 * @returns {boolean} Whether elements are valid
 */
function validateElements(elements) {
    return elements &&
        elements.sequencerA &&
        elements.sequencerB &&
        elements.playButton &&
        elements.stopButton;
}

/**
 * Validate state structure
 * @param {Object} state - State object
 * @returns {boolean} Whether state is valid
 */
function validateState(state) {
    return state &&
        typeof state.isPlaying === 'boolean' &&
        state.playerACellsContent &&
        state.playerBCellsContent;
}

/**
 * Create sequencer cells for both players with validation
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 */
export function createSequencerCells(config, elements, getShapeForNote) {
    if (!validateConfig(config)) {
        console.error('Invalid configuration provided to createSequencerCells');
        return;
    }

    if (!validateElements(elements)) {
        console.error('Invalid elements provided to createSequencerCells');
        return;
    }

    if (typeof getShapeForNote !== 'function') {
        console.error('getShapeForNote must be a function');
        return;
    }

    // Create Player A cells with error handling
    config.playerACells.forEach(position => {
        try {
            if (typeof position !== 'number' || position < 1 || position > config.totalCells) {
                console.warn(`Invalid position ${position} for Player A`);
                return;
            }

            const cellElement = createCellElement(position, 'a', getShapeForNote);
            if (cellElement) {
                elements.sequencerA.appendChild(cellElement);
            }
        } catch (error) {
            console.warn(`Failed to create Player A cell at position ${position}:`, error);
        }
    });

    // Create Player B cells with error handling
    config.playerBCells.forEach(position => {
        try {
            if (typeof position !== 'number' || position < 1 || position > config.totalCells) {
                console.warn(`Invalid position ${position} for Player B`);
                return;
            }

            const cellElement = createCellElement(position, 'b', getShapeForNote);
            if (cellElement) {
                elements.sequencerB.appendChild(cellElement);
            }
        } catch (error) {
            console.warn(`Failed to create Player B cell at position ${position}:`, error);
        }
    });
}

/**
 * Create a sequencer cell element with validation
 * @param {number} position - The position in the sequence
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 * @returns {HTMLElement|null} The cell element or null if creation failed
 */
function createCellElement(position, player, getShapeForNote) {
    if (!['a', 'b'].includes(player)) {
        console.warn('Invalid player identifier:', player);
        return null;
    }

    try {
        const cellElement = document.createElement('div');
        cellElement.className = 'sequencer-cell';
        cellElement.setAttribute('data-position', position);
        cellElement.setAttribute('data-player', player);

        // Add shape attribute based on position number
        const shapeClass = getShapeForNote(position);
        if (shapeClass) {
            cellElement.setAttribute('data-note-shape', shapeClass);
        }

        // Add position number to the cell
        const positionLabel = document.createElement('span');
        positionLabel.className = 'position-label';
        positionLabel.textContent = position;
        cellElement.appendChild(positionLabel);

        return cellElement;
    } catch (error) {
        console.error(`Failed to create cell element for position ${position}:`, error);
        return null;
    }
}

/**
 * Start the layered audio playback
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 */
export function startPlayback(state, config, elements) {
    if (!validateState(state) || !validateConfig(config) || !validateElements(elements)) {
        console.error('Invalid parameters provided to startPlayback');
        return;
    }

    if (state.isPlaying) {
        console.warn('Playback already active');
        return;
    }

    try {
        state.isPlaying = true;

        // Update button state safely
        if (elements.playButton) elements.playButton.disabled = true;
        if (elements.stopButton) elements.stopButton.disabled = false;

        // Start layered playback
        startLayeredPlayback(false); // Resume if paused

        startSynchronizedPulse();

        // Add cleanup on page unload
        window.addEventListener('beforeunload', () => stopPlayback(state, elements));
    } catch (error) {
        console.error('Failed to start playback:', error);
        state.isPlaying = false;
        if (elements.playButton) elements.playButton.disabled = false;
        if (elements.stopButton) elements.stopButton.disabled = true;
    }
}

/**
 * Stop the layered audio playback
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 */
export function stopPlayback(state, elements) {
    if (!state) {
        console.warn('No state provided to stopPlayback');
        return;
    }

    stopSynchronizedPulse();

    if (!state.isPlaying) {
        return; // Already stopped
    }

    try {
        state.isPlaying = false;

        // Stop layered playback
        stopLayeredPlayback();

        // Update button state safely
        if (elements && elements.playButton) elements.playButton.disabled = false;
        if (elements && elements.stopButton) elements.stopButton.disabled = true;
    } catch (error) {
        console.error('Error stopping playback:', error);
    }
}

/**
 * Reset the sequencer with validation
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} createNotes - Function to create note elements
 */
export function resetSequencer(state, config, elements, createNotes) {
    if (!validateState(state) || !validateConfig(config) || !validateElements(elements)) {
        console.error('Invalid parameters provided to resetSequencer');
        return;
    }

    if (typeof createNotes !== 'function') {
        console.error('createNotes must be a function');
        return;
    }

    try {
        // Stop playback if running
        stopPlayback(state, elements);

        // Clear all cells and disable all notes
        const cells = document.querySelectorAll('.sequencer-cell');
        cells.forEach(cell => {
            try {
                removeNoteFromCell(cell, state);
            } catch (error) {
                console.warn('Error removing note from cell during reset:', error);
            }
        });

        // Reset state safely
        state.playerACellsContent = {};
        state.playerBCellsContent = {};
        state.currentStep = 0;

        // Clear the notes areas safely
        if (elements.notesAreaA) {
            try {
                elements.notesAreaA.innerHTML = '';
            } catch (error) {
                console.warn('Error clearing notes area A:', error);
            }
        }

        if (elements.notesAreaB) {
            try {
                elements.notesAreaB.innerHTML = '';
            } catch (error) {
                console.warn('Error clearing notes area B:', error);
            }
        }

        // Recreate all original notes
        try {
            createNotes();
        } catch (error) {
            console.error('Error recreating notes during reset:', error);
        }
    } catch (error) {
        console.error('Error resetting sequencer:', error);
    }
}

/**
 * Remove a note from a cell with validation
 * @param {HTMLElement} cell - The cell element
 * @param {Object} state - Application state
 */
export function removeNoteFromCell(cell, state) {
    if (!cell || !state) {
        console.warn('Invalid parameters provided to removeNoteFromCell');
        return;
    }

    try {
        // Get note number before removing
        const existingNote = cell.querySelector('.note-in-cell');
        let noteNumber = null;

        if (existingNote) {
            noteNumber = parseInt(existingNote.getAttribute('data-note'));
            cell.removeChild(existingNote);
        }

        // Remove the has-note class
        cell.classList.remove('has-note');

        // Update state
        const position = parseInt(cell.getAttribute('data-position'));
        const player = cell.getAttribute('data-player');

        if (isNaN(position) || !['a', 'b'].includes(player)) {
            console.warn('Invalid cell data for note removal');
            return;
        }

        if (player === 'a') {
            delete state.playerACellsContent[position];
        } else {
            delete state.playerBCellsContent[position];
        }

        deactivateSpecialEffect(noteNumber);

        // Disable the note in audio system
        if (noteNumber && !isNaN(noteNumber)) {
            disableNote(noteNumber);
        }
    } catch (error) {
        console.error('Error removing note from cell:', error);
    }
}

/**
 * Add a note to a cell with validation
 * @param {HTMLElement} cell - The cell element
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 * @param {Object} state - Application state
 */
export function addNoteToCell(cell, noteNumber, player, getShapeForNote, state) {
    if (!cell || !state) {
        console.warn('Invalid parameters provided to addNoteToCell');
        return;
    }

    if (typeof noteNumber !== 'number' || isNaN(noteNumber)) {
        console.warn('Invalid note number:', noteNumber);
        return;
    }

    if (!['a', 'b'].includes(player)) {
        console.warn('Invalid player identifier:', player);
        return;
    }

    if (typeof getShapeForNote !== 'function') {
        console.warn('getShapeForNote must be a function');
        return;
    }

    try {
        // Get shape class for this note
        const shapeClass = getShapeForNote(noteNumber);

        // Create a clone of the note to display in the cell
        const noteClone = document.createElement('div');
        noteClone.className = `note note-${player} ${shapeClass} note-in-cell`;
        noteClone.setAttribute('data-note', noteNumber);
        noteClone.setAttribute('data-active', 'true'); // Track activation state

        // Create DOM structure
        const borderElement = document.createElement('div');
        borderElement.className = 'note-border';
        noteClone.appendChild(borderElement);

        const fillElement = document.createElement('div');
        fillElement.className = 'note-fill';
        noteClone.appendChild(fillElement);

        // Add text
        const textSpan = document.createElement('span');
        textSpan.textContent = noteNumber;
        noteClone.appendChild(textSpan);

        // Add click handler for deactivation/activation
        noteClone.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNoteInCell(noteClone, noteNumber, state);
        });

        // Add note to cell
        cell.appendChild(noteClone);
        cell.classList.add('has-note');

        // Update state
        const position = parseInt(cell.getAttribute('data-position'));
        if (isNaN(position)) {
            console.warn('Invalid cell position');
            return;
        }

        if (player === 'a') {
            state.playerACellsContent[position] = noteNumber;
        } else {
            state.playerBCellsContent[position] = noteNumber;
        }

        activateSpecialEffect(noteNumber);

        // Enable the note in audio system
        enableNote(noteNumber);
    } catch (error) {
        console.error('Error adding note to cell:', error);
    }
}

/**
 * Toggle note activation/deactivation in cell
 * @param {HTMLElement} noteElement - The note element in the cell
 * @param {number} noteNumber - The note number
 * @param {Object} state - Application state
 */
function toggleNoteInCell(noteElement, noteNumber, state) {
    if (!noteElement || !state) {
        console.warn('Invalid parameters for toggleNoteInCell');
        return;
    }

    try {
        const isActive = noteElement.getAttribute('data-active') === 'true';
        
        if (isActive) {
            // Deactivate note
            noteElement.setAttribute('data-active', 'false');
            noteElement.classList.add('note-deactivated');
            noteElement.classList.remove('has-note-active');
            
            // Remove from beat sync
            noteElement.parentElement.classList.remove('has-note');
            noteElement.parentElement.classList.add('has-note-deactivated');
            
            // Deactivate special effects
            deactivateSpecialEffect(noteNumber);
            
            // Mute audio
            disableNote(noteNumber);
            
            console.log(`Note ${noteNumber} deactivated`);
        } else {
            // Reactivate note
            noteElement.setAttribute('data-active', 'true');
            noteElement.classList.remove('note-deactivated');
            noteElement.classList.add('has-note-active');
            
            // Add back to beat sync
            noteElement.parentElement.classList.add('has-note');
            noteElement.parentElement.classList.remove('has-note-deactivated');
            
            // Reactivate special effects
            activateSpecialEffect(noteNumber);
            
            // Unmute audio
            enableNote(noteNumber);
            
            console.log(`Note ${noteNumber} reactivated`);
        }
    } catch (error) {
        console.error('Error toggling note in cell:', error);
    }
}

/**
 * Set up events for the sequencer with validation
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Function} createNotes - Function to create notes
 */
export function setupSequencerEvents(elements, state, config, createNotes) {
    if (!validateElements(elements) || !validateState(state) || !validateConfig(config)) {
        console.error('Invalid parameters provided to setupSequencerEvents');
        return;
    }

    if (typeof createNotes !== 'function') {
        console.error('createNotes must be a function');
        return;
    }

    try {
        // Set up event listeners with error handling
        if (elements.playButton) {
            elements.playButton.addEventListener('click', () => {
                try {
                    startPlayback(state, config, elements);
                } catch (error) {
                    console.error('Error in play button handler:', error);
                }
            });
        }

        if (elements.stopButton) {
            elements.stopButton.addEventListener('click', () => {
                try {
                    stopPlayback(state, elements);
                } catch (error) {
                    console.error('Error in stop button handler:', error);
                }
            });
        }

        if (elements.resetButton) {
            elements.resetButton.addEventListener('click', () => {
                try {
                    resetSequencer(state, config, elements, createNotes);
                } catch (error) {
                    console.error('Error in reset button handler:', error);
                }
            });
        }

        // Add cleanup on page unload
        window.addEventListener('beforeunload', () => {
            try {
                stopPlayback(state, elements);
            } catch (error) {
                console.warn('Error during cleanup:', error);
            }
        });
    } catch (error) {
        console.error('Error setting up sequencer events:', error);
    }
}