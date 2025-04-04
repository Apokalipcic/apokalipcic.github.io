    <script>
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

        // Initialize certificate carousel (using your existing carousel logic)
        function initCertificateCarousel() {
            // This function should initialize the carousel for certificates
            // It will use your existing carousel logic from script.js

            // Example of how to call your existing carousel initialization
            if (typeof initializeScreenshotCarousel === 'function') {
                // Call your existing carousel initialization function
                initializeScreenshotCarousel();
            } else {
                console.warn('Carousel initialization function not found in the main script');

                // Fallback simple carousel initialization
                const track = document.querySelector('.certificate-track');
                const items = document.querySelectorAll('.certificate-item');
                const prevBtn = document.querySelector('.prev-btn');
                const nextBtn = document.querySelector('.next-btn');
                const dotsContainer = document.querySelector('.carousel-dots');

                if (!track || items.length === 0) return;

                // Create dots based on the number of certificates
                if (dotsContainer) {
                    dotsContainer.innerHTML = '';

                    for (let i = 0; i < items.length; i++) {
                        const dot = document.createElement('span');
                        dot.classList.add('dot');
                        if (i === 0) dot.classList.add('active');
                        dot.dataset.slide = i;
                        dotsContainer.appendChild(dot);

                        dot.addEventListener('click', function () {
                            goToSlide(parseInt(this.dataset.slide));
                        });
                    }
                }

                let currentSlide = 0;

                // Go to specified slide
                function goToSlide(slideIndex) {
                    currentSlide = slideIndex;
                    const itemWidth = items[0].getBoundingClientRect().width;
                    const offset = -currentSlide * itemWidth;
                    track.style.transform = `translateX(${offset}px)`;

                    // Update active dot
                    const dots = document.querySelectorAll('.dot');
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentSlide);
                    });
                }

                // Next slide
                function nextSlide() {
                    if (currentSlide >= items.length - 1) {
                        goToSlide(0);
                    } else {
                        goToSlide(currentSlide + 1);
                    }
                }

                // Previous slide
                function prevSlide() {
                    if (currentSlide <= 0) {
                        goToSlide(items.length - 1);
                    } else {
                        goToSlide(currentSlide - 1);
                    }
                }

                // Add event listeners for carousel
                if (nextBtn) {
                    nextBtn.addEventListener('click', nextSlide);
                }

                if (prevBtn) {
                    prevBtn.addEventListener('click', prevSlide);
                }
            }
        }

        // Initialize certificate modal
        function initCertificateModal() {
            const certificatePreviews = document.querySelectorAll('.certificate-preview');
            const modal = document.getElementById('certificateModal');
            const modalImage = document.getElementById('modalImage');
            const closeButton = document.getElementById('closeModal');
            const downloadButton = document.getElementById('downloadCertificate');

            // Open modal when clicking on a certificate
            certificatePreviews.forEach(preview => {
                preview.addEventListener('click', function () {
                    const certificatePath = this.getAttribute('data-certificate');
                    const imgSrc = this.querySelector('img').src;

                    // Set modal image source
                    modalImage.src = imgSrc;

                    // Update download link
                    downloadButton.href = imgSrc;
                    downloadButton.download = certificatePath;

                    // Show modal
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                });
            });

            // Close modal when clicking the close button
            if (closeButton) {
                closeButton.addEventListener('click', function () {
                    closeModal();
                });
            }

            // Close modal when clicking outside the image
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });

            // Function to close the modal
            function closeModal() {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable scrolling
            }
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
    </script>