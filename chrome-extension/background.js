// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFocus") {
    // Use tabId from message or fallback to sender.tab.id
    const tabId = request.tabId || sender.tab?.id;
    if (!tabId) {
      console.error("No tab ID available");
      sendResponse({ success: false, error: "No tab ID available" });
      return;
    }

    console.log("Toggling focus mode for tab:", tabId);

    // First, try to inject content script
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: false },
      files: ["content.js"]
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to inject content script:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      console.log("Content script injected successfully");

      // Then request fullscreen
      chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        func: () => {
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(console.warn);
            }
          } catch (e) {
            console.warn("Fullscreen request failed:", e);
          }
        }
      }, () => {
        sendResponse({ success: true });
      });
    });
    
    return true; // Keep message channel open for async response
  }
});

// Keep the original icon click functionality as backup
chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;

  console.log("Icon clicked for tab:", tab.id);

  // Inject content script first
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: false },
    files: ["content.js"]
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error("Failed to inject content script on icon click:", chrome.runtime.lastError);
      return;
    }

    console.log("Content script injected successfully on icon click");

    // Then request fullscreen
    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      func: () => {
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(console.warn);
          }
        } catch (e) {
          console.warn("Fullscreen request failed:", e);
        }
      }
    });
  });
});
