/* text-scramble.js - Cyberpunk Text Scrambling Effect
 * 
 * This script provides a text scrambling effect for Cyberpunk 2077 styled pages
 * with three modes:
 * 1. Finite Mode: Text scrambles then settles on the target text after a duration
 * 2. Infinite Mode: Text scrambles and occasionally settles on target text before scrambling again
 * 3. Infinite Random Mode: Text continuously scrambles without settling, maintaining same length
 */

// Global configuration for text scramble effects
const SCRAMBLE_CONFIG = {
  // Character set used for randomization
  chars: '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  
  // Finite mode configuration
  finite: {
    duration: 2000,          // Default duration for finite scramble in ms
    minStaggerStart: 0,      // Minimum start time for character scrambling
    maxStaggerStart: 40,     // Maximum start time for character scrambling
    minStaggerLength: 20,    // Minimum frames that a character scrambles for
    maxStaggerLength: 60     // Maximum frames that a character scrambles for
  },
  
  // Infinite mode configuration
  infinite: {
    resetChance: 0.05,       // Chance to start scrambling again (per frame)
    charResetChance: 0.3,    // Chance of a character being scrambled during reset
    stableTime: 2000,        // Minimum time to remain stable when fully formed
    staggerRange: 40,        // Range for staggered character animations
    completionThreshold: 0.8 // Percentage of characters that must be complete before reset chance
  },
  
  // Random mode configuration
  random: {
    changeFrequency: 0.3,    // Chance per frame of a character changing
    preserveSpaces: true     // Whether to preserve spaces in random mode
  },
  
  // Global settings
  frameRate: 30,             // Target frame rate for animation
  autoInitialize: true,      // Whether to auto-initialize elements with data-scramble
  preserveSpaces: true,      // Whether to preserve spaces in all modes
  preserveHTML: true,        // Whether to parse and preserve HTML in scrambled text
  debugMode: false           // Enable console logging for debugging
};

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = SCRAMBLE_CONFIG.chars;
    this.queue = [];
    this.frameRequest = null;
    this.frameCount = 0;
    this.isRunning = false;
    this.mode = 'finite'; // Default mode (finite, infinite, random)
    this.originalText = '';
    this.lastCompleteTime = 0;
    this.resolvePromise = null;
  }

  // Initialize the scramble effect
  setText(newText, mode = 'finite', customConfig = {}) {
    // Merge custom config with defaults
    const config = { ...SCRAMBLE_CONFIG };
    if (customConfig) {
      Object.keys(customConfig).forEach(key => {
        if (typeof customConfig[key] === 'object') {
          config[key] = { ...config[key], ...customConfig[key] };
        } else {
          config[key] = customConfig[key];
        }
      });
    }
    
    // Store the original text and update mode
    this.originalText = newText;
    this.mode = mode;
    this.config = config;
    
    // Reset animation state
    this.queue = [];
    this.frameCount = 0;
    this.lastCompleteTime = 0;
    
    // Parse HTML if needed
    let characters = [];
    let htmlMap = null;
    
    if (config.preserveHTML && newText.includes('<')) {
      ({ characters, htmlMap } = this.parseHTML(newText));
    } else {
      characters = newText.split('');
    }
    
    // Create animation queue
    for (let i = 0; i < characters.length; i++) {
      const from = this.randomChar();
      const to = mode === 'random' ? null : characters[i];
      const isSpace = characters[i] === ' ';
      
      // Apply different stagger settings based on mode
      let start, end;
      
      if (mode === 'finite') {
        start = Math.floor(Math.random() * 
          (config.finite.maxStaggerStart - config.finite.minStaggerStart)) + 
          config.finite.minStaggerStart;
        
        end = start + Math.floor(Math.random() * 
          (config.finite.maxStaggerLength - config.finite.minStaggerLength)) + 
          config.finite.minStaggerLength;
      } else {
        start = Math.floor(Math.random() * config.infinite.staggerRange);
        end = start + Math.floor(Math.random() * config.infinite.staggerRange) + 20;
      }
      
      this.queue.push({
        from,
        to,
        start,
        end,
        char: from,
        isSpace,
        htmlTag: htmlMap ? htmlMap[i] : null
      });
    }

    // Cancel any existing animation
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    
    // Start animation
    this.isRunning = true;
    this.frameRequest = requestAnimationFrame(() => this.update());
    
    // Return a promise that resolves when animation completes (for finite mode)
    return new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }

  // Parse HTML and return characters with HTML mapping
  parseHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const characters = [];
    const htmlMap = [];
    
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Process text node
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          characters.push(text[i]);
          htmlMap.push(null);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Process element node
        const openTag = node.outerHTML.substring(0, node.outerHTML.indexOf('>') + 1);
        const closeTag = `</${node.nodeName.toLowerCase()}>`;
        
        // Add opening tag
        characters.push(' '); // Space as placeholder for tag
        htmlMap.push({ isTag: true, tag: openTag });
        
        // Process children
        Array.from(node.childNodes).forEach(child => {
          processNode(child);
        });
        
        // Add closing tag
        characters.push(' '); // Space as placeholder for tag
        htmlMap.push({ isTag: true, tag: closeTag });
      }
    }
    
    Array.from(tempDiv.childNodes).forEach(node => {
      processNode(node);
    });
    
    return { characters, htmlMap };
  }

  // Stop the animation
  stop() {
    this.isRunning = false;
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
    
    // Resolve promise if it exists
    if (this.resolvePromise) {
      this.resolvePromise();
      this.resolvePromise = null;
    }
  }

  // Generate a random character
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  // The animation loop
  update() {
    // Exit if not running
    if (!this.isRunning) return;
    
    let complete = 0;
    let output = '';
    const config = this.config;
    
    // Process each character in the queue
    for (let i = 0; i < this.queue.length; i++) {
      const { from, to, start, end, char, isSpace, htmlTag } = this.queue[i];
      
      // Handle HTML tags
      if (htmlTag && htmlTag.isTag) {
        output += htmlTag.tag;
        continue;
      }
      
      // Different behavior based on mode
      if (this.mode === 'random') {
        // Handle spaces in random mode
        if (isSpace && config.random.preserveSpaces) {
          output += ' ';
          continue;
        }
        
        // Random mode: Change characters randomly based on frequency
        if (Math.random() < config.random.changeFrequency) {
          this.queue[i].char = this.randomChar();
        }
        output += this.queue[i].char;
      } else {
        // Finite and Infinite modes
        
        // Preserve spaces if configured
        if (isSpace && config.preserveSpaces) {
          output += ' ';
          complete++;
          continue;
        }
        
        const frameCount = this.frameCount;
        
        if (frameCount < start) {
          // Not started scrambling yet
          output += from;
        } else if (frameCount >= start && frameCount < end) {
          // Scrambling phase
          this.queue[i].char = this.randomChar();
          output += this.queue[i].char;
        } else {
          // Finished scrambling
          output += to;
          complete++;
        }
      }
    }
    
    // Update the element text
    this.el.innerHTML = output;
    
    // Handle completion logic based on mode
    if (this.mode === 'finite' && complete === this.queue.length) {
      // Finite mode: end animation when done
      this.isRunning = false;
      if (this.resolvePromise) {
        this.resolvePromise();
        this.resolvePromise = null;
      }
    } else if (this.mode === 'infinite') {
      const totalChars = this.queue.filter(q => !q.isSpace && (!q.htmlTag || !q.htmlTag.isTag)).length;
      const completionRatio = complete / totalChars;
      const now = Date.now();
      
      // For infinite mode, check if we should reset
      if (completionRatio >= config.infinite.completionThreshold) {
        // If we've been in a completed state for the stable time, check for reset
        if (complete === totalChars) {
          if (this.lastCompleteTime === 0) {
            this.lastCompleteTime = now;
          } else if (now - this.lastCompleteTime > config.infinite.stableTime) {
            // Check for reset chance
            if (Math.random() < config.infinite.resetChance) {
              this.resetScramble();
            }
          }
        }
      }
    }
    
    // Continue animation
    if (this.isRunning) {
      this.frameCount++;
      this.frameRequest = requestAnimationFrame(() => this.update());
    }
    
    // Debug logging
    if (config.debugMode && this.frameCount % 30 === 0) {
      console.log(`Mode: ${this.mode}, Frame: ${this.frameCount}, Complete: ${complete}/${this.queue.length}`);
    }
  }
  
  // Reset scramble for infinite mode
  resetScramble() {
    if (SCRAMBLE_CONFIG.debugMode) {
      console.log('Resetting scramble animation');
    }
    
    this.frameCount = 0;
    this.lastCompleteTime = 0;
    
    const config = this.config;
    
    // Reset the queue for scrambling again
    for (let i = 0; i < this.queue.length; i++) {
      // Skip spaces and HTML tags
      if (this.queue[i].isSpace || (this.queue[i].htmlTag && this.queue[i].htmlTag.isTag)) {
        continue;
      }
      
      // Reset animation timing
      const start = Math.floor(Math.random() * config.infinite.staggerRange);
      const end = start + Math.floor(Math.random() * config.infinite.staggerRange) + 20;
      
      this.queue[i].start = start;
      this.queue[i].end = end;
      
      // Only scramble some characters based on probability
      if (Math.random() < config.infinite.charResetChance) {
        this.queue[i].char = this.randomChar();
      }
    }
  }
}

