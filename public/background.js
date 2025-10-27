// Background service worker for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Assistant for Everyday Life installed');

    // Create context menu items for Study Mode
    chrome.contextMenus.create({
        id: 'study-separator',
        title: '📚 Study Mode',
        contexts: ['selection'],
        type: 'normal'
    });

    chrome.contextMenus.create({
        id: 'summarize-selection',
        title: 'Summarize Selection',
        contexts: ['selection'],
        parentId: 'study-separator'
    });

    chrome.contextMenus.create({
        id: 'proofread-selection',
        title: 'Proofread Selection',
        contexts: ['selection'],
        parentId: 'study-separator'
    });

    // Create context menu items for Career Mode
    chrome.contextMenus.create({
        id: 'career-separator',
        title: '💼 Career Mode',
        contexts: ['selection'],
        type: 'normal'
    });

    chrome.contextMenus.create({
        id: 'generate-cover-letter',
        title: 'Generate Cover Letter',
        contexts: ['selection'],
        parentId: 'career-separator'
    });

    chrome.contextMenus.create({
        id: 'rephrase-selection',
        title: 'Rephrase Professionally',
        contexts: ['selection'],
        parentId: 'career-separator'
    });

    chrome.contextMenus.create({
        id: 'extract-skills',
        title: 'Extract Skills',
        contexts: ['selection'],
        parentId: 'career-separator'
    });

    // Create context menu items for Travel Mode
    chrome.contextMenus.create({
        id: 'travel-separator',
        title: '✈️ Travel Mode',
        contexts: ['selection'],
        type: 'normal'
    });

    chrome.contextMenus.create({
        id: 'translate-selection',
        title: 'Translate to English',
        contexts: ['selection'],
        parentId: 'travel-separator'
    });

    chrome.contextMenus.create({
        id: 'travel-insights',
        title: 'Get Travel Insights',
        contexts: ['selection'],
        parentId: 'travel-separator'
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const actionMap = {
        'summarize-selection': { tab: 'study', action: 'summarize' },
        'proofread-selection': { tab: 'study', action: 'proofread' },
        'generate-cover-letter': { tab: 'career', action: 'generate-cover-letter' },
        'rephrase-selection': { tab: 'career', action: 'rephrase' },
        'extract-skills': { tab: 'career', action: 'extract-skills' },
        'translate-selection': { tab: 'travel', action: 'translate' },
        'travel-insights': { tab: 'travel', action: 'travel-insights' }
    };

    const menuAction = actionMap[info.menuItemId];

    if (menuAction) {
        // Save selected text and action details
        chrome.storage.local.set({
            selectedText: info.selectionText,
            targetTab: menuAction.tab,
            action: menuAction.action,
            timestamp: Date.now()
        });

        // Open side panel
        chrome.sidePanel.open({ tabId: tab.id });
    }
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});

// Message passing between content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle any background processing if needed
    if (request.type === 'GET_SELECTED_TEXT') {
        chrome.storage.local.get(['selectedText', 'action', 'targetTab', 'timestamp'], (result) => {
            sendResponse(result);
        });
        return true; // Keeps the message channel open for async response
    }

    if (request.type === 'OPEN_EXTENSION') {
        // Open side panel when floating button is clicked
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.sidePanel.open({ tabId: tabs[0].id });
            }
        });
    }
});