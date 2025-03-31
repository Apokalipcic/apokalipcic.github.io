/* script.js - Enhanced JavaScript functionality for Cyberpunk 2077 Portfolio */

/********************************************************
 * CONFIGURATION
 ********************************************************/

// Global configuration for all effects
const CONFIG = {
  // Typewriter effect configuration
  typewriter: {
    defaultSpeed: 50,            // Default typing speed in milliseconds
    defaultDelay: 500,           // Default delay before typing starts
    randomDelayChance: 0.3,      // Chance of random delay (0-1)
    randomDelayAmount: 100       // Max random delay in milliseconds
  },
  
  // Glitch effect configuration
  glitch: {
    defaultDuration: 500,        // Default duration of glitch effect
    defaultInterval: 3000,       // Default interval for random glitches
    elementChance: 0.5           // Chance of element being glitched (0-1)
  },

  // Redacted text configuration
  redacted: {
    defaultText: "[REDACTED]",   // Text to display for redacted content
    flickerInterval: 8000,       // Flicker interval in ms (how often it might show content)
    flickerDuration: 100         // How long content is shown during flicker
  },

  // Corrupted text configuration
  corrupted: {
    primaryColor: "var(--colors-secondary--500)",    // Primary color for corrupted text
    secondaryColor: "var(--colors-primary--500)",    // Secondary color for effect
    animationDuration: 3000                          // Animation cycle duration
  },

  // Terminal typing configuration
  terminal: {
    defaultSpeed: 100,           // Default typing speed
    cursorBlinkSpeed: 500        // Cursor blink speed
  },

  // Access notification configuration
  access: {
    defaultDuration: 3000,       // How long notifications show
    pulseSpeed: 2000             // Speed of pulse animation
  },

    // Warning - Running line
    warning: {
      scrollSpeed: 8000,        // Time in ms for one complete scroll cycle
      scrollDelay: 1000,        // Delay before scrolling starts
      scrollPause: 2000,        // Pause at each end of scroll
      scrollClass: 'warning-scroll' // Class name for scrolling warnings
    },

  // Scanner effect configuration
  scanner: {
    lineSpeed: 10,             // Speed of scanner line movement
    lineColor: "var(--colors-secondary--500)"  // Color of scanner line
  }
};

// Dialog system configuration
const DIALOG_CONFIG = {
  defaultDelay: 100,      // Default delay between dialogs
  defaultDuration: 4000,  // Default duration to show each dialog
  fadeSpeed: 300,         // Fade transition speed in ms
  audioEnabled: true      // Global toggle for audio
};

/********************************************************
 * INITIALIZATION
 ********************************************************/

// Initialize everything when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all text effects
  initAllTextEffects();

  initFullElementGlitch();

  // Initialize dialog system
  initDialogSystem();
  
  // Show incoming call with delay
  setTimeout(function() {
    const fixerCallSection = document.querySelector('.fixer-call-section');
    if (fixerCallSection) {
      fixerCallSection.classList.add('glitch-full');
      fixerCallSection.classList.remove('hidden');
      setupCallFunctionality();
    }
  }, 2000);

  // Add the CRT effects if enabled
  if (document.body.classList.contains('crt-enabled')) {
    addCRTEffects();
  }
});

// Initialize all special text effects
function initAllTextEffects() {
  // Initialize existing effects
  initTypewriterElements();
  initGlitchElements();
  initRandomGlitches();
  initScannerEffects();
  initWarningScrolls();

  
  // Initialize new effects
  initCorruptedText();
  
  // Initialize effects in all content containers
  document.querySelectorAll('.content-section').forEach(section => {
    initEffectsInElement(section);
  });
  
  // Initialize effects in dialogs
  document.querySelectorAll('.dialog-text').forEach(dialog => {
    initEffectsInElement(dialog);
  });
}

