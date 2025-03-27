// Navigation highlight on scroll
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Add active class to navigation based on scroll position
    function highlightNav() {
        let current = '';
        const scrollPosition = window.scrollY + 100;

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

    window.addEventListener('scroll', highlightNav);
    highlightNav(); // Initial check

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('#navbar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            navbar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close menu when clicking a link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navbar.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        });
    });

    // Portfolio carousel
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (carouselTrack && carouselItems.length > 0) {
        // Create dots based on number of slides
        function createDots() {
            const windowWidth = window.innerWidth;

            // Determine how many items per view based on screen size
            let itemsPerView;
            if (windowWidth < 768) {
                itemsPerView = 1;
            } else if (windowWidth < 992) {
                itemsPerView = 2;
            } else {
                itemsPerView = 2; // Show maximum of 2 items even on large screens
            }

            const slideCount = Math.ceil(carouselItems.length / itemsPerView);

            // Clear existing dots
            if (dotsContainer) {
                dotsContainer.innerHTML = '';

                // Create new dots
                for (let i = 0; i < slideCount; i++) {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    if (i === 0) {
                        dot.classList.add('active');
                    }
                    dot.dataset.slide = i;
                    dotsContainer.appendChild(dot);

                    // Add click event to dots
                    dot.addEventListener('click', function () {
                        goToSlide(parseInt(this.dataset.slide));
                    });
                }
            }

            return {
                itemsPerView,
                slideCount
            };
        }

        // Calculate carousel properties
        let carouselProps = createDots();
        let currentSlide = 0;

        // Go to specified slide
        function goToSlide(slideIndex) {
            const itemWidth = carouselItems[0].getBoundingClientRect().width;
            const gapWidth = 32; // 2rem gap

            currentSlide = slideIndex;
            const offset = -1 * currentSlide * carouselProps.itemsPerView * (itemWidth + gapWidth);
            carouselTrack.style.transform = `translateX(${offset}px)`;

            // Update active dot
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Handle video playback
            handleVisibleVideos();
        }

        // Next slide
        function nextSlide() {
            if (currentSlide >= carouselProps.slideCount - 1) {
                goToSlide(0);
            } else {
                goToSlide(currentSlide + 1);
            }
        }

        // Previous slide
        function prevSlide() {
            if (currentSlide <= 0) {
                goToSlide(carouselProps.slideCount - 1);
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

        // Recalculate on window resize
        window.addEventListener('resize', function () {
            carouselProps = createDots();
            goToSlide(0);
        });

        // Convert portfolio-card to use direct links
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach(card => {
            // Skip if card already has a direct link
            if (card.querySelector('.card-link')) return;

            const content = card.innerHTML;
            const projectId = card.getAttribute('data-project');

            // Create a wrapper link
            const link = document.createElement('a');
            link.href = "#"; // Default link that will be updated
            link.className = "card-link";
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');

            // Set link based on project ID
            switch (projectId) {
                case 'project1':
                    link.href = "https://www.google.com/search?q=puzzle+games";
                    break;
                case 'project2':
                    link.href = "https://www.google.com/search?q=space+run+game";
                    break;
                case 'project3':
                    link.href = "https://www.google.com/search?q=ghost+run+game";
                    break;
                case 'project4':
                    link.href = "https://www.google.com/search?q=dragon+quest+game";
                    break;
                case 'project5':
                    link.href = "https://www.google.com/search?q=speed+racer+game";
                    break;
                case 'project6':
                    link.href = "https://www.google.com/search?q=chess+master+game";
                    break;
                default:
                    link.href = "#portfolio";
                    break;
            }

            // Move content into the link
            link.innerHTML = content;

            // Replace card content with the link
            card.innerHTML = '';
            card.appendChild(link);

            // Prevent video clicks from navigating
            const videoContainers = card.querySelectorAll('.video-container');
            videoContainers.forEach(container => {
                container.addEventListener('click', function (e) {
                    if (e.target.closest('iframe') || e.target.closest('.play-button')) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });
        });

        // Function to handle video containers
        function handleVideoContainers() {
            const videoContainers = document.querySelectorAll('.video-container[data-video-id]');

            // Function to check if an element is visible in view
            function isInViewport(element) {
                const rect = element.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            }

            // Function to replace thumbnails with iframes for visible videos
            function handleVisibleVideos() {
                videoContainers.forEach(container => {
                    const videoId = container.getAttribute('data-video-id');
                    const existingIframe = container.querySelector('iframe');
                    const thumbnail = container.querySelector('.video-thumbnail');

                    if (isInViewport(container)) {
                        // If visible and doesn't have iframe, replace thumbnail with iframe
                        if (!existingIframe && thumbnail) {
                            // Create iframe element
                            const iframe = document.createElement('iframe');
                            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                            iframe.title = "YouTube video player";
                            iframe.frameBorder = "0";
                            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                            iframe.allowFullscreen = true;
                            iframe.className = "youtube-video";

                            // Hide thumbnail but don't remove it
                            thumbnail.style.display = 'none';
                            container.appendChild(iframe);
                        }
                    } else {
                        // If not visible and has iframe, remove iframe and show thumbnail
                        if (existingIframe && thumbnail) {
                            existingIframe.remove();
                            thumbnail.style.display = 'block';
                        }
                    }
                });
            }

            // Check initial visibility
            setTimeout(handleVisibleVideos, 1000);

            // Check on scroll
            window.addEventListener('scroll', handleVisibleVideos);

            return handleVisibleVideos;
        }

        // Initialize video handling and get the function
        const handleVisibleVideos = handleVideoContainers();

        // Add animation to skills bars
        const skillLevels = document.querySelectorAll('.skill-level');
        function animateSkills() {
            skillLevels.forEach(skill => {
                const targetWidth = skill.style.width;
                skill.style.width = '0%';

                setTimeout(() => {
                    skill.style.width = targetWidth;
                }, 100);
            });
        }

        // Use Intersection Observer to trigger skill animation when in view
        if ('IntersectionObserver' in window) {
            const skillsSection = document.querySelector('.skills');

            if (skillsSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateSkills();
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(skillsSection);
            }
        } else {
            // Fallback for browsers that don't support Intersection Observer
            setTimeout(animateSkills, 1000);
        }
    }
});