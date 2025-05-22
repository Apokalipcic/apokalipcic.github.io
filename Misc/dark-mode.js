// dark-mode.js - Dark Mode Toggle with Page Ripple Effect

document.addEventListener('DOMContentLoaded', function () {

    // Theme management
    const THEME_KEY = 'portfolio-theme';
    const LIGHT_THEME = 'light';
    const DARK_THEME = 'dark';

    // Configuration for custom icons (set these before calling initializeDarkMode)
    const iconConfig = {
        useSVG: false, // Set to true to use custom SVG icons
        sunIconPath: 'Images/Elements/Icons/sun-icon.svg', // Path to sun SVG file
        moonIconPath: 'Images/Elements/Icons/moon-icon.svg', // Path to moon SVG file
        sunIconHTML: '☀️', // Fallback emoji or HTML
        moonIconHTML: '🌙' // Fallback emoji or HTML
    };

    // Function to load SVG icon
    async function loadSVGIcon(path) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('Failed to load SVG icon:', path, error);
        }
        return null;
    }

    // Function to update icons based on configuration
    async function updateToggleIcons() {
        if (!toggleButton) return;

        const sunIconElement = toggleButton.querySelector('.sun-icon');
        const moonIconElement = toggleButton.querySelector('.moon-icon');

        if (iconConfig.useSVG && iconConfig.sunIconPath && iconConfig.moonIconPath) {
            // Load SVG icons
            const sunSVG = await loadSVGIcon(iconConfig.sunIconPath);
            const moonSVG = await loadSVGIcon(iconConfig.moonIconPath);

            if (sunSVG && moonSVG) {
                sunIconElement.innerHTML = sunSVG;
                moonIconElement.innerHTML = moonSVG;
                return;
            }
        }

        // Fallback to configured HTML/emoji
        sunIconElement.innerHTML = iconConfig.sunIconHTML;
        moonIconElement.innerHTML = iconConfig.moonIconHTML;
    }

    let currentTheme = LIGHT_THEME;
    let isAnimating = false;

    // DOM elements
    let toggleButton = null;
    let rippleOverlay = null;

    // Initialize dark mode functionality
    function initializeDarkMode() {
        createToggleButton();
        createRippleOverlay();
        updateToggleIcons(); // Apply custom icons
        loadSavedTheme();
        setupEventListeners();
    }

    // Create the dark mode toggle button
    function createToggleButton() {
        // Create toggle button HTML structure with SVG support
        const toggleHTML = `
            <button class="dark-mode-toggle" id="darkModeToggle" aria-label="Toggle dark mode">
                <div class="toggle-inner">
                    <div class="toggle-face sun-face">
                        <span class="toggle-icon sun-icon">☀️</span>
                    </div>
                    <div class="toggle-face moon-face">
                        <span class="toggle-icon moon-icon">🌙</span>
                    </div>
                </div>
            </button>
        `;

        // Find the social icons container in header
        const socialIcons = document.querySelector('.social-icons');

        if (socialIcons) {
            // Insert toggle button AFTER the last social icon (LinkedIn)
            socialIcons.insertAdjacentHTML('beforeend', toggleHTML);
            toggleButton = document.getElementById('darkModeToggle');
        } else {
            // Fallback: add to header container
            const headerContainer = document.querySelector('#header .container');
            if (headerContainer) {
                headerContainer.insertAdjacentHTML('beforeend', toggleHTML);
                toggleButton = document.getElementById('darkModeToggle');
            }
        }
    }

    // Create ripple overlay container
    function createRippleOverlay() {
        rippleOverlay = document.createElement('div');
        rippleOverlay.className = 'page-ripple-overlay';
        document.body.appendChild(rippleOverlay);
    }

    // Load saved theme from localStorage
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme && (savedTheme === LIGHT_THEME || savedTheme === DARK_THEME)) {
            currentTheme = savedTheme;
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                currentTheme = DARK_THEME;
            }
        }

        applyTheme(currentTheme, false); // Apply without animation on page load
    }

    // Save theme to localStorage
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    // Apply theme to document
    function applyTheme(theme, animate = true) {
        const htmlElement = document.documentElement;

        if (theme === DARK_THEME) {
            htmlElement.setAttribute('data-theme', 'dark');
            // Set button to dark state
            if (toggleButton) {
                toggleButton.classList.add('dark-theme');
            }
        } else {
            htmlElement.removeAttribute('data-theme');
            // Set button to light state
            if (toggleButton) {
                toggleButton.classList.remove('dark-theme');
            }
        }

        currentTheme = theme;
        saveTheme(theme);
    }

    // Create page-wide ripple effect
    function createPageRipple(clickEvent) {
        if (!rippleOverlay || !toggleButton) return;

        // Get button position relative to viewport
        const buttonRect = toggleButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + (buttonRect.width / 2);
        const buttonCenterY = buttonRect.top + (buttonRect.height / 2);

        // Calculate maximum distance to cover entire screen
        const maxDistance = Math.sqrt(
            Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
        );

        // Create ripple element
        const ripple = document.createElement('div');
        ripple.className = 'page-ripple';

        // Set ripple position and initial size
        const rippleSize = maxDistance * 2;
        ripple.style.width = rippleSize + 'px';
        ripple.style.height = rippleSize + 'px';
        ripple.style.left = (buttonCenterX - rippleSize / 2) + 'px';
        ripple.style.top = (buttonCenterY - rippleSize / 2) + 'px';

        // Set ripple color based on target theme
        const targetTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
        if (targetTheme === DARK_THEME) {
            ripple.style.background = 'radial-gradient(circle, #121212 0%, #1e1e1e 50%, transparent 70%)';
        } else {
            ripple.style.background = 'radial-gradient(circle, #ffffff 0%, #f0f0f0 50%, transparent 70%)';
        }

        // Add ripple to overlay
        rippleOverlay.appendChild(ripple);

        // Trigger animation
        requestAnimationFrame(() => {
            ripple.classList.add('expanding');
        });

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1200);
    }

    // Handle toggle button click
    function handleToggleClick(event) {
        if (isAnimating) return;

        isAnimating = true;

        // Create ripple effect
        createPageRipple(event);

        // Add coin flip animation
        if (toggleButton) {
            toggleButton.classList.add('flipping');
        }

        // Change theme after short delay for visual effect
        setTimeout(() => {
            const newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
            applyTheme(newTheme, true);

            // Remove flip animation class after theme is applied
            setTimeout(() => {
                if (toggleButton) {
                    toggleButton.classList.remove('flipping');
                }
            }, 100);
        }, 300);

        // Reset animation state
        setTimeout(() => {
            isAnimating = false;
        }, 1200);
    }

    // Setup event listeners
    function setupEventListeners() {
        if (toggleButton) {
            toggleButton.addEventListener('click', handleToggleClick);
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', function (e) {
                // Only auto-switch if user hasn't manually set a preference
                const savedTheme = localStorage.getItem(THEME_KEY);
                if (!savedTheme) {
                    const systemTheme = e.matches ? DARK_THEME : LIGHT_THEME;
                    applyTheme(systemTheme, false);
                }
            });
        }

        // Handle keyboard accessibility
        if (toggleButton) {
            toggleButton.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleToggleClick(event);
                }
            });
        }
    }

    // Public API for external access
    window.DarkModeAPI = {
        getCurrentTheme: () => currentTheme,
        setTheme: (theme, animate = true) => {
            if (theme === LIGHT_THEME || theme === DARK_THEME) {
                applyTheme(theme, animate);
            }
        },
        toggleTheme: () => {
            if (!isAnimating && toggleButton) {
                toggleButton.click();
            }
        },
        isAnimating: () => isAnimating,
        // Icon configuration methods
        setIcons: (sunPath, moonPath) => {
            iconConfig.useSVG = true;
            iconConfig.sunIconPath = sunPath;
            iconConfig.moonIconPath = moonPath;
            updateToggleIcons();
        },
        setIconsHTML: (sunHTML, moonHTML) => {
            iconConfig.useSVG = false;
            iconConfig.sunIconHTML = sunHTML;
            iconConfig.moonIconHTML = moonHTML;
            updateToggleIcons();
        }
    };

    // Initialize everything
    initializeDarkMode();

    // Enhanced integration with existing cat paw trail
    function updateCatPawColors() {
        const pawPrints = document.querySelectorAll('.paw-print');
        pawPrints.forEach(paw => {
            // Force re-render to apply new CSS custom property values
            paw.style.display = 'none';
            paw.offsetHeight; // Trigger reflow
            paw.style.display = '';
        });
    }

    // Listen for theme changes to update dynamic elements
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                // Theme changed, update dynamic elements
                updateCatPawColors();

                // Dispatch custom event for other components
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme: currentTheme }
                }));
            }
        });
    });

    // Start observing theme changes
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // Cleanup function
    window.addEventListener('beforeunload', function () {
        observer.disconnect();
    });
});