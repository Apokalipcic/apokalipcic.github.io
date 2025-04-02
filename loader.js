// loader.js - Animation and timing logic for the sleeping cat loader

document.addEventListener('DOMContentLoaded', function() {
    // References to key elements
    const loaderContainer = document.getElementById('loader-container');
    const mainContent = document.getElementById('main-content');
    const zzzContainer = document.querySelector('.zzz-container');
    const dots = document.querySelector('.dots');
    
    // Show the Zzz animation after a short delay
    setTimeout(() => {
        zzzContainer.style.opacity = '1';
    }, 300);
    
    // Custom dots animation
    let dotState = 0;
    const dotStates = ['.', '..', '...'];
    
    setInterval(() => {
        dotState = (dotState + 1) % dotStates.length;
        dots.textContent = dotStates[dotState];
    }, 500);
    
    // Function to fade out the loader and show main content
    function fadeOutLoader() {
        // Add the fade-out class to animate the disappearance
        loaderContainer.classList.add('fade-out');
        
        // After the animation completes, show the main content
        setTimeout(() => {
            mainContent.style.display = 'block';
            loaderContainer.style.display = 'none';
            
            // Trigger any initialization that might need to happen
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('resize'));
            }
        }, 500); // This should match the transition duration in CSS
    }
    
    // Set minimum loading time (in milliseconds)
    const minimumLoadingTime = 450; // 0.45 seconds
    
    // Start timer to show main content after minimum loading time
    setTimeout(fadeOutLoader, minimumLoadingTime);
    
    // If page loads before minimum time, still wait for the timer
    window.addEventListener('load', function() {
        // The window.load event handler stays empty as we're using the timer approach
    });
});