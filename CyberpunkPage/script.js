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
  },

  // Element glitch effect configuration
  elementGlitch: {
    duration: 1000,           // Duration of glitch effect in ms
    fadeTime: 700             // Time for fade in/out transition
  }
};

// Dialog system configuration
const DIALOG_CONFIG = {
  defaultDelay: 100,        // Default delay between dialogs
  defaultDuration: 4000,    // Default duration to show each dialog
  fadeSpeed: 300,           // Fade transition speed in ms
  audioEnabled: true,       // Global toggle for audio
  interDialogDelay: 300     // Delay between dialogs after audio completes
};

/********************************************************
 * INITIALIZATION
 ********************************************************/

// Initialize everything when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all text effects
  initAllTextEffects();

  // Initialize dialog system
  initDialogSystem();
  
  // Show incoming call with delay
  setTimeout(function() {
    const fixerCallSection = document.querySelector('.fixer-call-section');
    if (fixerCallSection) {
      showWithGlitch(fixerCallSection);
      setupCallFunctionality();
    }
  }, 2000);

  // Add the CRT effects if enabled
  if (document.body.classList.contains('crt-enabled')) {
    addCRTEffects();
    }

    initConceptCardGlitches();

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
  });

  // Initialize warning scrolls inside this element
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

// Function to handle typewriting HTML content
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
      const hasEffects = Array.from(node.classList || []).some(cls => 
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
 * ELEMENT GLITCH EFFECT FUNCTIONS
 ********************************************************/

// Show an element with glitch effect 
function showWithGlitch(element) {
  if (!element) return;
  
  // Setup transition properties
  element.style.transition = `opacity ${CONFIG.elementGlitch.fadeTime}ms ease-in-out, transform ${CONFIG.elementGlitch.fadeTime}ms ease-in-out`;
  
  // Make sure element is in the DOM but invisible
  element.classList.remove('hidden');
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px) scale(0.95)';
  
  // Force reflow to ensure transition happens
  element.offsetHeight;
  
  // Create and add glitch copies
  const copies = createGlitchCopies(element);
  
  // Start fade in
  element.style.opacity = '1';
  element.style.transform = 'translateY(0) scale(1)';
  
  // Set timeout to remove glitch effect
  setTimeout(() => {
    copies.forEach(copy => {
      if (element.contains(copy)) {
        element.removeChild(copy);
      }
    });
  }, CONFIG.elementGlitch.duration);
}

// Hide an element with glitch effect
function hideWithGlitch(element) {
  if (!element) return;
  
  // Setup transition properties
  element.style.transition = `opacity ${CONFIG.elementGlitch.fadeTime}ms ease-in-out, transform ${CONFIG.elementGlitch.fadeTime}ms ease-in-out`;
  
  // Create and add glitch copies
  const copies = createGlitchCopies(element);
  
  // Start fade out
  setTimeout(() => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px) scale(0.95)';
    
    // Hide element after fade completes
    setTimeout(() => {
      element.classList.add('hidden');
      element.style.opacity = '';
      element.style.transform = '';
      
      // Remove glitch copies
      copies.forEach(copy => {
        if (element.contains(copy)) {
          element.removeChild(copy);
        }
      });
    }, CONFIG.elementGlitch.fadeTime);
  }, 300); // Short delay before starting fade out
}

// Toggle an element with glitch effect
function toggleWithGlitch(element, show) {
  if (show) {
    showWithGlitch(element);
  } else {
    hideWithGlitch(element);
  }
}

