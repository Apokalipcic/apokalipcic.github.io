// Navigation highlight on scroll
document.addEventListener('DOMContentLoaded', function() {
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
    
    mobileMenuBtn.addEventListener('click', function() {
        navbar.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Close menu when clicking a link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Portfolio carousel
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    // Create dots based on number of slides
    function createDots() {
        const itemWidth = carouselItems[0].getBoundingClientRect().width;
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
        
        const slideCount = Math.ceil(carouselItems.length / itemsPerView);
        
        // Clear existing dots
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
            dot.addEventListener('click', function() {
                goToSlide(parseInt(this.dataset.slide));
            });
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
        currentSlide = slideIndex;
        const offset = -1 * currentSlide * carouselProps.itemsPerView * (itemWidth + 32); // 32px for the left/right margins
        carouselTrack.style.transform = `translateX(${offset}px)`;
        
        // Update active dot
        document.querySelectorAll('.dot').forEach((dot, index) => {
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
    
    // Add event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Recalculate on window resize
    window.addEventListener('resize', function() {
        carouselProps = createDots();
        goToSlide(0);
    });
    
    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // For now, just log the data
            console.log('Form submitted:', { name, email, subject, message });
            
            // Clear the form
            contactForm.reset();
            
            // Show success message (you can enhance this later)
            alert('Thanks for your message! I\'ll get back to you soon.');
        });
    }
    
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
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkills();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    } else {
        // Fallback for browsers that don't support Intersection Observer
        setTimeout(animateSkills, 1000);
    }
});
