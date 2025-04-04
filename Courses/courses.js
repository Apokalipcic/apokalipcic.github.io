// courses.js - JavaScript functionality for the courses page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation highlighting (same as main page)
    initNavHighlight();
    
    // Initialize certificate modal functionality
    initCertificateModal();
    
    // Initialize progress circles for current courses
    initProgressCircles();
    
    // Initialize animations
    initAnimations();
});

// Handle navigation highlighting
function initNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add active class to navigation based on current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '#' && window.location.pathname.includes('courses')) {
            link.classList.add('active');
        }
    });
    
    // Mobile menu toggle (same as main page)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('#navbar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navbar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close menu when clicking a link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        });
    });
}

// Certificate modal functionality
function initCertificateModal() {
    const certificateContainers = document.querySelectorAll('.course-certificate');
    const certificateButtons = document.querySelectorAll('.view-certificate-btn');
    const certificateModal = document.getElementById('certificate-modal');
    const certificateImage = document.getElementById('certificate-image');
    const closeButton = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const downloadButton = document.querySelector('.download-certificate');
    
    // Function to open the certificate modal
    function openCertificateModal(certificatePath) {
        // Set the certificate image source
        certificateImage.src = `Images/About Me/Courses/${certificatePath}`;
        
        // Update download button href
        downloadButton.href = `Images/About Me/Courses/${certificatePath}`;
        
        // Show the modal
        certificateModal.classList.add('active');
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close the certificate modal
    function closeCertificateModal() {
        certificateModal.classList.remove('active');
        
        // Re-enable body scrolling
        document.body.style.overflow = '';
        
        // Clear the image source after animation completes
        setTimeout(() => {
            certificateImage.src = '';
        }, 300);
    }
    
    // Add click event to certificate containers
    certificateContainers.forEach(container => {
        container.addEventListener('click', function() {
            const certificateImg = this.querySelector('img');
            const certificatePath = certificateImg.getAttribute('src').split('/').pop();
            openCertificateModal(certificatePath);
        });
    });
    
    // Add click event to view certificate buttons
    certificateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const certificatePath = this.getAttribute('data-certificate');
            openCertificateModal(certificatePath);
        });
    });
    
    // Close modal when clicking the close button
    if (closeButton) {
        closeButton.addEventListener('click', closeCertificateModal);
    }
    
    // Close modal when clicking the overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCertificateModal);
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certificateModal.classList.contains('active')) {
            closeCertificateModal();
        }
    });
}

// Initialize progress circles for current courses
function initProgressCircles() {
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    progressCircles.forEach(circle => {
        const progress = circle.getAttribute('data-progress');
        circle.style.setProperty('--progress', progress + '%');
    });
}

// Initialize animations for page elements
function initAnimations() {
    // Add animation classes with delays to elements
    const addAnimationWithDelay = (selector, animationClass, baseDelay = 0) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            const delay = baseDelay + (index * 0.1); // 0.1s delay between each element
            element.style.animationDelay = `${delay}s`;
            element.classList.add(animationClass);
        });
    };
    
    // Add animations to various elements
    addAnimationWithDelay('.stat-card', 'fade-in', 0.2);
    addAnimationWithDelay('.featured-course', 'slide-up', 0.3);
    addAnimationWithDelay('.course-card', 'fade-in', 0.4);
    addAnimationWithDelay('.current-course', 'slide-up', 0.4);
    addAnimationWithDelay('.goal-card', 'fade-in', 0.5);
    
    // Add intersection observer for scroll-triggered animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Elements to observe
        const elementsToObserve = document.querySelectorAll('.section-header, .featured-course, .course-card, .current-course, .goal-card');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }
}