// Create glitch copies for an element
function createGlitchCopies(element) {
  // Create copies array to track and return
  const copies = [];
  
  // Store original position if needed
  const originalPosition = getComputedStyle(element).position;
  if (originalPosition === 'static') {
    element.style.position = 'relative';
  }
  
  // Ensure element has overflow visible
  element.style.overflow = 'visible';
  
  // Create first glitch copy with cyan border
  const copy1 = document.createElement('div');
  copy1.className = 'simple-glitch-copy simple-glitch-copy-1';
  copy1.innerHTML = element.innerHTML;
  element.appendChild(copy1);
  copies.push(copy1);
  
  // Create second glitch copy with yellow border
  const copy2 = document.createElement('div');
  copy2.className = 'simple-glitch-copy simple-glitch-copy-2';
  copy2.innerHTML = element.innerHTML;
  element.appendChild(copy2);
  copies.push(copy2);
  
  return copies;
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
      
      // Stop any currently playing dialog audio
      stopCurrentDialogAudio();
      
      // Show active call indicator in left sidebar with glitch effect
      const activeCallIndicator = document.querySelector('.active-call-indicator');
      if (activeCallIndicator) {
        // Make sure it's hidden (to ensure the effect works properly)
        activeCallIndicator.classList.add('hidden');
        
        // Force a reflow to ensure the hidden state is applied
        activeCallIndicator.offsetHeight;
        
        // Now show it with the glitch effect
        showWithGlitch(activeCallIndicator);
        
        // Update the caller avatar based on the first dialog in the sequence
        const firstDialog = document.querySelector(`.dialog-data[data-dialog-group="${dialogGroup}"]`);
        if (firstDialog) {
          const speaker = firstDialog.getAttribute('data-speaker');
          updateActiveCallIndicator(speaker);
        }
      }
      
      // Play dialogs in sequence and hide call indicator when complete
      playDialogSequence(dialogGroup).then(() => {
        // Hide call indicator after dialog completes
        setTimeout(() => {
          hideActiveCallIndicator();
        }, 500);
      });
    });
  });
}

function ensureDialogElementsVisible() {
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  // Check if elements are currently faded out
  if (dialogSpeaker.style.opacity === '0' || dialogText.style.opacity === '0') {
    // Apply transition for smooth fade-in
    dialogSpeaker.style.transition = 'opacity 0.5s ease-in-out';
    dialogText.style.transition = 'opacity 0.5s ease-in-out';
    
    // Apply glitch effect if available
    if (typeof applyGlitch === 'function') {
      // Create a container for the glitch effect
      const dialogContainer = document.querySelector('.dialog-container');
      if (dialogContainer) {
        applyGlitch(dialogContainer, 400);
      }
    }
    
    // Fade in
    dialogSpeaker.style.opacity = '1';
    dialogText.style.opacity = '1';
  }
}

