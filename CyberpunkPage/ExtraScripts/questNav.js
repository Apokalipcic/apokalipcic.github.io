/* questNavigation.js - Cyberpunk Quest Navigation System
 * Handles Quest Structure, Gameplay Loop, and Map Carousel functionality
 * Uses existing effects and functions from main script.js
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all quest navigation components
    initQuestNavigation();
});

// Configuration for quest navigation
const QUEST_NAV_CONFIG = {
    carouselAutoplayInterval: 6000, // Time between auto-advancing slides
    loopCycleInterval: 5000        // Time between auto-cycling gameplay stages
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
 * Initialize gameplay loop with cycling stages
 */
function initGameplayLoop() {
    const loopStages = document.querySelectorAll('.loop-stage-box');
    if (loopStages.length === 0) return;

    // Set up hover interactions
    loopStages.forEach(stage => {
        stage.addEventListener('mouseenter', function () {
            // Use glitchElement from script.js
            if (typeof glitchElement === 'function') {
                glitchElement(this, 300);
            }
        });
    });

    // Set up auto-cycling through stages
    let currentStageIndex = 0;
    let intervalId;

    function cycleStages() {
        // Remove active class from all stages
        loopStages.forEach(stage => {
            stage.classList.remove('active');
        });

        // Add active class to current stage
        loopStages[currentStageIndex].classList.add('active');

        // Use glitchElement from script.js
        if (typeof glitchElement === 'function') {
            glitchElement(loopStages[currentStageIndex], 300);
        }

        // Increment index, loop back to start if needed
        currentStageIndex = (currentStageIndex + 1) % loopStages.length;
    }

    // Start with first stage active
    loopStages[0].classList.add('active');

    // Start the auto-cycle
    intervalId = setInterval(cycleStages, QUEST_NAV_CONFIG.loopCycleInterval);

    // Pause cycle on hover
    const loopContainer = document.querySelector('.gameplay-loop-container');
    if (loopContainer) {
        loopContainer.addEventListener('mouseenter', function () {
            clearInterval(intervalId);
        });

        loopContainer.addEventListener('mouseleave', function () {
            // Clear any existing interval
            clearInterval(intervalId);

            // Restart the interval
            intervalId = setInterval(cycleStages, QUEST_NAV_CONFIG.loopCycleInterval);
        });
    }
}

/**
 * Initialize map carousel with controls
 */
/**
 * Initialize map carousel with controls
 */
function initMapCarousel() {
    const carousel = document.querySelector('.carousel-wrapper');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const nextButton = carousel.querySelector('.carousel-button-next');
    const prevButton = carousel.querySelector('.carousel-button-prev');
    const indicators = Array.from(carousel.querySelectorAll('.carousel-indicator'));

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoplayInterval;
    let slideWidth = carousel.getBoundingClientRect().width;

    // Initialize carousel position
    function setCarouselPosition() {
        // Update the track position
        track.style.transform = `translateX(${-slideWidth * currentIndex}px)`;

        // Update active states for slides
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update active states for indicators
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Log the current state for debugging
        console.log('Current carousel index:', currentIndex);
    }

    // Move to specific slide
    function moveToSlide(index) {
        // Use glitchElement from script.js if available
        if (typeof glitchElement === 'function') {
            glitchElement(track, 300);
        }

        // Set the current index
        currentIndex = index;

        // Handle bounds
        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        } else if (currentIndex >= slides.length) {
            currentIndex = 0;
        }

        // Update carousel position
        setCarouselPosition();
        resetAutoplay();
    }

    // Add click handler for next button
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            moveToSlide(currentIndex + 1);
        });
    }

    // Add click handler for previous button
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            moveToSlide(currentIndex - 1);
        });
    }

    // Explicitly add click handlers for each indicator
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function () {
            console.log('Indicator clicked:', index);
            moveToSlide(index);
        });
    });

    // Start autoplay
    function startAutoplay() {
        // Clear any existing interval
        clearInterval(autoplayInterval);

        // Set up a new interval
        autoplayInterval = setInterval(function () {
            moveToSlide(currentIndex + 1);
        }, QUEST_NAV_CONFIG.carouselAutoplayInterval);
    }

    // Reset autoplay timer
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Reset carousel to first slide
    function resetMapCarousel() {
        currentIndex = 0;
        setCarouselPosition();
        resetAutoplay();
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        // Update slide width and recalculate position
        slideWidth = carousel.getBoundingClientRect().width;
        setCarouselPosition();
    });

    // Enable touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;

        // Detect swipe direction
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next slide
            moveToSlide(currentIndex + 1);
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - go to previous slide
            moveToSlide(currentIndex - 1);
        }
    }

    // Initialize carousel
    setCarouselPosition();
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