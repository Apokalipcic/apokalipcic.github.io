// chill-guy.js - Script for the chilling cat functionality

document.addEventListener('DOMContentLoaded', function() {
    // Create the chilling cat elements
    createChillGuy();

    // Add scroll event listener
    window.addEventListener('scroll', checkFooterVisibility);
    
    // Handle window resize events to reposition the cat
    window.addEventListener('resize', positionChillGuy);
    
    // Check on page load
    checkFooterVisibility();
});

// Create the chilling cat and speech bubble elements
function createChillGuy() {
    // Create container
    const container = document.createElement('div');
    container.className = 'chill-guy-container';
    container.id = 'chill-guy-container';
    
    // Create speech bubble
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = 'Just Chilling';
    
    // Create image
    const img = document.createElement('img');
    img.className = 'chill-guy-img';
    img.src = 'Images/Elements/Misc/chillGuy_400.png'; // Update this path to your actual image
    img.alt = 'Chill guy';
    
    // Add elements to container
    container.appendChild(speechBubble);
    container.appendChild(img);
    
    // Add container to the page - add to footer for mobile positioning
    const footer = document.querySelector('#footer');
    if (footer && window.innerWidth <= 768) {
        // For mobile, insert before the footer
        footer.parentNode.insertBefore(container, footer);
    } else {
        // For desktop, append to body
        document.body.appendChild(container);
    }
}

// Position the chilling cat element
function positionChillGuy() {
    const container = document.getElementById('chill-guy-container');
    const footer = document.querySelector('#footer');
    
    if (!container || !footer) return;
    
    // Check if we're on mobile
    if (window.innerWidth <= 768) {
        // For mobile devices
        // 1. Make sure the container is a sibling to the footer for proper positioning
        if (container.parentNode !== footer.parentNode) {
            footer.parentNode.insertBefore(container, footer);
        }
        
        // 2. Use relative positioning before the footer
        container.style.position = 'relative';
        container.style.top = 'auto';
        container.style.bottom = 'auto';
        container.style.marginBottom = '20px'; // Space between cat and footer
    } else {
        // For desktop, use absolute positioning after the about section
        container.style.position = 'absolute';
        
        // Make sure it's in the body for proper absolute positioning
        if (container.parentNode !== document.body) {
            document.body.appendChild(container);
        }
        
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            container.style.top = (aboutSection.offsetTop + aboutSection.offsetHeight - 180) + 'px';
        } else {
            // Fallback if About section isn't available
            container.style.top = (document.body.offsetHeight - footer.offsetHeight - 180) + 'px';
        }
    }
}

// Check if footer is visible and show cat if it is
function checkFooterVisibility() {
    const container = document.getElementById('chill-guy-container');
    const footer = document.querySelector('#footer');
    
    if (!container || !footer) return;
    
    // First, make sure the cat is positioned correctly
    positionChillGuy();
    
    // Get footer position
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if footer is visible in the viewport
    const isFooterVisible = footerRect.top < windowHeight && footerRect.bottom >= 0;
    
    // Show/hide the cat based on visibility
    if (isFooterVisible || isNearBottom()) {
        container.classList.add('visible');
    } else {
        container.classList.remove('visible');
    }
}

// Helper function to check if user is near the bottom of the page
function isNearBottom() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Consider "near bottom" as within 90% of the full scroll distance
    return scrollPosition + windowHeight > documentHeight * 0.9;
}