// DOM Elements
const appContainer = document.getElementById('app-container');
const playerASide = document.getElementById('player-a-side');
const playerBSide = document.getElementById('player-b-side');
const divider = document.getElementById('divider');
const notesAreaA = document.getElementById('notes-area-a');
const notesAreaB = document.getElementById('notes-area-b');
const sequencerA = document.getElementById('sequencer-a');
const sequencerB = document.getElementById('sequencer-b');
const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');
const audioContainer = document.getElementById('audio-container');

// Configuration
const config = {
    totalCells: 8,                   // Total number of sequencer cells
    tempo: 120,                      // Beats per minute
    playerACells: [1, 3, 5],      // Cell positions for Player A (1-based)
    playerBCells: [2, 4, 6],      // Cell positions for Player B (1-based)
    playerANotes: [1, 4, 6],      // Note numbers for Player B (matching cell positions)
    playerBNotes: [2, 3, 5],      // Note numbers for Player A (matching cell positions)
    audioFiles: {                    // Audio file paths for each note
        1: 'Audio/note1.ogg',          
        2: 'Audio/note2.ogg',
        3: 'Audio/note3.ogg',
        4: 'Audio/note4.ogg',
        5: 'Audio/note5.ogg',
        5: 'Audio/note6.ogg',
    }
};

// State
let state = {
    isPlaying: false,                // Whether the sequencer is currently playing
    currentStep: 0,                  // Current step in the sequence (0-based)
    intervalId: null,                // ID for the playback interval
    playerACellsContent: {},         // Contents of Player A cells: { position: noteNumber }
    playerBCellsContent: {},         // Contents of Player B cells: { position: noteNumber }
    draggedNote: null,               // Currently dragged note element
    draggedNoteData: null,           // Data for the currently dragged note
};

// Global dragging state
let activeNote = null;
let offsetX = 0;
let offsetY = 0;
let targetX = 0;  // Target position for smooth movement
let targetY = 0;
let currentX = 0; // Current position during animation
let currentY = 0;
let isAnimating = false;
let animationFrameId = null;

// Movement speed factor (1.0 = instant, lower values = slower movement)
const MOVEMENT_SPEED = 0.1; // Adjust this value to control speed
// Minimum distance threshold for stopping animation
const MIN_DISTANCE_THRESHOLD = 0;

//const stepDuration = 60000 / config.tempo;

// Ensure step duration is at least as long as audio files
// Temp solution for testing
const stepDuration = Math.max(60000 / config.tempo, 1650);

// Initialize the application
function init() {
    createNotes();
    createSequencerCells();
    createAudioElements();
    setupEventListeners();

    startPlayback();

    // Initialize divider position to 50%
    const containerWidth = appContainer.offsetWidth;
    divider.style.left = (containerWidth / 2) + 'px';

    // Set initial clip paths
    playerASide.style.clipPath = 'inset(0 50% 0 0)';
    playerBSide.style.clipPath = 'inset(0 0 0 50%)';

    // Make sure all panels are at appropriate z-index
    playerASide.style.zIndex = 2;
    playerBSide.style.zIndex = 1;
    divider.style.zIndex = 10;
}

// Create draggable notes for both players
function createNotes() {
    // Create Player A notes
    config.playerANotes.forEach(noteNumber => {
        const noteElement = createNoteElement(noteNumber, 'a');
        notesAreaA.appendChild(noteElement);
    });

    // Create Player B notes
    config.playerBNotes.forEach(noteNumber => {
        const noteElement = createNoteElement(noteNumber, 'b');
        notesAreaB.appendChild(noteElement);
    });
}

// Function to get shape class based on number
function getShapeForNote(noteNumber) {
    // Assign shapes based on note numbers
    if ([1, 3, 5].includes(noteNumber)) {
        return 'shape-triangle';
    } else if (noteNumber === 2) {
        return 'shape-diamond';
    } else if (noteNumber === 4) {
        return 'shape-circle';
    } else {
        return 'shape-square'; // Default shape
    }
}

