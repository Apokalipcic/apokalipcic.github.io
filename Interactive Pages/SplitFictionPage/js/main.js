// main.js - Main entry point with layered audio system

// Import modules with error handling
import { createAudioElements, startLayeredPlayback, stopLayeredPlayback, hasEnabledNotes } from './audio.js';
import { createSequencerCells, setupSequencerEvents, startPlayback, stopPlayback, resetSequencer } from './sequencer.js';
import { createNotes, getShapeForNote } from './notes.js';
import { makeClickDraggable, setupNoteDragEvents } from './note-drag.js';
import { initCrossoverDetection, createAllPortalCounterparts } from './portal-effects.js';
import { setupDividerDrag, initializeDividerPosition, initializePortalEffects } from './divider-drag.js';
import { initializeScreenSplit, updateScreenSplit } from './screen-split.js';
import { bpmToMs } from './utils.js';
import { initializeParticleSystems } from './visual_effects.js';

/**
 * Validate DOM element exists
 * @param {string} id - Element ID
 * @param {string} description - Description for error messages
 * @returns {HTMLElement|null} Element or null if not found
 */
function validateElement(id, description) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Required element not found: ${id} (${description})`);
    }
    return element;
}

/**
 * Get and validate all required DOM elements
 * @returns {Object|null} Elements object or null if validation fails
 */
function getElements() {
    const elements = {
        appContainer: validateElement('app-container', 'Main application container'),
        playerASide: validateElement('player-a-side', 'Player A side panel'),
        playerBSide: validateElement('player-b-side', 'Player B side panel'),
        divider: validateElement('divider', 'Screen divider'),
        notesAreaA: validateElement('notes-area-a', 'Player A notes area'),
        notesAreaB: validateElement('notes-area-b', 'Player B notes area'),
        sequencerA: validateElement('sequencer-a', 'Player A sequencer'),
        sequencerB: validateElement('sequencer-b', 'Player B sequencer'),
        playButton: validateElement('play-button', 'Play button'),
        stopButton: validateElement('stop-button', 'Stop button'),
        resetButton: validateElement('reset-button', 'Reset button'),
        audioContainer: validateElement('audio-container', 'Audio container')
    };

    // Check if all required elements exist
    const requiredElements = [
        'appContainer', 'playerASide', 'playerBSide', 'divider',
        'notesAreaA', 'notesAreaB', 'sequencerA', 'sequencerB',
        'playButton', 'stopButton', 'audioContainer'
    ];

    const missingElements = requiredElements.filter(key => !elements[key]);

    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return null;
    }

    return elements;
}

/**
 * Validate configuration structure
 * @param {Object} config - Configuration object
 * @returns {boolean} Whether config is valid
 */
function validateConfig(config) {
    const requiredFields = [
        'totalCells', 'playerACells', 'playerBCells',
        'playerANotes', 'playerBNotes', 'audioFiles', 'nestedItems'
    ];

    const missingFields = requiredFields.filter(field => config[field] === undefined);

    if (missingFields.length > 0) {
        console.error('Missing required config fields:', missingFields);
        return false;
    }

    // Validate specific field types
    if (typeof config.totalCells !== 'number' || config.totalCells <= 0) {
        console.error('totalCells must be a positive number');
        return false;
    }

    if (!Array.isArray(config.playerACells) || !Array.isArray(config.playerBCells)) {
        console.error('playerACells and playerBCells must be arrays');
        return false;
    }

    if (!Array.isArray(config.playerANotes) || !Array.isArray(config.playerBNotes)) {
        console.error('playerANotes and playerBNotes must be arrays');
        return false;
    }

    if (typeof config.audioFiles !== 'object' || config.audioFiles === null) {
        console.error('audioFiles must be an object');
        return false;
    }

    if (typeof config.nestedItems !== 'object' || config.nestedItems === null) {
        console.error('nestedItems must be an object');
        return false;
    }

    return true;
}

// Application configuration with validation (BACKUP)
const config = {
    totalCells: 6,
    playerACells: [1, 2],
    playerBCells: [3, 4],
    playerANotes: [1, 2],
    playerBNotes: [3, 4],
    audioFiles: {
        1: 'Audio/01_GtrMic1.wav',
        2: 'Audio/02_GtrMic2.wav',
        3: 'Audio/03_GtrRevSFXMic1.wav',
        4: 'Audio/04_GtrRevSFXMic2.wav'
    },
    backgroundMusic: null, // Set to 'Audio/background.ogg' if you have background music
    nestedItems: {
        //1: [2],
        //2: [3],
        //4: [5],
    }
};


// Application state with initialization
const state = {
    isPlaying: false,
    currentStep: 0,
    intervalId: null,
    playerACellsContent: {},
    playerBCellsContent: {},
    draggedNote: null,
    draggedNoteData: null,
    nestedRelationships: {
        //2: 1,
        //3: 2,
        //5: 4
    }
};

// Global elements reference
let elements = null;

/**
 * Initialize UI elements with error handling
 * @returns {boolean} Whether initialization was successful
 */
function initializeUI() {
    try {
        console.log('Creating notes...');
        createNotes(config, elements, makeClickDraggable);

        console.log('Creating sequencer cells...');
        createSequencerCells(config, elements, getShapeForNote);

        console.log('Creating audio elements...');
        createAudioElements(config, elements.audioContainer);

        return true;
    } catch (error) {
        console.error('Failed to initialize UI elements:', error);
        return false;
    }
}

/**
 * Set up event handlers with error handling
 * @returns {boolean} Whether event setup was successful
 */
function setupEvents() {
    try {
        console.log('Setting up note drag events...');
        setupNoteDragEvents(elements, state, config);

        console.log('Setting up divider drag...');
        setupDividerDrag(elements, updateScreenSplit);

        console.log('Initializing portal effects...');
        initializePortalEffects(elements);

        console.log('Setting up sequencer events...');
        setupSequencerEvents(elements, state, config, () => createNotes(config, elements, makeClickDraggable));

        return true;
    } catch (error) {
        console.error('Failed to set up events:', error);
        return false;
    }
}

/**
 * Initialize screen and positioning with error handling
 * @returns {boolean} Whether initialization was successful
 */
function initializeScreen() {
    try {
        console.log('Initializing divider position...');
        initializeDividerPosition(elements);

        console.log('Initializing screen split...');
        initializeScreenSplit(elements);

        return true;
    } catch (error) {
        console.error('Failed to initialize screen:', error);
        return false;
    }
}

/**
 * Start initial playback with delay for audio loading
 * @returns {Promise<boolean>} Whether playback started successfully
 */
async function startInitialPlayback() {
    return new Promise((resolve) => {
        // Wait for audio elements to potentially load
        setTimeout(() => {
            try {
                console.log('Checking for initial playback...');

                // Check if document is ready and elements are still valid
                if (document.readyState === 'complete' && elements.playButton) {
                    // With layered audio, we start playback if there's background music
                    if (config.backgroundMusic) {
                        console.log('Starting background music playback...');
                        startLayeredPlayback(true);
                        state.isPlaying = true;

                        // Update button states
                        if (elements.playButton) elements.playButton.disabled = true;
                        if (elements.stopButton) elements.stopButton.disabled = false;
                    } else {
                        console.log('No background music configured, waiting for user interaction');
                    }
                    resolve(true);
                } else {
                    console.warn('Document not ready or elements invalid, skipping initial playback');
                    resolve(false);
                }
            } catch (error) {
                console.error('Failed to start initial playback:', error);
                resolve(false);
            }
        }, 1000); // Give audio elements time to load
    });
}

/**
 * Initialize visual effects with error handling
 * @returns {boolean} Whether initialization was successful
 */
function initializeVisuals() {
    try {
        console.log('Initializing particle systems...');
        initializeParticleSystems();
        return true;
    } catch (error) {
        console.error('Failed to initialize visual effects:', error);
        return false;
    }
}

/**
 * Main initialization function with comprehensive error handling
 */
async function init() {
    console.log('Starting application initialization...');

    try {
        // Validate configuration
        if (!validateConfig(config)) {
            console.error('Configuration validation failed');
            return;
        }

        // Get and validate DOM elements
        elements = getElements();
        if (!elements) {
            console.error('DOM element validation failed');
            return;
        }

        // Initialize UI elements
        if (!initializeUI()) {
            console.error('UI initialization failed');
            return;
        }

        // Set up event handlers
        if (!setupEvents()) {
            console.error('Event setup failed');
            return;
        }

        // Initialize screen and positioning
        if (!initializeScreen()) {
            console.error('Screen initialization failed');
            return;
        }

        // Initialize visual effects
        if (!initializeVisuals()) {
            console.warn('Visual effects initialization failed, continuing without them');
        }

        // Start initial playback (with delay for audio)
        const playbackStarted = await startInitialPlayback();
        if (!playbackStarted) {
            console.warn('Initial playback not started (this is normal if no background music)');
        }

        console.log('Application initialization completed successfully');

    } catch (error) {
        console.error('Critical error during initialization:', error);

        // Attempt basic cleanup
        try {
            if (state.intervalId) {
                clearInterval(state.intervalId);
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
    }
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
    try {
        console.log('Cleaning up application...');

        // Stop playback
        if (state && elements) {
            stopPlayback(state, elements);
        }

        // Clear any intervals
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }

        // Reset state
        state.isPlaying = false;
        state.draggedNote = null;
        state.draggedNoteData = null;

        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Set up page lifecycle events
window.addEventListener('beforeunload', cleanup);
window.addEventListener('unload', cleanup);

// Handle visibility change (for mobile/tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.isPlaying) {
        console.log('Page hidden, pausing playback');
        try {
            // For layered audio, we might want to pause instead of stop
            stopLayeredPlayback();
        } catch (error) {
            console.error('Error pausing playback on visibility change:', error);
        }
    }
});

// Initialize on page load with proper timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// Export for potential use by other modules
export { config, state, elements };