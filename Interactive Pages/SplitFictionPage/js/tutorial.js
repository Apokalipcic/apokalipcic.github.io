// tutorial.js - Tutorial popup functionality with background music integration and music selection

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
                content: "Drag the central divider to reveal one of the sides",
                image: "images/tutorial/Tutorial 4.png"
            },
            {
                title: "Choose Your Music",
                content: "Select a music track to begin your experience",
                isMusicSelection: true
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
                        <div class="tutorial-step" id="tutorial-step">Step 1 of 6</div>
                    </div>
                    
                    <div class="tutorial-progress">
                        <div class="tutorial-progress-bar" id="tutorial-progress-bar"></div>
                    </div>
                    
                    <div class="tutorial-content" id="tutorial-content">
                        <div class="tutorial-image">
                            <img id="tutorial-image" src="" alt="" style="display: none;">
                        </div>
                        <h3 class="tutorial-text" id="tutorial-text">Content</h3>
                        
                        <!-- Music Selection Content (hidden by default) -->
                        <div class="music-selection-container" id="music-selection-container" style="display: none;">
                            <div class="music-option" id="music-option-pop" data-music="pop">
                                <div class="music-thumbnail">
                                    <img src="images/music/DaftPunk_Thumbnail.jpg" alt="Pop Music" onerror="this.style.display='none'">
                                </div>
                                <div class="music-info">
                                    <div class="music-title">Pop Music</div>
                                    <div class="music-description">
                                        Daft Punk - Get Lucky with electronic beats and layered vocals.
                                    </div>
                                </div>
                            </div>
                            
                            <div class="music-option" id="music-option-ost" data-music="ost">
                                <div class="music-thumbnail">
                                    <img src="images/music/OST_Thumbnail.jpg" alt="Original Soundtrack" onerror="this.style.display='none'">
                                </div>
                                <div class="music-info">
                                    <div class="music-title">Original Soundtrack</div>
                                    <div class="music-description">
                                        Custom composed music for this page.
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        <button id="tutorial-skip">Skip to music selection</button>
                    </div>
                </div>
            </div>
            
            <button id="tutorial-reopen" class="tutorial-reopen" style="display: none;">
                Show Tutorial
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', tutorialHTML);
        this.createTopRightContainer();
        this.createDots();
    }

    createTopRightContainer() {
        // Create container for top-right buttons if it doesn't exist
        let container = document.getElementById('top-right-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'top-right-controls';
            container.className = 'top-right-controls';
            document.body.appendChild(container);
        }

        // Move tutorial reopen button to container
        const tutorialButton = document.getElementById('tutorial-reopen');
        if (tutorialButton && container) {
            container.appendChild(tutorialButton);
        }
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
        document.getElementById('tutorial-close').addEventListener('click', () => this.handleClose());
        document.getElementById('tutorial-skip').addEventListener('click', () => this.skipToMusicSelection());
        document.getElementById('tutorial-prev').addEventListener('click', () => this.prevPage());
        document.getElementById('tutorial-next').addEventListener('click', () => this.nextPage());
        document.getElementById('tutorial-get-started').addEventListener('click', () => this.hide());
        document.getElementById('tutorial-reopen').addEventListener('click', () => this.show());

        // Music selection events
        document.getElementById('music-option-pop').addEventListener('click', () => this.selectMusic('pop'));
        document.getElementById('music-option-ost').addEventListener('click', () => this.selectMusic('ost'));
    }

    updateContent() {
        const page = this.tutorialPages[this.currentPage];

        document.getElementById('tutorial-title').textContent = page.title;
        document.getElementById('tutorial-step').textContent = `Step ${this.currentPage + 1} of ${this.tutorialPages.length}`;
        document.getElementById('tutorial-text').textContent = page.content;

        // Handle music selection page
        const musicContainer = document.getElementById('music-selection-container');
        const imageContainer = document.querySelector('.tutorial-image');

        if (page.isMusicSelection) {
            // Show music selection, hide image
            musicContainer.style.display = 'grid';
            imageContainer.style.display = 'none';
        } else {
            // Show image, hide music selection
            musicContainer.style.display = 'none';
            imageContainer.style.display = 'flex';

            // Update image
            const img = document.getElementById('tutorial-image');
            img.src = page.image;
            img.alt = page.title;
            img.style.display = 'block';
            img.onerror = () => img.style.display = 'none';
        }

        // Update progress bar
        const progressBar = document.getElementById('tutorial-progress-bar');
        progressBar.style.width = `${((this.currentPage + 1) / this.tutorialPages.length) * 100}%`;

        // Update navigation buttons
        const prevBtn = document.getElementById('tutorial-prev');
        const nextBtn = document.getElementById('tutorial-next');
        const getStartedBtn = document.getElementById('tutorial-get-started');

        prevBtn.disabled = this.currentPage === 0;

        if (page.isMusicSelection) {
            // On music selection page, hide Next and Get Started until selection is made
            nextBtn.style.display = 'none';
            getStartedBtn.style.display = 'none';
        } else if (this.currentPage === this.tutorialPages.length - 2) {
            // Second to last page (before music selection)
            nextBtn.style.display = 'flex';
            getStartedBtn.style.display = 'none';
        } else {
            // Regular pages
            nextBtn.style.display = 'flex';
            getStartedBtn.style.display = 'none';
        }

        // Update skip button text
        const skipButton = document.getElementById('tutorial-skip');
        if (page.isMusicSelection) {
            skipButton.textContent = 'Choose default music';
        } else {
            skipButton.textContent = 'Skip to music selection';
        }

        // Update dots
        this.createDots();
    }

    selectMusic(musicType) {
        console.log(`Music selected: ${musicType}`);

        // Dispatch music selection event
        const event = new CustomEvent('tutorialMusicSelected', {
            detail: { configKey: musicType }
        });
        document.dispatchEvent(event);

        // Show Get Started button after music selection
        const getStartedBtn = document.getElementById('tutorial-get-started');
        getStartedBtn.style.display = 'block';
        getStartedBtn.textContent = `Get Started!`;

        // Add visual feedback to selected option
        document.querySelectorAll('.music-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.getElementById(`music-option-${musicType}`).classList.add('selected');
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

    skipToMusicSelection() {
        if (this.tutorialPages[this.currentPage].isMusicSelection) {
            // If already on music selection page, choose default music
            this.selectMusic('pop'); // Default to pop music
        } else {
            // Skip to music selection page
            this.currentPage = this.tutorialPages.length - 1; // Last page
            this.updateContent();
        }
    }

    handleClose() {
        // If on music selection page and no music selected, go to music selection
        if (!this.tutorialPages[this.currentPage].isMusicSelection) {
            this.skipToMusicSelection();
        } else {
            // If no music selected, choose default
            if (!document.querySelector('.music-option.selected')) {
                this.selectMusic('pop');
            }
            this.hide();
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

    // Trigger background music after first tutorial close
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