// Function to create a note element with the appropriate shape
function createNoteElement(noteNumber, player) {
    const noteElement = document.createElement('div');

    // Get shape class based on note number
    const shapeClass = getShapeForNote(noteNumber);

    // Apply all necessary classes including shape and hollow state
    noteElement.className = `note note-${player} ${shapeClass} hollow draggable`;
    noteElement.setAttribute('data-note', noteNumber);
    noteElement.setAttribute('data-player', player);

    // Create a span for the text to allow separate styling/positioning
    const textSpan = document.createElement('span');
    textSpan.textContent = noteNumber;
    noteElement.appendChild(textSpan);

    // Create a portal counterpart for dimensional effect
    // We'll create it with the opposite styling already applied
    const oppositePlayer = player === 'a' ? 'b' : 'a';
    const portalCounterpart = document.createElement('div');
    portalCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
    portalCounterpart.setAttribute('data-note', noteNumber);
    portalCounterpart.setAttribute('data-counterpart-for', player);

    // Add span for text
    const counterpartTextSpan = document.createElement('span');
    counterpartTextSpan.textContent = noteNumber;
    portalCounterpart.appendChild(counterpartTextSpan);

    // Link the notes
    noteElement.setAttribute('data-counterpart-id', `counterpart-${player}-${noteNumber}`);
    portalCounterpart.id = `counterpart-${player}-${noteNumber}`;

    // Position notes initially (keep your existing positioning code)
    if (player === 'a') {
        // Position Player A notes on the left side
        const index = config.playerANotes.indexOf(noteNumber);
        const row = Math.floor(index / 2);
        const col = index % 2;
        noteElement.style.left = `${100 + (col * 100)}px`;
        noteElement.style.top = `${100 + (row * 100)}px`;

        // Add the portal counterpart to Player B side (initialized at the same position)
        portalCounterpart.style.left = `${100 + (col * 100)}px`;
        portalCounterpart.style.top = `${100 + (row * 100)}px`;
        playerBSide.appendChild(portalCounterpart);
    } else {
        // Position Player B notes on the right side
        const index = config.playerBNotes.indexOf(noteNumber);
        const row = Math.floor(index / 2);
        const col = index % 2;
        const rightOffset = appContainer.offsetWidth - 180;
        noteElement.style.left = `${rightOffset - (col * 100)}px`;
        noteElement.style.top = `${100 + (row * 100)}px`;

        // Add the portal counterpart to Player A side (initialized at the same position)
        portalCounterpart.style.left = `${rightOffset - (col * 100)}px`;
        portalCounterpart.style.top = `${100 + (row * 100)}px`;
        playerASide.appendChild(portalCounterpart);
    }

    // Make notes draggable with click
    makeClickDraggable(noteElement);

    return noteElement;
}

// Global state for crossover
let crossOverDetection = {
    isActive: false,
    currentArea: null // 'a' or 'b'
};

// Check which side of the screen the note is on
function checkNoteSide(x) {
    const dividerPosition = parseInt(divider.style.left);
    return x < dividerPosition ? 'a' : 'b';
}

// Make an element draggable with click
function makeClickDraggable(element) {
    // Event handler for starting a drag operation
    const startDrag = function (e) {
        e.preventDefault(); // Prevent default browser drag

        // Get offset within the element
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Initialize current position
        currentX = rect.left;
        currentY = rect.top;

        // Set initial target (same as current)
        targetX = currentX;
        targetY = currentY;

        // Set as active element
        activeNote = element;
        element.classList.add('dragging');

        // Fill the shape by removing hollow class
        element.classList.remove('hollow');

        // Set dragging state for other functions
        state.draggedNote = element;
        state.draggedNoteData = {
            note: parseInt(element.getAttribute('data-note')),
            player: element.getAttribute('data-player')
        };

        // Initialize crossover detection
        crossOverDetection.isActive = true;
        crossOverDetection.currentArea = state.draggedNoteData.player;

        // Set high z-index to be above all panels
        element.style.zIndex = '30';

        // Add dragging class to container to disable pointer events
        appContainer.classList.add('dragging-active');

        // Start the animation loop
        if (!isAnimating) {
            isAnimating = true;
            animateMovement();
        }
    };

    // Pick up on first click or touch
    element.addEventListener('mousedown', startDrag);

    // Touch version
    element.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        startDrag({
            preventDefault: () => e.preventDefault(),
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });
}

