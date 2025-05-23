/* questNav.js - Enhanced Cyberpunk Quest Navigation System
 * Provides full navigation functionality for Cyberpunk 2077 quest design portfolio
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all quest navigation components
    initQuestNavigation();
});

// Configuration for quest navigation
const QUEST_NAV_CONFIG = {
    carouselAutoplayInterval: 6000,    // Time between auto-advancing slides (ms)
    transitionSpeed: 500,              // Transition speed for slides (ms)
    loopCycleInterval: 4000,           // Time between auto-cycling gameplay stages
    glitchProbability: 0.2,            // Probability of random glitch effect (0-1)
    glitchDuration: 300,               // Duration of glitch effect (ms)
    chipTransitionDelay: 500           // Delay for chip transition effect (ms)
};

/**
 * Main initialization function for quest navigation
 */
function initQuestNavigation() {
    // Initialize tab navigation if it exists
    initQuestTabs();

    // Initialize the quest structure flowchart
    initQuestStructure();

    // Initialize gameplay loop animation
    initGameplayLoop();

    // Initialize map carousel
    initMapCarousel();

    // Add periodic random glitch effects for cyberpunk feel
    initRandomGlitches();
}

/**
 * Initialize tab navigation for quest sections
 */
function initQuestTabs() {
    const tabLinks = document.querySelectorAll('.quest-nav-tab');
    const sections = document.querySelectorAll('.quest-nav-section');

    if (tabLinks.length === 0 || sections.length === 0) return;

    tabLinks.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Get target section from data attribute
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return;

            // Remove active class from all tabs and sections
            tabLinks.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show target section
            const section = document.getElementById(targetSection);
            if (section) {
                // Use showWithGlitch from script.js if available
                if (typeof showWithGlitch === 'function') {
                    section.style.opacity = '0';
                    section.classList.add('active');
                    showWithGlitch(section);
                } else {
                    // Fallback if function isn't available
                    section.classList.add('active');
                }

                // Re-initialize section content if needed
                switch (targetSection) {
                    case 'quest-structure-section':
                        initQuestStructure();
                        break;
                    case 'gameplay-loop-section':
                        initGameplayLoop();
                        break;
                    case 'map-sketch-section':
                        resetMapCarousel();
                        break;
                }
            }
        });
    });

    // Activate first tab by default if none is active
    if (!document.querySelector('.quest-nav-tab.active') && tabLinks.length > 0) {
        tabLinks[0].click();
    }
}

/**
 * Initialize the quest structure flowchart with expandable nodes
 */
function initQuestStructure() {
    const mainNodes = document.querySelectorAll('.quest-node-main');
    if (mainNodes.length === 0) return;

    // Add click event to each main node
    mainNodes.forEach(node => {
        node.addEventListener('click', function () {
            // Find the sub-container associated with this node
            const subContainer = this.nextElementSibling;
            if (!subContainer || !subContainer.classList.contains('quest-node-sub-container')) return;

            // Toggle the expanded class
            subContainer.classList.toggle('expanded');

            // Use existing glitchElement function from script.js
            if (typeof glitchElement === 'function') {
                glitchElement(this, 500);
            }
        });
    });

    // Expand the first node by default if none are expanded
    if (!document.querySelector('.quest-node-sub-container.expanded') && mainNodes.length > 0) {
        const firstSubContainer = mainNodes[0].nextElementSibling;
        if (firstSubContainer && firstSubContainer.classList.contains('quest-node-sub-container')) {
            firstSubContainer.classList.add('expanded');
        }
    }
}

/**
 * Initialize gameplay loop with cycling stages in specified order
 */
