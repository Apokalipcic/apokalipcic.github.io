/* quest-design.js - JavaScript functionality for Cyberpunk 2077 Quest Design page */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize quest design functionalities
  initQuestDesign();
});

function initQuestDesign() {
  // Navigation functionality
  initNavigation();
  
  // Fixer call buttons
  initFixerCall();
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav__link');
  const contentSections = document.querySelectorAll('.content-section');
  const contentTitle = document.querySelector('.content-title');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active link
      navLinks.forEach(item => item.classList.remove('nav__link--active'));
      this.classList.add('nav__link--active');
      
      // Get section ID
      const targetSection = this.getAttribute('data-section');
      
      // Update content title
      if (contentTitle) {
        contentTitle.textContent = this.textContent;
      }
      
      // Show selected content section
      contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) {
          section.classList.add('active');
        }
      });
      
      // Update dialog based on selected section
      updateDialog(targetSection);
    });
  });
}

function initFixerCall() {
  const acceptCallBtn = document.getElementById('accept-call');
  const declineCallBtn = document.getElementById('decline-call');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingProgress = document.getElementById('loading-progress');
  
  if (acceptCallBtn) {
    acceptCallBtn.addEventListener('click', function() {
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
        
        // Update UI to show quest is active
        document.querySelector('.fixer-call-section').classList.add('hidden');
      }, 3500);
    });
  }
  
  if (declineCallBtn) {
    declineCallBtn.addEventListener('click', function() {
      // Show a failure message or reload page effect
      document.body.style.animation = 'glitch 0.3s infinite';
      
      // Add more glitch effects to elements
      const elements = document.querySelectorAll('.app-header, .app-container, .dialog-footer');
      elements.forEach(el => {
        el.style.animation = 'glitch 0.2s infinite';
      });
      
      // Reload after delay
      setTimeout(() => {
        location.reload();
      }, 1500);
    });
  }
}

function updateDialog(section) {
  const dialogSpeaker = document.querySelector('.dialog-speaker');
  const dialogText = document.querySelector('.dialog-text');
  
  if (!dialogSpeaker || !dialogText) return;
  
  // Update dialog based on active section
  switch(section) {
    case 'quest-brief':
      dialogSpeaker.textContent = 'REGINA JONES:';
      dialogText.textContent = 'V, I need someone with your particular skill set for a job. Interested?';
      break;
    case 'quest-structure':
      dialogSpeaker.textContent = 'V:';
      dialogText.textContent = 'What exactly am I walking into here, Regina?';
      break;
    case 'core-loop':
      dialogSpeaker.textContent = 'REGINA JONES:';
      dialogText.textContent = 'Expect resistance. The facility\'s security systems are... unpredictable.';
      break;
    case 'map-sketch':
      dialogSpeaker.textContent = 'V:';
      dialogText.textContent = 'Send me the building schematics. I need to know what I\'m dealing with.';
      break;
    case 'notes-sketches':
      dialogSpeaker.textContent = 'REGINA JONES:';
      dialogText.textContent = 'My information is fragmented. You\'ll need to piece things together on site.';
      break;
    case 'item-description':
      dialogSpeaker.textContent = 'REGINA JONES:';
      dialogText.textContent = 'There\'s something valuable in there. Experimental tech that never hit the market.';
      break;
    case 'dialogues':
      dialogSpeaker.textContent = 'ROGUE AI:';
      dialogText.textContent = 'Subject identified: Potential threat. Defense protocols active.';
      break;
    default:
      dialogSpeaker.textContent = 'REGINA JONES:';
      dialogText.textContent = 'V, I need someone with your particular skill set for a job. Interested?';
  }
}

// Add glitch effect to text elements with the glitch-text class
function glitchTextElements() {
  const glitchElements = document.querySelectorAll('.glitch-text');
  
  glitchElements.forEach(element => {
    // The CSS animation will handle the visual effect
    // This function can be extended for more complex glitch behaviors
  });
}
