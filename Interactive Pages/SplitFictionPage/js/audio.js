// audio.js - Layered audio system for simultaneous playback with mute/unmute

import { startSynchronizedPulse } from './pulse-synchronizer.js';

// Audio state management
let audioState = {
    audioContext: null,
    isInitialized: false,
    isPlaying: false,
    backgroundTrack: null,
    noteTracks: new Map(), // Map of noteNumber -> {audio, gainNode}
    masterGainNode: null,
    startTime: 0,
    pauseTime: 0,
    volume: 1.0
};

/**
 * Initialize Web Audio API context
 */
function initializeAudioContext() {
    try {
        if (typeof AudioContext !== 'undefined') {
            audioState.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            audioState.audioContext = new webkitAudioContext();
        }

        if (audioState.audioContext) {
            // Create master gain node
            audioState.masterGainNode = audioState.audioContext.createGain();
            audioState.masterGainNode.connect(audioState.audioContext.destination);
            audioState.masterGainNode.gain.value = audioState.volume;

            console.log('Audio context initialized with master gain');
        }
    } catch (error) {
        console.warn('Could not initialize audio context:', error);
    }
}

/**
 * Create audio elements for all tracks
 * @param {Object} config - Application configuration
 * @param {HTMLElement} audioContainer - Container for audio elements
 */
export function createAudioElements(config, audioContainer) {
    if (!config || !config.audioFiles || !audioContainer) {
        console.error('Invalid parameters for createAudioElements');
        return;
    }

    try {
        // Initialize audio context if not already done
        if (!audioState.isInitialized) {
            initializeAudioContext();
            audioState.isInitialized = true;
        }

        // Clear existing audio elements
        audioContainer.innerHTML = '';
        audioState.noteTracks.clear();

        // Create background track if specified
        if (config.backgroundMusic) {
            createBackgroundTrack(config.backgroundMusic, audioContainer);
        }

        // Create note tracks
        Object.entries(config.audioFiles).forEach(([noteNumber, audioPath]) => {
            try {
                const noteNum = parseInt(noteNumber);
                if (isNaN(noteNum)) return;

                createNoteTrack(noteNum, audioPath, audioContainer);
            } catch (error) {
                console.warn(`Error creating track for note ${noteNumber}:`, error);
            }
        });

        console.log('Audio elements created successfully');
    } catch (error) {
        console.error('Critical error in createAudioElements:', error);
    }
}

/**
 * Create background music track
 * @param {string} audioPath - Path to background music file
 * @param {HTMLElement} container - Audio container
 */
function createBackgroundTrack(audioPath, container) {
    try {
        const audio = new Audio(audioPath);
        audio.id = 'background-music';
        audio.loop = true;
        audio.volume = audioState.volume;

        container.appendChild(audio);

        // Connect to Web Audio API if available
        if (audioState.audioContext && audioState.masterGainNode) {
            const source = audioState.audioContext.createMediaElementSource(audio);
            const gainNode = audioState.audioContext.createGain();
            gainNode.gain.value = 1; // Background always plays at full volume

            source.connect(gainNode);
            gainNode.connect(audioState.masterGainNode);

            audioState.backgroundTrack = { audio, gainNode, source };
        } else {
            audioState.backgroundTrack = { audio };
        }

        console.log('Background track created');
    } catch (error) {
        console.error('Error creating background track:', error);
    }
}

/**
 * Create a note track with gain control
 * @param {number} noteNumber - The note number
 * @param {string} audioPath - Path to audio file
 * @param {HTMLElement} container - Audio container
 */
function createNoteTrack(noteNumber, audioPath, container) {
    try {
        const audio = new Audio(audioPath);
        audio.id = `audio-${noteNumber}`;
        audio.loop = true;
        audio.volume = 0; // fallback volume (only used if no gainNode)

        container.appendChild(audio);

        // Default track entry
        const track = { audio };

        // Connect to Web Audio API immediately (before play)
        if (audioState.audioContext && audioState.masterGainNode) {
            try {
                const source = audioState.audioContext.createMediaElementSource(audio);
                const gainNode = audioState.audioContext.createGain();
                gainNode.gain.value = 0; // start muted

                source.connect(gainNode);
                gainNode.connect(audioState.masterGainNode);

                track.source = source;
                track.gainNode = gainNode;

                console.log(`Note track ${noteNumber} connected to Web Audio API`);
            } catch (error) {
                console.warn(`Could not connect note ${noteNumber} to Web Audio API:`, error);
            }
        }

        audioState.noteTracks.set(noteNumber, track);
        console.log(`Note track ${noteNumber} created`);
    } catch (error) {
        console.error(`Error creating note track ${noteNumber}:`, error);
    }
}


