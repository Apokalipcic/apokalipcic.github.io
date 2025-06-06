// main.js - Main entry point with layered audio system and music config selection

// Import modules with error handling
import { createAudioElements, startLayeredPlayback, stopLayeredPlayback, hasEnabledNotes, getPlaybackState } from './audio.js';
import { createSequencerCells, setupSequencerEvents, startPlayback, stopPlayback, resetSequencer } from './sequencer.js';
import { createNotes, getShapeForNote } from './notes.js';
import { makeClickDraggable, setupNoteDragEvents } from './note-drag.js';
import { initCrossoverDetection, createAllPortalCounterparts } from './portal-effects.js';
import { setupDividerDrag, initializeDividerPosition, initializePortalEffects } from './divider-drag.js';
import { initializeScreenSplit, updateScreenSplit } from './screen-split.js';
import { bpmToMs } from './utils.js';
import { initializeParticleSystems } from './visual_effects.js';
import { cleanupPulseSystem } from './pulse-synchronizer.js';
import { initTutorial } from './tutorial.js';
import { initContributors } from './contributors.js';

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

// Multiple music configuration presets
const musicConfigs = {
    pop: {
        name: "Daft Punk",
        totalCells: 6,
        playerACells: [1, 2, 5],
        playerBCells: [3, 4],
        playerANotes: [1, 2, 5],
        playerBNotes: [3, 4],
        audioFiles: {
            1: 'Audio/Daft_Punk_Get_Lucky_Bass.mp3',
            2: 'Audio/Daft_Punk_Get_Lucky_Guitars.mp3',
            3: 'Audio/Daft_Punk_Get_Lucky_Keyboards.mp3',
            4: 'Audio/Daft_Punk_Get_Lucky_Vocals.mp3',
            5: 'Audio/Daft_Punk_Get_Lucky_Chorus.mp3'
        },
        backgroundMusic: 'Audio/Daft_Punk_Get_Lucky_Drums.mp3',
        nestedItems: {}
    },

    ost: {
        name: "OST",
        totalCells: 6,
        playerACells: [1, 2, 3],
        playerBCells: [4, 5, 6],
        playerANotes: [1, 2, 3],
        playerBNotes: [4, 5, 6],
        audioFiles: {
            1: 'Audio/Split%20Screen%5BFantasy%5D%28Flutes%29.mp3',           // [Fantasy](Flutes)
            2: 'Audio/Split%20Screen%5BFantasy%5D%28Violas%20%26%20Celli%29.mp3', // [Fantasy](Violas & Celli)
            3: 'Audio/Split%20Screen%5BFantasy%5D%28Violins%29.mp3',         // [Fantasy](Violins)
            4: 'Audio/Split%20Screen%5BSci-Fi%5D%28Lead%20Synth%29.mp3',     // [Sci-Fi](Lead Synth)
            5: 'Audio/Split%20Screen%5BSci-Fi%5D%28Rhythm%20Synth%29.mp3',   // [Sci-Fi](Rhythm Synth)
            6: 'Audio/Split%20Screen%5BSci-Fi%5D%28Pad%29.mp3'              // [Sci-Fi](Pad)
        },
        backgroundMusic: 'Audio/Split%20Screen%28Background%29.mp3',        // (Background)
        nestedItems: {
            1: [4],
            5: [2],
            2: [6]
        }
    }
};

// Set initial config
let config = musicConfigs.pop;
let currentConfigKey = 'pop'; // Track current config for comparison

// Application state with initialization
const state = {
    isPlaying: false,
    currentStep: 0,
    intervalId: null,
    playerACellsContent: {},
    playerBCellsContent: {},
    draggedNote: null,
    draggedNoteData: null,
    nestedRelationships: {}
};

// Global elements reference
let elements = null;

/**
 * Apply a music configuration
 * @param {string} configKey - Key of the config to apply
 * @returns {boolean} Whether the config was applied successfully
 */
function applyMusicConfig(configKey) {
    if (!musicConfigs[configKey]) {
        console.warn(`Config "${configKey}" not found`);
        return false;
    }

    try {
        // Stop any current playback
        if (state.isPlaying && elements) {
            stopPlayback(state, elements);
        }

        // Update config
        config = musicConfigs[configKey];

        currentConfigKey = configKey;

        // Update nested relationships based on new config
        state.nestedRelationships = {};
        Object.entries(config.nestedItems).forEach(([parent, children]) => {
            children.forEach(child => {
                state.nestedRelationships[child] = parseInt(parent);
            });
        });

        console.log('Setting up note drag events...');
        setupNoteDragEvents(elements, state, config);

        console.log(`Applied music config: ${config.name} (${configKey})`);
        return true;
    } catch (error) {
        console.error('Error applying music config:', error);
        return false;
    }
}

function startBackgroundMusicSmart(requestedConfigKey = null) {
    try {
        const playbackState = getPlaybackState();

        // If a specific config is requested and it's different from current, switch configs
        if (requestedConfigKey && requestedConfigKey !== currentConfigKey) {
            console.log(`Switching from ${currentConfigKey} to ${requestedConfigKey}`);

            if (applyMusicConfig(requestedConfigKey)) {
                reinitializeWithNewConfig();
            }

            // Start the new music
            if (config.backgroundMusic) {
                startLayeredPlayback(true); // true = from beginning
                state.isPlaying = true;

                if (elements.playButton) elements.playButton.disabled = true;
                if (elements.stopButton) elements.stopButton.disabled = false;

                console.log(`Started new background music: ${config.name}`);
            }
        } else if (requestedConfigKey === currentConfigKey) {
            // Same config requested - don't restart if already playing
            if (playbackState.isPlaying) {
                console.log(`Same music (${config.name}) already playing - not restarting`);
                return;
            } else {
                // Same config but not playing - start it
                if (config.backgroundMusic) {
                    startLayeredPlayback(true);
                    state.isPlaying = true;

                    if (elements.playButton) elements.playButton.disabled = true;
                    if (elements.stopButton) elements.stopButton.disabled = false;

                    console.log(`Resumed background music: ${config.name}`);
                }
            }
        } else {
            // No specific config requested - just start current config if not playing
            if (!playbackState.isPlaying && config.backgroundMusic) {
                startLayeredPlayback(true);
                state.isPlaying = true;

                if (elements.playButton) elements.playButton.disabled = true;
                if (elements.stopButton) elements.stopButton.disabled = false;

                console.log(`Started background music: ${config.name}`);
            }
        }
    } catch (error) {
        console.error('Error in startBackgroundMusicSmart:', error);
    }
}