function initGameplayLoop() {
    // Get all stage boxes
    const loopStages = document.querySelectorAll('.loop-stage-box');
    if (loopStages.length === 0) return;

    // Get tooltips
    const tooltips = document.querySelectorAll('.loop-tooltip');

    // Define the cycle order by stage title text
    // Rei Owns Chip > Rei Attacks Player > Player Hides > Player Uses Environment > 
    // Chip Changes Owner > Player Owns Chip > Rei Hides > Player Attacks Rei > loop
    const cycleOrder = [
        'REI OWNS THE CHIP',
        'REI ATTACKS PLAYER',
        'PLAYER HIDES',
        'PLAYER USES ENVIRONMENT',
        'CHIP CHANGES OWNER',
        'PLAYER OWNS THE CHIP',
        'REI HIDES',
        'PLAYER ATTACKS REI'
    ];

    let currentStageIndex = 0;
    let intervalId;

    // Map of stage titles to their DOM elements for quicker access
    const stageMap = {};

    // Initialize tooltips and stage mapping
    function initTooltips() {
        // Create a map of stage boxes by their title text
        loopStages.forEach(stage => {
            const titleElement = stage.querySelector('.loop-stage-title');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                stageMap[title] = stage;

                // Position tooltip next to the corresponding stage box
                const tooltip = Array.from(tooltips).find(t => t.getAttribute('data-for') === title);
                if (tooltip) {
                    positionTooltip(stage, tooltip);

                    // Add mouse events to the stage box to show/hide tooltip
                    stage.addEventListener('mouseenter', function () {
                        showTooltip(tooltip);

                        // Use glitchElement from script.js if available
                        if (typeof glitchElement === 'function') {
                            glitchElement(this, 300);
                        }
                    });

                    stage.addEventListener('mouseleave', function () {
                        hideTooltip(tooltip);
                    });
                }
            }
        });
    }

    /**
     * Position tooltip relative to its stage box
     */
    function positionTooltip(stageBox, tooltip) {
        // Get stage box position
        const stageRect = stageBox.getBoundingClientRect();
        const containerRect = stageBox.closest('.gameplay-diagram').getBoundingClientRect();

        // Calculate relative position
        const boxTop = stageRect.top - containerRect.top;
        const boxLeft = stageRect.left - containerRect.left;

        // Determine which column this box is in
        const isRightColumn = stageBox.closest('.right-column') !== null;
        const isConvergence = stageBox.closest('.loop-stage-convergence') !== null;
        const isTransition = stageBox.closest('.loop-stage-transition') !== null;

        // Position tooltip to the side of the box with slight offset
        if (isConvergence || isTransition) {
            // Position to the right for central elements
            tooltip.style.top = `${boxTop}px`;
            tooltip.style.left = `${boxLeft + stageRect.width + 20}px`;
            tooltip.style.borderLeftColor = stageBox.classList.contains('env-box') ? '#00bcd4' : '#ff3b30';
        } else if (isRightColumn) {
            // Position to the left for right column elements
            tooltip.style.top = `${boxTop}px`;
            tooltip.style.left = `${boxLeft - 240}px`;
            tooltip.style.borderRightColor = '#ff3b30';
            tooltip.style.borderLeft = 'none';
            tooltip.style.borderRight = '2px solid #ff3b30';
        } else {
            // Position to the right for left column elements
            tooltip.style.top = `${boxTop}px`;
            tooltip.style.left = `${boxLeft + stageRect.width + 20}px`;
            tooltip.style.borderLeftColor = '#ff3b30';
        }
    }

    /**
     * Show tooltip with fade in effect
     */
    function showTooltip(tooltip) {
        if (!tooltip) return;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    }

    /**
     * Hide tooltip with fade out effect
     */
    function hideTooltip(tooltip) {
        if (!tooltip) return;
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }

    /**
     * Cycle to the next stage in the defined order
     */
    function cycleToNextStage() {
        // Remove active class from all stages
        loopStages.forEach(stage => {
            stage.classList.remove('active');
        });

        // Find the current stage by title text
        const currentStageName = cycleOrder[currentStageIndex];
        const nextStage = stageMap[currentStageName];

        // If stage found, activate it
        if (nextStage) {
            nextStage.classList.add('active');

            // Apply glitch effect to the active stage
            if (typeof glitchElement === 'function') {
                glitchElement(nextStage, 300);
            }

            // If this is a special stage like "CHIP CHANGES OWNER", apply extra effects
            if (currentStageName === 'CHIP CHANGES OWNER') {
                // Apply more dramatic glitch effect to the gameplay container
                if (typeof applyGlitch === 'function') {
                    setTimeout(() => {
                        const gameplayContainer = document.querySelector('.gameplay-loop-container');
                        if (gameplayContainer) {
                            applyGlitch(gameplayContainer, 500);
                        }
                    }, QUEST_NAV_CONFIG.chipTransitionDelay || 500);
                }

                // Apply chip transition animation
                nextStage.style.animation = 'chipTransition 2s';
                setTimeout(() => {
                    nextStage.style.animation = '';
                }, 2000);
            }

            // Update stage index for next cycle
            currentStageIndex = (currentStageIndex + 1) % cycleOrder.length;
        }
    }

    // Handle window resize to reposition tooltips
    function handleResize() {
        // Reposition all tooltips
        loopStages.forEach(stage => {
            const titleElement = stage.querySelector('.loop-stage-title');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                const tooltip = Array.from(tooltips).find(t => t.getAttribute('data-for') === title);
                if (tooltip) {
                    positionTooltip(stage, tooltip);
                }
            }
        });
    }

    window.addEventListener('resize', handleResize);

    // Initialize tooltips
    initTooltips();

    // Start with the first stage active
    cycleToNextStage();

    // Set up auto-cycling through stages
    intervalId = setInterval(cycleToNextStage, QUEST_NAV_CONFIG.loopCycleInterval || 4000);

    // Pause cycling on hover over the gameplay loop container
    const loopContainer = document.querySelector('.gameplay-loop-container');
    if (loopContainer) {
        loopContainer.addEventListener('mouseenter', function () {
            clearInterval(intervalId);
        });

        loopContainer.addEventListener('mouseleave', function () {
            // Clear any existing interval
            clearInterval(intervalId);

            // Restart the interval
            intervalId = setInterval(cycleToNextStage, QUEST_NAV_CONFIG.loopCycleInterval || 4000);
        });
    }

    // Enhance timer elements with pulsing effect
    const timerElements = document.querySelectorAll('.timer-icon');
    if (timerElements.length > 0) {
        timerElements.forEach(timer => {
            timer.style.animation = 'timerPulse 3s infinite';
        });
    }
}