function playDialogSequence(dialogGroupName) {
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroupName}"]`);
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  if (dialogs.length > 0 && dialogSpeaker && dialogText) {
    let currentIndex = 0;
    let currentAudio = null;
    
    // Function to display the current dialog
    function displayDialog() {
      if (currentIndex >= dialogs.length) {
        // All dialogs complete - dispatch an event we can listen for
        // Hide dialog elements with a fade-out effect when sequence completes
        fadeOutDialogFooter().then(() => {
          // Dispatch event after fade-out completes
          document.dispatchEvent(new CustomEvent('dialogSequenceComplete', {
            detail: { dialogGroup: dialogGroupName }
          }));
        });
        return;
      }

    ensureDialogElementsVisible();

      
      const dialog = dialogs[currentIndex];
      const speaker = dialog.getAttribute('data-speaker');
      const text = dialog.innerHTML.trim(); // Use innerHTML to preserve HTML tags
      const duration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
      
      // Get custom typewriter speed if specified, otherwise use default
      const typewriterSpeed = parseInt(dialog.getAttribute('data-typewriter-speed')) || 30;
      
      // Update active call indicator with current speaker
      updateActiveCallIndicator(speaker);
      
      // Update dialog speaker immediately
      dialogSpeaker.textContent = speaker + ':';
      
      // Clear dialog text area
      dialogText.innerHTML = '';
      
      // Apply typewriter effect based on content complexity
      if (text.includes('<')) {
        // Complex content with HTML tags
        typeWriterHTML(dialogText, text, duration);
      } else {
        // Simple text content
        typeWriter(dialogText, text, 0, typewriterSpeed);
      }
      
      // Apply glitch if requested for the whole dialog
      if (dialog.hasAttribute('data-glitch')) {
        setTimeout(() => {
          applyGlitch(dialogText, parseInt(dialog.getAttribute('data-glitch-duration')) || CONFIG.glitch.defaultDuration);
        }, 500);
      }
      
      // Play audio if available
      const audioPath = dialog.getAttribute('data-audio');
      
      // Determine how long to wait before moving to the next dialog
      let waitTime = duration;
      
      if (audioPath && DIALOG_CONFIG.audioEnabled) {
        // Stop any currently playing audio
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        
        // Create audio element
        currentAudio = new Audio(audioPath);
        currentAudio.setAttribute('data-dialog-audio', 'true');
        
        // Set up audio event listeners
        currentAudio.addEventListener('ended', function() {
          // When audio ends, move to next dialog after a small delay
          setTimeout(() => {
            currentIndex++;
            displayDialog();
          }, DIALOG_CONFIG.interDialogDelay || 300); // Small delay between dialogs
        });
        
        // Handle audio errors
        currentAudio.addEventListener('error', function(e) {
          console.log('Audio playback error:', e);
          // If audio fails, fall back to duration-based timing
          setTimeout(() => {
            currentIndex++;
            displayDialog();
          }, waitTime);
        });
        
        // Start audio playback
        currentAudio.play().catch(e => {
          console.log('Audio playback error:', e);
          // If audio fails, fall back to duration-based timing
          setTimeout(() => {
            currentIndex++;
            displayDialog();
          }, waitTime);
        });
      } else {
        // No audio - calculate appropriate wait time based on text length for typewriter effect
        const textLength = text.replace(/<[^>]*>/g, '').length; // Remove HTML tags for length calculation
        waitTime = Math.max(textLength * typewriterSpeed + 1000, duration); // Minimum duration + extra time
        
        // Move to next dialog after waiting
        setTimeout(() => {
          currentIndex++;
          displayDialog();
        }, waitTime);
      }
    }
    
    // Start the dialog sequence
    displayDialog();
    
    // Return a promise that resolves when all dialogs are complete
    return new Promise((resolve) => {
      document.addEventListener('dialogSequenceComplete', function onComplete(event) {
        if (event.detail.dialogGroup === dialogGroupName) {
          document.removeEventListener('dialogSequenceComplete', onComplete);
          resolve();
        }
      });
    });
  }
  
  // Function to fade out dialog footer elements
function fadeOutDialogFooter() {
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  // Return a promise that resolves when the fade-out is complete
  return new Promise((resolve) => {
    // Apply transition properties if not already set
    dialogSpeaker.style.transition = 'opacity 0.8s ease-in-out';
    dialogText.style.transition = 'opacity 0.8s ease-in-out';
    
    // Trigger a glitch effect if available
    if (typeof applyGlitch === 'function') {
      applyGlitch(dialogText, 500);
      
      // Small delay before starting fade out
      setTimeout(() => {
        // Start fade out
        dialogSpeaker.style.opacity = '0';
        dialogText.style.opacity = '0';
        
        // Wait for transition to complete before resolving
        setTimeout(() => {
          resolve();
        }, 800);
      }, 300);
    } else {
      // Fallback if glitch function isn't available
      dialogSpeaker.style.opacity = '0';
      dialogText.style.opacity = '0';
      
      // Wait for transition to complete
      setTimeout(() => {
        resolve();
      }, 800);
    }
  });
}

return Promise.resolve(); // Return resolved promise if no dialogs
}

