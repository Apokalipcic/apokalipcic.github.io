// contributors.js - Contributors heart button and popup functionality

class Contributors {
    constructor() {
        this.isVisible = false;
        this.contributors = [
            {
                id: 1,
                name: "Niccolò Rovai",
                role: "Music Composer",
                avatar: "images/Music/OST_Thumbnail.jpg",
                description: "Contributed in creating music composition for this specific page.",
                links: {
                    website: "https://nickr02vgm.com/",
                    email: "niccorovai02@gmail.com"
                }
            }
        ];

        this.init();
    }

    init() {
        this.createTopRightContainer();
        this.createHeartButton();
        this.createPopupHTML();
        this.bindEvents();
    }

    createTopRightContainer() {
        // Check if container already exists (in case tutorial creates it)
        let container = document.getElementById('top-right-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'top-right-controls';
            container.className = 'top-right-controls';
            document.body.appendChild(container);
        }
    }

    createHeartButton() {
        const container = document.getElementById('top-right-controls');

        const heartButton = document.createElement('button');
        heartButton.id = 'contributors-heart';
        heartButton.className = 'contributors-heart';
        heartButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;

        // Insert as first child so heart appears before tutorial button
        container.insertBefore(heartButton, container.firstChild);
    }

    createPopupHTML() {
        const popupHTML = `
            <div id="contributor-overlay" class="contributor-overlay" style="display: none;">
                <div class="contributor-popup">
                    <div class="contributor-header">
                        <button class="contributor-close" id="contributor-close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <h2 class="contributor-title">Contributors</h2>
                        <div class="contributor-subtitle">Special thanks for helping with music!</div>
                    </div>
                    
                    <div class="contributor-progress">
                        <div class="contributor-progress-bar"></div>
                    </div>
                    
                    <div class="contributor-content" id="contributor-content">
                        <!-- Content will be populated by JavaScript -->
                    </div>
                    
                    <div class="contributor-footer">
                        <button class="contributor-close-button" id="contributor-close-button">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    bindEvents() {
        // Heart button click
        document.getElementById('contributors-heart').addEventListener('click', () => this.show());

        // Close buttons
        document.getElementById('contributor-close').addEventListener('click', () => this.hide());
        document.getElementById('contributor-close-button').addEventListener('click', () => this.hide());

        // Overlay click to close
        document.getElementById('contributor-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'contributor-overlay') {
                this.hide();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    updateContent() {
        const contentContainer = document.getElementById('contributor-content');

        // For now, show the first contributor
        // In the future, you could cycle through multiple contributors
        const contributor = this.contributors[0];

        contentContainer.innerHTML = `
            <div class="contributor-avatar">
                <img src="${contributor.avatar}" alt="${contributor.name}" onerror="this.style.display='none'">
            </div>
            <h3 class="contributor-name">${contributor.name}</h3>
            <p class="contributor-role">${contributor.role}</p>
            <p class="contributor-description">${contributor.description}</p>
            
            <div class="contributor-links">
                ${contributor.links.website ? `
                    <a href="${contributor.links.website}" target="_blank" rel="noopener noreferrer" class="contributor-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        Website
                    </a>
                ` : ''}
                
                ${contributor.links.email ? `
                    <a href="mailto:${contributor.links.email}" class="contributor-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Contact
                    </a>
                ` : ''}
            </div>
        `;
    }

    show() {
        this.isVisible = true;
        this.updateContent();
        document.getElementById('contributor-overlay').style.display = 'flex';

        // Prevent body scroll when popup is open
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.isVisible = false;
        document.getElementById('contributor-overlay').style.display = 'none';

        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Method to add new contributors (for future use)
    addContributor(contributor) {
        this.contributors.push(contributor);
    }

    // Method to update existing contributor
    updateContributor(id, updates) {
        const contributorIndex = this.contributors.findIndex(c => c.id === id);
        if (contributorIndex !== -1) {
            this.contributors[contributorIndex] = { ...this.contributors[contributorIndex], ...updates };
        }
    }
}

// Initialize contributors when DOM is loaded
let contributors;

export function initContributors() {
    contributors = new Contributors();
    console.log('Contributors system initialized');
}

// Export for potential external use
export { contributors };