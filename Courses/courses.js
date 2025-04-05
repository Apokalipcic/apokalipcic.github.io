document.addEventListener('DOMContentLoaded', function () {
    // Initialize the certificate carousel
    initCertificateCarousel();

    // Initialize the certificate modal
    initCertificateModal();

    // Initialize the back to top button
    initBackToTop();

    // Initialize navigation highlighting
    initNavHighlighting();
});

// Initialize certificate carousel with autoplay
function initCertificateCarousel() {
    const carouselContainer = document.querySelector('.certificate-carousel');
    const track = document.querySelector('.certificate-track');
    const items = document.querySelectorAll('.certificate-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    // Exit if elements don't exist
    if (!track || !items.length) return;

    // If there's only one certificate, add class to hide controls
    if (items.length <= 1) {
        carouselContainer.classList.add('single-item');
        return; // No need to initialize carousel for single item
    }

    // Variables for tracking state
    let currentSlide = 0;
    let autoplayInterval;
    const autoplayDelay = 6000; // 6 seconds between slides

    // Create dots based on number of slides
    if (dotsContainer) {
        dotsContainer.innerHTML = '';

        for (let i = 0; i < items.length; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.slide = i;
            dotsContainer.appendChild(dot);

            // Add click event to dots
            dot.addEventListener('click', function () {
                goToSlide(parseInt(this.dataset.slide));
                resetAutoplay();
            });
        }
    }

    // Go to specified slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlidePosition();
        updateDots();
    }

    // Update the slide position
    function updateSlidePosition() {
        const slideWidth = items[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    }

    // Update active dot
    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % items.length;
        updateSlidePosition();
        updateDots();
    }

    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + items.length) % items.length;
        updateSlidePosition();
        updateDots();
    }

    // Start autoplay
    function startAutoplay() {
        stopAutoplay(); // Clear any existing interval
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }

    // Stop autoplay
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Reset autoplay (used when manually changing slides)
    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Add event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            prevSlide();
            resetAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            nextSlide();
            resetAutoplay();
        });
    }

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Handle window resize
    window.addEventListener('resize', function () {
        updateSlidePosition();
    });

    // Initialize positions and start autoplay
    updateSlidePosition();
    startAutoplay();
}
// Initialize back to top button
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');

    // Show button when user scrolls down
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize navigation highlighting
function initNavHighlighting() {
    const sections = document.querySelectorAll('.course-section');
    const navLinks = document.querySelectorAll('.course-nav-link');

    // Add active class to navigation based on scroll position
    function highlightNav() {
        let current = '';
        const scrollPosition = window.scrollY + 200; // Offset for better highlighting

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }

    // Highlight nav on scroll
    window.addEventListener('scroll', highlightNav);

    // Initial highlight check
    highlightNav();

    // Smooth scroll to sections when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // Adjust offset as needed

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}