// Function to stop any playing dialog audio (useful when transitioning between sections)
function stopCurrentDialogAudio() {
  // Find any audio elements with data-dialog-audio="true" and stop them
  const audioElements = document.querySelectorAll('audio[data-dialog-audio="true"]');
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

// Calculate total duration of all dialogs in a group (accounting for audio files)
function calculateTotalDialogDuration(dialogGroupName) {
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroupName}"]`);
  let totalDuration = 0;
  
  // Create a temporary array to hold all audio promises
  const audioDurations = [];
  
  dialogs.forEach(dialog => {
    const audioPath = dialog.getAttribute('data-audio');
    const specifiedDuration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
    
    if (audioPath && DIALOG_CONFIG.audioEnabled) {
      // Create a promise to get audio duration
      const promise = new Promise((resolve) => {
        const audio = new Audio(audioPath);
        
        // Once metadata is loaded, we can access duration
        audio.addEventListener('loadedmetadata', function() {
          // Add a small buffer to audio duration
          resolve(audio.duration * 1000 + DIALOG_CONFIG.interDialogDelay);
        });
        
        // Handle errors - fall back to specified duration
        audio.addEventListener('error', function() {
          resolve(specifiedDuration);
        });
        
        // Set src after adding event listeners
        audio.src = audioPath;
      });
      
      audioDurations.push(promise);
    } else {
      // For dialogs without audio, just use the specified duration
      audioDurations.push(Promise.resolve(specifiedDuration));
    }
  });
  
  // Return a promise that resolves to the total duration
  return Promise.all(audioDurations).then(durations => {
    return durations.reduce((total, duration) => total + duration, 0);
  });
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
  
  
  // Show call UI with glitch effect
  showWithGlitch(document.querySelector('.fixer-call-section'));
  
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

      // Hide call UI with glitch effect
      hideWithGlitch(document.querySelector('.fixer-call-section'));
      
      // Show active call indicator in left sidebar with glitch effect
      setTimeout(() => {
        showWithGlitch(document.querySelector('.active-call-indicator'));
        updateActiveCallIndicator('REGINA JONES');
        
        // Play dialog sequence and wait for completion
        playDialogSequence('regina-intro').then(() => {
          // Now that dialog sequence is complete, hide call indicator with glitch effect
          hideWithGlitch(document.querySelector('.active-call-indicator'));
          
          // Show loading animation
          showLoadingAnimation();
          
          // After loading is complete, show main content
          setTimeout(() => {
            const mainContentContainer = document.getElementById('app-main');
            const navigationContentContainer = document.getElementById('nav-section');
            
            showWithGlitch(mainContentContainer);
            showWithGlitch(navigationContentContainer);
          }, 3500);
        });
      }, CONFIG.elementGlitch.fadeTime + 100); // Short delay after the call UI is hidden
    });
  }
  
  // Decline call button functionality remains the same
  if (declineCallBtn) {
    declineCallBtn.addEventListener('click', function() {
      ringtone.pause();
      ringtone.currentTime = 0;

      glitchSound.play().catch(e => console.log('Audio playback error:', e));
      
      // Hide call UI with glitch effect
      hideWithGlitch(document.querySelector('.fixer-call-section'));


      // Adding Scramble to Header and footer
      // Apply random scramble to header for 5 seconds
        temporaryScramble('.app-header', 'random', 5000);
        temporaryScramble('.dialog-speaker', 'random', 5000);
        temporaryScramble('.dialog-text', 'random', 5000);

      // Short delay to ensure call section is hidden first
      setTimeout(() => {
        // Create and show relic malfunction message
        showRelicMalfunction();
        
        // Apply glitch effect to whole screen
        applyFullScreenGlitch();
        
        // Fade to black and reset
        setTimeout(() => {
          fadeToBlackAndReset();
        }, 4500);
      }, CONFIG.elementGlitch.fadeTime);
    });
  }
}

/**
 * Temporarily apply scramble effect to an element
 * @param {string|Element} selector - CSS selector or DOM element
 * @param {string} mode - 'finite', 'infinite', or 'random'
 * @param {number} duration - Duration in milliseconds before removing effect
 * @param {Object} config - Optional custom configuration for the scrambler
 */
function temporaryScramble(selector, mode = 'finite', duration = 3000, config = {}) {
  // Get the element
  const element = typeof selector === 'string' ? 
    document.querySelector(selector) : selector;
    
  if (!element) return;
  
  // Store original text
  const originalText = element.innerHTML;
  
  // Create a scrambler
  const scrambler = new TextScramble(element);
  scrambler.setText(originalText, mode, config);
  
  // Set timeout to remove effect
  setTimeout(() => {
    // Stop the scramble animation
    scrambler.stop();
    
    // Reset element text
    element.innerHTML = originalText;
    
    // Remove data attributes
    element.removeAttribute('data-scramble');
    element.removeAttribute('data-scramble-mode');
  }, duration);
  
  // Return scrambler for possible manual control
  return scrambler;
}