// Function to initialize effects in any element
function initEffectsInElement(element) {
  // Initialize typewriter elements inside
  element.querySelectorAll('.typewriter').forEach(el => {
    const originalText = el.textContent;
    el.textContent = '';
    const speed = el.dataset.speed ? parseInt(el.dataset.speed) : CONFIG.typewriter.defaultSpeed;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay) : CONFIG.typewriter.defaultDelay;
    
    setTimeout(() => {
      typeWriter(el, originalText, 0, speed);
    }, delay);
  }); // This closing bracket was missing

  // Initialize warning scrolls inside this element - this was incorrectly indented
  element.querySelectorAll('.warning-text.' + CONFIG.warning.scrollClass).forEach(el => {
    // If it doesn't already have the content span
    if (!el.querySelector('.warning-text-content')) {
      const originalText = el.innerHTML;
      el.innerHTML = '';
      const contentSpan = document.createElement('span');
      contentSpan.className = 'warning-text-content';
      contentSpan.innerHTML = originalText;
      el.appendChild(contentSpan);
      
      // Apply custom scroll settings
      const duration = el.dataset.scrollSpeed ? 
        parseInt(el.dataset.scrollSpeed) : CONFIG.warning.scrollSpeed;
      el.style.setProperty('--scroll-duration', duration + 'ms');
      el.style.setProperty('--scroll-delay', CONFIG.warning.scrollDelay + 'ms');
    }
  });
  
  // Initialize glitch elements inside
  element.querySelectorAll('.glitch-text').forEach(el => {
    const duration = el.dataset.duration ? parseInt(el.dataset.duration) : CONFIG.glitch.defaultDuration;
    applyGlitch(el, duration);
    
    // If it should repeat
    if (el.classList.contains('glitch-repeat')) {
      const interval = el.dataset.interval ? parseInt(el.dataset.interval) : CONFIG.glitch.defaultInterval;
      setInterval(() => {
        applyGlitch(el, duration);
      }, interval);
    }
  });
  
  // Initialize scanner elements inside
  element.querySelectorAll('.scanner').forEach(el => {
    el.classList.add('scanner-effect');
  });

  // Initialize redacted text elements
  element.querySelectorAll('.redacted').forEach(el => {
    applyRedactedEffect(el);
  });
}

/********************************************************
 * TEXT EFFECT FUNCTIONS
 ********************************************************/

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

// Creates a typewriter effect for text
function typeWriter(element, text, i, speed, callback) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    
    // Add random slight delay to some characters
    const randomDelay = Math.random() < CONFIG.typewriter.randomDelayChance 
      ? CONFIG.typewriter.randomDelayAmount 
      : 0;
    
    setTimeout(() => {
      typeWriter(element, text, i, speed, callback);
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
    
    // Call callback if provided
    if (callback && typeof callback === 'function') {
      callback();
    }
  }
}

