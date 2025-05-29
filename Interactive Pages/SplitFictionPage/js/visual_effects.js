// visual-effects.js - Handles particle systems with improved validation and cleanup

// Global state for managing particle systems
let particleState = {
    runeInterval: null,
    isActive: false,
    containers: {
        starParticles: null,
        magicalParticles: null,
        floatingRunes: null
    }
};

/**
 * Validate container element exists
 * @param {string} containerId - Container element ID
 * @param {string} description - Description for logging
 * @returns {HTMLElement|null} Container element or null
 */
function validateContainer(containerId, description) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`${description} container not found: ${containerId}`);
    }
    return container;
}

/**
 * Create a particle element safely
 * @param {string} className - CSS class name for the particle
 * @param {Object} styles - Style properties to apply
 * @returns {HTMLElement|null} Created particle element or null
 */
function createParticleElement(className, styles = {}) {
    try {
        const particle = document.createElement('div');
        particle.className = className;

        // Apply styles safely
        Object.entries(styles).forEach(([property, value]) => {
            try {
                particle.style[property] = value;
            } catch (error) {
                console.warn(`Failed to set style ${property}:`, error);
            }
        });

        return particle;
    } catch (error) {
        console.error('Error creating particle element:', error);
        return null;
    }
}

/**
 * Generate safe random values with bounds checking
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random value between min and max
 */
function safeRandom(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number' || min >= max) {
        console.warn('Invalid random range, using defaults');
        return 0;
    }
    return Math.random() * (max - min) + min;
}

/**
 * Create star particles for Screen B (Sci-Fi) with validation
 */
export function createStarParticles() {
    const container = validateContainer('star-particles-b', 'Star particles');
    if (!container) return;

    try {
        particleState.containers.starParticles = container;

        // Clear existing particles
        container.innerHTML = '';

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const styles = {
                left: `${safeRandom(0, 100)}%`,
                top: `${safeRandom(0, 100)}%`,
                animationDelay: `${safeRandom(0, 6)}s`,
                animationDuration: `${safeRandom(4, 8)}s`
            };

            const star = createParticleElement('star-particle', styles);

            star.classList.add('beat-sync');

            if (star) {
                container.appendChild(star);
            }
        }

        console.log(`Created ${particleCount} star particles`);
    } catch (error) {
        console.error('Error creating star particles:', error);
    }
}

/**
 * Create magical particles for Screen A (Fantasy) with validation
 */
export function createMagicalParticles() {
    const container = validateContainer('magical-particles-a', 'Magical particles');
    if (!container) return;

    try {
        particleState.containers.magicalParticles = container;

        // Clear existing particles
        container.innerHTML = '';

        // Create different types of magical particles
        const particleTypes = [
            { className: 'magical-particle', count: 15, durationRange: [6, 10] },
            { className: 'ember-particle', count: 8, durationRange: [8, 14] },
            { className: 'sparkle-particle', count: 12, durationRange: [4, 7] }
        ];

        particleTypes.forEach(({ className, count, durationRange }) => {
            for (let i = 0; i < count; i++) {
                const styles = {
                    left: `${safeRandom(0, 100)}%`,
                    top: `${safeRandom(0, 100)}%`,
                    animationDelay: `${safeRandom(0, 8)}s`,
                    animationDuration: `${safeRandom(durationRange[0], durationRange[1])}s`
                };

                const particle = createParticleElement(className, styles);

                particle.classList.add('beat-sync');
                if (particle) {
                    container.appendChild(particle);
                }
            }
        });

        console.log('Created magical particle system');
    } catch (error) {
        console.error('Error creating magical particles:', error);
    }
}

/**
 * Create floating runes for Screen A (Fantasy) with cleanup management
 */