/**
 * Start playback of all tracks
 * @param {boolean} fromBeginning - Whether to start from the beginning
 */
export function startLayeredPlayback(fromBeginning = true) {
    if (audioState.isPlaying && !fromBeginning) return;

    try {
        // Resume audio context if suspended
        if (audioState.audioContext && audioState.audioContext.state === 'suspended') {
            audioState.audioContext.resume();
        }

        const currentTime = audioState.audioContext ? audioState.audioContext.currentTime : Date.now() / 1000;

        if (fromBeginning || audioState.startTime === 0) {
            audioState.startTime = currentTime;
            audioState.pauseTime = 0;
        } else {
            // Resume from pause
            audioState.startTime = currentTime - audioState.pauseTime;
        }

        // Start background track if it exists
        if (audioState.backgroundTrack) {
            const { audio } = audioState.backgroundTrack;
            if (fromBeginning) {
                audio.currentTime = 0;
            }
            audio.play().catch(e => console.warn('Background playback failed:', e));
        }

        // Start all note tracks (muted or unmuted based on current state)
        audioState.noteTracks.forEach((track, noteNumber) => {
            const { audio } = track;
            if (fromBeginning) {
                audio.currentTime = 0;
            } else if (audioState.pauseTime > 0) {
                // Sync to current playback position
                audio.currentTime = audioState.pauseTime;
            }
            audio.play().catch(e => console.warn(`Note ${noteNumber} playback failed:`, e));
        });

        startSynchronizedPulse(116);

        audioState.isPlaying = true;
        console.log('Layered playback started');
    } catch (error) {
        console.error('Error starting layered playback:', error);
    }
}

/**
 * Stop all playback
 */
export function stopLayeredPlayback() {
    if (!audioState.isPlaying) return;

    try {
        // Stop background track
        if (audioState.backgroundTrack) {
            audioState.backgroundTrack.audio.pause();
            audioState.backgroundTrack.audio.currentTime = 0;
        }

        // Stop all note tracks
        audioState.noteTracks.forEach(track => {
            track.audio.pause();
            track.audio.currentTime = 0;
        });

        audioState.isPlaying = false;
        audioState.startTime = 0;
        audioState.pauseTime = 0;

        console.log('Layered playback stopped');
    } catch (error) {
        console.error('Error stopping layered playback:', error);
    }
}

/**
 * Pause all playback
 */
export function pauseLayeredPlayback() {
    if (!audioState.isPlaying) return;

    try {
        const currentTime = audioState.audioContext ? audioState.audioContext.currentTime : Date.now() / 1000;
        audioState.pauseTime = currentTime - audioState.startTime;

        // Pause background track
        if (audioState.backgroundTrack) {
            audioState.backgroundTrack.audio.pause();
        }

        // Pause all note tracks
        audioState.noteTracks.forEach(track => {
            track.audio.pause();
        });

        audioState.isPlaying = false;
        console.log('Layered playback paused');
    } catch (error) {
        console.error('Error pausing layered playback:', error);
    }
}

/**
 * Enable/unmute a specific note
 * @param {number} noteNumber - The note number to enable
 */
export function enableNote(noteNumber) {
    const track = audioState.noteTracks.get(noteNumber);
    if (!track) {
        console.warn(`Note ${noteNumber} track not found`);
        return;
    }

    try {
        if (track.gainNode) {
            // Smooth fade in via gainNode
            const now = audioState.audioContext.currentTime;
            track.gainNode.gain.cancelScheduledValues(now);
            track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
            track.gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
        } else {
            // Fallback for browsers not supporting Web Audio API
            track.audio.volume = audioState.volume;
        }

            track.audio.volume = audioState.volume;
        console.log(`Note ${noteNumber} enabled`);

        // Start playback if not already playing
        if (!audioState.isPlaying && !audioState.backgroundTrack) {
            startLayeredPlayback(true);
        }
    } catch (error) {
        console.error(`Error enabling note ${noteNumber}:`, error);
    }
}


