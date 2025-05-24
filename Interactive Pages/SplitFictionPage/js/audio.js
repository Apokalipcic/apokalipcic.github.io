// audio.js - Handles audio elements and sound playback with improved validation and error handling

// Audio state management
let audioState = {
    loadedAudio: new Map(),
    audioContext: null,
    isInitialized: false,
    volume: 1.0
};

/**
 * Validate configuration for audio creation
 * @param {Object} config - Application configuration
 * @returns {boolean} Whether config is valid
 */
function validateConfig(config) {
    return config &&
        config.audioFiles &&
        typeof config.audioFiles === 'object' &&
        Object.keys(config.audioFiles).length > 0;
}

/**
 * Validate audio container
 * @param {HTMLElement} audioContainer - Container for audio elements
 * @returns {boolean} Whether container is valid
 */
function validateContainer(audioContainer) {
    return audioContainer &&
        audioContainer.nodeType === Node.ELEMENT_NODE &&
        audioContainer.parentNode;
}

/**
 * Initialize audio context for better performance (optional)
 */
function initializeAudioContext() {
    try {
        if (typeof AudioContext !== 'undefined') {
            audioState.audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            audioState.audioContext = new webkitAudioContext();
        }

        if (audioState.audioContext) {
            console.log('Audio context initialized');
        }
    } catch (error) {
        console.warn('Could not initialize audio context:', error);
        // Continue without audio context - basic audio will still work
    }
}

/**
 * Resume audio context if it's suspended (required by some browsers)
 */
async function resumeAudioContext() {
    if (audioState.audioContext && audioState.audioContext.state === 'suspended') {
        try {
            await audioState.audioContext.resume();
            console.log('Audio context resumed');
        } catch (error) {
            console.warn('Could not resume audio context:', error);
        }
    }
}

/**
 * Create audio elements for all notes with improved error handling
 * @param {Object} config - Application configuration
 * @param {HTMLElement} audioContainer - Container for audio elements
 */
export function createAudioElements(config, audioContainer) {
    if (!validateConfig(config)) {
        console.error('Invalid configuration provided to createAudioElements');
        return;
    }

    if (!validateContainer(audioContainer)) {
        console.error('Invalid audio container provided to createAudioElements');
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
        audioState.loadedAudio.clear();

        let successCount = 0;
        let errorCount = 0;

        Object.entries(config.audioFiles).forEach(([noteNumber, audioPath]) => {
            try {
                const noteNum = parseInt(noteNumber);
                if (isNaN(noteNum)) {
                    console.warn(`Invalid note number: ${noteNumber}`);
                    errorCount++;
                    return;
                }

                if (!audioPath || typeof audioPath !== 'string') {
                    console.warn(`Invalid audio path for note ${noteNumber}: ${audioPath}`);
                    errorCount++;
                    return;
                }

                const audio = document.createElement('audio');
                audio.id = `audio-${noteNum}`;
                audio.src = audioPath;
                audio.preload = 'auto';
                audio.volume = audioState.volume;

                // Track loading state
                let isLoaded = false;
                let hasErrored = false;

                // Success handler
                audio.addEventListener('canplaythrough', () => {
                    if (!isLoaded) {
                        isLoaded = true;
                        audioState.loadedAudio.set(noteNum, audio);
                        successCount++;
                        console.log(`Audio loaded successfully for note ${noteNum}`);
                    }
                });

                // Error handler
                audio.addEventListener('error', (event) => {
                    if (!hasErrored) {
                        hasErrored = true;
                        errorCount++;
                        console.warn(`Audio file failed to load for note ${noteNum}: ${audioPath}`, event);

                        // Remove from loaded audio map if it was added
                        audioState.loadedAudio.delete(noteNum);
                    }
                });

                // Fallback timeout for loading
                setTimeout(() => {
                    if (!isLoaded && !hasErrored) {
                        console.warn(`Audio loading timeout for note ${noteNum}`);
                        errorCount++;
                    }
                }, 10000); // 10 second timeout

                audioContainer.appendChild(audio);
            } catch (error) {
                console.warn(`Error creating audio element for note ${noteNumber}:`, error);
                errorCount++;
            }
        });

        // Log summary
        setTimeout(() => {
            console.log(`Audio creation summary - Success: ${successCount}, Errors: ${errorCount}`);
            if (errorCount > 0) {
                console.warn('Some audio files failed to load. Playback will continue silently for missing files.');
            }
        }, 1000);

    } catch (error) {
        console.error('Critical error in createAudioElements:', error);
    }
}

/**
 * Play a sound for a specific note with comprehensive error handling
 * @param {number} noteNumber - The note number to play
 */