// Update active call indicator in left sidebar - improved version
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
      // Define avatar mapping with fallbacks
      const avatarMap = {
        'V': 'Images/Characters/V_Avatar.png',
        'REGINA JONES': 'Images/Characters/ReginaJohnes_Avatar.png',
        'MR. HANDS': 'mr-hands.jpg',
        'ROGUE': 'Images/Characters/Rogue_Avatar.png',
        'JOHNNY SILVERHAND': 'Images/Characters/Johnny_Avatar.png',
        'JUDY': 'Images/Characters/Judy_Avatar.png',
        'PANAM': 'Images/Characters/Panam_Avatar.png',
        'TAKEMURA': 'Images/Characters/Takemura_Avatar.png',
        'DEXTER DESHAWN': 'Images/Characters/Dexter_Avatar.png',
        'ROGUE AI': 'Images/Characters/Rouge_AI_Avatar.png'
      };
      
      // Get avatar or use default if not found
      let imageSrc = avatarMap[speakerName] || 'Images/Characters/Default_Avatar.png';
      
      // Check if file exists, otherwise use a fallback
      const img = new Image();
      img.onerror = function() {
        // If image doesn't exist, use a generic fallback
        callerAvatarElement.src = 'placeholder-fixer.jpg';
      };
      img.onload = function() {
        // If image loads successfully, use it
        callerAvatarElement.src = imageSrc;
      };
      img.src = imageSrc;
      
      callerAvatarElement.alt = speakerName;
    }
  }
}

// Hide active call indicator
function hideActiveCallIndicator() {
  const indicator = document.querySelector('.active-call-indicator');
  if (indicator) {
    hideWithGlitch(indicator);
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
  }
  
  // Show with glitch effect
  relicMalfunction.style.display = 'none'; // Hide first
  relicMalfunction.offsetHeight; // Force reflow
  showWithGlitch(relicMalfunction);
}

// Function to apply repeating glitch effect to concept cards using showWithGlitch
function initConceptCardGlitches() {
    // Get only concept cards with data-glitch-repeat attribute
    const glitchCards = document.querySelectorAll('.concept-card[data-glitch-repeat]');

    glitchCards.forEach(card => {
        // Get interval from data attribute or use default (5 seconds)
        const interval = card.getAttribute('data-glitch-interval') ?
            parseInt(card.getAttribute('data-glitch-interval')) : 5000;

        // Apply initial glitch effect after a short delay
        setTimeout(() => {
            showWithGlitch(card);
        }, 500);

        // Set up repeating glitch effect
        setInterval(() => {
            // Temporarily hide card
            card.style.opacity = '0';
            // Force reflow
            card.offsetHeight;
            // Show with glitch effect
            showWithGlitch(card);
        }, interval);
    });
}

// Call this function after the concepts section is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize concept card glitches when the page loads
    initConceptCardGlitches();
});

// Function to apply glitch to a specific concept card by ID
function glitchConceptCard(conceptId) {
    const card = document.querySelector(`.concept-card[data-concept-id="${conceptId}"]`);
    if (card) {
        // Temporarily hide the card (without changing layout)
        card.style.opacity = '0';

        // Force reflow
        card.offsetHeight;

        // Apply the glitch effect
        showWithGlitch(card);
    }
}

// Function to set up repeating glitch on a specific concept card
function setupRepeatingGlitch(conceptId, interval = 5000) {
    const card = document.querySelector(`.concept-card[data-concept-id="${conceptId}"]`);
    if (card) {
        // Apply initial glitch
        glitchConceptCard(conceptId);

        // Set up repeating interval
        const intervalId = setInterval(() => {
            glitchConceptCard(conceptId);
        }, interval);

        // Store interval ID on the element for future reference
        card.dataset.glitchIntervalId = intervalId;

        return intervalId;
    }
    return null;
}

// Function to stop a repeating glitch
function stopRepeatingGlitch(conceptId) {
    const card = document.querySelector(`.concept-card[data-concept-id="${conceptId}"]`);
    if (card && card.dataset.glitchIntervalId) {
        clearInterval(parseInt(card.dataset.glitchIntervalId));
        delete card.dataset.glitchIntervalId;
    }
}