export function createFloatingRunes() {
    const container = validateContainer('floating-runes-a', 'Floating runes');
    if (!container) return;

    try {
        particleState.containers.floatingRunes = container;
        particleState.isActive = true;

        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

        /**
         * Add a single rune with validation
         */
        function addRune() {
            if (!particleState.isActive || !container.parentNode) {
                // Stop if not active or container removed
                return;
            }

            try {
                const runeText = runes[Math.floor(safeRandom(0, runes.length))];
                if (!runeText) return;

                const styles = {
                    left: `${safeRandom(0, 90)}%`,
                    animationDuration: `${safeRandom(10, 15)}s`
                };

                const rune = createParticleElement('floating-rune', styles);
                if (rune) {
                    rune.textContent = runeText;
                    container.appendChild(rune);

                    rune.classList.add('beat-sync');

                    // Remove rune after animation with error handling
                    setTimeout(() => {
                        try {
                            if (container.contains(rune)) {
                                container.removeChild(rune);
                            }
                        } catch (error) {
                            console.warn('Error removing rune:', error);
                        }
                    }, 15000);
                }
            } catch (error) {
                console.warn('Error adding rune:', error);
            }
        }

        // Create initial rune
        addRune();

        // Set up interval with cleanup tracking
        if (particleState.runeInterval) {
            clearInterval(particleState.runeInterval);
        }

        particleState.runeInterval = setInterval(addRune, 3000);

        console.log('Floating runes system initialized');
    } catch (error) {
        console.error('Error creating floating runes:', error);
    }
}

/**
 * Cleanup particle systems with comprehensive cleanup
 */
export function cleanupParticleSystems() {
    try {
        console.log('Cleaning up particle systems...');

        // Stop rune generation
        particleState.isActive = false;

        // Clear intervals
        if (particleState.runeInterval) {
            clearInterval(particleState.runeInterval);
            particleState.runeInterval = null;
        }

        // Clear containers
        Object.values(particleState.containers).forEach(container => {
            if (container) {
                try {
                    container.innerHTML = '';
                } catch (error) {
                    console.warn('Error clearing particle container:', error);
                }
            }
        });

        // Reset state
        particleState.containers = {
            starParticles: null,
            magicalParticles: null,
            floatingRunes: null
        };

        console.log('Particle systems cleanup completed');
    } catch (error) {
        console.error('Error during particle systems cleanup:', error);
    }
}

/**
 * Reinitialize all particle systems (useful for resets)
 */
export function reinitializeParticleSystems() {
    try {
        console.log('Reinitializing particle systems...');

        cleanupParticleSystems();

        // Small delay to ensure cleanup is complete
        setTimeout(() => {
            initializeParticleSystems();
        }, 100);
    } catch (error) {
        console.error('Error reinitializing particle systems:', error);
    }
}

/**
 * Check if particle systems are responsive (for performance monitoring)
 * @returns {boolean} Whether systems are performing well
 */
export function checkParticlePerformance() {
    try {
        const totalParticles = Object.values(particleState.containers)
            .filter(container => container)
            .reduce((total, container) => {
                return total + (container.children ? container.children.length : 0);
            }, 0);

        // Warn if too many particles (performance threshold)
        if (totalParticles > 100) {
            console.warn(`High particle count detected: ${totalParticles}`);
            return false;
        }

        return true;
    } catch (error) {
        console.warn('Error checking particle performance:', error);
        return false;
    }
}

/**
 * Adjust particle density based on performance
 * @param {number} performanceLevel - Performance level (0-1, where 1 is best)
 */
