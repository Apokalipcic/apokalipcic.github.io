/* script.js - JavaScript functionality for Cyberpunk 2077 Portfolio */

// Configuration variables - easy to adjust
const CONFIG = {
  // Typewriter effect settings
  typewriter: {
    text: "CYBERPUNK 2077 - GAME DESIGN PORTFOLIO",
    speed: 5,            // Typing speed in milliseconds (lower = faster)
    initialDelay: 500,    // Delay before typing starts
    randomDelayChance: 0.3, // Chance of random delay on characters (0-1)
    randomDelayAmount: 100  // Max random delay in milliseconds
  },
  
  // Glitch effect settings
  glitch: {
    duration: 500,        // Duration of glitch effect in milliseconds
    interval: 3000,       // How often random glitches occur
    elementChance: 0.5    // Chance of an element being glitched (0-1)
  },
  
  // Fade in settings
  fadeIn: {
    delay: 0           // Delay before elements fade in
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the portfolio UI
  initUI();
});

function initUI() {
  // Typewriter effect for header text
  const headerText = document.getElementById('header-text');
  
  // Start with empty text
  headerText.textContent = "";
  
  // Typing effect with configured delay
  setTimeout(() => {
    typeWriter(headerText, CONFIG.typewriter.text, 0);
  }, CONFIG.typewriter.initialDelay);
  
  // Fade in footer
  const footer = document.getElementById('footer');
  if (footer) {
    setTimeout(() => {
      footer.classList.add('fade-in');
    }, CONFIG.fadeIn.delay);
  }
  
  // Apply glitch effect occasionally
  setInterval(() => {
    applyRandomGlitch();
  }, CONFIG.glitch.interval);
}

/**
 * Creates a typewriter effect for text
 * @param {HTMLElement} element - The element to apply the effect to
 * @param {string} text - The final text to be displayed
 * @param {number} i - Current character index
 */
function typeWriter(element, text, i) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    
    // Add random slight delay to some characters for realistic typing effect
    const randomDelay = Math.random() < CONFIG.typewriter.randomDelayChance 
      ? CONFIG.typewriter.randomDelayAmount 
      : 0;
    
    setTimeout(() => {
      typeWriter(element, text, i);
    }, CONFIG.typewriter.speed + randomDelay);
  } else {
    // After typing is complete, add the glitch class
    setTimeout(() => {
      element.classList.add('glitch-text');
      
      // Remove the glitch after a short time
      setTimeout(() => {
        element.classList.remove('glitch-text');
      }, CONFIG.glitch.duration);
    }, 500);
  }
}

/**
 * Applies a random glitch effect to various elements
 */
function applyRandomGlitch() {
  // Define elements that can be glitched
  const glitchableElements = [
    document.getElementById('header-text'),
    document.querySelector('.dialog-text')
  ];
  
  // For each element, decide whether to apply glitch
  glitchableElements.forEach(element => {
    if (element && Math.random() < CONFIG.glitch.elementChance) {
      // Apply glitch class
      element.classList.add('glitch-text');
      
      // Remove the glitch after configured duration
      setTimeout(() => {
        element.classList.remove('glitch-text');
      }, CONFIG.glitch.duration);
    }
  });
}

/**
 * Adds a scanline effect to the container
 * Call this function when you want to add the scanner effect
 */
function addScannerEffect() {
  const container = document.querySelector('.app-container');
  if (container) {
    container.classList.add('scanner-effect');
  }
}

/**
 * Adds CRT and noise effects to the page
 * Call this function when you want to add these effects
 */
function addCRTEffects() {
  // Create noise overlay
  const noiseOverlay = document.createElement('div');
  noiseOverlay.className = 'noise-overlay';
  document.body.appendChild(noiseOverlay);
  
  // Create CRT scanline effect
  const crtEffect = document.createElement('div');
  crtEffect.className = 'crt-effect';
  document.body.appendChild(crtEffect);
}

// Function to be called when you want to initialize all effects
function initAllEffects() {
  addScannerEffect();
  addCRTEffects();
}

// You can uncomment this line to enable all effects by default
// setTimeout(initAllEffects, CONFIG.fadeIn.delay);