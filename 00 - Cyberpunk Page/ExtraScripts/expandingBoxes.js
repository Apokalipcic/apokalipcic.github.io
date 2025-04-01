/* expandingBoxes.js - Cyberpunk styled expanding information panels
 * Simplified and efficient implementation with row organization
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize expandable boxes
  initExpandableBoxes();
});

function initExpandableBoxes() {
  // Get all expandable boxes
  const boxes = document.querySelectorAll('.cyber-box');
  if (!boxes.length) return;
  
  // Add click event to each box
  boxes.forEach(box => {
    box.addEventListener('click', function() {
      const isExpanded = this.classList.contains('expanded');
      
      // If already expanded, collapse it
      if (isExpanded) {
        collapseBox(this);
      } else {
        // Otherwise expand it
        expandBox(this);
      }
    });
    
    // Add click event to close button if present
    const closeBtn = box.querySelector('.cyber-box-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        collapseBox(box);
      });
    }
  });
}

function expandBox(box) {
  // Get the expanded box content
  const content = box.querySelector('.cyber-box-expanded-content');
  if (!content) return;
  
  // Get all boxes
  const allBoxes = document.querySelectorAll('.cyber-box');
  
  // Create and show glitch overlay
  showGlitchOverlay();
  
  // Get the row height for animation
  const rowHeight = box.offsetHeight;
  
  // Mark this box as expanded
  box.classList.add('expanded');
  
  // Get row container
  const row = box.closest('.cyber-row');
  
  // First, collapse any currently expanded box
  const currentExpanded = document.querySelector('.cyber-box.expanded:not([data-id="' + box.dataset.id + '"])');
  if (currentExpanded) {
    collapseBox(currentExpanded, false); // Don't show glitch overlay for this collapse
  }
  
  // Hide other boxes with fade
  allBoxes.forEach(otherBox => {
    if (otherBox !== box) {
      otherBox.classList.add('faded');
    }
  });
  
  // Animate expansion
  // First set initial height
  content.style.display = 'block';
  
  // Force browser to recognize initial height
  window.getComputedStyle(content).getPropertyValue('height');
  
  // Now set the expanded height class
  box.classList.add('expanding');
  
  // After animation completes
  setTimeout(() => {
    box.classList.remove('expanding');
    box.classList.add('expanded-complete');
    
    // Ensure content is visible
    content.style.opacity = '1';
  }, 500); // Match this to your CSS transition duration
}

function collapseBox(box, showGlitch = true) {
  if (!box.classList.contains('expanded')) return;
  
  // Show glitch overlay if requested
  if (showGlitch) {
    showGlitchOverlay();
  }
  
  // Get the expanded content
  const content = box.querySelector('.cyber-box-expanded-content');
  
  // Mark as collapsing
  box.classList.remove('expanded-complete');
  box.classList.add('collapsing');
  
  // Set content to fade out
  content.style.opacity = '0';
  
  // Get all boxes
  const allBoxes = document.querySelectorAll('.cyber-box');
  
  // Show other boxes
  allBoxes.forEach(otherBox => {
    otherBox.classList.remove('faded');
  });
  
  // After animation completes
  setTimeout(() => {
    // Reset all classes
    box.classList.remove('expanded', 'collapsing');
    
    // Hide expanded content
    content.style.display = 'none';
  }, 500); // Match this to your CSS transition duration
}

function showGlitchOverlay() {
  // Create glitch overlay
  const overlay = document.createElement('div');
  overlay.className = 'cyber-glitch-overlay';
  document.body.appendChild(overlay);
  
  // Remove after animation completes
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }, 300); // Match this to your CSS animation duration
}