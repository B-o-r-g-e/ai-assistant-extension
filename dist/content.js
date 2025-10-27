// Content script for floating AI assistant button (Grammarly-style)
// Refactored for stability and persistence

let floatingButton = null;
let selectedText = '';
let isMenuOpen = false;
let hideTimeout = null;
let selectionInProgress = false;

// Create the floating button (only once)
function createFloatingButton() {
  if (floatingButton) return floatingButton;

  floatingButton = document.createElement('div');
  floatingButton.id = 'ai-assistant-floating-btn';
  floatingButton.setAttribute('data-ai-assistant', 'true');

  floatingButton.innerHTML = `
    <div class="ai-assistant-tooltip">
      <button class="ai-btn-main" title="AI Assistant">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </button>
      <div class="ai-menu">
        <div class="ai-menu-section">
          <div class="ai-menu-title">📚 Study</div>
          <button data-action="summarize" class="ai-menu-item">Summarize</button>
          <button data-action="proofread" class="ai-menu-item">Proofread</button>
        </div>
        <div class="ai-menu-section">
          <div class="ai-menu-title">💼 Career</div>
          <button data-action="generate-cover-letter" class="ai-menu-item">Cover Letter</button>
          <button data-action="rephrase" class="ai-menu-item">Rephrase</button>
          <button data-action="extract-skills" class="ai-menu-item">Extract Skills</button>
        </div>
        <div class="ai-menu-section">
          <div class="ai-menu-title">✈️ Travel</div>
          <button data-action="translate" class="ai-menu-item">Translate</button>
          <button data-action="travel-insights" class="ai-menu-item">Travel Info</button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #ai-assistant-floating-btn {
      position: fixed;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: auto;
      display: none;
    }
    
    #ai-assistant-floating-btn.visible {
      display: block;
    }

    .ai-assistant-tooltip {
      position: relative;
    }

    .ai-btn-main {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s ease;
    }

    .ai-btn-main:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .ai-menu {
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      padding: 8px;
      min-width: 220px;
      border: 1px solid rgba(0,0,0,0.08);
      display: none;
    }

    .ai-menu.open {
      display: block;
    }

    .ai-menu-section {
      margin-bottom: 8px;
    }

    .ai-menu-section:last-child {
      margin-bottom: 0;
    }

    .ai-menu-title {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      padding: 6px 10px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ai-menu-item {
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: background 0.15s;
      display: block;
    }

    .ai-menu-item:hover {
      background: #f0f0f0;
    }

    .ai-menu-item:active {
      background: #e0e0e0;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(floatingButton);

  // Setup event listeners
  setupButtonListeners();

  return floatingButton;
}

// Setup button event listeners
function setupButtonListeners() {
  const mainBtn = floatingButton.querySelector('.ai-btn-main');
  const menu = floatingButton.querySelector('.ai-menu');

  mainBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    isMenuOpen = !isMenuOpen;
    menu.classList.toggle('open', isMenuOpen);

    // Cancel any pending hide
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });

  // Handle menu item clicks
  floatingButton.querySelectorAll('.ai-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const action = item.dataset.action;
      handleAIAction(action);
      hideFloatingButton();
    });
  });
}

// Position and show the button
function showFloatingButton(rect) {
  const btn = createFloatingButton();

  // Cancel any pending hide
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  // Calculate position (centered above selection)
  const buttonWidth = 40;
  const buttonHeight = 40;
  const margin = 10;

  let left = rect.left + (rect.width / 2) - (buttonWidth / 2);
  let top = rect.top - buttonHeight - margin;

  // Keep button within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  left = Math.max(margin, Math.min(left, viewportWidth - buttonWidth - margin));
  top = Math.max(margin, Math.min(top, viewportHeight - buttonHeight - margin));

  // If button would be above viewport, show below selection
  if (top < margin) {
    top = rect.bottom + margin;
  }

  btn.style.left = `${left}px`;
  btn.style.top = `${top}px`;
  btn.classList.add('visible');

  // Close menu when repositioning
  const menu = btn.querySelector('.ai-menu');
  menu.classList.remove('open');
  isMenuOpen = false;
}

// Hide the button
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.classList.remove('visible');
    const menu = floatingButton.querySelector('.ai-menu');
    menu.classList.remove('open');
    isMenuOpen = false;
  }

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

// Handle AI action
function handleAIAction(action) {
  const tabMap = {
    'summarize': 'study',
    'proofread': 'study',
    'generate-cover-letter': 'career',
    'rephrase': 'career',
    'extract-skills': 'career',
    'translate': 'travel',
    'travel-insights': 'travel'
  };

  // Save to Chrome storage
  chrome.storage.local.set({
    selectedText: selectedText,
    targetTab: tabMap[action],
    action: action,
    timestamp: Date.now()
  });

  // Open extension
  chrome.runtime.sendMessage({
    type: 'OPEN_EXTENSION',
    action: action,
    text: selectedText
  });
}

// Check if element is part of our button
function isButtonElement(element) {
  if (!element) return false;
  return element.closest('#ai-assistant-floating-btn') !== null;
}

// Handle text selection
function handleSelection() {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : '';

  if (text && text.length > 0) {
    selectedText = text;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        showFloatingButton(rect);
      }
    } catch (error) {
      console.error('Error getting selection rect:', error);
    }
  } else if (!isMenuOpen) {
    // Only hide if menu is not open
    hideFloatingButton();
  }
}

// Listen for mouseup (user finished selecting)
document.addEventListener('mouseup', (e) => {
  // Ignore if clicking on our button
  if (isButtonElement(e.target)) {
    return;
  }

  selectionInProgress = false;

  // Delay to ensure selection is complete
  setTimeout(() => {
    handleSelection();
  }, 50);
});

// Listen for mousedown (user starting to select)
document.addEventListener('mousedown', (e) => {
  // Ignore if clicking on our button
  if (isButtonElement(e.target)) {
    return;
  }

  selectionInProgress = true;

  // If clicking outside button while menu closed, hide button
  if (!isMenuOpen && floatingButton && floatingButton.classList.contains('visible')) {
    hideFloatingButton();
  }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (isMenuOpen && !isButtonElement(e.target)) {
    const menu = floatingButton.querySelector('.ai-menu');
    menu.classList.remove('open');
    isMenuOpen = false;
  }
});

// Handle scroll - hide button after delay
let scrollTimeout = null;
document.addEventListener('scroll', () => {
  if (floatingButton && floatingButton.classList.contains('visible')) {
    // Don't hide immediately if menu is open
    if (isMenuOpen) return;

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      if (!isMenuOpen) {
        hideFloatingButton();
      }
    }, 1000);
  }
}, true);

// Initialize
console.log('AI Assistant content script loaded and ready');