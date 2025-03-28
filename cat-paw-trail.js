// cat-paw-trail.js - Cat Paw Trail Animation
document.addEventListener('DOMContentLoaded', function() {
    // Create a container for our paw prints
    const pawContainer = document.createElement('div');
    pawContainer.id = 'paw-container';
    pawContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
        overflow: visible;
    `;
    document.body.appendChild(pawContainer);

    // Define custom paw SVG
    const pawSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" height="24px">
            <path d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z"/>
        </svg>
    `;

    // Variables for tracking mouse position and paw placement
    let lastX = 0;
    let lastY = 0;
    let isLeftPaw = true; // Toggle between left and right paws
    let lastPlacementDistance = 0;
    const PLACEMENT_DISTANCE = 60; // Distance between paw prints in pixels
    let lastPlacementTime = 0;
    const MIN_PLACEMENT_INTERVAL = 100; // Minimum time between placements in ms
    
    // Add scroll position tracking
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    let scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Handle mouse movement
    document.addEventListener('mousemove', function(e) {
        const currentTime = Date.now();
        
        // Get current scroll position
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        const currentScrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        // Calculate cursor position in the page (not just viewport)
        const currentX = e.clientX + currentScrollLeft;
        const currentY = e.clientY + currentScrollTop;
        
        // Calculate distance from last paw placement
        const distanceMoved = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
        
        // Add to the cumulative distance
        lastPlacementDistance += distanceMoved;
        
        // Only place a paw if we've moved enough distance AND enough time has passed
        if (lastPlacementDistance >= PLACEMENT_DISTANCE && currentTime - lastPlacementTime > MIN_PLACEMENT_INTERVAL) {
            // Calculate direction vector for natural paw direction
            const dirX = currentX - lastX;
            const dirY = currentY - lastY;
            const angle = Math.atan2(dirY, dirX) * 180 / Math.PI;
            
            // Create paw at current position
            createPawPrint(currentX, currentY, isLeftPaw, angle);
            
            // Toggle paw side for alternating left-right pattern
            isLeftPaw = !isLeftPaw;
            
            // Reset placement tracking
            lastPlacementDistance = 0;
            lastPlacementTime = currentTime;
        }
        
        // Update position tracking
        lastX = currentX;
        lastY = currentY;
        scrollTop = currentScrollTop;
        scrollLeft = currentScrollLeft;
    });
    
    // Handle scrolling as cursor movement
    window.addEventListener('scroll', function() {
        const currentTime = Date.now();
        
        // Get current scroll position
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        const currentScrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        // Calculate how much we scrolled
        const scrollDeltaX = currentScrollLeft - scrollLeft;
        const scrollDeltaY = currentScrollTop - scrollTop;
        
        // Only proceed if we actually scrolled
        if (scrollDeltaX === 0 && scrollDeltaY === 0) return;
        
        // Use last known mouse position + current scroll position
        const currentX = lastX + scrollDeltaX;
        const currentY = lastY + scrollDeltaY;
        
        // Calculate distance from last paw placement
        const distanceMoved = Math.sqrt(Math.pow(scrollDeltaX, 2) + Math.pow(scrollDeltaY, 2));
        
        // Add to the cumulative distance
        lastPlacementDistance += distanceMoved;
        
        // Only place a paw if we've moved enough distance AND enough time has passed
        if (lastPlacementDistance >= PLACEMENT_DISTANCE && currentTime - lastPlacementTime > MIN_PLACEMENT_INTERVAL) {
            // Calculate direction from scroll
            const angle = Math.atan2(scrollDeltaY, scrollDeltaX) * 180 / Math.PI;
            
            // Create paw at current calculated position
            createPawPrint(currentX, currentY, isLeftPaw, angle);
            
            // Toggle paw side for alternating left-right pattern
            isLeftPaw = !isLeftPaw;
            
            // Reset placement tracking
            lastPlacementDistance = 0;
            lastPlacementTime = currentTime;
        }
        
        // Update position tracking
        lastX = currentX;
        lastY = currentY;
        scrollTop = currentScrollTop;
        scrollLeft = currentScrollLeft;
    });

    // Create a paw print at the specified position
    function createPawPrint(x, y, isLeft, directionAngle) {
        const paw = document.createElement('div');
        
        // Randomly choose a color variant
        const variant = Math.floor(Math.random() * 4) + 1;
        
        // Set classes for styling
        paw.className = `paw-print ${isLeft ? 'left' : 'right'} variant-${variant}`;
        
        // Insert the SVG
        paw.innerHTML = pawSVG;
        
        // Position the paw - use absolute positioning relative to the document
        // Subtract current scroll to properly position in viewport
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        const currentScrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        paw.style.position = 'absolute'; // Changed from absolute to fixed
        paw.style.left = `${x - 15}px`;
        paw.style.top = `${y - 15}px`;
        
        // Adjust for SVG's natural orientation (90 degree offset)
        const baseAngle = 90;
        
        // Calculate proper rotation: base angle + direction + left/right tilt
        const tiltAngle = isLeft ? -10 : 10;  // Left or right paw tilt
        const finalAngle = baseAngle + directionAngle + tiltAngle;
        paw.style.transform = `rotate(${finalAngle}deg)`;
        
        // Slightly adjust size for variety
        const sizeVariation = 0.8 + Math.random() * 0.3; // 80% to 110% of original size
        paw.style.transform += ` scale(${sizeVariation})`;
        
        // Add paw to container
        pawContainer.appendChild(paw);
        
        // Start fade out after a short delay
        setTimeout(() => {
            paw.classList.add('fade-out');
        }, 500);
        
        // Remove paw after animation completes
        setTimeout(() => {
            if (pawContainer.contains(paw)) {
                pawContainer.removeChild(paw);
            }
        }, 2500);
    }
});