// Animate the movement of the active note
function animateMovement() {
    if (!isAnimating || !activeNote) {
        isAnimating = false;
        return;
    }

    // Calculate distance to target
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    // Check if movement is small enough to stop
    if (Math.abs(dx) < MIN_DISTANCE_THRESHOLD && Math.abs(dy) < MIN_DISTANCE_THRESHOLD) {
        // Just set to exact target
        currentX = targetX;
        currentY = targetY;
    } else {
        // Move a percentage of the distance to the target (smooth follow)
        currentX += dx * MOVEMENT_SPEED;
        currentY += dy * MOVEMENT_SPEED;
    }

    // Update the position of the active note
    activeNote.style.left = `${currentX}px`;
    activeNote.style.top = `${currentY}px`;

    // Get the portal counterpart
    const counterpartId = activeNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    if (portalCounterpart) {
        // Update position
        portalCounterpart.style.left = `${currentX}px`;
        portalCounterpart.style.top = `${currentY}px`;

        // Get divider position
        const dividerPosition = parseInt(divider.style.left);

        // Get note dimensions
        const noteRect = activeNote.getBoundingClientRect();
        const noteWidth = noteRect.width;

        // Get original player side
        const originalSide = activeNote.getAttribute('data-player');

        // Simplified crossing logic - just show/hide based on center position
        if (originalSide === 'a') {
            if (currentX + noteWidth / 2 > dividerPosition) {
                // Crossed from left to right - show counterpart
                portalCounterpart.style.opacity = "1";
                portalCounterpart.classList.add('portal-active');
                portalCounterpart.classList.remove('hollow');
            } else {
                // Not crossing - hide counterpart
                portalCounterpart.style.opacity = "1";
                portalCounterpart.classList.remove('portal-active');
                portalCounterpart.classList.add('hollow');
            }
        } else { // originalSide === 'b'
            if (currentX + noteWidth / 2 < dividerPosition) {
                // Crossed from right to left - show counterpart
                portalCounterpart.style.opacity = "1";
                portalCounterpart.classList.add('portal-active');
                portalCounterpart.classList.remove('hollow');
            } else {
                // Not crossing - hide counterpart
                portalCounterpart.style.opacity = "1";
                portalCounterpart.classList.remove('portal-active');
                portalCounterpart.classList.add('hollow');
            }
        }
    }

    // Get note dimensions for center calculation
    const rect = activeNote.getBoundingClientRect();

    // Check which side the note is on for drop targeting
    const noteSide = checkNoteSide(currentX + rect.width / 2);
    crossOverDetection.currentArea = noteSide;

    // Check if over any sequencer cell - based on the NOTE'S actual position
    checkDropTargets(currentX + rect.width / 2, currentY + rect.height / 2);

    // Continue the animation loop
    animationFrameId = requestAnimationFrame(animateMovement);
}

// Global document mouse move
document.addEventListener('mousemove', function (e) {
    if (activeNote) {
        // Update the target position (where the note should move to)
        targetX = e.clientX - offsetX;
        targetY = e.clientY - offsetY;
    }
});

// Touch move
document.addEventListener('touchmove', function (e) {
    if (activeNote) {
        const touch = e.touches[0];

        // Update the target position (where the note should move to)
        targetX = touch.clientX - offsetX;
        targetY = touch.clientY - offsetY;

        e.preventDefault(); // Prevent scrolling
    }
});

// Mouse up - drop the element
document.addEventListener('mouseup', function (e) {
    if (activeNote) {
        dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
    }
});

// Touch end
document.addEventListener('touchend', function (e) {
    if (activeNote) {
        dropActiveNote(currentX + activeNote.offsetWidth / 2, currentY + activeNote.offsetHeight / 2);
    }
});

