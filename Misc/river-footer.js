// river-footer.js - Script for the animated river footer

// Initialize the river footer animation
function initRiverFooter() {
    // Check if Lottie library is loaded
    if (typeof lottie === 'undefined') {
        console.error('Lottie library not found. Please include the Lottie library.');
        return;
    }

    // Load the river animation using Lottie
    const riverAnimation = lottie.loadAnimation({
        container: document.getElementById('river-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'Misc/footer_River.json' // Path to your Lottie JSON file
    });
    
    // Boat animation
    const boatContainer = document.getElementById('boat-container');
    const boatVideo = document.getElementById('boat-video');
    let boatPosition = -150; // Starting off-screen
    let isReturning = false;
    let animationFrameId;
    let containerWidth = window.innerWidth;
    
    // Update container width on resize for responsive design
    function updateContainerWidth() {
        containerWidth = window.innerWidth;
    }
    
    window.addEventListener('resize', updateContainerWidth);
    
    // Animation loop for the boat
    function animateBoat() {
        // If boat reaches the end of the screen
        if (boatPosition > containerWidth + 50 && !isReturning) {
            isReturning = true;
            boatContainer.style.opacity = '0'; // Fade out
        }
        
        // When boat is returning (invisible) and has moved far enough
        if (isReturning && boatPosition > containerWidth + 200) {
            isReturning = false;
            boatPosition = -150; // Reset position
        }
        
        // When boat is coming back into view
        if (boatPosition === -150 && !isReturning) {
            boatContainer.style.opacity = '1'; // Make visible again
        }
        
        // Move boat
        boatPosition += 0.8;
        boatContainer.style.left = boatPosition + 'px';
        
        // Continue animation
        animationFrameId = requestAnimationFrame(animateBoat);
    }
    
    // Make sure the video is loaded before starting animation
    if (boatVideo.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        // Video is already loaded enough to play
        animationFrameId = requestAnimationFrame(animateBoat);
    } else {
        // Wait for the video to load
        boatVideo.addEventListener('loadeddata', function() {
            // Start animation
            animationFrameId = requestAnimationFrame(animateBoat);
        });
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        cancelAnimationFrame(animationFrameId);
    });
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initRiverFooter);
