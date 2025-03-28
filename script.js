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
                        gameUrl = "https://www.google.com/search?q=dragon+quest+game";
                        break;
                    case 'project5':
                        gameUrl = "https://www.google.com/search?q=speed+racer+game";
                        break;
                    case 'project6':
                        gameUrl = "https://www.google.com/search?q=chess+master+game";
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
                itemsPerView = 3;
            } else {
                itemsPerView = 3; // Show maximum of 3 items even on large screens
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
        const videoContainers = document.querySelectorAll('.video-container');
        videoContainers.forEach(container => {
            container.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });

        // Function to handle video containers
        function initializeVideoContainers() {
            const videoContainers = document.querySelectorAll('.video-container[data-video-id]');

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
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
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

    initializeGameJamVideos();
});