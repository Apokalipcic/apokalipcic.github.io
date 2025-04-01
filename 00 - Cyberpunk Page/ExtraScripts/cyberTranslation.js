/* cyberTranslation.js - Japanese to English text translation with cyberpunk style
 * Three translation modes:
 * 1. Hover: Text translates on container hover, reverts when hover ends
 * 2. Click: Text translates permanently when container is clicked
 * 3. Auto: Text automatically translates with typewriter-like effect
 */

// Configuration for translation effects
const TRANSLATION_CONFIG = {
  // Glitch effect configuration
  glitch: {
    duration: 500,            // Duration of glitch animation in ms
    intensity: 3              // Glitch intensity (1-5)
  },
  
  // Auto-translate configuration
  auto: {
    initialDelay: 1000,       // Initial delay before starting translation
    charDelay: 50,            // Delay between each character translation
    batchSize: 3,             // Characters to translate in each batch
    useTypewriter: true       // Whether to use typewriter effect from main script
  },
  
  // Scanner effect configuration 
  scanner: {
    duration: 2000,           // Scanner animation duration
    color: 'var(--colors-secondary--500)'
  },
  
  // Class names
  classes: {
    container: 'cyber-translate',
    hover: 'translate-hover',
    click: 'translate-click',
    auto: 'translate-auto',
    translating: 'translating',
    translated: 'translated',
    glitching: 'glitching',
    japanese: 'jp-text',
    english: 'en-text',
    dataAttrs: {
      jp: 'data-jp',
      en: 'data-en',
      mode: 'data-translate-mode'
    }
  },
  
  // Debug mode
  debug: false
};

// CyberTranslation class for managing translation containers
class CyberTranslation {
  constructor(config = {}) {
    // Merge custom config with defaults
    this.config = { ...TRANSLATION_CONFIG };
    if (config) {
      Object.keys(config).forEach(key => {
        if (typeof config[key] === 'object') {
          this.config[key] = { ...this.config[key], ...config[key] };
        } else {
          this.config[key] = config[key];
        }
      });
    }
    
    this.containers = [];
    this.initialized = false;
  }
  
  // Initialize all translatable containers
  init() {
    if (this.initialized) return;
    
    const containerSelector = `.${this.config.classes.container}`;
    const containers = document.querySelectorAll(containerSelector);
    
    containers.forEach(container => {
      this.setupContainer(container);
    });
    
    this.initialized = true;
    
    if (this.config.debug) {
      console.log(`CyberTranslation initialized with ${containers.length} containers`);
    }
    
    return this;
  }
  
  // Set up a single translation container
  setupContainer(container) {
    // Get translation mode from container
    const mode = container.getAttribute(this.config.classes.dataAttrs.mode) || 
                  (container.classList.contains(this.config.classes.hover) ? 'hover' : 
                   (container.classList.contains(this.config.classes.click) ? 'click' : 
                    (container.classList.contains(this.config.classes.auto) ? 'auto' : 'hover')));
    
    // Find all translatable elements in this container
    const translatables = this.findTranslatableElements(container);
    
    if (translatables.length === 0) return;
    
    // Store container data
    const containerData = {
      element: container,
      mode: mode,
      translatables: translatables,
      isTranslated: false,
      isTranslating: false
    };
    
    this.containers.push(containerData);
    
    // Add appropriate event handlers based on mode
    if (mode === 'hover') {
      container.addEventListener('mouseenter', () => this.startTranslation(containerData, false));
      container.addEventListener('mouseleave', () => this.revertTranslation(containerData));
    } else if (mode === 'click') {
      container.addEventListener('click', () => this.startTranslation(containerData, true));
    } else if (mode === 'auto') {
      // Set a timeout to start the auto translation
      setTimeout(() => {
        this.startAutoTranslation(containerData);
      }, this.config.auto.initialDelay);
    }
    
    // Add scanner effect if the main script has it
    if (typeof initScannerEffects === 'function') {
      container.classList.add('scanner-effect');
    }
    
    if (this.config.debug) {
      console.log(`Container setup: Mode: ${mode}, Translatables: ${translatables.length}`);
    }
  }
  
  // Find all elements with translation data
  findTranslatableElements(container) {
    const elements = [];
    const jpAttr = this.config.classes.dataAttrs.jp;
    const enAttr = this.config.classes.dataAttrs.en;
    
    // Find elements with both Japanese and English data attributes
    const directElements = container.querySelectorAll(`[${jpAttr}][${enAttr}]`);
    directElements.forEach(el => {
      elements.push({
        element: el,
        japanese: el.getAttribute(jpAttr),
        english: el.getAttribute(enAttr),
        isTranslated: false
      });
    });
    
    return elements;
  }
  
  // Start translation process on a container
  startTranslation(containerData, permanent = false) {
    if (containerData.isTranslating || (permanent && containerData.isTranslated)) return;
    
    containerData.isTranslating = true;
    containerData.element.classList.add(this.config.classes.translating);
    
    // Apply glitch effect
    this.applyGlitchEffect(containerData.element);
    
    // Mark all elements as translating
    containerData.translatables.forEach(item => {
      this.translateElement(item.element, item.japanese, item.english);
      item.isTranslated = true;
    });
    
    if (permanent) {
      containerData.isTranslated = true;
      containerData.element.classList.add(this.config.classes.translated);
    }
    
    return containerData;
  }
  