// Drop the active note
function dropActiveNote(x, y) {
    // Stop the animation
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Check for drop on a cell
    const dropCell = document.querySelector('.sequencer-cell.drag-over');

    // Get the portal counterpart
    const counterpartId = activeNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    if (dropCell) {
        // Note is dropped on a cell - keep it filled
        handleDrop(dropCell);
    } else if (x && y) {
        // Return to hollow state when not dropped on a cell
        activeNote.classList.add('hollow');

        // Get divider position
        const dividerPosition = parseInt(divider.style.left);
        // Note is dropped outside a cell - let it stay where it was dropped
        const player = checkNoteSide(x);
        const noteNumber = parseInt(activeNote.getAttribute('data-note'));
        const originalPlayer = activeNote.getAttribute('data-player');

        // If dropped on the opposite side, update the note's player attribute
        if (player !== originalPlayer) {
            // Update the note to reflect its new side
            activeNote.setAttribute('data-player', player);
            activeNote.classList.remove(`note-${originalPlayer}`);
            activeNote.classList.add(`note-${player}`);

            // Move the note to the appropriate container
            const targetContainer = player === 'a' ? playerASide : playerBSide;

            // Remove from current container and add to target container
            if (activeNote.parentNode) {
                activeNote.parentNode.removeChild(activeNote);
            }
            targetContainer.appendChild(activeNote);

            // Remove the portal counterpart from its container
            if (portalCounterpart && portalCounterpart.parentNode) {
                portalCounterpart.parentNode.removeChild(portalCounterpart);
            }

            // Create a new portal counterpart for the transferred note
            const oppositePlayer = player === 'a' ? 'b' : 'a';
            const shapeClass = getShapeForNote(noteNumber);
            const newCounterpart = document.createElement('div');
            newCounterpart.className = `note note-${oppositePlayer} ${shapeClass} hollow portal-counterpart`;
            newCounterpart.setAttribute('data-note', noteNumber);
            newCounterpart.setAttribute('data-counterpart-for', player);
            newCounterpart.id = `counterpart-${player}-${noteNumber}`;

            // Add span for text
            const textSpan = document.createElement('span');
            textSpan.textContent = noteNumber;
            newCounterpart.appendChild(textSpan);

            newCounterpart.style.left = activeNote.style.left;
            newCounterpart.style.top = activeNote.style.top;

            // Add the new portal counterpart to the opposite side
            const counterpartContainer = player === 'a' ? playerBSide : playerASide;
            counterpartContainer.appendChild(newCounterpart);

            // Update the link in the original note
            activeNote.setAttribute('data-counterpart-id', `counterpart-${player}-${noteNumber}`);
        }
    }

    // Reset active note appearance
    activeNote.style.zIndex = '5';

    // Hide portal counterpart
    if (portalCounterpart) {
        portalCounterpart.classList.remove('portal-active');
        portalCounterpart.classList.add('hollow');
    }

    // Remove dragging class
    activeNote.classList.remove('dragging');
    activeNote = null;

    // Clear drag state
    state.draggedNote = null;
    state.draggedNoteData = null;
    crossOverDetection.isActive = false;

    // Remove highlight from all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => cell.classList.remove('drag-over'));

    // Remove dragging-active class from container
    appContainer.classList.remove('dragging-active');
}
// Handle dropping a note on a cell
function handleDrop(cell) {
    if (!state.draggedNoteData) return;

    // Stop the animation
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const position = parseInt(cell.getAttribute('data-position'));
    const player = cell.getAttribute('data-player');
    const noteNumber = state.draggedNoteData.note;
    const originalPlayer = state.draggedNoteData.player;

    // Remove existing note in this cell if any
    removeNoteFromCell(cell);

    // Add the new note to the cell
    addNoteToCell(cell, noteNumber, player);

    // Update state
    if (player === 'a') {
        state.playerACellsContent[position] = noteNumber;
    } else {
        state.playerBCellsContent[position] = noteNumber;
    }

    // Move the original note to the appropriate side based on the drop position
    const draggedNote = state.draggedNote;

    // Get the portal counterpart
    const counterpartId = draggedNote.getAttribute('data-counterpart-id');
    const portalCounterpart = document.getElementById(counterpartId);

    // Remove the portal counterpart if it exists
    if (portalCounterpart && portalCounterpart.parentNode) {
        portalCounterpart.parentNode.removeChild(portalCounterpart);
    }

    // Remove the dragged note from wherever it is
    if (draggedNote.parentNode) {
        draggedNote.parentNode.removeChild(draggedNote);
    }
}

// Create sequencer cells for both players
function createSequencerCells() {
    // Create Player A cells
    config.playerACells.forEach(position => {
        const cellElement = createCellElement(position, 'a');
        sequencerA.appendChild(cellElement);
    });

    // Create Player B cells
    config.playerBCells.forEach(position => {
        const cellElement = createCellElement(position, 'b');
        sequencerB.appendChild(cellElement);
    });
}

