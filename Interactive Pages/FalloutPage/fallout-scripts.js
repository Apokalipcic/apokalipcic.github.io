/* ===========================
   Theme Color System
   =========================== */
const root = document.querySelector(":root");

// Color theme switcher
function initColorTheme() {
  const colorInputs = document.getElementsByName("colors");
  
  colorInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        root.className = this.value;
      }
    });
  });
}

/* ===========================
   Tab Navigation System
   =========================== */
function initTabNavigation() {
  // Handle all links with data-toggle="tab"
  const tabLinks = document.querySelectorAll('[data-toggle="tab"]');
  
  tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetTab = document.querySelector(targetId);
      
      if (!targetTab) return;
      
      // Remove active states from current tab group
      const tabGroup = targetTab.closest('.tab-content');
      const currentActive = tabGroup.querySelector('.tab-pane.active');
      
      if (currentActive) {
        currentActive.classList.remove('active', 'in', 'fade');
      }
      
      // Add active state to new tab
      targetTab.classList.add('active', 'in');
      
      // Update link active states
      const linkContainer = this.closest('ul');
      if (linkContainer) {
        linkContainer.querySelectorAll('li').forEach(li => {
          li.classList.remove('active');
        });
        this.closest('li').classList.add('active');
      }
      
      // Handle direct link active state
      const allLinks = document.querySelectorAll(`[href="${targetId}"]`);
      allLinks.forEach(l => {
        const parent = l.closest('li');
        if (parent) {
          parent.classList.add('active');
        } else {
          l.classList.add('active');
        }
      });
    });
  });
}

/* ===========================
   Basic Interactive Elements
   =========================== */
function initInteractiveElements() {
  // Handle hover states for all interactive elements
  const interactiveElements = document.querySelectorAll('a, button, label, input[type="button"], input[type="submit"]');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    
    element.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
}

/* ===========================
   Utility Functions
   =========================== */
function addClass(element, className) {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
}

function removeClass(element, className) {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
}

function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/* ===========================
   CRT Effect Animation
   =========================== */
function initCRTEffects() {
  // Add subtle flicker to the frame
  const frame = document.querySelector('.frame');
  
  if (frame) {
    setInterval(() => {
      const opacity = 0.98 + Math.random() * 0.02;
      frame.style.opacity = opacity;
    }, 100);
  }
}

/* ===========================
   Initialize Everything
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
  initColorTheme();
  initTabNavigation();
  initInteractiveElements();
  initCRTEffects();
  
  // Set initial active states
  const firstTab = document.querySelector('.tab-pane');
  if (firstTab) {
    firstTab.classList.add('active', 'in');
  }
});

/* ===========================
   Optional: Simple Custom Cursor
   =========================== */
function initCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor cursor-default';
  document.body.appendChild(cursor);
  
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });
  
  function updateCursor() {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    requestAnimationFrame(updateCursor);
  }
  
  updateCursor();
  
  // Change cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, label, input');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      cursor.classList.remove('cursor-default');
      cursor.classList.add('cursor-active');
    });
    
    element.addEventListener('mouseleave', function() {
      cursor.classList.remove('cursor-active');
      cursor.classList.add('cursor-default');
    });
  });
  
  // Hide cursor when outside frame
  const frame = document.querySelector('.frame');
  if (frame) {
    frame.addEventListener('mouseenter', function() {
      cursor.classList.remove('cursor-hidden');
    });
    
    frame.addEventListener('mouseleave', function() {
      cursor.classList.add('cursor-hidden');
    });
  }
}

// Uncomment to enable custom cursor
// document.addEventListener('DOMContentLoaded', initCustomCursor);