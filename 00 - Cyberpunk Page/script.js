/* script.js - Enhanced JavaScript functionality for Cyberpunk 2077 Portfolio */

// Global configuration
const CONFIG = {
  typewriter: {
    defaultSpeed: 50,            // Default typing speed in milliseconds
    defaultDelay: 500,           // Default delay before typing starts
    randomDelayChance: 0.3,      // Chance of random delay (0-1)
    randomDelayAmount: 100       // Max random delay in milliseconds
  },
  
  glitch: {
    defaultDuration: 500,        // Default duration of glitch effect
    defaultInterval: 3000,       // Default interval for random glitches
    elementChance: 0.5           // Chance of element being glitched (0-1)
  }
};

// Dialog system configuration
const DIALOG_CONFIG = {
  defaultDelay: 100,      // Default delay between dialogs
  defaultDuration: 4000,  // Default duration to show each dialog
  fadeSpeed: 300,         // Fade transition speed in ms
  audioEnabled: true      // Global toggle for audio
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize effects
  initTypewriterElements();
  initGlitchElements();
  initRandomGlitches();
  initScannerEffects();

  // Initialize dialog system
  initDialogSystem();
  
  // Show incoming call with delay
  setTimeout(function() {
    const fixerCallSection = document.querySelector('.fixer-call-section');
    if (fixerCallSection) {
      fixerCallSection.classList.remove('hidden');
      setupCallFunctionality();
    }
  }, 2000);

  // Add the CRT effects if enabled
  if (document.body.classList.contains('crt-enabled')) {
    addCRTEffects();
  }
});

// Initialize typewriter effect on elements with class "typewriter"
function initTypewriterElements() {
  const typewriterElements = document.querySelectorAll('.typewriter');
  
  typewriterElements.forEach(element => {
    // Store original text
    const originalText = element.textContent;
    element.textContent = '';
    
    // Get custom settings from data attributes or use defaults
    const speed = element.dataset.speed ? parseInt(element.dataset.speed) : CONFIG.typewriter.defaultSpeed;
    const delay = element.dataset.delay ? parseInt(element.dataset.delay) : CONFIG.typewriter.defaultDelay;
    
    // Start typing effect with delay
    setTimeout(() => {
      typeWriter(element, originalText, 0, speed);
    }, delay);
  });
}

// Initialize glitch effect on elements with class "glitch"
function initGlitchElements() {
  const glitchElements = document.querySelectorAll('.glitch');
  
  glitchElements.forEach(element => {
    // Get custom settings from data attributes or use defaults
    const duration = element.dataset.duration ? parseInt(element.dataset.duration) : CONFIG.glitch.defaultDuration;
    const interval = element.dataset.interval ? parseInt(element.dataset.interval) : CONFIG.glitch.defaultInterval;
    
    // Apply glitch right away
    applyGlitch(element, duration);
    
    // If the glitch should repeat (has 'glitch-repeat' class)
    if (element.classList.contains('glitch-repeat')) {
      setInterval(() => {
        applyGlitch(element, duration);
      }, interval);
    }
  });
}

// Initialize random glitches on elements with class "glitch-random"
function initRandomGlitches() {
  const randomGlitchElements = document.querySelectorAll('.glitch-random');
  
  if (randomGlitchElements.length > 0) {
    setInterval(() => {
      randomGlitchElements.forEach(element => {
        if (Math.random() < CONFIG.glitch.elementChance) {
          const duration = element.dataset.duration ? parseInt(element.dataset.duration) : CONFIG.glitch.defaultDuration;
          applyGlitch(element, duration);
        }
      });
    }, CONFIG.glitch.defaultInterval);
  }
}

// Initialize scanner effects on elements with class "scanner"
function initScannerEffects() {
  document.querySelectorAll('.scanner').forEach(element => {
    element.classList.add('scanner-effect');
  });
}

/**
 * Creates a typewriter effect for text
 */
function typeWriter(element, text, i, speed) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    
    // Add random slight delay to some characters
    const randomDelay = Math.random() < CONFIG.typewriter.randomDelayChance 
      ? CONFIG.typewriter.randomDelayAmount 
      : 0;
    
    setTimeout(() => {
      typeWriter(element, text, i, speed);
    }, speed + randomDelay);
  } else {
    // Add class indicating typing is complete
    element.classList.add('typewriter-complete');
    
    // If element also has glitch class, apply glitch after typing
    if (element.classList.contains('glitch') || element.classList.contains('glitch-after-type')) {
      setTimeout(() => {
        applyGlitch(element, CONFIG.glitch.defaultDuration);
      }, 500);
    }
  }
}