// Create a sequencer cell element
function createCellElement(position, player) {
    const cellElement = document.createElement('div');
    cellElement.className = 'sequencer-cell';
    cellElement.setAttribute('data-position', position);
    cellElement.setAttribute('data-player', player);

    // Add shape attribute based on position number
    // This will use the same shape logic as for notes
    const shapeClass = getShapeForNote(position);
    cellElement.setAttribute('data-note-shape', shapeClass);

    // Add position number to the cell
    const positionLabel = document.createElement('span');
    positionLabel.className = 'position-label';
    positionLabel.textContent = position;
    cellElement.appendChild(positionLabel);

    return cellElement;
}

// Create audio elements for all notes
function createAudioElements() {
    Object.entries(config.audioFiles).forEach(([noteNumber, audioPath]) => {
        const audio = document.createElement('audio');
        audio.id = `audio-${noteNumber}`;
        audio.src = audioPath;
        audio.preload = 'auto';
        audioContainer.appendChild(audio);
    });
}

// Check if a cell is a valid drop target for the current dragged note
function isValidDropTarget(cell) {
    if (!state.draggedNoteData) return false;

    const cellPlayer = cell.getAttribute('data-player');
    const notePlayer = state.draggedNoteData.player;
    const cellPosition = parseInt(cell.getAttribute('data-position'));
    const noteNumber = state.draggedNoteData.note;

    // Notes can only be dropped in cells belonging to the same player
    // AND the note number must match the cell position
    return cellPlayer === notePlayer && noteNumber === cellPosition;
}

// Check if the dragged note is over a drop target
function checkDropTargets(x, y) {
    if (!state.draggedNote) return;

    // Remove highlight from all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => cell.classList.remove('drag-over'));

    // Check if the note is over any cell
    cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        const inBounds = (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );

        // If in bounds and a valid target, highlight the cell
        if (inBounds) {
            const validTarget = isValidDropTarget(cell);
            if (validTarget) {
                cell.classList.add('drag-over');
            }
        }
    });
}

// Remove a note from a cell
function removeNoteFromCell(cell) {
    // Remove existing note element if any
    const existingNote = cell.querySelector('.note-in-cell');
    if (existingNote) {
        cell.removeChild(existingNote);
    }

    // Remove the has-note class
    cell.classList.remove('has-note');

    // Update state
    const position = parseInt(cell.getAttribute('data-position'));
    const player = cell.getAttribute('data-player');

    if (player === 'a') {
        delete state.playerACellsContent[position];
    } else {
        delete state.playerBCellsContent[position];
    }
}

// And similarly for the function that adds notes to cells
function addNoteToCell(cell, noteNumber, player) {
    // Get shape class for this note
    const shapeClass = getShapeForNote(noteNumber);

    // Create a clone of the note to display in the cell
    const noteClone = document.createElement('div');

    // Notes in cells should be filled (not hollow)
    noteClone.className = `note note-${player} ${shapeClass} note-in-cell`;
    noteClone.setAttribute('data-note', noteNumber);

    // Add a span for the text
    const textSpan = document.createElement('span');
    textSpan.textContent = noteNumber;
    noteClone.appendChild(textSpan);

    // Add note to cell
    cell.appendChild(noteClone);

    // Add the has-note class
    cell.classList.add('has-note');
}

// Set up note drag and drop events
function setupNoteDragEvents() {
    // The note event listeners are now set up in makeClickDraggable function
    // and global document event listeners

    // Set up cells as drop targets
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => {
        // These are now handled in the global checkDropTargets function
        // We keep the cell setup for any additional cell-specific functionality
    });
}

// Start the sequencer playback
function startPlayback() {
    if (state.isPlaying) return;

    state.isPlaying = true;
    state.currentStep = 0;

    // Update button state
    playButton.disabled = true;
    stopButton.disabled = false;

    // Start the interval
    playStep(); // Play the first step immediately
    state.intervalId = setInterval(playStep, stepDuration);
}

// Play a single step of the sequence
function playStep() {
    // Calculate which position to play (1-based)
    const currentPosition = state.currentStep + 1;

    // Find all cells at the current position
    highlightActivePosition(currentPosition);

    // Player A cell
    if (config.playerACells.includes(currentPosition)) {
        const noteNumber = state.playerACellsContent[currentPosition];
        if (noteNumber) {
            playSound(noteNumber);
        }
    }

    // Player B cell
    if (config.playerBCells.includes(currentPosition)) {
        const noteNumber = state.playerBCellsContent[currentPosition];
        if (noteNumber) {
            playSound(noteNumber);
        }
    }

    // Move to the next step
    state.currentStep = (state.currentStep + 1) % config.totalCells;
}