// Function to type HTML content (breaks it into nodes and types each)
function typeWriterHTML(element, html, duration) {
  // Create a temporary container
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get all nodes
  const nodes = Array.from(temp.childNodes);
  let currentNodeIndex = 0;
  
  function processNextNode() {
    if (currentNodeIndex >= nodes.length) return;
    
    const node = nodes[currentNodeIndex];
    
    if (node.nodeType === Node.TEXT_NODE) {
      // Text node - type it character by character
      const textContainer = document.createElement('span');
      element.appendChild(textContainer);
      typeWriter(textContainer, node.textContent, 0, 30, () => {
        currentNodeIndex++;
        processNextNode();
      });
    } else {
      // Element node - clone it and process its children
      const clone = node.cloneNode(false);
      element.appendChild(clone);
      
      // If it has special classes, initialize its effects later
      const hasEffects = Array.from(node.classList).some(cls => 
        ['glitch-text', 'typewriter', 'scanner', 'redacted'].includes(cls));
      
      if (node.childNodes.length > 0) {
        // Process its children recursively
        typeWriterHTML(clone, node.innerHTML, 0);
      }
      
      // Initialize effects on this element if needed
      if (hasEffects) {
        setTimeout(() => {
          initEffectsInElement(clone);
        }, 100);
      }
      
      // Move to next node after a delay
      setTimeout(() => {
        currentNodeIndex++;
        processNextNode();
      }, 100);
    }
  }
  
  // Start processing nodes
  processNextNode();
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

// Warning - Running line
function initWarningScrolls() {
  document.querySelectorAll('.warning-text.' + CONFIG.warning.scrollClass).forEach(element => {
    // Create a container for the scrolling content
    const originalText = element.innerHTML;
    
    // Clear the element
    element.innerHTML = '';
    
    // Create the scrolling content container
    const contentSpan = document.createElement('span');
    contentSpan.className = 'warning-text-content';
    contentSpan.innerHTML = originalText;
    
    // Add the scrolling content to the warning element
    element.appendChild(contentSpan);
    
    // Apply custom scroll settings if provided
    const duration = element.dataset.scrollSpeed ? 
      parseInt(element.dataset.scrollSpeed) : CONFIG.warning.scrollSpeed;
    
    element.style.setProperty('--scroll-duration', duration + 'ms');
    element.style.setProperty('--scroll-delay', CONFIG.warning.scrollDelay + 'ms');
  });
}

// Applies a glitch effect to an element
function applyGlitch(element, duration) {
  // Add glitch-active class
  element.classList.add('glitch-active');
  
  // Remove the glitch after duration
  setTimeout(() => {
    element.classList.remove('glitch-active');
  }, duration);
}

// Apply glitch effect to any element by ID or element
function glitchElement(elementOrId, duration = CONFIG.glitch.defaultDuration) {
  const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (element) {
    applyGlitch(element, duration);
  }
}

// Apply typewriter effect to any element by ID
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

// Initialize scanner effects on elements with class "scanner"
function initScannerEffects() {
  document.querySelectorAll('.scanner').forEach(element => {
    element.classList.add('scanner-effect');
  });
}

// Apply redacted text effect - replaces content with [REDACTED]
function applyRedactedEffect(element) {
  // Store original text as data attribute (for potential flickering)
  const originalText = element.textContent.trim();
  if (originalText && !element.hasAttribute('data-original-text')) {
    element.setAttribute('data-original-text', originalText);
  }
  
  // Replace content with [REDACTED]
  element.textContent = CONFIG.redacted.defaultText;
  
  // Add the base effect
  element.classList.add('redacted');
  
  // Add flicker effect if requested
  if (element.dataset.flicker === 'true' || element.classList.contains('redacted-flicker')) {
    element.classList.add('redacted-flicker');
  }
}

// Initialize corrupted text effect
function initCorruptedText() {
  document.querySelectorAll('.corrupted').forEach(element => {
    // Store original text as data attribute for the animation
    if (!element.hasAttribute('data-text')) {
      element.setAttribute('data-text', element.textContent);
    }
  });
}

// Apply a terminal typing effect to an element
function applyTerminalTyping(element, text, speed = CONFIG.terminal.defaultSpeed) {
  element.innerHTML = '';
  element.classList.add('terminal-typing');
  
  let i = 0;
  const typeInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      // Remove blinking cursor after typing completes
      setTimeout(() => {
        element.classList.remove('terminal-typing');
      }, 1000);
    }
  }, speed);
}

// Show access notification (granted/denied)
function showAccessNotification(type, message, duration = CONFIG.access.defaultDuration) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `access-notification access-${type.toLowerCase()}`;
  
  // Add appropriate class for styling
  const messageSpan = document.createElement('span');
  messageSpan.className = `access-${type.toLowerCase()}`;
  messageSpan.textContent = message || (type === 'granted' ? 'ACCESS GRANTED' : 'ACCESS DENIED');
  
  notification.appendChild(messageSpan);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Position in center of screen
  notification.style.position = 'fixed';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.background = 'rgba(0, 0, 0, 0.8)';
  notification.style.padding = '1rem 2rem';
  notification.style.zIndex = '9999';
  
  // Remove after duration
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, duration);
}