/**
 * Applies a glitch effect to an element
 */
function applyGlitch(element, duration) {
  // Add glitch-active class
  element.classList.add('glitch-active');
  
  // Remove the glitch after duration
  setTimeout(() => {
    element.classList.remove('glitch-active');
  }, duration);
}

/**
 * Apply glitch effect to any element by ID or element
 * Can be called directly from HTML
 */
function glitchElement(elementOrId, duration = CONFIG.glitch.defaultDuration) {
  const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (element) {
    applyGlitch(element, duration);
  }
}

/**
 * Apply typewriter effect to any element by ID
 * Can be called directly from HTML
 */
function typewriteElement(elementId, speed = CONFIG.typewriter.defaultSpeed, delay = CONFIG.typewriter.defaultDelay) {
  const element = document.getElementById(elementId);
  if (element) {
    const originalText = element.textContent;
    element.textContent = '';
    
    setTimeout(() => {
      typeWriter(element, originalText, 0, speed);
    }, delay);
  }
}

/**
 * Adds CRT and noise effects to the page
 */
function addCRTEffects() {
  // Create noise overlay if it doesn't exist
  if (!document.querySelector('.noise-overlay')) {
    const noiseOverlay = document.createElement('div');
    noiseOverlay.className = 'noise-overlay';
    document.body.appendChild(noiseOverlay);
  }
  
  // Create CRT scanline effect if it doesn't exist
  if (!document.querySelector('.crt-effect')) {
    const crtEffect = document.createElement('div');
    crtEffect.className = 'crt-effect';
    document.body.appendChild(crtEffect);
  }
}

/**
 * Initialize special loading effects
 * Call this when loading screens or transitions are needed
 */
function initLoadingAnimation(containerId = 'loading-screen', barId = 'loading-progress', duration = 3000) {
  const container = document.getElementById(containerId);
  const bar = document.getElementById(barId);
  
  if (container && bar) {
    // Show loading animation
    container.style.display = 'flex';
    
    // Animate loading bar
    setTimeout(() => {
      bar.style.width = '100%';
    }, 100);
    
    // Return a promise that resolves when loading is complete
    return new Promise(resolve => {
      setTimeout(() => {
        container.style.display = 'none';
        
        // Reset loading bar for next time
        setTimeout(() => {
          bar.style.width = '0%';
        }, 500);
        
        resolve();
      }, duration);
    });
  }
  
  return Promise.resolve(); // Return resolved promise if elements not found
}

// Setup call functionality
function setupCallFunctionality() {
  const acceptCallBtn = document.getElementById('accept-call');
  const declineCallBtn = document.getElementById('decline-call');

  const ringtone = new Audio('Audio/Vs_Phone_Ringtone.mp3');
  const glitchSound = new Audio('Audio/glitch_Sound.m4a');
  ringtone.loop = true;
  ringtone.play().catch(e => console.log('Audio playback error:', e));
  
  if (acceptCallBtn) {
    acceptCallBtn.addEventListener('click', function() {
      ringtone.pause();
      ringtone.currentTime = 0;

      // Hide call UI
      document.querySelector('.fixer-call-section').classList.add('hidden');
      
      // Show active call indicator in left sidebar
      updateActiveCallIndicator('REGINA JONES');
      
      // Play dialog sequence
      playDialogSequence('regina-intro');
      
      // After dialog sequence completes, show loading screen
      const totalDialogDuration = calculateTotalDialogDuration('regina-intro');
      
      setTimeout(() => {
        // Hide active call indicator
        hideActiveCallIndicator();
        
        // Show loading animation
        showLoadingAnimation();
        
        // After loading is complete, show main content
        setTimeout(() => {
          const mainContentContainer = document.getElementById('app-main');
          const navigationContentContainer = document.getElementById('nav-section');

            mainContentContainer.classList.remove('hidden');
            navigationContentContainer.classList.remove('hidden');
          
        }, 3500);
      }, totalDialogDuration + 500); // Add a buffer after dialog
    });
  }
  
  if (declineCallBtn) {
    declineCallBtn.addEventListener('click', function() {
      ringtone.pause();
      ringtone.currentTime = 0;

      glitchSound.play().catch(e => console.log('Audio playback error:', e));
      document.querySelector('.fixer-call-section').classList.add('hidden');

      // Create and show relic malfunction message
      showRelicMalfunction();
      
      // Apply glitch effect to whole screen
      applyFullScreenGlitch();
      
      // Fade to black and reset
      setTimeout(() => {
        fadeToBlackAndReset();
      }, 4500);
    });
  }
}

