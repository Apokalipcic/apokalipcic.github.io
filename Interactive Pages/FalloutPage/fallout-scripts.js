// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        const main = document.querySelector('main');

        if (targetElement) {
            // Hide all sections
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the target section
            targetElement.style.display = 'block';
            
            // Scroll to the top of the content
            main.scrollTo({
                top: targetElement.offsetTop - main.offsetTop,
                behavior: 'smooth'
            });
            
            // Update active navigation state
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Add active state to current navigation item
function updateActiveNav() {
    const hash = window.location.hash;
    if (hash) {
        document.querySelectorAll('nav a').forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Update on page load and hash change
window.addEventListener('load', updateActiveNav);
window.addEventListener('hashchange', updateActiveNav);

// CRT flicker effect
function addCRTFlicker() {
    const container = document.querySelector('.retro-container');
    setInterval(() => {
        const opacity = 0.95 + Math.random() * 0.05;
        container.style.opacity = opacity;
    }, 100);
}

// Initialize CRT flicker
addCRTFlicker();

// Add typing effect for alerts
function typeAlert(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Apply typing effect to all alert elements
document.querySelectorAll('.alert').forEach(alert => {
    const originalText = alert.textContent;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeAlert(alert, originalText);
                observer.unobserve(alert);
            }
        });
    });
    
    observer.observe(alert);
});

// Add random glitch effect
function glitchEffect() {
    const container = document.querySelector('.retro-container');
    const glitchChance = 0.05; // 5% chance of glitch
    
    setInterval(() => {
        if (Math.random() < glitchChance) {
            container.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            setTimeout(() => {
                container.style.transform = 'translate(0, 0)';
            }, 100);
        }
    }, 500);
}

// Initialize glitch effect
glitchEffect();

// Add boot sequence animation
function bootSequence() {
    const bootOverlay = document.createElement('div');
    bootOverlay.className = 'boot-overlay';
    bootOverlay.innerHTML = `
        <div class="boot-text">
            <p>ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM</p>
            <p>COPYRIGHT 2075-2077 ROBCO INDUSTRIES</p>
            <p>-SERVER 1-</p>
            <p>INITIALIZING PIP-BOY 3000...</p>
        </div>
    `;
    
    document.body.appendChild(bootOverlay);
    
    setTimeout(() => {
        bootOverlay.classList.add('fade-out');
        setTimeout(() => {
            bootOverlay.remove();
        }, 2000);
    }, 3000);
}

// Run boot sequence on page load
window.addEventListener('load', bootSequence);

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const links = Array.from(document.querySelectorAll('nav a'));
        const activeLink = document.querySelector('nav a.active') || links[0];
        const currentIndex = links.indexOf(activeLink);
        
        let nextIndex;
        if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex - 1 < 0 ? links.length - 1 : currentIndex - 1;
        } else {
            nextIndex = currentIndex + 1 >= links.length ? 0 : currentIndex + 1;
        }
        
        links[nextIndex].click();
    }
});
