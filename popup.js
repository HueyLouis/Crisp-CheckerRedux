
document.getElementById("runCrispChecker").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["contentScript.js"]
        }).then(() => {
            // Save the includeFee value in localStorage
            chrome.storage.local.set({ includeFee: true });
            // Reset the formSubmitted status to false
            chrome.storage.local.set({ formSubmitted: false });
            chrome.tabs.sendMessage(tabs[0].id, { action: "runCrispChecker", includeFee: true });
        });
    });
    window.close();
});

document.getElementById("runCrispCheckerWithoutFee").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["contentScript.js"]
        }).then(() => {
            // Save the includeFee value in localStorage
            chrome.storage.local.set({ includeFee: false });
            // Reset the formSubmitted status to false
            chrome.storage.local.set({ formSubmitted: false });
            chrome.tabs.sendMessage(tabs[0].id, { action: "runCrispChecker", includeFee: false });
        });
    });
    window.close();
});