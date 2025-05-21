// main.js - Main entry point for the split-screen sequencer application

// Import modules
import { createAudioElements, playSound } from './audio.js';
import { createSequencerCells, setupSequencerEvents, startPlayback, stopPlayback, resetSequencer } from './sequencer.js';
import { createNotes, getShapeForNote } from './notes.js';
import { makeClickDraggable, setupNoteDragEvents } from './note-drag.js';
import { initCrossoverDetection, updatePortalEffects, createAllPortalCounterparts } from './portal-effects.js';
import { setupDividerDrag, initializeDividerPosition } from './divider-drag.js';
import { initializeScreenSplit, updateScreenSplit } from './screen-split.js';
import { bpmToMs } from './utils.js';

// Get DOM Elements
const appContainer = document.getElementById('app-container');
const playerASide = document.getElementById('player-a-side');
const playerBSide = document.getElementById('player-b-side');
const divider = document.getElementById('divider');
const notesAreaA = document.getElementById('notes-area-a');
const notesAreaB = document.getElementById('notes-area-b');
const sequencerA = document.getElementById('sequencer-a');
const sequencerB = document.getElementById('sequencer-b');
const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');
const audioContainer = document.getElementById('audio-container');

// Application configuration
const config = {
    totalCells: 8,                   // Total number of sequencer cells
    tempo: 120,                      // Beats per minute
    playerACells: [1, 3, 5],         // Cell positions for Player A (1-based)
    playerBCells: [2, 4, 6],         // Cell positions for Player B (1-based)
    playerANotes: [1, 4, 6],         // Note numbers for Player A
    playerBNotes: [2, 3, 5],         // Note numbers for Player B
    audioFiles: {                    // Audio file paths for each note
        1: 'Audio/note1.ogg',
        2: 'Audio/note2.ogg',
        3: 'Audio/note3.ogg',
        4: 'Audio/note4.ogg',
        5: 'Audio/note5.ogg',
        6: 'Audio/note6.ogg'
    },
    stepDuration: 1650               // Minimum step duration in ms
};

// Application state
const state = {
    isPlaying: false,                // Whether the sequencer is currently playing
    currentStep: 0,                  // Current step in the sequence (0-based)
    intervalId: null,                // ID for the playback interval
    playerACellsContent: {},         // Contents of Player A cells: { position: noteNumber }
    playerBCellsContent: {},         // Contents of Player B cells: { position: noteNumber }
    draggedNote: null,               // Currently dragged note element
    draggedNoteData: null,           // Data for the currently dragged note
};

// Collect DOM elements for sharing with modules
const elements = {
    appContainer,
    playerASide,
    playerBSide,
    divider,
    notesAreaA,
    notesAreaB,
    sequencerA,
    sequencerB,
    audioContainer,
    playButton,
    stopButton,
    resetButton
};

/**
 * Initialize the application
 */
function init() {
    // Create UI elements
    createNotes(config, elements, makeClickDraggable);
    createSequencerCells(config, elements, getShapeForNote);
    createAudioElements(config, audioContainer);

    // Set up event handlers
    setupNoteDragEvents(elements, state);
    setupDividerDrag(elements, updateScreenSplit);
    setupSequencerEvents(elements, state, config, () => createNotes(config, elements, makeClickDraggable));

    // Initialize screen splitting
    initializeDividerPosition(elements);
    initializeScreenSplit(elements);

    // Start playback immediately
    startPlayback(state, config, elements);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Export anything that might be needed by other modules
export { config, state, elements, playSound };