/********************************************************
 * DIALOG SYSTEM 
 ********************************************************/

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
      const text = dialog.innerHTML.trim(); // Use innerHTML instead of textContent
      const duration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
      const useTypewriter = dialog.hasAttribute('data-typewriter');
      
      // Update active call indicator with current speaker
      updateActiveCallIndicator(speaker);
      
      // Update dialog content
      dialogSpeaker.textContent = speaker + ':';
      
      // Apply typewriter effect if needed
      if (useTypewriter) {
        dialogText.innerHTML = ''; // Clear using innerHTML
        if (text.includes('<')) {
          // Complex content with HTML
          typeWriterHTML(dialogText, text, duration);
        } else {
          // Simple text content
          typeWriter(dialogText, text, 0, parseInt(dialog.getAttribute('data-typewriter-speed')) || 30);
        }
      } else {
        dialogText.innerHTML = text; // Set using innerHTML
        
        // Initialize any effect elements inside the dialog
        initEffectsInElement(dialogText);
      }
      
      // Apply glitch if requested for the whole dialog
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

/********************************************************
 * UI EFFECTS & TRANSITIONS
 ********************************************************/

// Adds CRT and noise effects to the page
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

// Initialize special loading effects
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

/********************************************************
 * CALL FUNCTIONALITY
 ********************************************************/

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
      document.querySelector('.fixer-call-section').classList.remove('glitch-full');
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

      document.querySelector('.fixer-call-section').classList.remove('glitch-full');
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

// JavaScript implementation for full element glitch effect

/**
 * Handles the full element glitch effect
 * Add this to your script.js file, preferable at the end before the closing bracket
 */

// Initialize the full element glitch effect
function initFullElementGlitch() {
  // Create sliced glitch animations CSS dynamically
  createGlitchStyles();
  
  // Initialize glitch for elements with the glitch-full class
  document.addEventListener('DOMContentLoaded', () => {
    // Get all elements with glitch-full class
    const glitchElements = document.querySelectorAll('.glitch-full');
    
    // Add mutation observer to watch for new elements with glitch-full class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          
          // If class was added and contains glitch-full
          if (target.classList.contains('glitch-full') && !target.hasAttribute('data-glitch-initialized')) {
            setupGlitchElement(target);
          }
          
          // If class was removed and element was previously glitching
          if (!target.classList.contains('glitch-full') && target.hasAttribute('data-glitch-initialized')) {
            cleanupGlitchElement(target);
          }
        }
      });
    });
    
    // Observe all elements for class changes
    document.querySelectorAll('*').forEach(el => {
      observer.observe(el, { attributes: true });
    });
    
    // Initialize existing elements
    glitchElements.forEach(setupGlitchElement);
  });
}

// Setup an element for glitching
function setupGlitchElement(element) {
  if (element.hasAttribute('data-glitch-initialized')) return;
  
  // Mark as initialized
  element.setAttribute('data-glitch-initialized', 'true');
  
  // Create glitch copies
  createGlitchCopies(element);
  
  // Apply glitch animation
  applyGlitchAnimation(element);
  
  // Remove glitch effect after animation completes
  setTimeout(() => {
    if (element.classList.contains('glitch-full')) {
      element.classList.remove('glitch-animating');
    }
  }, 1000);
}

// Clean up glitch effect
function cleanupGlitchElement(element) {
  // Mark glitch as in progress
  element.classList.add('glitch-animating');
  
  // Create glitch copies if they don't exist
  if (!element.querySelector('.glitch-copy')) {
    createGlitchCopies(element);
  }
  
  // Apply glitch animation
  applyGlitchAnimation(element);
  
  // Remove element after animation completes
  setTimeout(() => {
    element.classList.add('glitch-hidden');
    
    // Remove all glitch-related attributes and classes after transition
    setTimeout(() => {
      element.removeAttribute('data-glitch-initialized');
      element.classList.remove('glitch-animating', 'glitch-hidden');
      
      // Remove glitch copies
      const copies = element.querySelectorAll('.glitch-copy');
      copies.forEach(copy => copy.remove());
    }, 700); // Match your CSS transition time
  }, 1000);
}

