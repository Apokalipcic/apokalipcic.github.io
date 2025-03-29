// deal-with-it.js - Script for the "Deal With It" sunglasses animation

// ==========================================
// CUSTOMIZATION VARIABLES
// Change these to adjust the behavior
// ==========================================
const GLASSES_CONFIG = {
    // Path to the glasses image
    imagePath: 'Images/Elements/Glasses/dealWithIt.png',
    
    // Sections where glasses should be visible (by section ID)
    visibleInSections: ['hero', 'about'],
    
    // Where the glasses should land (section ID)
    landingSection: 'about',
    
    // How far down the landing section before glasses land (0-1)
    landingTriggerPoint: 0.6,
    
    // Position adjustment on the face (may need fine-tuning)
    facePositionY: 0.19,  // Percentage down from top of profile picture (0-1)
    facePositionX: 0.45,   // Percentage across from left of profile picture (0-1)
    
    // Selectors for finding elements (change if your HTML structure differs)
    profileContainerSelector: '.img-container',
    
    // Delay before showing glasses initially (milliseconds)
    initialShowDelay: 1000,
    
    // Delay before showing glasses at final position (milliseconds)
    finalShowDelay: 200
};

document.addEventListener('DOMContentLoaded', function() {
    // Create sunglasses element if it doesn't exist
    if (!document.getElementById('deal-with-it-glasses')) {
        const glasses = document.createElement('img');
        glasses.id = 'deal-with-it-glasses';
        glasses.className = 'deal-with-it-glasses';
        glasses.src = GLASSES_CONFIG.imagePath;
        glasses.alt = 'Deal With It Glasses';
        document.body.appendChild(glasses);
    }

    const sunglasses = document.getElementById('deal-with-it-glasses');
    const landingSection = document.getElementById(GLASSES_CONFIG.landingSection);
    
    // Find profile container inside the landing section
    const profileContainer = landingSection ? 
        landingSection.querySelector(GLASSES_CONFIG.profileContainerSelector) : null;
    
    // Get all elements for sections where glasses should be visible
    const visibleSections = GLASSES_CONFIG.visibleInSections.map(id => document.getElementById(id));
    
    // Function to check if an element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        );
    }
    
    // Function to handle glasses visibility and position
    function handleGlassesPosition() {
        // Hide glasses by default
        sunglasses.style.opacity = '0';
        sunglasses.classList.remove('final-position');
        
        // Check if any visible section is in viewport
        let isVisible = false;
        
        for (const section of visibleSections) {
            if (section && isElementInViewport(section)) {
                isVisible = true;
                
                // Special handling for landing section
                if (section.id === GLASSES_CONFIG.landingSection && profileContainer) {
                    const sectionRect = section.getBoundingClientRect();
                    const profileRect = profileContainer.getBoundingClientRect();
                    
                    // Calculate how far the section is scrolled into view (0-1)
                    const visibilityRatio = 1 - Math.max(0, Math.min(1, sectionRect.top / window.innerHeight));
                    
                    // If section is scrolled past the trigger point, position glasses on profile picture
                    if (visibilityRatio > GLASSES_CONFIG.landingTriggerPoint) {
                        sunglasses.classList.add('final-position');
                        
                        // Position the glasses precisely over the profile picture
                        const verticalOffset = profileRect.height * GLASSES_CONFIG.facePositionY;
                        const horizontalOffset = profileRect.width * GLASSES_CONFIG.facePositionX;
                        
                        sunglasses.style.top = (profileRect.top + window.scrollY + verticalOffset) + 'px';
                        sunglasses.style.left = (profileRect.left + horizontalOffset - (sunglasses.offsetWidth/2)) + 'px';
                        
                        // Show the glasses with a slight delay for dramatic effect
                        setTimeout(() => {
                            sunglasses.style.opacity = '1';
                        }, GLASSES_CONFIG.finalShowDelay);
                    } else {
                        // Reset to fixed position if not yet at landing point
                        sunglasses.style.removeProperty('top');
                        sunglasses.style.removeProperty('left');
                        sunglasses.style.opacity = '1';
                    }
                } else {
                    // Just make glasses visible in normal position for this section
                    sunglasses.style.removeProperty('top');
                    sunglasses.style.removeProperty('left');
                    sunglasses.style.opacity = '1';
                }
                
                // We found a visible section, no need to check others
                break;
            }
        }
        
        // If no visible sections are in viewport, make sure glasses are hidden
        if (!isVisible) {
            sunglasses.style.opacity = '0';
        }
    }
    
    // Show glasses with delay after page load
    setTimeout(() => {
        handleGlassesPosition();
    }, GLASSES_CONFIG.initialShowDelay);
    
    // Listen for scroll events
    window.addEventListener('scroll', handleGlassesPosition);
    
    // Update on resize
    window.addEventListener('resize', handleGlassesPosition);
});