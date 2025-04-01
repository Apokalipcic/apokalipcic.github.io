/* mainContentSwitcher.js - Navigation functionality for Cyberpunk 2077 Portfolio */

/********************************************************
 * MAIN CONTENT SWITCHER
 ********************************************************/

// Initialize the content switcher when document is ready
document.addEventListener('DOMContentLoaded', function() {
  initContentSwitcher();
});

// Initialize the content switching functionality
function initContentSwitcher() {
  // Find all navigation links
  const navLinks = document.querySelectorAll('.nav__link');
  
  // Add click event listeners to each link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the target section ID from data-section attribute
      const sectionId = this.getAttribute('data-section');
      
      if (sectionId) {
        // Switch to the target section
        switchSection(sectionId, this);
      }
    });
  });
}

// Switch to a specific content section
function switchSection(sectionId, clickedLink) {
  // Get all content sections
  const contentSections = document.querySelectorAll('.content-section');
  
  // Hide all sections
  contentSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Show the target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    // Apply glitch effect if available
    if (typeof showWithGlitch === 'function') {
      targetSection.style.opacity = '0';
      targetSection.classList.add('active');
      showWithGlitch(targetSection);
    } else {
      targetSection.classList.add('active');
    }
  }
  
  // Update the active navigation link
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.classList.remove('nav__link--active');
  });
  
  // Set the clicked link as active
  if (clickedLink) {
    clickedLink.classList.add('nav__link--active');
    
    // Update the content title in the topbar
    updateContentTitle(clickedLink.textContent);
  }
}

// Update the content title in the topbar
function updateContentTitle(title) {
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    if (typeof glitchElement === 'function') {
      // Apply glitch effect to title change if available
      contentTitle.textContent = title;
      glitchElement(contentTitle.parentElement, 500);
    } else {
      contentTitle.textContent = title;
    }
  }
}

// Public function to switch to a section by ID
function switchToSection(sectionId) {
  const link = document.querySelector(`.nav__link[data-section="${sectionId}"]`);
  switchSection(sectionId, link);
}