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
  playerACells: [1, 3, 5, 7],      // Cell positions for Player A (1-based)
  playerBCells: [2, 4, 6, 8],      // Cell positions for Player B (1-based)
  playerANotes: [1, 2, 3, 4],      // Note numbers for Player A
  playerBNotes: [5, 6, 7, 8],      // Note numbers for Player B
  audioFiles: {                    // Audio file paths for each note
    1: 'audio/note1.mp3',          // Replace with actual paths to audio files
    2: 'audio/note2.mp3',
    3: 'audio/note3.mp3',
    4: 'audio/note4.mp3',
    5: 'audio/note5.mp3',
    6: 'audio/note6.mp3',
    7: 'audio/note7.mp3',
    8: 'audio/note8.mp3',
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

// Calculate step duration in milliseconds from tempo
const stepDuration = 60000 / config.tempo;

// Initialize the application
function init() {
  createNotes();
  createSequencerCells();
  createAudioElements();
  setupEventListeners();
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

// Create a note element
function createNoteElement(noteNumber, player) {
  const noteElement = document.createElement('div');
  noteElement.className = `note note-${player}`;
  noteElement.setAttribute('data-note', noteNumber);
  noteElement.setAttribute('data-player', player);
  noteElement.setAttribute('draggable', 'true');
  noteElement.textContent = noteNumber;
  return noteElement;
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

// Set up the divider drag functionality
function setupDividerDrag() {
  let isDraggingDivider = false;
  let startX = 0;
  let startLeft = 0;
  
  // Mouse events
  divider.addEventListener('mousedown', startDividerDrag);
  document.addEventListener('mousemove', moveDivider);
  document.addEventListener('mouseup', stopDividerDrag);
  
  // Touch events for mobile
  divider.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    startDividerDrag({ clientX: touch.clientX });
  });
  
  document.addEventListener('touchmove', function(e) {
    if (!isDraggingDivider) return;
    const touch = e.touches[0];
    moveDivider({ clientX: touch.clientX });
    e.preventDefault(); // Prevent scrolling while dragging
  });
  
  document.addEventListener('touchend', stopDividerDrag);
  
  function startDividerDrag(e) {
    isDraggingDivider = true;
    startX = e.clientX;
    startLeft = divider.offsetLeft;
    divider.classList.add('dragging');
  }
  
  function moveDivider(e) {
    if (!isDraggingDivider) return;
    
    const containerWidth = appContainer.offsetWidth;
    const newLeft = Math.max(100, Math.min(containerWidth - 100, startLeft + e.clientX - startX));
    const leftPercent = (newLeft / containerWidth) * 100;
    
    // Update divider position
    divider.style.left = `${leftPercent}%`;
    
    // Update panel widths
    playerASide.style.width = `${leftPercent}%`;
    playerBSide.style.width = `${100 - leftPercent}%`;
  }
  
  function stopDividerDrag() {
    isDraggingDivider = false;
    divider.classList.remove('dragging');
  }
}

// Set up note drag and drop events
function setupNoteDragEvents() {
  // Get all notes (we'll need to call this again if notes are created dynamically)
  const notes = document.querySelectorAll('.note');
  
  notes.forEach(note => {
    // Drag start
    note.addEventListener('dragstart', function(e) {
      state.draggedNote = this;
      state.draggedNoteData = {
        note: parseInt(this.getAttribute('data-note')),
        player: this.getAttribute('data-player')
      };
      
      // Add dragging class for styling
      this.classList.add('dragging');
      
      // Required for Firefox
      e.dataTransfer.setData('text/plain', '');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    // Drag end
    note.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      state.draggedNote = null;
      state.draggedNoteData = null;
    });
  });
  
  // Set up drop targets (sequencer cells)
  const cells = document.querySelectorAll('.sequencer-cell');
  
  cells.forEach(cell => {
    // When dragged note enters a cell
    cell.addEventListener('dragenter', function(e) {
      e.preventDefault();
      if (isValidDropTarget(this)) {
        this.classList.add('drag-over');
      }
    });
    
    // When dragged note is over a cell
    cell.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (isValidDropTarget(this)) {
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    });
    
    // When dragged note leaves a cell
    cell.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    
    // When note is dropped on a cell
    cell.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      
      if (isValidDropTarget(this) && state.draggedNoteData) {
        const position = parseInt(this.getAttribute('data-position'));
        const player = this.getAttribute('data-player');
        const noteNumber = state.draggedNoteData.note;
        
        // Remove existing note in this cell if any
        removeNoteFromCell(this);
        
        // Add the new note to the cell
        addNoteToCell(this, noteNumber, player);
        
        // Update state
        if (player === 'a') {
          state.playerACellsContent[position] = noteNumber;
        } else {
          state.playerBCellsContent[position] = noteNumber;
        }
      }
    });
  });
}

// Check if a cell is a valid drop target for the current dragged note
function isValidDropTarget(cell) {
  if (!state.draggedNoteData) return false;
  
  const cellPlayer = cell.getAttribute('data-player');
  const notePlayer = state.draggedNoteData.player;
  
  // Notes can only be dropped in cells belonging to the same player
  return cellPlayer === notePlayer;
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

// Add a note to a cell
function addNoteToCell(cell, noteNumber, player) {
  // Create a clone of the note to display in the cell
  const noteClone = document.createElement('div');
  noteClone.className = `note note-${player} note-in-cell`;
  noteClone.setAttribute('data-note', noteNumber);
  noteClone.textContent = noteNumber;
  
  // Add note to cell
  cell.appendChild(noteClone);
  
  // Add the has-note class
  cell.classList.add('has-note');
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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
