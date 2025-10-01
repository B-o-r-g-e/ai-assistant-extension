// Background service worker for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Assistant for Everyday Life installed');

    // Create context menu items
    chrome.contextMenus.create({
        id: 'summarize-selection',
        title: 'Summarize with AI Assistant',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'proofread-selection',
        title: 'Proofread with AI Assistant',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'summarize-selection' || info.menuItemId === 'proofread-selection') {
        // Open side panel or popup with selected text
        chrome.storage.local.set({
            selectedText: info.selectionText,
            action: info.menuItemId.split('-')[0] // 'summarize' or 'proofread'
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
        chrome.storage.local.get(['selectedText', 'action'], (result) => {
            sendResponse(result);
        });
        return true; // Keeps the message channel open for async response
    }
});