/**
 * Reinitialize the application with new config
 */
function reinitializeWithNewConfig() {
    if (!elements) {
        console.warn('Elements not available for reinitialization');
        return;
    }

    try {
        // Stop any current playback and clean up audio
        if (state.isPlaying) {
            stopPlayback(state, elements);
        }

        // Clean up sequencer cells and disable all audio notes
        const cells = document.querySelectorAll('.sequencer-cell');
        cells.forEach(cell => {
            try {
                removeNoteFromCell(cell, state);
            } catch (error) {
                console.warn('Error removing note from cell during config change:', error);
            }
        });

        // Remove all existing notes from player sides (not notes areas)
        const existingNotes = document.querySelectorAll('.note:not(.note-in-cell)');
        existingNotes.forEach(note => {
            try {
                if (note.parentNode) {
                    note.parentNode.removeChild(note);
                }
            } catch (error) {
                console.warn('Error removing existing note:', error);
            }
        });

        // Clean up portal counterparts
        const portalCounterparts = document.querySelectorAll('.portal-counterpart');
        portalCounterparts.forEach(counterpart => {
            try {
                if (counterpart.parentNode) {
                    counterpart.parentNode.removeChild(counterpart);
                }
            } catch (error) {
                console.warn('Error removing portal counterpart:', error);
            }
        });

        // Clear existing sequencer cells
        if (elements.sequencerA) elements.sequencerA.innerHTML = '';
        if (elements.sequencerB) elements.sequencerB.innerHTML = '';

        // Reset state completely
        state.playerACellsContent = {};
        state.playerBCellsContent = {};
        state.draggedNote = null;
        state.draggedNoteData = null;
        state.currentStep = 0;

        // Reset nested relationships based on new config
        state.nestedRelationships = {};
        Object.entries(config.nestedItems).forEach(([parent, children]) => {
            children.forEach(child => {
                state.nestedRelationships[child] = parseInt(parent);
            });
        });

        // Recreate UI with new config
        createNotes(config, elements, makeClickDraggable);
        createSequencerCells(config, elements, getShapeForNote);
        createAudioElements(config, elements.audioContainer);

        // Recreate portal counterparts for new notes
        const allNotes = document.querySelectorAll('.note:not(.portal-counterpart):not(.nested-visual)');
        createAllPortalCounterparts(allNotes, elements);

        console.log('Application reinitialized with new config');
    } catch (error) {
        console.error('Error reinitializing application:', error);
    }
}

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
        //console.log('Setting up note drag events...');
        //setupNoteDragEvents(elements, state, config);

        console.log('Setting up divider drag...');
        setupDividerDrag(elements, updateScreenSplit);

        console.log('Initializing portal effects...');
        initializePortalEffects(elements);

        console.log('Setting up sequencer events...');
        setupSequencerEvents(elements, state, config, () => createNotes(config, elements, makeClickDraggable));

        // Set up tutorial background music trigger
        setupTutorialMusicTrigger();

        // Set up tutorial music selection listener
        setupMusicSelectionListener();

        return true;
    } catch (error) {
        console.error('Failed to set up events:', error);
        return false;
    }
}

/**
 * Set up listener for tutorial close event to trigger background music
 */
function setupTutorialMusicTrigger() {
    document.addEventListener('tutorialFirstClose', (event) => {
        console.log('Tutorial first close event received:', event.detail.message);
        startBackgroundMusicSmart(); // Start current config without forcing restart
    });
}

/**
 * Set up listener for music selection from tutorial
 */
function setupMusicSelectionListener() {
    document.addEventListener('tutorialMusicSelected', (event) => {
        const selectedConfig = event.detail.configKey;
        console.log('Music selection received:', selectedConfig);

        // Use smart music starter that handles config switching
        startBackgroundMusicSmart(selectedConfig);
    });
}

/**
 * Initialize screen and positioning with error handling
 * @returns {boolean} Whether initialization was successful
 */
function initializeScreen() {
    try {
        console.log('Initializing divider position...');
        initializeDividerPosition(elements, 43);

        console.log('Initializing screen split...');
        initializeScreenSplit(elements, 43);

        return true;
    } catch (error) {
        console.error('Failed to initialize screen:', error);
        return false;
    }
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

        // Initialize tutorial (background music will start when tutorial closes)
        initTutorial();

        // Initialize contributors heart button
        initContributors();

        console.log('Application initialization completed successfully');
        console.log('Background music will start after tutorial is closed for the first time');

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

        // Cleanup pulse system
        cleanupPulseSystem();

        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Set up page lifecycle events
window.addEventListener('beforeunload', cleanup);
window.addEventListener('unload', cleanup);

// Initialize on page load with proper timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// Export for potential use by other modules
export { config, state, elements, musicConfigs, applyMusicConfig };