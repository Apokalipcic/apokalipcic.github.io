// concepts.js - Functionality for game concepts section

document.addEventListener('DOMContentLoaded', function () {
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
            title: "Mirror's Edge",
            category: "RPG",
            images: [
                "Images/Concepts/Cyberpunk/cyberpunk_concept_01.png",
                "Images/Concepts/Cyberpunk/cyberpunk_concept_02.png",
                "Images/Concepts/Cyberpunk/cyberpunk_concept_03.png",
                "Images/Concepts/Cyberpunk/cyberpunk_concept_04.png",
                "Images/Concepts/Cyberpunk/cyberpunk_concept_05.png",
                "Images/Concepts/Cyberpunk/cyberpunk_concept_06.png"
            ],
            description: "As a fan of Cyberpunk 2077 cyberpsycho encounters, I wanted to explore a more complex narrative within this quest type. Mirror's Edge showcases my ability to create engaging gameplay mechanics that serve the story, rather than just adding combat difficulty.",
            features: [
                "A unique boss fight mechanic with the Mirror's Edge chip",
                "Multi-phase encounter design",
                "Integration with existing game characters and lore (Regina Jones, Johnny Silverhand)"
            ],
            tags: ["RPG", "Action", "Horror", "Cyberpunk"],
            primaryLink: "https://www.figma.com/design/V73MiKv3QF7GrvQTO123Cw/C2077-Quest-Design---Mirror's-Edge?node-id=88-88&t=yAvlESeT0H7vHBU0-1", // Add your actual link here
            secondaryLink: "CyberpunkPage/index.html" // Add your actual link here, or leave empty to use construction strip
        },
        {
            id: 'concept2',
            title: "River Mystery",
            category: "RPG",
            images: [
                "Images/Concepts/Concept RPG/RPG_Concept_01.png",
                "Images/Concepts/Concept RPG/RPG_Concept_02.png",
                "Images/Concepts/Concept RPG/RPG_Concept_03.png",
                "Images/Concepts/Concept RPG/RPG_Concept_04.png",
                "Images/Concepts/Concept RPG/RPG_Concept_05.png"
            ],
            description: "I was inspired by Baldur's Gate 3 to create new Quest Design Location, with multiple choices and dialogues.",
            features: [
                "Branching Narrative",
                "Multiple Approach",
                "Standalone"
            ],
            tags: ["RPG", "Narrative", "Fantasy", ],
            primaryLink: "https://www.figma.com/design/JoKhPJjWRTn1Su6JH0hKt0/RPG-Quest-Design---Design?node-id=134-1314&t=E5hGdwzL5WGnpAnA-1", // Add your actual link here
            secondaryLink: "" // Add your actual link here, or leave empty to use construction strip
        }
    ];

    // Current state
    let activeImageIndex = 0;
    let selectedConcept = null;

    // Add click event to concept cards
    conceptCards.forEach(card => {
        card.addEventListener('click', function () {
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

                // Make sure each thumbnail has its own unique click handler
                thumbnail.addEventListener('click', function () {
                    setActiveImage(idx);
                });

                thumbnailsContainer.appendChild(thumbnail);
            });

            // Hide thumbnails container if only one image
            thumbnailsContainer.style.display = selectedConcept.images.length <= 1 ? 'none' : 'flex';
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

        // Set up modal action buttons
        const primaryBtn = conceptModal.querySelector('.modal-actions .primary-btn');
        const secondaryBtn = conceptModal.querySelector('.modal-actions .secondary-btn');

        // Primary button (Figma Board)
        if (primaryBtn) {
            // Check if we need to convert button to an anchor or update existing anchor
            let primaryLink;
            if (primaryBtn.tagName === 'BUTTON') {
                // It's a button, need to convert to anchor if we have a link
                if (selectedConcept.primaryLink) {
                    // Create a new anchor element preserving classes and text
                    primaryLink = document.createElement('a');
                    primaryLink.className = primaryBtn.className;
                    primaryLink.textContent = primaryBtn.textContent;
                    primaryLink.href = selectedConcept.primaryLink;
                    primaryLink.target = "_blank"; // Open in new window
                    primaryLink.rel = "noopener noreferrer"; // Security best practice for target="_blank"

                    // Replace button with anchor
                    primaryBtn.parentNode.replaceChild(primaryLink, primaryBtn);
                } else {
                    // No link, keep as button with construction strip
                    primaryBtn.setAttribute('data-construction', 'small');
                    // Add construction strip if not already present
                    if (typeof window.addConstructionStrip === 'function' &&
                        !primaryBtn.querySelector('.under-construction-strip')) {
                        window.addConstructionStrip(primaryBtn, 'small');
                    }
                }
            } else if (primaryBtn.tagName === 'A') {
                // It's already an anchor, update or revert as needed
                primaryLink = primaryBtn;
                if (selectedConcept.primaryLink) {
                    primaryLink.href = selectedConcept.primaryLink;
                    primaryLink.target = "_blank"; // Open in new window
                    primaryLink.rel = "noopener noreferrer"; // Security best practice
                    primaryLink.removeAttribute('data-construction');

                    // Remove any existing under-construction strip
                    const existingStrip = primaryLink.querySelector('.under-construction-strip');
                    if (existingStrip) primaryLink.removeChild(existingStrip);
                } else {
                    // Convert back to a button (or keep as disabled link with construction strip)
                    primaryLink.removeAttribute('href');
                    primaryLink.removeAttribute('target');
                    primaryLink.removeAttribute('rel');
                    primaryLink.setAttribute('data-construction', 'small');
                    // Add construction strip if not already present
                    if (typeof window.addConstructionStrip === 'function' &&
                        !primaryLink.querySelector('.under-construction-strip')) {
                        window.addConstructionStrip(primaryLink, 'small');
                    }
                }
            }
        }

        // Secondary button (Interactive Site)
        if (secondaryBtn) {
            // Check if we need to convert button to an anchor or update existing anchor
            let secondaryLink;
            if (secondaryBtn.tagName === 'BUTTON') {
                // It's a button, need to convert to anchor if we have a link
                if (selectedConcept.secondaryLink) {
                    // Create a new anchor element preserving classes and text
                    secondaryLink = document.createElement('a');
                    secondaryLink.className = secondaryBtn.className;
                    secondaryLink.textContent = secondaryBtn.textContent;
                    secondaryLink.href = selectedConcept.secondaryLink;
                    secondaryLink.target = "_blank"; // Open in new window
                    secondaryLink.rel = "noopener noreferrer"; // Security best practice for target="_blank"

                    // Replace button with anchor
                    secondaryBtn.parentNode.replaceChild(secondaryLink, secondaryBtn);
                } else {
                    // No link, keep as button with construction strip
                    secondaryBtn.setAttribute('data-construction', 'small');
                    // Add construction strip if not already present
                    if (typeof window.addConstructionStrip === 'function' &&
                        !secondaryBtn.querySelector('.under-construction-strip')) {
                        window.addConstructionStrip(secondaryBtn, 'small');
                    }
                }
            } else if (secondaryBtn.tagName === 'A') {
                // It's already an anchor, update or revert as needed
                secondaryLink = secondaryBtn;
                if (selectedConcept.secondaryLink) {
                    secondaryLink.href = selectedConcept.secondaryLink;
                    secondaryLink.target = "_blank"; // Open in new window
                    secondaryLink.rel = "noopener noreferrer"; // Security best practice
                    secondaryLink.removeAttribute('data-construction');

                    // Remove any existing under-construction strip
                    const existingStrip = secondaryLink.querySelector('.under-construction-strip');
                    if (existingStrip) secondaryLink.removeChild(existingStrip);
                } else {
                    // Convert back to a button (or keep as disabled link with construction strip)
                    secondaryLink.removeAttribute('href');
                    secondaryLink.removeAttribute('target');
                    secondaryLink.removeAttribute('rel');
                    secondaryLink.setAttribute('data-construction', 'small');
                    // Add construction strip if not already present
                    if (typeof window.addConstructionStrip === 'function' &&
                        !secondaryLink.querySelector('.under-construction-strip')) {
                        window.addConstructionStrip(secondaryLink, 'small');
                    }
                }
            }
        }

        // Show/hide navigation buttons based on number of images
        const prevButton = conceptModal.querySelector('.gallery-nav.prev');
        const nextButton = conceptModal.querySelector('.gallery-nav.next');

        if (prevButton && nextButton) {
            const display = selectedConcept.images.length <= 1 ? 'none' : 'flex';
            prevButton.style.display = display;
            nextButton.style.display = display;
        }
    }

    // Set active image in gallery
    function setActiveImage(index) {
        if (!selectedConcept) return;

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
            thumb.classList.toggle('active', idx === activeImageIndex);
        });
    }

    // Store references to event handlers so they can be removed properly
    let prevButtonHandler, nextButtonHandler, keyboardHandler;

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

        // Create new handlers each time
        prevButtonHandler = function (e) {
            e.stopPropagation();
            navigateGallery('prev');
        };

        nextButtonHandler = function (e) {
            e.stopPropagation();
            navigateGallery('next');
        };

        keyboardHandler = function (e) {
            if (e.key === 'Escape') {
                closeConceptModal();
            } else if (e.key === 'ArrowLeft') {
                navigateGallery('prev');
            } else if (e.key === 'ArrowRight') {
                navigateGallery('next');
            }
        };

        // Add event listeners
        if (prevButton) {
            prevButton.addEventListener('click', prevButtonHandler);
        }

        if (nextButton) {
            nextButton.addEventListener('click', nextButtonHandler);
        }

        // Keyboard navigation
        document.addEventListener('keydown', keyboardHandler);
    }

    // Remove gallery navigation
    function removeGalleryNavigation() {
        const prevButton = conceptModal.querySelector('.gallery-nav.prev');
        const nextButton = conceptModal.querySelector('.gallery-nav.next');

        // Remove event listeners using the stored references
        if (prevButton && prevButtonHandler) {
            prevButton.removeEventListener('click', prevButtonHandler);
        }

        if (nextButton && nextButtonHandler) {
            nextButton.removeEventListener('click', nextButtonHandler);
        }

        if (keyboardHandler) {
            document.removeEventListener('keydown', keyboardHandler);
        }

        // Reset handler references
        prevButtonHandler = null;
        nextButtonHandler = null;
        keyboardHandler = null;
    }
}