// Create glitch copies for an element
function createGlitchCopies(element) {
  // Store original element style
  const originalPosition = getComputedStyle(element).position;
  if (originalPosition === 'static') {
    element.style.position = 'relative';
  }
  
  // Make sure overflow is visible
  element.style.overflow = 'visible';
  
  // Create two glitch copies
  for (let i = 0; i < 2; i++) {
    const copy = document.createElement('div');
    copy.className = `glitch-copy glitch-copy-${i+1}`;
    copy.innerHTML = element.innerHTML;
    
    // Make position absolute and make them overlay the original
    copy.style.position = 'absolute';
    copy.style.top = '0';
    copy.style.left = '0';
    copy.style.width = '100%';
    copy.style.height = '100%';
    copy.style.zIndex = '10';
    copy.style.pointerEvents = 'none'; // Prevent interaction with copies
    
    // Apply different clip paths to each copy
    copy.style.clipPath = i === 0 ? 'var(--slice-1)' : 'var(--slice-2)';
    
    // Append the copy to the element
    element.appendChild(copy);
  }
}

// Apply glitch animation to an element and its copies
function applyGlitchAnimation(element) {
  // Add animating class to indicate glitch is in progress
  element.classList.add('glitch-animating');
  
  // Get the glitch copies
  const copy1 = element.querySelector('.glitch-copy-1');
  const copy2 = element.querySelector('.glitch-copy-2');
  
  if (copy1 && copy2) {
    // Apply animations with different keyframes
    copy1.style.animation = 'glitchCopy1 1s steps(2, end) forwards';
    copy2.style.animation = 'glitchCopy2 1s steps(2, end) forwards';
  }
}

// Create CSS for glitch animations dynamically
function createGlitchStyles() {
  if (document.getElementById('glitch-full-styles')) return;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'glitch-full-styles';
  
  styleSheet.textContent = `
    :root {
      --slice-0: inset(50% 50% 50% 50%);
      --slice-1: inset(80% -6px 0 0);
      --slice-2: inset(50% -6px 30% 0);
      --slice-3: inset(10% -6px 85% 0);
      --slice-4: inset(40% -6px 43% 0);
      --slice-5: inset(80% -6px 5% 0);
    }
    
    .glitch-full {
      opacity: 1;
      transform: translateY(0) scale(1);
      transition: opacity 0.7s ease-in-out, transform 0.7s ease-in-out;
    }
    
    .glitch-hidden {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.7s ease-in-out, transform 0.7s ease-in-out;
    }
    
    .glitch-copy {
      opacity: 0;
      background: inherit;
      color: inherit;
    }
    
    .glitch-animating .glitch-copy {
      opacity: 0.8;
    }
    
    @keyframes glitchCopy1 {
      0% {
        clip-path: var(--slice-1);
        transform: translate(-20px, -10px);
      }
      20% {
        clip-path: var(--slice-3);
        transform: translate(10px, 10px);
      }
      40% {
        clip-path: var(--slice-5);
        transform: translate(-15px, 5px);
      }
      60% {
        clip-path: var(--slice-4);
        transform: translate(5px, 10px);
      }
      80% {
        clip-path: var(--slice-2);
        transform: translate(20px, -10px);
      }
      100% {
        clip-path: var(--slice-3);
        transform: translate(-10px, 0px);
      }
    }
    
    @keyframes glitchCopy2 {
      0% {
        clip-path: var(--slice-3);
        transform: translate(10px, 5px);
      }
      20% {
        clip-path: var(--slice-1);
        transform: translate(-15px, 10px);
      }
      40% {
        clip-path: var(--slice-2);
        transform: translate(15px, -5px);
      }
      60% {
        clip-path: var(--slice-5);
        transform: translate(-5px, 8px);
      }
      80% {
        clip-path: var(--slice-4);
        transform: translate(15px, -10px);
      }
      100% {
        clip-path: var(--slice-2);
        transform: translate(-15px, 5px);
      }
    }
  `;
  
  document.head.appendChild(styleSheet);
}