// Helper function to create and start text scramble on an element
function createTextScramble(selector, text, mode = 'finite', customConfig = {}) {
  const element = typeof selector === 'string' ? 
    document.querySelector(selector) : selector;
    
  if (!element) {
    if (SCRAMBLE_CONFIG.debugMode) {
      console.error(`Element not found: ${selector}`);
    }
    return null;
  }
  
  // Store original text if not provided
  if (!text) {
    text = element.textContent;
  }
  
  // Prepare configuration
  let config = {};
  
  // If customConfig is a number, assume it's duration for backward compatibility
  if (typeof customConfig === 'number') {
    config = { finite: { duration: customConfig } };
  } else {
    config = customConfig;
  }
  
  // Create scrambler instance
  const scrambler = new TextScramble(element);
  
  // Start scrambling
  const promise = scrambler.setText(text, mode, config);
  
  // For finite mode, automatically set text after duration
  if (mode === 'finite') {
    const duration = config.finite?.duration || SCRAMBLE_CONFIG.finite.duration;
    setTimeout(() => {
      if (element) {
        element.innerHTML = text;
      }
    }, duration);
  }
  
  // Store scrambler instance for later reference
  element._scrambler = scrambler;
  
  return scrambler;
}

// Initialize all scramblers with data attributes
function initAllScramblers() {
  if (!SCRAMBLE_CONFIG.autoInitialize) return;
  
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const mode = el.getAttribute('data-scramble-mode') || 'finite';
    const duration = parseInt(el.getAttribute('data-scramble-duration')) || SCRAMBLE_CONFIG.finite.duration;
    const text = el.getAttribute('data-scramble-text') || el.innerHTML;
    
    // Parse custom config if available
    let customConfig = {};
    if (el.hasAttribute('data-scramble-config')) {
      try {
        customConfig = JSON.parse(el.getAttribute('data-scramble-config'));
      } catch (e) {
        if (SCRAMBLE_CONFIG.debugMode) {
          console.error('Invalid data-scramble-config JSON:', e);
        }
      }
    }
    
    // Apply duration if specified
    if (duration && !customConfig.finite) {
      customConfig.finite = { duration };
    }
    
    const scrambler = new TextScramble(el);
    scrambler.setText(text, mode, customConfig);
    
    // Store scrambler instance for later reference
    el._scrambler = scrambler;
    
    // For finite mode, automatically stop after duration
    if (mode === 'finite') {
      setTimeout(() => {
        el.innerHTML = text;
      }, duration);
    }
  });
}

// Apply scramble effect to all elements matching a selector
function scrambleElements(selector, text, mode = 'finite', customConfig = {}) {
  const elements = document.querySelectorAll(selector);
  const scramblers = [];
  
  elements.forEach(el => {
    const scrambler = createTextScramble(el, text || el.innerHTML, mode, customConfig);
    if (scrambler) {
      scramblers.push(scrambler);
    }
  });
  
  return scramblers;
}

// Expose to window
window.TextScramble = TextScramble;
window.createTextScramble = createTextScramble;
window.initAllScramblers = initAllScramblers;
window.scrambleElements = scrambleElements;
window.SCRAMBLE_CONFIG = SCRAMBLE_CONFIG;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', initAllScramblers);