// Show relic malfunction message
function showRelicMalfunction() {
  // Check if the element exists already
  let relicMalfunction = document.querySelector('.relic-malfunction-overlay');
  
  if (!relicMalfunction) {
    // Create relic malfunction overlay
    relicMalfunction = document.createElement('div');
    relicMalfunction.className = 'relic-malfunction-overlay';
    relicMalfunction.innerHTML = `
      <div class="warning-triangle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L1 22h22L12 1zm0 7a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm0 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"></path>
        </svg>
      </div>
      <div class="relic-malfunction-text">RELIC MALFUNCTION DETECTED</div>
    `;
    document.body.appendChild(relicMalfunction);
  } else {
    relicMalfunction.style.display = 'flex';
  }
}

// Apply glitch effect to entire screen
function applyFullScreenGlitch() {
  // Create glitch overlay if it doesn't exist
  let glitchEl = document.querySelector('.fullscreen-glitch');
  
  if (!glitchEl) {
    glitchEl = document.createElement('div');
    glitchEl.className = 'fullscreen-glitch';
    document.body.appendChild(glitchEl);
  }
  
  glitchEl.classList.add('active');
  
  // Apply glitch effect to body
  document.body.style.animation = 'glitch 0.3s infinite';
  
  // Apply to all major containers
  const elements = document.querySelectorAll('.app-header, .app-container, .dialog-footer');
  elements.forEach(el => {
    el.style.animation = 'glitch 0.2s infinite';
  });
}

// Fade to black and reset all elements (without page reload)
function fadeToBlackAndReset() {
  // Create fade overlay if it doesn't exist
  let fadeEl = document.querySelector('.fade-overlay');
  
  if (!fadeEl) {
    fadeEl = document.createElement('div');
    fadeEl.className = 'fade-overlay';
    document.body.appendChild(fadeEl);
  }
  
  fadeEl.classList.add('active');
  
  // Reset after animation
  setTimeout(() => {
    // Reset all elements
    resetAllElements();
    
    // Fade back in
    fadeEl.classList.remove('active');

    setupCallFunctionality();
  }, 1500);
}

// Reset all elements to initial state
function resetAllElements() {
  // Remove active animations
  document.body.style.animation = '';
  document.querySelectorAll('.app-header, .app-container, .dialog-footer').forEach(el => {
    el.style.animation = '';
  });
  
  // Hide all overlays
  document.querySelector('.relic-malfunction-overlay').style.display = 'none';
  document.querySelector('.fullscreen-glitch').classList.remove('active');
  
  // Reset dialog
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  if (dialogSpeaker && dialogText) {
    dialogSpeaker.textContent = 'SYSTEM:';
    dialogText.textContent = 'INCOMING CALL';
  }
  
  // Hide main content
  const mainContentContainer = document.getElementById('main-content-container');
  if (mainContentContainer) {
    mainContentContainer.classList.add('hidden');
  }
  
  // Show call UI
  document.querySelector('.fixer-call-section').classList.remove('hidden');
  
  // Hide any active call indicator
  hideActiveCallIndicator();
}

// Initialize dialog system
function initDialogSystem() {
  // Find all dialog trigger elements
  const dialogTriggers = document.querySelectorAll('.dialog-trigger');
  
  // Attach event listeners to triggers
  dialogTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get dialog group from trigger
      const dialogGroup = this.getAttribute('data-dialog-group') || 'default';
      
      // Get section ID if available
      const sectionId = this.getAttribute('data-section');
      
      // If section ID is available, activate that section
      if (sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
          section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
          targetSection.classList.add('active');
        }
        
        // Update the content title
        const contentTitle = document.querySelector('.content-title');
        if (contentTitle) {
          contentTitle.textContent = this.textContent;
        }
        
        // Update active navigation link
        document.querySelectorAll('.nav__link').forEach(link => {
          link.classList.remove('nav__link--active');
        });
        this.classList.add('nav__link--active');
      }
      
      // Find all dialogs in this group
      const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroup}"]`);
      
      // Play dialogs in sequence
      playDialogSequence(dialogGroup);
      
      // Hide call indicator after dialog completes
      const totalDuration = calculateTotalDialogDuration(dialogGroup);
      setTimeout(() => {
        hideActiveCallIndicator();
      }, totalDuration + 500);
    });
  });
}