export function adjustParticleDensity(performanceLevel = 1) {
    if (typeof performanceLevel !== 'number' || performanceLevel < 0 || performanceLevel > 1) {
        console.warn('Invalid performance level, using default');
        performanceLevel = 1;
    }

    try {
        // Reduce particles if performance is poor
        if (performanceLevel < 0.5) {
            console.log('Reducing particle density for performance');

            Object.values(particleState.containers).forEach(container => {
                if (container && container.children) {
                    // Remove every other particle
                    Array.from(container.children).forEach((child, index) => {
                        if (index % 2 === 0) {
                            try {
                                container.removeChild(child);
                            } catch (error) {
                                console.warn('Error removing particle for performance:', error);
                            }
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error adjusting particle density:', error);
    }
}

/**
 * Create grass animation for Screen A (Fantasy) with simple left-right beat sway
 */
export function createGrassAnimation() {
    const container = validateContainer('grass-container-a', 'Grass container');
    if (!container) return;

    try {
        const canvas = document.getElementById('grass-canvas');
        if (!canvas) {
            console.warn('Grass canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        const stack = [];
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || window.innerHeight / 2;

        canvas.width = w;
        canvas.height = h;

        // Beat tracking - simple left/right alternation
        let swayDirection = 0; // 0 = center, -1 = left, 1 = right
        let currentBeatPhase = 0; // Track beat state
        let swayAmount = 15; // How much to sway

        // Listen for beat changes from pulse synchronizer
        const checkBeatState = () => {
            const computedStyle = getComputedStyle(document.documentElement);
            const brightness = parseFloat(computedStyle.getPropertyValue('--beat-brightness')) || 1;

            // Detect beat phase change
            if (brightness > 1.1 && currentBeatPhase === 0) {
                // Beat just started - alternate sway direction
                currentBeatPhase = 1;
                swayDirection = swayDirection === 1 ? -1 : 1; // Alternate between left and right
            } else if (brightness <= 1.1 && currentBeatPhase === 1) {
                // Beat ended
                currentBeatPhase = 0;
            }
        };

        const drawer = function () {
            ctx.clearRect(0, 0, w, h);
            checkBeatState();

            stack.forEach(function (el) {
                el();
            });
            requestAnimationFrame(drawer);
        };

        const anim = function () {
            let x = 0;
            const speed = Math.random() * 7;
            const position = Math.random() * w - w / 2;
            const maxTall = (Math.random() * 0.8 + 0.6) * (h * 0.2); // 40%-100% of container height
            const maxSize = Math.random() * 10 + 5;
            const c = function (l, u) {
                return Math.round(Math.random() * (u || 255) + l || 0);
            };
            const color = "rgb(" + c(60, 10) + "," + c(201, 50) + "," + c(120, 50) + ")";

            // Store target sway for smooth transitions
            let currentSway = 0;
            let targetSway = 0;

            return function () {
                // Update target sway based on beat
                targetSway = swayDirection * swayAmount;

                // Smooth transition to target (simulating CSS transition 0.3s)
                const transitionSpeed = 0.1; // Adjust for smoother/faster transition
                currentSway += (targetSway - currentSway) * transitionSpeed;

                const tall = Math.min(x / 5, maxTall);
                const size = Math.min(x / 50, maxSize);

                x += speed;
                ctx.save();
                ctx.strokeWidth = 10;
                ctx.translate(w / 2 + position, h);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.lineTo(-size, 0);
                ctx.quadraticCurveTo(-size, -tall / 2, currentSway, -tall);
                ctx.quadraticCurveTo(size, -tall / 2, size, 0);
                ctx.fill();
                ctx.restore();
            };
        };

        for (var i = 0; i < 300; i++) {
            stack.push(anim());
        }

        drawer();
        console.log('Simple left-right beat sway animation initialized');
    } catch (error) {
        console.error('Error creating grass animation:', error);
    }
}

/**
 * Initialize all particle systems with error handling
 */
export function initializeParticleSystems() {
    try {
        console.log('Initializing particle systems...');

        // Initialize each system independently
        createStarParticles();
        createMagicalParticles();
        createFloatingRunes();
        createGrassAnimation();


        // Set up performance monitoring
        setTimeout(() => {
            const isPerformant = checkParticlePerformance();
            if (!isPerformant) {
                adjustParticleDensity(0.5);
            }
        }, 5000);

        // Set up cleanup on page unload
        window.addEventListener('beforeunload', cleanupParticleSystems);
        window.addEventListener('unload', cleanupParticleSystems);

        // Handle visibility change (pause/resume on tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                particleState.isActive = false;
            } else {
                particleState.isActive = true;
            }
        });

        console.log('Particle systems initialized successfully');
    } catch (error) {
        console.error('Error initializing particle systems:', error);
    }
}