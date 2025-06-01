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

    // Function to populate store badges from template
    function populateStoreBadges() {
        // Get the template
        const template = document.getElementById('store-badge-template');

        // Exit if template doesn't exist
        if (!template) return;

        // Find all footers that need the template
        const footers = document.querySelectorAll('.portfolio-card-footer[data-use-template="store-badge-template"]');

        // For each footer, clone the template content and append it
        footers.forEach(footer => {
            // Clone the template content
            const clone = template.content.cloneNode(true);

            // Get the project ID from the parent portfolio card
            const projectId = footer.closest('.portfolio-card').getAttribute('data-project');

            // Get the store link from the clone
            const storeLink = clone.querySelector('.store-link');

            // Set the appropriate URL based on project ID
            if (storeLink && projectId) {
                let gameUrl = "#";
                switch (projectId) {
                    case 'project1':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.BalloonBurst";
                        break;
                    case 'project2':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.Tornado.io";
                        break;
                    case 'project3':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.ColorDash_Project";
                        break;
                    case 'project4':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.BoatMaster";
                        break;
                    case 'project5':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.AutoTD";
                        break;
                    case 'project6':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.ColorBlitz";
                        break;
                    case 'project7':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.ConnectRitz";
                        break;
                    case 'project8':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.BurgerMania";
                        break;
                    case 'project9':
                        gameUrl = "https://play.google.com/store/apps/details?id=com.Prudentibus.JustTanky";
                        break;
                    default:
                        gameUrl = "#portfolio";
                        break;
                }

                // Update the link href
                storeLink.href = gameUrl;
            }

            // Append the clone to the footer
            footer.appendChild(clone);
        });
    }

    // Call the function to populate badges
    populateStoreBadges();

    // *** PORTFOLIO CAROUSEL - MOBILE GAMES SECTION ***
    function initializePortfolioCarousel() {
        const carouselTrack = document.querySelector('#Mobile-Games .carousel-track');
        const carouselItems = document.querySelectorAll('#Mobile-Games .carousel-item');
        const prevBtn = document.querySelector('#Mobile-Games .prev-btn');
        const nextBtn = document.querySelector('#Mobile-Games .next-btn');
        const dotsContainer = document.querySelector('#Mobile-Games .carousel-dots');

        if (!carouselTrack || carouselItems.length === 0) return;

        // Create dots based on number of slides
        function createDots() {
            const windowWidth = window.innerWidth;

            // Determine how many items per view based on screen size
            let itemsPerView;
            if (windowWidth < 768) {
                itemsPerView = 1;
            } else if (windowWidth < 992) {
                itemsPerView = 2; // Changed from 3 to 2 for medium screens
            } else {
                itemsPerView = 3; // Show maximum of 3 items even on large screens
            }

            // Calculate total number of slides needed
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
            const dots = document.querySelectorAll('#Mobile-Games .dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Update game info boxes visibility
            updateGameInfoBoxVisibility();
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

        // Prevent video clicks from navigating
        const videoContainers = document.querySelectorAll('#Mobile-Games .video-container');
        videoContainers.forEach(container => {
            container.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });

        // Function to handle video containers
        function initializeVideoContainers() {
            const videoContainers = document.querySelectorAll('#Mobile-Games .video-container[data-video-id]');

            // Function to load all videos automatically
            function loadAllVideos() {
                videoContainers.forEach(container => {
                    const videoId = container.getAttribute('data-video-id');
                    const existingIframe = container.querySelector('iframe');
                    const thumbnail = container.querySelector('.video-thumbnail');

                    // Only create iframe if it doesn't exist yet
                    if (!existingIframe && thumbnail) {
                        // Create iframe element
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                        iframe.title = "YouTube video player";
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;
                        iframe.className = "youtube-video";

                        // Hide thumbnail
                        thumbnail.style.display = 'none';

                        // Add iframe to container
                        container.appendChild(iframe);
                    }
                });
            }

            // Load videos with slight delay to ensure DOM is ready
            setTimeout(loadAllVideos, 1000);
        }

        // Initialize video containers
        initializeVideoContainers();

        // Game Info Box functionality
        // Function to update game info box visibility based on carousel position
        function updateGameInfoBoxVisibility() {
            const carouselItems = document.querySelectorAll('#Mobile-Games .carousel-item');
            const windowWidth = window.innerWidth;

            // Determine how many items per view based on screen size
            let itemsPerView;
            if (windowWidth < 768) {
                itemsPerView = 1;
            } else if (windowWidth < 992) {
                itemsPerView = 2;
            } else {
                itemsPerView = 3;
            }

            // Calculate start and end indices for visible items
            const startIndex = currentSlide * itemsPerView;
            const endIndex = Math.min(startIndex + itemsPerView, carouselItems.length);

            // Hide all game info boxes first
            carouselItems.forEach(item => {
                const gameInfoBox = item.querySelector('.game-info-box');
                if (gameInfoBox) {
                    gameInfoBox.style.opacity = '0';
                    gameInfoBox.style.transform = 'translateY(20px)';
                    gameInfoBox.style.pointerEvents = 'none';
                }
            });

            // Show only the game info boxes for visible slides with stagger effect
            for (let i = startIndex; i < endIndex; i++) {
                if (i < carouselItems.length) {
                    const gameInfoBox = carouselItems[i].querySelector('.game-info-box');
                    if (gameInfoBox) {
                        setTimeout(() => {
                            gameInfoBox.style.opacity = '1';
                            gameInfoBox.style.transform = 'translateY(0)';
                            gameInfoBox.style.pointerEvents = 'auto';
                        }, (i - startIndex) * 100); // Stagger animation
                    }
                }
            }
        }

        // Initialize game info boxes with transitions
        function initGameInfoBoxes() {
            const gameInfoBoxes = document.querySelectorAll('#Mobile-Games .game-info-box');

            gameInfoBoxes.forEach(box => {
                box.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                box.style.opacity = '0';
                box.style.transform = 'translateY(20px)';
                box.style.pointerEvents = 'none';
            });

            // Initial update to show the correct boxes
            setTimeout(updateGameInfoBoxVisibility, 300);
        }

        // Initialize game info boxes
        initGameInfoBoxes();
    }

    // Function to handle the Game Jam Navigation
    function initializeGameJamNavigation() {
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.game-jam-nav-btn');

        // Get all game jam projects
        const gameJamProjects = document.querySelectorAll('.game-jam-project');

        // Exit if elements don't exist
        if (!navButtons.length || !gameJamProjects.length) return;

        // Add click event to each navigation button
        navButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Get the target project id from data attribute
                const targetProjectId = this.getAttribute('data-project');

                // Skip if clicking already active button
                if (this.classList.contains('active')) return;

                // Update button active states
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Show/hide projects based on selection
                gameJamProjects.forEach(project => {
                    if (project.id === targetProjectId) {
                        // Show the selected project
                        project.style.display = 'block';

                        // Add class to help with targeting the active project
                        project.classList.add('active');

                        // Wait a tiny bit for the DOM to update
                        setTimeout(() => {
                            // Re-initialize the screenshot carousel for this project
                            initializeScreenshotCarousel();
                        }, 100);
                    } else {
                        // Hide other projects
                        project.style.display = 'none';
                        project.classList.remove('active');
                    }
                });
            });
        });

        // Mark the first project as active (it's visible by default)
        if (gameJamProjects.length > 0) {
            gameJamProjects[0].classList.add('active');
        }
    }


    // Initialize Game Jam Videos
    function initializeGameJamVideos() {
        const gameJamVideoContainers = document.querySelectorAll('.game-jam-video-container .video-container[data-video-id]');

        gameJamVideoContainers.forEach(container => {
            const videoId = container.getAttribute('data-video-id');
            const thumbnail = container.querySelector('.video-thumbnail');

            if (thumbnail) {
                thumbnail.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Create iframe element
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                    iframe.title = "YouTube video player";
                    iframe.frameBorder = "0";
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;
                    iframe.className = "youtube-video";

                    // Hide thumbnail
                    thumbnail.style.display = 'none';

                    // Add iframe to container
                    container.appendChild(iframe);
                });
            }
        });
    }

    // *** SCREENSHOTS CAROUSEL - GAME JAM SECTION ***
    function initializeScreenshotCarousel() {
        // Find the active game-jam-project
        const activeGameJamProject = document.querySelector('.game-jam-project[style*="display: block"], .game-jam-project.active');

        // If no project is active, exit
        if (!activeGameJamProject) return;

        // Get carousel elements from active project
        const screenshotTrack = activeGameJamProject.querySelector('.screenshots-carousel .screenshot-track');
        const screenshotItems = activeGameJamProject.querySelectorAll('.screenshots-carousel .screenshot-item');
        const screenshotPrevBtn = activeGameJamProject.querySelector('.screenshots-carousel .prev-btn');
        const screenshotNextBtn = activeGameJamProject.querySelector('.screenshots-carousel .next-btn');
        const screenshotDotsContainer = activeGameJamProject.querySelector('.screenshots-carousel .carousel-dots');

        // Exit if carousel elements don't exist
        if (!screenshotTrack || screenshotItems.length === 0) return;

        let autoplayInterval;
        const autoplayDelay = 5000; // 5 seconds between slides

        // Create dots based on number of slides
        function createScreenshotDots() {
            // Always show 1 screenshot at a time
            const itemsPerView = 1;
            const slideCount = Math.ceil(screenshotItems.length / itemsPerView);

            // Clear existing dots
            if (screenshotDotsContainer) {
                screenshotDotsContainer.innerHTML = '';

                // Create new dots
                for (let i = 0; i < slideCount; i++) {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    if (i === 0) {
                        dot.classList.add('active');
                    }
                    dot.dataset.slide = i;
                    screenshotDotsContainer.appendChild(dot);

                    // Add click event to dots
                    dot.addEventListener('click', function () {
                        goToSlide(parseInt(this.dataset.slide));
                        resetAutoplay();
                    });
                }
            }

            return {
                itemsPerView,
                slideCount
            };
        }

        // Calculate carousel properties
        let screenshotCarouselProps = createScreenshotDots();
        let currentScreenshotSlide = 0;

        // Go to specified slide
        function goToSlide(slideIndex) {
            const itemWidth = screenshotItems[0].getBoundingClientRect().width;
            const gapWidth = 32; // 2rem gap

            currentScreenshotSlide = slideIndex;
            const offset = -1 * currentScreenshotSlide * screenshotCarouselProps.itemsPerView * (itemWidth + gapWidth);
            screenshotTrack.style.transform = `translateX(${offset}px)`;
            screenshotTrack.style.transition = 'transform 0.5s ease-in-out';

            // Update active dot
            const dots = screenshotDotsContainer ? screenshotDotsContainer.querySelectorAll('.dot') : [];
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentScreenshotSlide);
            });
        }

        // Next slide
        function nextSlide() {
            if (currentScreenshotSlide >= screenshotCarouselProps.slideCount - 1) {
                goToSlide(0);
            } else {
                goToSlide(currentScreenshotSlide + 1);
            }
        }

        // Previous slide
        function prevSlide() {
            if (currentScreenshotSlide <= 0) {
                goToSlide(screenshotCarouselProps.slideCount - 1);
            } else {
                goToSlide(currentScreenshotSlide - 1);
            }
        }

        // Start autoplay
        function startAutoplay() {
            stopAutoplay(); // Clear any existing interval first
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        // Stop autoplay
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        }

        // Reset autoplay - used when manually changing slides
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Add event listeners for carousel
        if (screenshotNextBtn) {
            screenshotNextBtn.addEventListener('click', function () {
                nextSlide();
                resetAutoplay();
            });
        }

        if (screenshotPrevBtn) {
            screenshotPrevBtn.addEventListener('click', function () {
                prevSlide();
                resetAutoplay();
            });
        }

        // Pause autoplay on hover
        if (screenshotTrack) {
            screenshotTrack.addEventListener('mouseenter', stopAutoplay);
            screenshotTrack.addEventListener('mouseleave', startAutoplay);
        }

        // Recalculate on window resize
        window.addEventListener('resize', function () {
            // Exit if elements are no longer in the DOM (e.g., if another game jam is now active)
            if (!screenshotTrack || !screenshotItems.length) return;

            screenshotCarouselProps = createScreenshotDots();
            goToSlide(0);
            resetAutoplay();
        });

        // Start autoplay
        startAutoplay();
    }

    // Animation for skill bars in the About section
    function initializeSkillBars() {
        const skillLevels = document.querySelectorAll('.skill-bar');

        // Function to check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        // Function to animate skill bars
        function animateSkills() {
            skillLevels.forEach(skill => {
                if (isInViewport(skill)) {
                    const targetWidth = skill.style.width;
                    skill.style.width = '0%';

                    setTimeout(() => {
                        skill.style.width = targetWidth;
                    }, 200);
                }
            });
        }

        // Use Intersection Observer if supported
        if ('IntersectionObserver' in window) {
            const skillsSection = document.querySelector('.skills-container');

            if (skillsSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateSkills();
                            // Disconnect after animation to prevent re-triggering
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.2 });

                // Observe both skill sections
                document.querySelectorAll('.skills-container').forEach(section => {
                    observer.observe(section);
                });
            }
        } else {
            // Fallback for browsers that don't support Intersection Observer
            window.addEventListener('scroll', function () {
                animateSkills();
            });

            // Initial animation
            setTimeout(animateSkills, 500);
        }
    }

    // Initialize all components
    initializePortfolioCarousel();
    initializeGameJamVideos();
    initializeScreenshotCarousel();
    initializeSkillBars();
    initializeGameJamNavigation();
});