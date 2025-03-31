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

// Call system configuration
const CALL_CONFIG = {
  containerSelector: '.call-container',
  initialCallSelector: '.call-initial',
  activeCallSelector: '.call-active',
  callerImagePath: 'images/callers/', // Base path for caller images
  defaultCallerImage: 'regina-jones.png',
  animationDuration: 800, // Duration of appear/disappear animation
  defaultDuration: 4000, // Default dialog duration
  ringtoneFile: 'Audio/Vs_Phone_Ringtone.mp3'
};


document.addEventListener('DOMContentLoaded', function() {
  // Initialize effects
  initTypewriterElements();
  initGlitchElements();
  initRandomGlitches();
  initScannerEffects();

   // Initialize dialog system
  initDialogSystem();
  
  // Initialize call system
  initCallSystem();
  
  // Add the CRT effects if enabled
  if (document.body.classList.contains('crt-enabled')) {
    addCRTEffects();
  }

    setTimeout(function() {
    showInitialCall('regina', 'REGINA JONES', 'regina-jones.png', 'regina-intro');
    }, 2000);
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

// Initialize dialog system
function initDialogSystem() {
  // Get dialog container elements
  const dialogContainer = document.querySelector('.dialog-container');
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  if (!dialogContainer || !dialogSpeaker || !dialogText) return;
  
  // Find all dialog trigger elements
  const dialogTriggers = document.querySelectorAll('.dialog-trigger');
  
  // Attach event listeners to triggers
  dialogTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get dialog group from trigger
      const dialogGroup = this.getAttribute('data-dialog-group') || 'default';
      
      // Find all dialogs in this group
      const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroup}"]`);
      
      // Play dialogs in sequence
      playDialogSequence(dialogs, dialogSpeaker, dialogText);
    });
  });
}

// Play a sequence of dialogs
function playDialogSequence(dialogs, speakerElement, textElement) {
  let currentIndex = 0;
  
  // Function to display current dialog
  function displayDialog() {
    if (currentIndex >= dialogs.length) return;
    
    const dialog = dialogs[currentIndex];
    const speaker = dialog.getAttribute('data-speaker');
    const text = dialog.textContent;
    const audio = dialog.getAttribute('data-audio');
    const duration = parseInt(dialog.getAttribute('data-duration')) || DIALOG_CONFIG.defaultDuration;
    
    // Fade out current dialog
    fadeOut(speakerElement);
    fadeOut(textElement, function() {
      // Update dialog content
      speakerElement.textContent = speaker + ':';
      
      // Apply typewriter if requested
      if (dialog.hasAttribute('data-typewriter')) {
        textElement.textContent = '';
        typeWriter(textElement, text, 0, parseInt(dialog.getAttribute('data-typewriter-speed')) || 30);
      } else {
        textElement.textContent = text;
      }
      
      // Play audio if available
      if (audio && DIALOG_CONFIG.audioEnabled) {
        const audioElement = new Audio(audio);
        audioElement.play();
      }
      
      // Fade in updated dialog
      fadeIn(speakerElement);
      fadeIn(textElement);
      
      // Apply glitch if requested
      if (dialog.hasAttribute('data-glitch')) {
        setTimeout(() => {
          applyGlitch(textElement, parseInt(dialog.getAttribute('data-glitch-duration')) || CONFIG.glitch.defaultDuration);
        }, 500);
      }
      
      // Move to next dialog after duration
      currentIndex++;
      if (currentIndex < dialogs.length) {
        setTimeout(displayDialog, duration);
      }
    });
  }
  
  // Start dialog sequence
  displayDialog();
}

// Fade out element and call callback when complete
function fadeOut(element, callback) {
  element.style.transition = `opacity ${DIALOG_CONFIG.fadeSpeed}ms`;
  element.style.opacity = 0;
  
  setTimeout(() => {
    if (callback) callback();
  }, DIALOG_CONFIG.fadeSpeed);
}

// Fade in element
function fadeIn(element) {
  element.style.transition = `opacity ${DIALOG_CONFIG.fadeSpeed}ms`;
  element.style.opacity = 1;
}

// Manually update dialog by group name
function updateDialogByGroup(groupName, index = 0) {
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${groupName}"]`);
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  if (dialogs.length > index && dialogSpeaker && dialogText) {
    const dialog = dialogs[index];
    
    dialogSpeaker.textContent = dialog.getAttribute('data-speaker') + ':';
    dialogText.textContent = dialog.textContent;
    
    // Play audio if available
    const audio = dialog.getAttribute('data-audio');
    if (audio && DIALOG_CONFIG.audioEnabled) {
      const audioElement = new Audio(audio);
      audioElement.play();
    }
    
    return true;
  }
  
  return false;
}
     
