// Scroll Progress Bar Functionality
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    
    if (!header) return;
    
    // Create progress bar elements
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    
    progressContainer.appendChild(progressBar);
    header.appendChild(progressContainer);
    
    // Update progress bar on scroll
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(updateScrollProgress);
            ticking = true;
            setTimeout(() => { ticking = false; }, 10);
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set progress on page load
    updateScrollProgress();
});