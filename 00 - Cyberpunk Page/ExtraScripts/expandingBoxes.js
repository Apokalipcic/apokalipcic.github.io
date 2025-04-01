/* expandingBoxes.js - Cyberpunk styled expanding information panels
 * Enhanced implementation with first-row relocation approach
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
    box.addEventListener('click', function(e) {
      // Prevent click from propagating if it's on close button
      if (e.target.closest('.cyber-box-close')) return;
      
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
  
  // First, collapse any currently expanded box
  const currentExpanded = document.querySelector('.cyber-box.expanded:not([data-id="' + box.dataset.id + '"])');
  if (currentExpanded) {
    collapseBox(currentExpanded, false); // Don't show glitch overlay for this collapse
  }
  
  // Get the parent container (cyber-rows) for positioning
  const rowsContainer = box.closest('.cyber-rows');
  if (!rowsContainer) return;
  
  // Get the first row for relocation
  const firstRow = rowsContainer.querySelector('.cyber-row:first-child');
  if (!firstRow) return;
  
  // Store the original box information
  const originalBox = {
    parent: box.parentElement,
    nextSibling: box.nextElementSibling,
    rect: box.getBoundingClientRect(),
    containerRect: rowsContainer.getBoundingClientRect()
  };
  
  // Store position data as attributes
  box.dataset.originalParentId = originalBox.parent.id || 'row-' + Array.from(rowsContainer.querySelectorAll('.cyber-row')).indexOf(originalBox.parent);
  if (!originalBox.parent.id) {
    originalBox.parent.id = box.dataset.originalParentId;
  }
  
  box.dataset.originalNextSiblingId = originalBox.nextSibling ? (originalBox.nextSibling.id || 'cyber-box-' + Date.now()) : '';
  if (originalBox.nextSibling && !originalBox.nextSibling.id && box.dataset.originalNextSiblingId) {
    originalBox.nextSibling.id = box.dataset.originalNextSiblingId;
  }
  
  // Store the original box index in the row
  const boxesInRow = Array.from(originalBox.parent.querySelectorAll('.cyber-box'));
  box.dataset.originalIndex = boxesInRow.indexOf(box);
  box.dataset.isLeftmost = (box.dataset.originalIndex === '0').toString();
  
  // Calculate current position for smooth transition
  const boxRect = box.getBoundingClientRect();
  const containerRect = rowsContainer.getBoundingClientRect();
  const firstRowRect = firstRow.getBoundingClientRect();
  
  // Store original dimensions
  box.dataset.originalWidth = box.offsetWidth + 'px';
  box.dataset.originalHeight = box.offsetHeight + 'px';
  
  // Hide header elements
  const header = box.querySelector('.cyber-box-header');
  if (header) {
    header.style.opacity = '0';
    header.style.visibility = 'hidden';
  }
  
  // Hide other boxes with fade
  allBoxes.forEach(otherBox => {
    if (otherBox !== box) {
      otherBox.classList.add('faded');
    }
  });
  
  // Set initial position to match current visual position
  box.style.position = 'absolute';
  box.style.zIndex = '100';
  box.style.top = (boxRect.top - containerRect.top) + 'px';
  box.style.left = (boxRect.left - containerRect.left) + 'px';
  box.style.width = box.offsetWidth + 'px';
  box.style.height = box.offsetHeight + 'px';
  
  // Move the box to the document body temporarily for clean animation
  document.body.appendChild(box);
  
  // Reset position relative to body
  box.style.position = 'fixed';
  box.style.top = boxRect.top + 'px';
  box.style.left = boxRect.left + 'px';
  
  // Mark this box as expanded
  box.classList.add('expanded');
  
  // Force browser to recognize initial dimensions
  window.getComputedStyle(box).getPropertyValue('height');
  
  // Now move the box to the first row of the container
  firstRow.appendChild(box);
  
  // Update position to be absolute within the first row
  box.style.position = 'absolute';
  box.style.top = '0';
  box.style.left = '0';
  
  // Now expand to fill container
  requestAnimationFrame(() => {
    box.classList.add('expanding');
    
    // Expand to fill the entire rows container
    box.style.width = rowsContainer.offsetWidth + 'px';
    box.style.height = rowsContainer.offsetHeight + 'px';
    
    // Show expanded content
    content.style.display = 'block';
    
    // After animation completes
    setTimeout(() => {
      box.classList.remove('expanding');
      box.classList.add('expanded-complete');
      
      // Ensure content is visible with a slight delay for smoother effect
      setTimeout(() => {
        content.style.opacity = '1';
      }, 50);
    }, 500); // Match this to your CSS transition duration
  });
  
  // Make sure the rows container keeps its layout during expansion
  rowsContainer.style.position = 'relative';
  rowsContainer.style.minHeight = rowsContainer.offsetHeight + 'px';
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
  
  // Show other boxes (remove fade)
  allBoxes.forEach(otherBox => {
    otherBox.classList.remove('faded');
  });
  
  // Get the rows container
  const rowsContainer = box.closest('.cyber-rows');
  if (!rowsContainer) return;
  
  // Get the original parent row and next sibling
  const originalParent = document.getElementById(box.dataset.originalParentId);
  const originalNextSibling = box.dataset.originalNextSiblingId ? 
    document.getElementById(box.dataset.originalNextSiblingId) : null;
  
  // Get the current position in the first row
  const boxRect = box.getBoundingClientRect();
  
  // Temporarily move to fixed position for clean animation
  document.body.appendChild(box);
  box.style.position = 'fixed';
  box.style.top = boxRect.top + 'px';
  box.style.left = boxRect.left + 'px';
  box.style.width = boxRect.width + 'px';
  box.style.height = boxRect.height + 'px';
  
  // Force browser to recognize initial dimensions
  window.getComputedStyle(box).getPropertyValue('height');
  
  // Animate back to original size
  box.style.width = box.dataset.originalWidth;
  box.style.height = box.dataset.originalHeight;
  
  // Calculate the target position for animation
  if (originalParent) {
    const originalParentRect = originalParent.getBoundingClientRect();
    let targetLeft, targetTop;
    
    // Get all boxes in the original row
    const boxesInRow = Array.from(originalParent.querySelectorAll('.cyber-box'));
    
    // Determine the box's original position in the row
    const isLeftmostBox = !box.dataset.originalNextSiblingId || boxesInRow.length === 0;
    
    if (isLeftmostBox) {
      // It's the leftmost box
      targetLeft = originalParentRect.left;
      targetTop = originalParentRect.top;
    } else if (originalNextSibling) {
      // Position before the next sibling with appropriate spacing
      const siblingRect = originalNextSibling.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(originalParent).gap) || 16; // Default gap if none specified
      targetLeft = siblingRect.left - parseFloat(box.dataset.originalWidth) - gap;
      targetTop = siblingRect.top;
    } else {
      // Position at the end of the parent
      targetLeft = originalParentRect.left + originalParent.offsetWidth - parseFloat(box.dataset.originalWidth);
      targetTop = originalParentRect.top;
    }
    
    // Animate to that position
    box.style.left = targetLeft + 'px';
    box.style.top = targetTop + 'px';
  }
  
  // After animation completes
  setTimeout(() => {
    // Reset all classes
    box.classList.remove('expanded', 'collapsing');
    
    // Hide expanded content
    content.style.display = 'none';
    
    // Reset positioning back to normal flow
    box.style.position = '';
    box.style.zIndex = '';
    box.style.top = '';
    box.style.left = '';
    box.style.width = '';
    box.style.height = '';
    
    // Move the box back to its original position in the DOM
    if (originalParent) {
      if (originalNextSibling) {
        originalParent.insertBefore(box, originalNextSibling);
      } else {
        originalParent.appendChild(box);
      }
    }
    
    // Show header elements again
    const header = box.querySelector('.cyber-box-header');
    if (header) {
      header.style.opacity = '1';
      header.style.visibility = 'visible';
    }
    
    // Reset min-height if needed
    if (!document.querySelector('.cyber-box.expanded')) {
      rowsContainer.style.minHeight = '';
    }
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