// Update active call indicator in left sidebar
function updateActiveCallIndicator(speakerName) {
  const indicator = document.querySelector('.active-call-indicator');
  if (indicator) {
    const callerNameElement = indicator.querySelector('.active-caller-name');
    const callerAvatarElement = indicator.querySelector('.caller-avatar img');
    
    // Update caller name
    if (callerNameElement) {
      callerNameElement.textContent = speakerName;
    }
    
    // Update avatar based on speaker
    if (callerAvatarElement) {
      let imageSrc = 'placeholder-fixer.jpg'; // Default
      
      if (speakerName === 'V') {
          imageSrc = 'Images/Characters/V_Avatar.png';
      } else if (speakerName === 'REGINA JONES') {
          imageSrc = 'Images/Characters/ReginaJohnes_Avatar.png';
      }
      
      callerAvatarElement.src = imageSrc;
      callerAvatarElement.alt = speakerName;
    }
    
    // Show the indicator
    indicator.classList.remove('hidden');
  }
}

// Hide active call indicator
function hideActiveCallIndicator() {
  const indicator = document.querySelector('.active-call-indicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

// Play a sequence of dialogs
function playDialogSequence(dialogGroupName) {
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroupName}"]`);
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  if (dialogs.length > 0 && dialogSpeaker && dialogText) {
    let currentIndex = 0;
    
    // Function to display the current dialog
    function displayDialog() {
      if (currentIndex >= dialogs.length) return;
      
      const dialog = dialogs[currentIndex];
      const speaker = dialog.getAttribute('data-speaker');
      const text = dialog.textContent.trim();
      const duration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
      const useTypewriter = dialog.hasAttribute('data-typewriter');
      
      // Update active call indicator with current speaker
      updateActiveCallIndicator(speaker);
      
      // Update dialog content
      dialogSpeaker.textContent = speaker + ':';
      
      // Apply typewriter effect if needed
      if (useTypewriter) {
        dialogText.textContent = '';
        const speed = parseInt(dialog.getAttribute('data-typewriter-speed')) || 30;
        typeWriter(dialogText, text, 0, speed);
      } else {
        dialogText.textContent = text;
      }
      
      // Apply glitch if requested
      if (dialog.hasAttribute('data-glitch')) {
        setTimeout(() => {
          applyGlitch(dialogText, parseInt(dialog.getAttribute('data-glitch-duration')) || CONFIG.glitch.defaultDuration);
        }, 500);
      }
      
      // Play audio if available
      const audio = dialog.getAttribute('data-audio');
      if (audio && DIALOG_CONFIG.audioEnabled) {
        const audioElement = new Audio(audio);
        audioElement.play().catch(e => console.log('Audio playback error:', e));
      }
      
      // Move to next dialog after duration
      currentIndex++;
      if (currentIndex < dialogs.length) {
        setTimeout(displayDialog, duration);
      }
    }
    
    // Start the dialog sequence
    displayDialog();
  }
}

// Calculate total duration of all dialogs in a group
function calculateTotalDialogDuration(dialogGroupName) {
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroupName}"]`);
  let totalDuration = 0;
  
  dialogs.forEach(dialog => {
    const duration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
    totalDuration += duration;
  });
  
  return totalDuration;
}

// Show loading animation
function showLoadingAnimation() {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingProgress = document.getElementById('loading-progress');
  
  if (loadingScreen && loadingProgress) {
    // Show loading animation
    loadingScreen.style.display = 'flex';
    
    // Animate loading bar
    setTimeout(() => {
      loadingProgress.style.width = '100%';
    }, 100);
    
    // After "loading" is complete
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      
      // Reset loading bar for next time
      setTimeout(() => {
        loadingProgress.style.width = '0%';
      }, 500);
    }, 3500);
  }
}