// Initialize call system
function initCallSystem() {
  // Setup call containers if they don't exist
  setupCallContainers();
  
  // Setup initial call triggers
  const initialCallTriggers = document.querySelectorAll('.initial-call-trigger');
  initialCallTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {

      e.preventDefault();
      // Get caller details
      const callerId = this.getAttribute('data-caller-id') || 'regina';
      const callerName = this.getAttribute('data-caller-name') || 'REGINA JONES';
      const callerImage = this.getAttribute('data-caller-image') || CALL_CONFIG.defaultCallerImage;
      const dialogGroup = this.getAttribute('data-dialog-group') || 'default';
      
      // Show initial call UI
      showInitialCall(callerId, callerName, callerImage, dialogGroup);
    });
  });
  
  // Setup regular call triggers (skipping initial call)
  const regularCallTriggers = document.querySelectorAll('.call-trigger:not(.initial-call-trigger)');
  regularCallTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get caller details
      const callerId = this.getAttribute('data-caller-id') || 'regina';
      const callerName = this.getAttribute('data-caller-name') || 'REGINA JONES';
      const callerImage = this.getAttribute('data-caller-image') || CALL_CONFIG.defaultCallerImage;
      const dialogGroup = this.getAttribute('data-dialog-group') || 'default';
      
      // Skip initial call and go straight to active call
      showActiveCall(callerId, callerName, callerImage, dialogGroup);
    });
  });
  
  // Set up answer and decline buttons
  setupAnswerDeclineButtons();
}

// Create call containers if they don't exist
function setupCallContainers() {
  if (!document.querySelector(CALL_CONFIG.containerSelector)) {
    // Create main container
    const callContainer = document.createElement('div');
    callContainer.className = 'call-container';
    
    // Create initial call UI
    const initialCall = document.createElement('div');
    initialCall.className = 'call-initial hidden';
    initialCall.innerHTML = `
      <div class="incoming-call-box">
        <div class="incoming-call-label">INCOMING CALL</div>
        <div class="caller-id"></div>
        <div class="caller-image-container">
          <img class="caller-image" src="placeholder.jpg" alt="Caller">
        </div>
        <div class="call-buttons">
          <button class="call-answer-btn">ANSWER</button>
          <button class="call-decline-btn">DECLINE</button>
        </div>
      </div>
    `;
    
    // Create active call UI
    const activeCall = document.createElement('div');
    activeCall.className = 'call-active hidden';
    activeCall.innerHTML = `
      <div class="active-call-box">
        <div class="caller-image-container">
          <img class="caller-image" src="placeholder.jpg" alt="Caller">
        </div>
        <div class="caller-name"></div>
      </div>
    `;
    
    // Append to container
    callContainer.appendChild(initialCall);
    callContainer.appendChild(activeCall);
    
    // Add to body
    document.body.appendChild(callContainer);
  }
}

// Show initial call UI
function showInitialCall(callerId, callerName, callerImage, dialogGroup) {
  const initialCallEl = document.querySelector(CALL_CONFIG.initialCallSelector);
  
  // Update caller details
  initialCallEl.querySelector('.caller-id').textContent = callerName;
  initialCallEl.querySelector('.caller-image').src = `${CALL_CONFIG.callerImagePath}${callerImage}`;
  
  // Store dialog group for answer button
  initialCallEl.setAttribute('data-dialog-group', dialogGroup);
  
  // Show with animation
  initialCallEl.classList.remove('hidden');
  initialCallEl.classList.add('appear-animation');
  
  // Play ringtone if available
  playRingtone();
}

// Show active call UI directly (skip initial)
function showActiveCall(callerId, callerName, callerImage, dialogGroup) {
  const activeCallEl = document.querySelector(CALL_CONFIG.activeCallSelector);
  
  // Update caller details
  activeCallEl.querySelector('.caller-name').textContent = callerName;
  activeCallEl.querySelector('.caller-image').src = `${CALL_CONFIG.callerImagePath}${callerImage}`;
  
  // Show with animation
  activeCallEl.classList.remove('hidden');
  activeCallEl.classList.add('appear-animation');
  
  // Start dialog sequence
  const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroup}"]`);
  if (dialogs.length > 0) {
    const dialogSpeaker = document.querySelector('.dialog-speaker');
    const dialogText = document.querySelector('.dialog-text');
    
    if (dialogSpeaker && dialogText) {
      playDialogSequence(dialogs, dialogSpeaker, dialogText);
      
      // End call after last dialog
      const lastDialog = dialogs[dialogs.length - 1];
      const duration = parseInt(lastDialog.getAttribute('data-duration')) || CALL_CONFIG.defaultDuration;
      
      setTimeout(() => {
        endCall();
      }, duration + 500); // Add a small buffer after last dialog
    }
  }
}