// Highlight the active position during playback
function highlightActivePosition(position) {
    // Remove existing highlights
    const allCells = document.querySelectorAll('.sequencer-cell');
    allCells.forEach(cell => cell.classList.remove('active'));

    // Add highlight to cells at the current position
    const activeCells = document.querySelectorAll(`.sequencer-cell[data-position="${position}"]`);
    activeCells.forEach(cell => cell.classList.add('active'));
}

// Play a sound for a note
function playSound(noteNumber) {
    const audio = document.getElementById(`audio-${noteNumber}`);
    if (audio) {
        // Reset the audio to start
        audio.currentTime = 0;
        audio.play();
    }
}

// Stop the sequencer playback
function stopPlayback() {
    if (!state.isPlaying) return;

    // Clear the interval
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.isPlaying = false;

    // Update button state
    playButton.disabled = false;
    stopButton.disabled = true;

    // Remove highlights
    const allCells = document.querySelectorAll('.sequencer-cell');
    allCells.forEach(cell => cell.classList.remove('active'));
}

// Reset the sequencer
function resetSequencer() {
    // Stop playback if running
    stopPlayback();

    // Clear all cells
    const cells = document.querySelectorAll('.sequencer-cell');
    cells.forEach(cell => {
        removeNoteFromCell(cell);
    });

    // Reset state
    state.playerACellsContent = {};
    state.playerBCellsContent = {};
    state.currentStep = 0;

    // Clear the notes areas
    notesAreaA.innerHTML = '';
    notesAreaB.innerHTML = '';

    // Recreate all original notes
    createNotes();
}

// Set up the divider drag functionality
function setupDividerDrag() {
    let isDraggingDivider = false;
    let startX = 0;
    let startPosition = 50; // Percentage position

    // Mouse events
    divider.addEventListener('mousedown', startDividerDrag);
    document.addEventListener('mousemove', moveDivider);
    document.addEventListener('mouseup', stopDividerDrag);

    // Touch events for mobile
    divider.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        startDividerDrag({ clientX: touch.clientX });
        e.preventDefault();
    });

    document.addEventListener('touchmove', function (e) {
        if (!isDraggingDivider) return;
        const touch = e.touches[0];
        moveDivider({ clientX: touch.clientX });
        e.preventDefault(); // Prevent scrolling while dragging
    });

    document.addEventListener('touchend', stopDividerDrag);

    function startDividerDrag(e) {
        isDraggingDivider = true;
        startX = e.clientX;

        // Get current position from the divider's left value
        const dividerLeft = parseInt(divider.style.left) || appContainer.offsetWidth / 2;
        startPosition = (dividerLeft / appContainer.offsetWidth) * 100;

        divider.classList.add('dragging');
    }

    function moveDivider(e) {
        if (!isDraggingDivider) return;

        const containerWidth = appContainer.offsetWidth;
        const mouseX = e.clientX;

        // Calculate percentage position (0-100)
        let newPosition = startPosition + ((mouseX - startX) / containerWidth) * 100;
        newPosition = Math.max(0, Math.min(100, newPosition));

        // Update divider position
        const dividerPos = (newPosition / 100) * containerWidth;
        divider.style.left = `${dividerPos}px`;

        // Update clip paths for both panels
        playerASide.style.clipPath = `inset(0 ${100 - newPosition}% 0 0)`;
        playerBSide.style.clipPath = `inset(0 0 0 ${newPosition}%)`;
    }

    function stopDividerDrag() {
        isDraggingDivider = false;
        divider.classList.remove('dragging');
    }

    // Add window resize handler
    window.addEventListener('resize', function () {
        // Get current percentage position
        const dividerLeft = parseInt(divider.style.left) || appContainer.offsetWidth / 2;
        const currentPosition = (dividerLeft / appContainer.offsetWidth) * 100;

        // Recalculate divider position based on percentage
        const newLeft = (currentPosition / 100) * appContainer.offsetWidth;
        divider.style.left = `${newLeft}px`;
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Divider drag events
    setupDividerDrag();

    // Note drag events
    setupNoteDragEvents();

    // Playback control buttons
    playButton.addEventListener('click', startPlayback);
    stopButton.addEventListener('click', stopPlayback);
    resetButton.addEventListener('click', resetSequencer);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);