  // Revert translation (for hover mode)
  revertTranslation(containerData) {
    if (containerData.isTranslated) return;
    
    containerData.isTranslating = false;
    containerData.element.classList.remove(this.config.classes.translating);
    
    // Apply glitch effect
    this.applyGlitchEffect(containerData.element);
    
    // Revert all elements
    containerData.translatables.forEach(item => {
      this.revertElement(item.element, item.japanese);
      item.isTranslated = false;
    });
    
    return containerData;
  }
  
  // Apply glitch effect to a container
  applyGlitchEffect(element) {
    element.classList.add(this.config.classes.glitching);
    
    // Remove glitch class after animation duration
    setTimeout(() => {
      element.classList.remove(this.config.classes.glitching);
    }, this.config.glitch.duration);
    
    // If using main script's glitch function
    if (typeof applyGlitch === 'function') {
      applyGlitch(element, this.config.glitch.duration);
    }
  }
  
  // Translate a single element
  translateElement(element, japanese, english) {
    // If the element has innerHTML, we update it
    if (element.innerHTML === japanese) {
      element.innerHTML = english;
    }
    // Otherwise, set a custom attribute to indicate it's translated
    element.setAttribute('data-translated', 'true');
    
    // Add translated class
    element.classList.add('translated-text');
    
    // Apply custom translation CSS if needed
    element.style.color = 'var(--colors-tertiary--500)';
    element.style.textShadow = '0 0 5px rgba(254, 211, 63, 0.3)';
  }
  
  // Revert a single element to Japanese
  revertElement(element, japanese) {
    // If the element had its innerHTML updated, revert it
    if (element.getAttribute('data-translated') === 'true') {
      element.innerHTML = japanese;
    }
    
    // Remove translated indicator
    element.removeAttribute('data-translated');
    element.classList.remove('translated-text');
    
    // Remove custom styling
    element.style.color = '';
    element.style.textShadow = '';
  }
  
  // Start auto translation with typewriter effect
  startAutoTranslation(containerData) {
    containerData.isTranslating = true;
    containerData.element.classList.add(this.config.classes.translating);
    
    // Apply glitch effect
    this.applyGlitchEffect(containerData.element);
    
    // Use typewriter effect if available in main script
    if (this.config.auto.useTypewriter && typeof typeWriter === 'function') {
      this.autoTranslateWithTypewriter(containerData);
    } else {
      this.autoTranslateBasic(containerData);
    }
    
    containerData.isTranslated = true;
    containerData.element.classList.add(this.config.classes.translated);
  }
  
  // Auto translate with typewriter effect from main script
  autoTranslateWithTypewriter(containerData) {
    // Process each translatable sequentially
    let currentIndex = 0;
    
    const processNext = () => {
      if (currentIndex >= containerData.translatables.length) {
        // All done
        containerData.isTranslating = false;
        return;
      }
      
      const item = containerData.translatables[currentIndex];
      const el = item.element;
      
      // Prepare for typewriter
      el.innerHTML = '';
      
      // Use the typewriter function from main script
      typeWriter(el, item.english, 0, this.config.auto.charDelay, () => {
        // Mark as translated
        item.isTranslated = true;
        
        // Move to next element
        currentIndex++;
        setTimeout(processNext, 300);
      });
    };
    
    // Start the sequence
    processNext();
  }
  
  // Basic auto translate for when typewriter is not available
  autoTranslateBasic(containerData) {
    const { translatables } = containerData;
    const totalElements = translatables.length;
    
    // Process elements in batches
    let processedCount = 0;
    const batchSize = this.config.auto.batchSize;
    
    const processNextBatch = () => {
      if (processedCount >= totalElements) {
        containerData.isTranslating = false;
        return;
      }
      
      // Get the current batch
      const currentBatch = translatables.slice(
        processedCount, 
        Math.min(processedCount + batchSize, totalElements)
      );
      
      // Process this batch
      currentBatch.forEach(item => {
        this.translateElement(item.element, item.japanese, item.english);
        item.isTranslated = true;
      });
      
      // Update counter
      processedCount += currentBatch.length;
      
      // Schedule next batch
      setTimeout(processNextBatch, this.config.auto.charDelay * batchSize);
    };
    
    // Start processing
    processNextBatch();
  }
  
  // Translate all containers at once
  translateAll(permanent = true) {
    this.containers.forEach(container => {
      this.startTranslation(container, permanent);
    });
    
    return this;
  }
  
  // Revert all containers
  revertAll() {
    this.containers.forEach(container => {
      if (!container.isTranslated) {
        this.revertTranslation(container);
      }
    });
    
    return this;
  }
  
  // Create a new translatable container dynamically
  createContainer(element, mode = 'hover') {
    if (!element) return null;
    
    // Add necessary classes
    element.classList.add(this.config.classes.container);
    element.classList.add(`translate-${mode}`);
    element.setAttribute(this.config.classes.dataAttrs.mode, mode);
    
    // Set up the container
    this.setupContainer(element);
    
    return element;
  }
  
  // Add translatable text to an element
  addTranslatableText(element, japanese, english) {
    if (!element) return null;
    
    // Set data attributes
    element.setAttribute(this.config.classes.dataAttrs.jp, japanese);
    element.setAttribute(this.config.classes.dataAttrs.en, english);
    
    // Default to showing Japanese text
    element.textContent = japanese;
    
    return element;
  }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Create global instance
  window.cyberTranslator = new CyberTranslation();
  window.cyberTranslator.init();
});

// Export the class for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CyberTranslation };
}