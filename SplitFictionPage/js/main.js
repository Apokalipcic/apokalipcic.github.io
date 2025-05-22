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
    totalCells: 8,
    tempo: 120,
    playerACells: [1, 3, 5],
    playerBCells: [2, 4, 6],
    playerANotes: [1, 4, 6],
    playerBNotes: [2, 3, 5],
    audioFiles: {
        1: 'Audio/note1.ogg',
        2: 'Audio/note2.ogg',
        3: 'Audio/note3.ogg',
        4: 'Audio/note4.ogg',
        5: 'Audio/note5.ogg',
        6: 'Audio/note6.ogg'
    },
    stepDuration: 1650,
    nestedItems: {
        1: [2],
        2: [3],
        4: [5],
    }
};

const state = {
    isPlaying: false,
    currentStep: 0,
    intervalId: null,
    playerACellsContent: {},
    playerBCellsContent: {},
    draggedNote: null,
    draggedNoteData: null,
    nestedRelationships: {
        2: 1,
        3: 2,
        5: 4
    }
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
    setupNoteDragEvents(elements, state, config);
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