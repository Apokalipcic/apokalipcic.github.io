// sequencer.js - Handles sequencer grid creation and playback

import { playSound } from './audio.js';

/**
 * Create sequencer cells for both players
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 */
export function createSequencerCells(config, elements, getShapeForNote) {
    // Create Player A cells
    config.playerACells.forEach(position => {
        const cellElement = createCellElement(position, 'a', getShapeForNote);
        elements.sequencerA.appendChild(cellElement);
    });

    // Create Player B cells
    config.playerBCells.forEach(position => {
        const cellElement = createCellElement(position, 'b', getShapeForNote);
        elements.sequencerB.appendChild(cellElement);
    });
}

/**
 * Create a sequencer cell element
 * @param {number} position - The position in the sequence
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 * @returns {HTMLElement} The cell element
 */
function createCellElement(position, player, getShapeForNote) {
    const cellElement = document.createElement('div');
    cellElement.className = 'sequencer-cell';
    cellElement.setAttribute('data-position', position);
    cellElement.setAttribute('data-player', player);

    // Add shape attribute based on position number
    const shapeClass = getShapeForNote(position);
    cellElement.setAttribute('data-note-shape', shapeClass);

    // Add position number to the cell
    const positionLabel = document.createElement('span');
    positionLabel.className = 'position-label';
    positionLabel.textContent = position;
    cellElement.appendChild(positionLabel);

    return cellElement;
}

/**
 * Start the sequencer playback
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 */
export function startPlayback(state, config, elements) {
    if (state.isPlaying) return;

    state.isPlaying = true;
    state.currentStep = 0;

    // Update button state
    elements.playButton.disabled = true;
    elements.stopButton.disabled = false;

    // Start the interval
    playStep(state, config); // Play the first step immediately
    state.intervalId = setInterval(() => playStep(state, config), config.stepDuration);
}

/**
 * Play a single step of the sequence
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 */
function playStep(state, config) {
    // Calculate which position to play (1-based)
    const currentPosition = state.currentStep + 1;

    // Find all cells at the current position
    highlightActivePosition(currentPosition);

    // Player A cell
    if (config.playerACells.includes(currentPosition)) {
        const noteNumber = state.playerACellsContent[currentPosition];
        if (noteNumber) {
            playSound(noteNumber);
        }
    }

    // Player B cell
    if (config.playerBCells.includes(currentPosition)) {
        const noteNumber = state.playerBCellsContent[currentPosition];
        if (noteNumber) {
            playSound(noteNumber);
        }
    }

    // Move to the next step
    state.currentStep = (state.currentStep + 1) % config.totalCells;
}

/**
 * Highlight the active position during playback
 * @param {number} position - The current position to highlight
 */
function highlightActivePosition(position) {
    // Remove existing highlights
    const allCells = document.querySelectorAll('.sequencer-cell');
    allCells.forEach(cell => cell.classList.remove('active'));

    // Add highlight to cells at the current position
    const activeCells = document.querySelectorAll(`.sequencer-cell[data-position="${position}"]`);
    activeCells.forEach(cell => cell.classList.add('active'));
}

/**
 * Stop the sequencer playback
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 */
export function stopPlayback(state, elements) {
    if (!state.isPlaying) return;

    // Clear the interval
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.isPlaying = false;

    // Update button state
    elements.playButton.disabled = false;
    elements.stopButton.disabled = true;

    // Remove highlights
    const allCells = document.querySelectorAll('.sequencer-cell');
    allCells.forEach(cell => cell.classList.remove('active'));
}

/**
 * Reset the sequencer
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Object} elements - DOM elements
 * @param {Function} createNotes - Function to create note elements
 */
export function resetSequencer(state, config, elements, createNotes) {
    // Stop playback if running
    stopPlayback(state, elements);

    // Clear all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => {
        removeNoteFromCell(cell, state);
    });

    // Reset state
    state.playerACellsContent = {};
    state.playerBCellsContent = {};
    state.currentStep = 0;

    // Clear the notes areas
    elements.notesAreaA.innerHTML = '';
    elements.notesAreaB.innerHTML = '';

    // Recreate all original notes
    createNotes();
}

/**
 * Remove a note from a cell
 * @param {HTMLElement} cell - The cell element
 * @param {Object} state - Application state
 */
export function removeNoteFromCell(cell, state) {
    // Remove existing note element if any
    const existingNote = cell.querySelector('.note-in-cell');
    if (existingNote) {
        cell.removeChild(existingNote);
    }

    // Remove the has-note class
    cell.classList.remove('has-note');

    // Update state
    const position = parseInt(cell.getAttribute('data-position'));
    const player = cell.getAttribute('data-player');

    if (player === 'a') {
        delete state.playerACellsContent[position];
    } else {
        delete state.playerBCellsContent[position];
    }
}

/**
 * Add a note to a cell
 * @param {HTMLElement} cell - The cell element
 * @param {number} noteNumber - The note number
 * @param {string} player - The player identifier ('a' or 'b')
 * @param {Function} getShapeForNote - Function to get shape class based on note number
 * @param {Object} state - Application state
 */
export function addNoteToCell(cell, noteNumber, player, getShapeForNote, state) {
    // Get shape class for this note
    const shapeClass = getShapeForNote(noteNumber);

    // Create a clone of the note to display in the cell
    const noteClone = document.createElement('div');

    // Notes in cells should be filled (not hollow)
    noteClone.className = `note note-${player} ${shapeClass} note-in-cell`;
    noteClone.setAttribute('data-note', noteNumber);

    // Add a span for the text
    const textSpan = document.createElement('span');
    textSpan.textContent = noteNumber;
    noteClone.appendChild(textSpan);

    // Add note to cell
    cell.appendChild(noteClone);

    // Add the has-note class
    cell.classList.add('has-note');

    // Update state
    const position = parseInt(cell.getAttribute('data-position'));
    if (player === 'a') {
        state.playerACellsContent[position] = noteNumber;
    } else {
        state.playerBCellsContent[position] = noteNumber;
    }
}

/**
 * Set up events for the sequencer
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 * @param {Object} config - Application configuration
 * @param {Function} createNotes - Function to create notes
 */
export function setupSequencerEvents(elements, state, config, createNotes) {
    elements.playButton.addEventListener('click', () => startPlayback(state, config, elements));
    elements.stopButton.addEventListener('click', () => stopPlayback(state, elements));
    elements.resetButton.addEventListener('click', () => resetSequencer(state, config, elements, createNotes));
}