export function playSound(noteNumber) {
    // Validate input
    if (typeof noteNumber !== 'number' || isNaN(noteNumber)) {
        console.warn('Invalid note number provided to playSound:', noteNumber);
        return;
    }

    try {
        // Resume audio context if needed (for browsers that require user interaction)
        resumeAudioContext();

        // Try to get from loaded audio map first
        let audio = audioState.loadedAudio.get(noteNumber);

        // Fallback to DOM query if not in map
        if (!audio) {
            audio = document.getElementById(`audio-${noteNumber}`);

            if (audio && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
                audioState.loadedAudio.set(noteNumber, audio);
            }
        }

        if (!audio) {
            console.warn(`No audio element found for note ${noteNumber}`);
            return;
        }

        // Check if audio is ready to play
        if (audio.readyState < 2) {
            console.warn(`Audio not ready for note ${noteNumber} (readyState: ${audio.readyState})`);
            return;
        }

        // Reset and play audio
        try {
            // Reset to start position
            audio.currentTime = 0;

            // Set volume
            audio.volume = audioState.volume;

            // Play with promise handling
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Common reasons: user hasn't interacted with page, audio blocked, etc.
                    if (error.name === 'NotAllowedError') {
                        console.warn(`Audio autoplay blocked for note ${noteNumber}. User interaction required.`);
                    } else if (error.name === 'AbortError') {
                        console.warn(`Audio playback aborted for note ${noteNumber}`);
                    } else {
                        console.warn(`Audio playback failed for note ${noteNumber}:`, error.message);
                    }
                });
            }
        } catch (error) {
            console.warn(`Error during audio playback for note ${noteNumber}:`, error);
        }
    } catch (error) {
        console.error(`Critical error in playSound for note ${noteNumber}:`, error);
    }
}

/**
 * Set global volume for all audio
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setGlobalVolume(volume) {
    if (typeof volume !== 'number' || isNaN(volume)) {
        console.warn('Invalid volume value provided');
        return;
    }

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioState.volume = clampedVolume;

    try {
        // Update all loaded audio elements
        audioState.loadedAudio.forEach((audio, noteNumber) => {
            try {
                audio.volume = clampedVolume;
            } catch (error) {
                console.warn(`Error setting volume for note ${noteNumber}:`, error);
            }
        });

        // Update any audio elements not in the map
        const allAudio = document.querySelectorAll('audio[id^="audio-"]');
        allAudio.forEach(audio => {
            try {
                audio.volume = clampedVolume;
            } catch (error) {
                console.warn('Error setting volume for audio element:', error);
            }
        });

        console.log(`Global volume set to ${clampedVolume}`);
    } catch (error) {
        console.error('Error setting global volume:', error);
    }
}

/**
 * Check if audio is supported and enabled
 * @returns {boolean} Whether audio functionality is available
 */
export function isAudioSupported() {
    try {
        return typeof Audio !== 'undefined' &&
            audioState.loadedAudio.size > 0;
    } catch (error) {
        console.warn('Error checking audio support:', error);
        return false;
    }
}

/**
 * Get audio loading status
 * @returns {Object} Status information about loaded audio
 */
export function getAudioStatus() {
    try {
        const totalExpected = document.querySelectorAll('audio[id^="audio-"]').length;
        const loadedCount = audioState.loadedAudio.size;

        return {
            totalExpected,
            loadedCount,
            loadingComplete: loadedCount === totalExpected,
            loadedNotes: Array.from(audioState.loadedAudio.keys()).sort()
        };
    } catch (error) {
        console.error('Error getting audio status:', error);
        return {
            totalExpected: 0,
            loadedCount: 0,
            loadingComplete: false,
            loadedNotes: []
        };
    }
}

/**
 * Cleanup audio resources
 */
export function cleanupAudio() {
    try {
        console.log('Cleaning up audio resources...');

        // Pause and cleanup all audio elements
        audioState.loadedAudio.forEach((audio, noteNumber) => {
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.removeAttribute('src');
                audio.load(); // Reset the audio element
            } catch (error) {
                console.warn(`Error cleaning up audio for note ${noteNumber}:`, error);
            }
        });

        // Clear the loaded audio map
        audioState.loadedAudio.clear();

        // Close audio context if it exists
        if (audioState.audioContext && audioState.audioContext.state !== 'closed') {
            audioState.audioContext.close().catch(error => {
                console.warn('Error closing audio context:', error);
            });
        }

        // Reset state
        audioState.audioContext = null;
        audioState.isInitialized = false;

        console.log('Audio cleanup completed');
    } catch (error) {
        console.error('Error during audio cleanup:', error);
    }
}

// Set up cleanup on page unload
window.addEventListener('beforeunload', cleanupAudio);
window.addEventListener('unload', cleanupAudio);

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause all playing audio when page becomes hidden
        audioState.loadedAudio.forEach((audio) => {
            try {
                if (!audio.paused) {
                    audio.pause();
                }
            } catch (error) {
                console.warn('Error pausing audio on visibility change:', error);
            }
        });
    }
});