// End call and hide UI
function endCall() {
  const initialCallEl = document.querySelector(CALL_CONFIG.initialCallSelector);
  const activeCallEl = document.querySelector(CALL_CONFIG.activeCallSelector);
  
  // Add disappear animation
  if (!initialCallEl.classList.contains('hidden')) {
    initialCallEl.classList.add('disappear-animation');
  }
  
  if (!activeCallEl.classList.contains('hidden')) {
    activeCallEl.classList.add('disappear-animation');
  }
  
  // After animation completes, hide elements
  setTimeout(() => {
    initialCallEl.classList.remove('appear-animation', 'disappear-animation');
    activeCallEl.classList.remove('appear-animation', 'disappear-animation');
    
    initialCallEl.classList.add('hidden');
    activeCallEl.classList.add('hidden');
  }, CALL_CONFIG.animationDuration);
  
  // Stop any audio
  stopRingtone();
}

// Setup answer and decline buttons
function setupAnswerDeclineButtons() {
  // Answer button
  const answerBtn = document.querySelector('.call-answer-btn');
  if (answerBtn) {
    answerBtn.addEventListener('click', function() {
      const initialCallEl = document.querySelector(CALL_CONFIG.initialCallSelector);
      const dialogGroup = initialCallEl.getAttribute('data-dialog-group');
      const callerName = initialCallEl.querySelector('.caller-id').textContent;
      const callerImage = initialCallEl.querySelector('.caller-image').getAttribute('src').split('/').pop();
      
      // Hide initial call
      initialCallEl.classList.add('disappear-animation');
      
      setTimeout(() => {
        initialCallEl.classList.remove('appear-animation', 'disappear-animation');
        initialCallEl.classList.add('hidden');
        
        // Show active call
        showActiveCall('custom', callerName, callerImage, dialogGroup);
      }, CALL_CONFIG.animationDuration);
      
      // Stop ringtone
      stopRingtone();
      
      // Show loading animation after dialog finishes
      const dialogs = document.querySelectorAll(`.dialog-data[data-dialog-group="${dialogGroup}"]`);
      if (dialogs.length > 0) {
        const lastDialog = dialogs[dialogs.length - 1];
        const totalDuration = calculateTotalDialogDuration(dialogs);
        
        setTimeout(() => {
          showLoadingAnimation();
        }, totalDuration + 1000);
      }
    });
  }
  
  // Decline button
  const declineBtn = document.querySelector('.call-decline-btn');
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      // End the call
      endCall();
      
      // Apply glitch effect to whole screen
      applyFullScreenGlitch();
      
      // Fade to black and reload
      fadeToBlackAndReload();
    });
  }
}

// Play ringtone for incoming call
function playRingtone() {
  // Create audio element if not exists
  if (!window.ringtoneAudio) {
    window.ringtoneAudio = new Audio(CALL_CONFIG.ringtoneFile);
    window.ringtoneAudio.loop = true;
  }
  
  // Play ringtone
  window.ringtoneAudio.play().catch(e => console.log('Audio playback error:', e));
}

// Stop ringtone
function stopRingtone() {
  if (window.ringtoneAudio) {
    window.ringtoneAudio.pause();
    window.ringtoneAudio.currentTime = 0;
  }
}

// Apply glitch effect to entire screen
function applyFullScreenGlitch() {
  // Create glitch overlay if not exists
  if (!document.querySelector('.fullscreen-glitch')) {
    const glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'fullscreen-glitch';
    document.body.appendChild(glitchOverlay);
  }
  
  const glitchEl = document.querySelector('.fullscreen-glitch');
  glitchEl.classList.add('active');
  
  // Apply glitch effect to body
  document.body.style.animation = 'glitch 0.3s infinite';
  
  // Apply to all major containers
  const elements = document.querySelectorAll('.app-header, .app-container, .dialog-footer');
  elements.forEach(el => {
    el.style.animation = 'glitch 0.2s infinite';
  });
}

// Fade to black and reload the page
function fadeToBlackAndReload() {
  // Create fade overlay if not exists
  if (!document.querySelector('.fade-overlay')) {
    const fadeOverlay = document.createElement('div');
    fadeOverlay.className = 'fade-overlay';
    document.body.appendChild(fadeOverlay);
  }
  
  const fadeEl = document.querySelector('.fade-overlay');
  fadeEl.classList.add('active');
  
  // Reload after animation
  setTimeout(() => {
    location.reload();
  }, 1500);
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

// Calculate total duration of all dialogs in a sequence
function calculateTotalDialogDuration(dialogs) {
  let totalDuration = 0;
  
  dialogs.forEach(dialog => {
    const duration = parseInt(dialog.getAttribute('data-duration')) || CALL_CONFIG.defaultDuration;
    totalDuration += duration;
  });
  
  return totalDuration;
}
