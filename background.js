// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab's status is 'complete'
  if (changeInfo.status === 'complete') {
      // Check if script was already injected
      chrome.storage.local.get(['scriptInjected'], function(result) {
          if (!result.scriptInjected) {
              // Inject the content script
              chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  files: ["contentScript.js"]
              }).then(() => {
                  // Mark script as injected
                  chrome.storage.local.set({ scriptInjected: true });

                  // Get includeFee from localStorage and convert to boolean
                  chrome.storage.local.get(['includeFee'], function(result) {
                      const includeFee = result.includeFee;

                      // Send the 'runCrispChecker' message with the includeFee value from localStorage
                      chrome.tabs.sendMessage(tabId, { 
                          action: "runCrispChecker", 
                          includeFee: includeFee 
                      });
                  });
              });
          }
      });
  }
});
