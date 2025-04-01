// concepts.js - Functionality for game concepts section

document.addEventListener('DOMContentLoaded', function() {
    // Initialize concepts functionality
    initConceptsSection();
});

function initConceptsSection() {
    // References to key elements
    const conceptCards = document.querySelectorAll('.concept-card');
    const conceptModal = document.getElementById('concept-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    
    // Concept data - this would normally come from a database or CMS
    // We're hardcoding it here for simplicity
    const conceptsData = [
        {
            id: 'concept1',
            title: "Elemental Tactics",
            category: "Strategy",
            images: [
                "Images/Concepts/elemental-tactics-1.jpg",
                "Images/Concepts/elemental-tactics-2.jpg",
                "Images/Concepts/elemental-tactics-3.jpg"
            ],
            description: "A turn-based strategy game where players command elemental forces to reshape the battlefield and outsmart opponents.",
            features: [
                "Dynamic terrain manipulation using elemental powers",
                "Deep strategic combat with elemental interactions",
                "Procedurally generated battlefields for endless replayability"
            ],
            tags: ["Turn-based", "Tactical", "Elements"]
        },
        {
            id: 'concept2',
            title: "Neon Shadows",
            category: "Action RPG",
            images: [
                "Images/Concepts/neon-shadows-1.jpg",
                "Images/Concepts/neon-shadows-2.jpg",
                "Images/Concepts/neon-shadows-3.jpg"
            ],
            description: "A cyberpunk action RPG exploring themes of identity and consciousness in a world where memories can be digitized and traded.",
            features: [
                "Memory-based progression system with unique abilities",
                "Branching narrative affected by memory choices",
                "Dynamic combat combining physical and digital abilities"
            ],
            tags: ["Cyberpunk", "Action", "Story-Rich"]
        }
    ];
    
    // Current state
    let activeImageIndex = 0;
    let selectedConcept = null;
    
    // Add click event to concept cards
    conceptCards.forEach(card => {
        card.addEventListener('click', function() {
            const conceptId = this.getAttribute('data-concept-id');
            openConceptModal(conceptId);
        });
    });
    
    // Close modal when clicking the close button
    if (modalClose) {
        modalClose.addEventListener('click', closeConceptModal);
    }
    
    // Close modal when clicking the backdrop
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeConceptModal);
    }
    
    // Open concept modal
    function openConceptModal(conceptId) {
        // Find the concept data
        selectedConcept = conceptsData.find(concept => concept.id === conceptId);
        if (!selectedConcept) return;
        
        // Reset active image index
        activeImageIndex = 0;
        
        // Update modal content
        updateModalContent();
        
        // Show modal
        if (conceptModal) {
            conceptModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
        
        // Add event listeners for gallery navigation
        setupGalleryNavigation();
    }
    
    // Close concept modal
    function closeConceptModal() {
        if (conceptModal) {
            conceptModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
        
        // Remove gallery navigation event listeners
        removeGalleryNavigation();
        
        // Reset state
        selectedConcept = null;
    }
    
    // Update modal content based on selected concept
    function updateModalContent() {
        if (!selectedConcept || !conceptModal) return;
        
        // Update main image
        const mainImage = conceptModal.querySelector('.gallery-main img');
        if (mainImage) {
            mainImage.src = selectedConcept.images[activeImageIndex];
            mainImage.alt = `${selectedConcept.title} - Image ${activeImageIndex + 1}`;
        }
        
        // Update thumbnails
        const thumbnailsContainer = conceptModal.querySelector('.gallery-thumbnails');
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = '';
            
            selectedConcept.images.forEach((img, idx) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${idx === activeImageIndex ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${img}" alt="Thumbnail ${idx + 1}">`;
                thumbnail.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setActiveImage(idx);
                });
                thumbnailsContainer.appendChild(thumbnail);
            });
            
            // Hide thumbnails container if only one image
            if (selectedConcept.images.length <= 1) {
                thumbnailsContainer.style.display = 'none';
            } else {
                thumbnailsContainer.style.display = 'flex';
            }
        }
        
        // Update concept details
        conceptModal.querySelector('.modal-header h2').textContent = selectedConcept.title;
        conceptModal.querySelector('.modal-category').textContent = selectedConcept.category;
        conceptModal.querySelector('.modal-description p').textContent = selectedConcept.description;
        
        // Update features list
        const featuresList = conceptModal.querySelector('.modal-features ul');
        if (featuresList) {
            featuresList.innerHTML = '';
            selectedConcept.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
        }
        
        // Update tags
        const tagsContainer = conceptModal.querySelector('.modal-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            selectedConcept.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'concept-tag';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });
        }
        
        // Show/hide navigation buttons based on number of images
        const prevButton = conceptModal.querySelector('.gallery-nav.prev');
        const nextButton = conceptModal.querySelector('.gallery-nav.next');
        
        if (prevButton && nextButton) {
            if (selectedConcept.images.length <= 1) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            } else {
                prevButton.style.display = 'flex';
                nextButton.style.display = 'flex';
            }
        }
    }
    
    // Set active image in gallery
    function setActiveImage(index) {
        activeImageIndex = index;
        
        // Update main image
        const mainImage = conceptModal.querySelector('.gallery-main img');
        if (mainImage) {
            mainImage.src = selectedConcept.images[activeImageIndex];
            mainImage.alt = `${selectedConcept.title} - Image ${activeImageIndex + 1}`;
        }
        
        // Update thumbnails
        const thumbnails = conceptModal.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, idx) => {
            if (idx === activeImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // Navigate gallery images
    function navigateGallery(direction) {
        if (!selectedConcept) return;
        
        const imagesCount = selectedConcept.images.length;
        if (direction === 'next') {
            activeImageIndex = (activeImageIndex + 1) % imagesCount;
        } else {
            activeImageIndex = (activeImageIndex - 1 + imagesCount) % imagesCount;
        }
        
        setActiveImage(activeImageIndex);
    }
    
    // Setup gallery navigation
    function setupGalleryNavigation() {
        const prevButton = conceptModal.querySelector('.gallery-nav.prev');
        const nextButton = conceptModal.querySelector('.gallery-nav.next');
        
        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateGallery('prev');
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateGallery('next');
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyNavigation);
    }
    
    // Remove gallery navigation
    function removeGalleryNavigation() {
        document.removeEventListener('keydown', handleKeyNavigation);
    }
    
    // Handle keyboard navigation
    function handleKeyNavigation(e) {
        if (e.key === 'Escape') {
            closeConceptModal();
        } else if (e.key === 'ArrowLeft') {
            navigateGallery('prev');
        } else if (e.key === 'ArrowRight') {
            navigateGallery('next');
        }
    }
    
    // Handle ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeConceptModal();
        }
    });
}