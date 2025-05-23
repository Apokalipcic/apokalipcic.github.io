// audio.js - Handles creation of audio elements and sound playback

/**
 * Create audio elements for all notes
 * @param {Object} config - Application configuration
 * @param {HTMLElement} audioContainer - Container for audio elements
 */
export function createAudioElements(config, audioContainer) {
    Object.entries(config.audioFiles).forEach(([noteNumber, audioPath]) => {
        try {
            const audio = document.createElement('audio');
            audio.id = `audio-${noteNumber}`;
            audio.src = audioPath;
            audio.preload = 'auto';
            // Use the error event to silently handle missing files
            audio.onerror = () => {
                // Just silently continue if the file is missing
                console.log(`Note ${noteNumber} audio file not found, continuing without audio.`);
            };
            audioContainer.appendChild(audio);
        } catch (error) {
            // Silently continue if there's an error
            console.log(`Error creating audio for note ${noteNumber}, continuing without audio.`);
        }
    });
}

/**
 * Play a sound for a specific note
 * @param {number} noteNumber - The note number to play
 */
export function playSound(noteNumber) {
    const audio = document.getElementById(`audio-${noteNumber}`);
    if (audio) {
        try {
            // Reset the audio to start
            audio.currentTime = 0;
            audio.play().catch(error => {
                // Silently continue if there's an error playing
                // This handles cases where the audio couldn't be loaded
                // or autoplay is blocked by the browser
            });
        } catch (error) {
            // Silently continue if there's an error
        }
    }
}