/**
 * Enhanced map carousel with improved functionality
 */
function initMapCarousel() {
    const carousel = document.querySelector('.carousel-wrapper');
    if (!carousel) {
        console.warn('Carousel wrapper not found');
        return;
    }

    const track = carousel.querySelector('.carousel-track');
    if (!track) {
        console.warn('Carousel track not found');
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) {
        console.warn('No carousel slides found');
        return;
    }

    const nextButton = carousel.querySelector('.carousel-button-next');
    const prevButton = carousel.querySelector('.carousel-button-prev');
    const indicators = Array.from(document.querySelectorAll('.carousel-indicator'));

    // Carousel state
    let currentIndex = 0;
    let autoplayInterval;
    let isDragging = false;
    let startPosX = 0;
    let currentTranslateX = 0;
    let slideWidth = carousel.getBoundingClientRect().width;
    let animationFrameId = null;

    /**
     * Set carousel position based on current index
     */
    function setCarouselPosition(animate = true) {
        if (!track) return;

        const translateValue = -slideWidth * currentIndex;

        if (animate) {
            track.style.transition = `transform ${QUEST_NAV_CONFIG.transitionSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        } else {
            track.style.transition = 'none';
        }

        track.style.transform = `translateX(${translateValue}px)`;

        // Update active states for slides
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);

            // Apply random glitch effect to active slide sometimes
            if (index === currentIndex && Math.random() < QUEST_NAV_CONFIG.glitchProbability) {
                if (typeof glitchElement === 'function') {
                    glitchElement(slide, QUEST_NAV_CONFIG.glitchDuration);
                }
            }
        });

        // Update active states for indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    /**
     * Move to specific slide
     */
    function moveToSlide(index, animate = true) {
        // Use glitchElement from script.js if available
        if (typeof glitchElement === 'function') {
            glitchElement(track, 300);
        }

        // Update current index with boundary checking
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));

        // If we're at the end and try to go further, do a special glitch effect
        if (index >= slides.length) {
            currentIndex = 0;
            applyExtraGlitch();
        } else if (index < 0) {
            currentIndex = slides.length - 1;
            applyExtraGlitch();
        }

        // Update carousel position
        setCarouselPosition(animate);
        resetAutoplay();
    }

    /**
     * Apply a more intense glitch effect for wrap-around
     */
    function applyExtraGlitch() {
        if (typeof applyGlitch !== 'function') return;

        // Apply glitch to multiple elements for more impact
        applyGlitch(track, 500);

        if (slides[currentIndex]) {
            applyGlitch(slides[currentIndex], 400);
        }

        const titles = document.querySelectorAll('.carousel-title');
        titles.forEach(title => {
            applyGlitch(title, 300);
        });
    }

    /**
     * Start autoplay function
     */
    function startAutoplay() {
        // Clear any existing interval
        clearInterval(autoplayInterval);

        // Set up a new interval
        autoplayInterval = setInterval(function () {
            moveToSlide(currentIndex + 1);
        }, QUEST_NAV_CONFIG.carouselAutoplayInterval);
    }

    /**
     * Reset autoplay timer
     */
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    /**
     * Reset carousel to first slide
     */
    function resetMapCarousel() {
        currentIndex = 0;
        setCarouselPosition(false); // Don't animate for initial position
        resetAutoplay();
    }

    /**
     * Handle touch/mouse start for dragging
     */
    function handleDragStart(e) {
        // Prevent default only for mouse events, not touch
        if (e.type === 'mousedown') {
            e.preventDefault();
        }

        isDragging = true;
        startPosX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;

        // Disable transition during drag
        track.style.transition = 'none';

        // Cancel any ongoing animation
        cancelAnimationFrame(animationFrameId);

        // Clear autoplay while dragging
        clearInterval(autoplayInterval);
    }

    /**
     * Handle touch/mouse move for dragging
     */
    function handleDragMove(e) {
        if (!isDragging) return;

        const currentPosX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const diff = currentPosX - startPosX;

        // Calculate what the new translate should be
        const translateX = -currentIndex * slideWidth + diff;

        // Apply resistance as user drags beyond limits
        if (currentIndex === 0 && diff > 0) {
            // Dragging left at first slide - add resistance
            currentTranslateX = translateX * 0.3;
        } else if (currentIndex === slides.length - 1 && diff < 0) {
            // Dragging right at last slide - add resistance
            currentTranslateX = -currentIndex * slideWidth + (diff * 0.3);
        } else {
            // Normal drag
            currentTranslateX = translateX;
        }

        // Update position
        track.style.transform = `translateX(${currentTranslateX}px)`;
    }

    /**
     * Handle touch/mouse end for dragging
     */
    function handleDragEnd(e) {
        if (!isDragging) return;

        isDragging = false;

        // Calculate how far the carousel was dragged
        const endPosX = e.type.includes('touch') ?
            (e.changedTouches ? e.changedTouches[0].clientX : startPosX) :
            e.clientX;

        const dragDistance = endPosX - startPosX;
        const dragThreshold = slideWidth * 0.2; // 20% of slide width as threshold

        // Enable transitions again
        track.style.transition = `transform ${QUEST_NAV_CONFIG.transitionSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)`;

        // Determine direction based on drag distance
        if (dragDistance > dragThreshold) {
            // Dragged right enough to move to previous slide
            moveToSlide(currentIndex - 1);
        } else if (dragDistance < -dragThreshold) {
            // Dragged left enough to move to next slide
            moveToSlide(currentIndex + 1);
        } else {
            // Not dragged enough, snap back to current slide
            setCarouselPosition();
        }

        // Restart autoplay
        startAutoplay();
    }

    /**
     * Add event listeners for drag/swipe
     */
    function addDragListeners() {
        // Mouse events
        carousel.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        // Touch events
        carousel.addEventListener('touchstart', handleDragStart, { passive: true });
        carousel.addEventListener('touchmove', handleDragMove, { passive: true });
        carousel.addEventListener('touchend', handleDragEnd, { passive: true });
    }

    /**
     * Initialize slide descriptions with cyberpunk effects
     */
    function initSlideDescriptions() {
        slides.forEach(slide => {
            const description = slide.querySelector('.carousel-description');
            const title = slide.querySelector('.carousel-title');

            if (title && Math.random() < 0.5 && typeof createTextScramble === 'function') {
                // Randomly apply scramble effect to some titles
                createTextScramble(title, title.textContent, 'finite', {
                    finite: { duration: 2000 }
                });
            }
        });
    }

    // Add click handler for next button
    if (nextButton) {
        nextButton.addEventListener('click', function (e) {
            e.preventDefault();
            moveToSlide(currentIndex + 1);
        });
    }

    // Add click handler for previous button
    if (prevButton) {
        prevButton.addEventListener('click', function (e) {
            e.preventDefault();
            moveToSlide(currentIndex - 1);
        });
    }

    // Add click handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function (e) {
            e.preventDefault();
            moveToSlide(index);
        });
    });

    // Handle window resize
    function handleResize() {
        // Update slide width and recalculate position
        slideWidth = carousel.getBoundingClientRect().width;
        setCarouselPosition(false); // Don't animate for resize
    }

    window.addEventListener('resize', handleResize);

    // Initialize carousel
    addDragListeners();
    initSlideDescriptions();
    resetMapCarousel();
    startAutoplay();

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', function () {
        clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', function () {
        startAutoplay();
    });

    // Make resetMapCarousel available globally
    window.resetMapCarousel = resetMapCarousel;
}

/**
 * Add random glitch effects to elements across the quest UI
 */
function initRandomGlitches() {
    // Exit if glitchElement function doesn't exist
    if (typeof glitchElement !== 'function') return;

    // Elements that could receive random glitches
    const glitchTargets = [
        '.quest-nav-title',
        '.carousel-title',
        '.quest-node-main-text',
        '.loop-stage-title'
    ];

    // Apply random glitches periodically
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance of triggering a glitch
            // Select a random target group
            const targetSelector = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
            const targets = document.querySelectorAll(targetSelector);

            if (targets.length > 0) {
                // Select a random element from the group
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];

                // Apply glitch effect
                glitchElement(randomTarget, 300 + Math.random() * 500);
            }
        }
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds
}

// Export functions for global use
window.initQuestNavigation = initQuestNavigation;
window.resetMapCarousel = resetMapCarousel;