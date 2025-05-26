// tutorial.js - Tutorial popup functionality with background music integration

class Tutorial {
    constructor() {
        this.currentPage = 0;
        this.isVisible = false;
        this.hasBeenClosedBefore = false; // Track if tutorial was closed before
        this.tutorialPages = [
            {
                title: "Welcome to Split Fiction!",
                content: "Let's quickly learn how to use this page",
                image: "images/tutorial/Tutorial 0.png"
            },
            {
                title: "Drag Notes Around",
                content: "Click and drag any note to move it around the screen.",
                image: "images/tutorial/Tutorial 1.png"
            },
            {
                title: "Place Notes in Sequencer",
                content: "Drag notes into the sequencer cells at the bottom to play a song",
                image: "images/tutorial/Tutorial 2.png"
            },
            {
                title: "Nested Notes Restriction",
                content: "Notes containing other notes cannot be placed in the sequencer.",
                image: "images/tutorial/Tutorial 3.png"
            },
            {
                title: "Adjust the Divider",
                content: "Drag the central divider to reavel one of the sides",
                image: "images/tutorial/Tutorial 4.png"
            }
        ];

        this.init();
    }

    init() {
        this.createTutorialHTML();
        this.bindEvents();
        this.show(); // Show tutorial on page load
    }

    createTutorialHTML() {
        const tutorialHTML = `
            <div id="tutorial-overlay" class="tutorial-overlay" style="display: none;">
                <div class="tutorial-popup">
                    <div class="tutorial-header">
                        <button class="tutorial-close" id="tutorial-close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <h2 class="tutorial-title" id="tutorial-title">Welcome</h2>
                        <div class="tutorial-step" id="tutorial-step">Step 1 of 5</div>
                    </div>
                    
                    <div class="tutorial-progress">
                        <div class="tutorial-progress-bar" id="tutorial-progress-bar"></div>
                    </div>
                    
                    <div class="tutorial-content">
                        <div class="tutorial-image">
                            <img id="tutorial-image" src="" alt="" style="display: none;">
                        </div>
                        <h3 class="tutorial-text" id="tutorial-text">Content</h3>
                    </div>
                    
                    <div class="tutorial-navigation">
                        <button class="tutorial-nav-button" id="tutorial-prev">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                            Previous
                        </button>
                        
                        <div class="tutorial-dots" id="tutorial-dots"></div>
                        
                        <button class="tutorial-nav-button" id="tutorial-next">
                            Next
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                        
                        <button class="tutorial-get-started" id="tutorial-get-started" style="display: none;">
                            Get Started!
                        </button>
                    </div>
                    
                    <div class="tutorial-skip">
                        <button id="tutorial-skip">Skip tutorial</button>
                    </div>
                </div>
            </div>
            
            <button id="tutorial-reopen" class="tutorial-reopen" style="display: none;">
                Show Tutorial
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', tutorialHTML);
        this.createDots();
    }

    createDots() {
        const dotsContainer = document.getElementById('tutorial-dots');
        dotsContainer.innerHTML = '';

        for (let i = 0; i < this.tutorialPages.length; i++) {
            const dot = document.createElement('div');
            dot.className = `tutorial-dot ${i === this.currentPage ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        document.getElementById('tutorial-close').addEventListener('click', () => this.hide());
        document.getElementById('tutorial-skip').addEventListener('click', () => this.hide());
        document.getElementById('tutorial-prev').addEventListener('click', () => this.prevPage());
        document.getElementById('tutorial-next').addEventListener('click', () => this.nextPage());
        document.getElementById('tutorial-get-started').addEventListener('click', () => this.hide());
        document.getElementById('tutorial-reopen').addEventListener('click', () => this.show());
    }

    updateContent() {
        const page = this.tutorialPages[this.currentPage];

        document.getElementById('tutorial-title').textContent = page.title;
        document.getElementById('tutorial-step').textContent = `Step ${this.currentPage + 1} of ${this.tutorialPages.length}`;
        document.getElementById('tutorial-text').textContent = page.content;

        // Update image
        const img = document.getElementById('tutorial-image');
        img.src = page.image;
        img.alt = page.title;
        img.style.display = 'block';
        img.onerror = () => img.style.display = 'none';

        // Update progress bar
        const progressBar = document.getElementById('tutorial-progress-bar');
        progressBar.style.width = `${((this.currentPage + 1) / this.tutorialPages.length) * 100}%`;

        // Update navigation buttons
        const prevBtn = document.getElementById('tutorial-prev');
        const nextBtn = document.getElementById('tutorial-next');
        const getStartedBtn = document.getElementById('tutorial-get-started');

        prevBtn.disabled = this.currentPage === 0;

        if (this.currentPage === this.tutorialPages.length - 1) {
            nextBtn.style.display = 'none';
            getStartedBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'flex';
            getStartedBtn.style.display = 'none';
        }

        // Update dots
        this.createDots();
    }

    nextPage() {
        if (this.currentPage < this.tutorialPages.length - 1) {
            this.currentPage++;
            this.updateContent();
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateContent();
        }
    }

    show() {
        this.isVisible = true;
        document.getElementById('tutorial-overlay').style.display = 'flex';
        document.getElementById('tutorial-reopen').style.display = 'none';
        this.updateContent();
    }

    hide() {
        this.isVisible = false;
        document.getElementById('tutorial-overlay').style.display = 'none';
        document.getElementById('tutorial-reopen').style.display = 'block';

        // Trigger background music if this is the first time closing tutorial
        if (!this.hasBeenClosedBefore) {
            this.hasBeenClosedBefore = true;
            this.triggerBackgroundMusic();
        }
    }

    // New method to trigger background music after first tutorial close
    triggerBackgroundMusic() {
        // Dispatch custom event that main.js can listen for
        const event = new CustomEvent('tutorialFirstClose', {
            detail: { message: 'Tutorial closed for first time, can start background music' }
        });
        document.dispatchEvent(event);

        console.log('Tutorial closed for first time - triggering background music');
    }
}

// Initialize tutorial when DOM is loaded
let tutorial;

export function initTutorial() {
    tutorial = new Tutorial();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Tutorial, initTutorial };
}