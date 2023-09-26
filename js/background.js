// Retrieve the includeFee value from chrome.storage.local
let includeFee
chrome.storage.local.get(['includeFee'], function(result) {
    includeFee = result.includeFee;
    console.log(includeFee);
});

// Listen for when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("tab update");
    // If the tabs status is 'complete'
    if (changeInfo.status === 'complete') {
        //Check if content script has already been injected into the tab
        console.log('checking content injected');
        chrome.tabs.query({
            active: true,
            currentWindow: true,
            url: tab.url
        }, function(tabs) {
            // If the content has not been injected, inject it
            if (tabs.length === 0) {
                console.log('Content has not been injected, injecting')
                chrome.tabs.executeScript(tabId, { file: 'contentScript.js' }, function() {
                    //Mark script as injected
                    chrome.storage.local.set({ scriptInjected: true});
                    // Send the 'runCrispChecker' message with the includeFee value from chrome.storage.local
                    chrome.tabs.sendMessage(tabId, {
                        action: 'runCrispChecker',
                        includeFee: includeFee
                    });
                });
            }
        });
    }
});