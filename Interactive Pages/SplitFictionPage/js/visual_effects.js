// visual-effects.js - Handles particle systems creation (DOM only, styling in CSS)

/**
 * Create star particles for Screen B (Sci-Fi)
 */
export function createStarParticles() {
    const container = document.getElementById('star-particles-b');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (Math.random() * 4 + 4) + 's';
        container.appendChild(star);
    }
}

/**
 * Create magical particles for Screen A (Fantasy)
 */
export function createMagicalParticles() {
    const container = document.getElementById('magical-particles-a');
    if (!container) return;

    // Create different types of magical particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'magical-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        container.appendChild(particle);
    }

    // Create ember particles
    for (let i = 0; i < 8; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember-particle';
        ember.style.left = Math.random() * 100 + '%';
        ember.style.top = Math.random() * 100 + '%';
        ember.style.animationDelay = Math.random() * 8 + 's';
        ember.style.animationDuration = (Math.random() * 6 + 8) + 's';
        container.appendChild(ember);
    }

    // Create sparkle particles
    for (let i = 0; i < 12; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 8 + 's';
        sparkle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(sparkle);
    }
}

/**
 * Create floating runes for Screen A (Fantasy)
 */
export function createFloatingRunes() {
    const container = document.getElementById('floating-runes-a');
    if (!container) return;

    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

    function addRune() {
        const rune = document.createElement('div');
        rune.className = 'floating-rune';
        rune.textContent = runes[Math.floor(Math.random() * runes.length)];
        rune.style.left = Math.random() * 90 + '%';
        rune.style.animationDuration = (Math.random() * 5 + 10) + 's';
        container.appendChild(rune);

        // Remove rune after animation completes
        setTimeout(() => {
            if (container.contains(rune)) {
                container.removeChild(rune);
            }
        }, 15000);
    }

    // Create initial runes and set interval for new ones
    setInterval(addRune, 3000);
    addRune(); // Create first rune immediately
}

/**
 * Initialize all particle systems
 */
export function initializeParticleSystems() {
    createStarParticles();
    createMagicalParticles();
    createFloatingRunes();
}