/**
 * Disable/mute a specific note
 * @param {number} noteNumber - The note number to disable
 */
export function disableNote(noteNumber) {
    const track = audioState.noteTracks.get(noteNumber);
    if (!track) {
        console.warn(`Note ${noteNumber} track not found`);
        return;
    }

    try {
        if (track.gainNode) {
            // Smooth fade out
            track.gainNode.gain.cancelScheduledValues(audioState.audioContext.currentTime);
            track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, audioState.audioContext.currentTime);
            track.gainNode.gain.linearRampToValueAtTime(0, audioState.audioContext.currentTime + 0.1);
        } else {
            track.audio.volume = 0;
        }

        console.log(`Note ${noteNumber} disabled`);
    } catch (error) {
        console.error(`Error disabling note ${noteNumber}:`, error);
    }
}

/**
 * Check if any notes are currently enabled
 * @returns {boolean} Whether any notes are enabled
 */
export function hasEnabledNotes() {
    for (const [noteNumber, track] of audioState.noteTracks) {
        if (track.gainNode && track.gainNode.gain.value > 0) {
            return true;
        } else if (!track.gainNode && track.audio.volume > 0) {
            return true;
        }
    }
    return false;
}

/**
 * Set global volume for all audio
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setGlobalVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioState.volume = clampedVolume;

    try {
        if (audioState.masterGainNode) {
            audioState.masterGainNode.gain.value = clampedVolume;
        } else {
            // Fallback for non-Web Audio API
            if (audioState.backgroundTrack) {
                audioState.backgroundTrack.audio.volume = clampedVolume;
            }

            audioState.noteTracks.forEach(track => {
                if (track.audio.volume > 0) {
                    track.audio.volume = clampedVolume;
                }
            });
        }

        console.log(`Global volume set to ${clampedVolume}`);
    } catch (error) {
        console.error('Error setting global volume:', error);
    }
}

/**
 * Get current playback state
 * @returns {Object} Playback state information
 */
export function getPlaybackState() {
    return {
        isPlaying: audioState.isPlaying,
        hasBackgroundMusic: !!audioState.backgroundTrack,
        enabledNotes: Array.from(audioState.noteTracks.entries())
            .filter(([noteNumber, track]) => {
                if (track.gainNode) {
                    return track.gainNode.gain.value > 0;
                }
                return track.audio.volume > 0;
            })
            .map(([noteNumber]) => noteNumber),
        currentTime: audioState.isPlaying ?
            (audioState.audioContext ? audioState.audioContext.currentTime - audioState.startTime : 0) :
            audioState.pauseTime
    };
}

/**
 * Cleanup audio resources
 */
export function cleanupAudio() {
    try {
        console.log('Cleaning up audio resources...');

        // Stop playback
        stopLayeredPlayback();

        // Cleanup all tracks
        if (audioState.backgroundTrack) {
            audioState.backgroundTrack.audio.removeAttribute('src');
            audioState.backgroundTrack.audio.load();
        }

        audioState.noteTracks.forEach(track => {
            track.audio.removeAttribute('src');
            track.audio.load();
        });

        // Clear state
        audioState.noteTracks.clear();
        audioState.backgroundTrack = null;

        // Close audio context
        if (audioState.audioContext && audioState.audioContext.state !== 'closed') {
            audioState.audioContext.close();
        }

        audioState.audioContext = null;
        audioState.isInitialized = false;

        console.log('Audio cleanup completed');
    } catch (error) {
        console.error('Error during audio cleanup:', error);
    }
}

// Legacy compatibility - redirect old playSound to enable/disable pattern
export function playSound(noteNumber) {
    console.warn('playSound is deprecated, using enableNote instead');
    enableNote(noteNumber);
}

// Set up cleanup on page unload
window.addEventListener('beforeunload', cleanupAudio);
window.addEventListener('unload', cleanupAudio);