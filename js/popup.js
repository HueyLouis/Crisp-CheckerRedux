function runCrispChecker(includeFee) {
    console.log("Running Crisp Checker")
    chrome.tabs.query({active: true, currentWindow: true }).then((tabs) => {
        chrome.scripting.executeScript({ target: { tabId: tabs.id }, files: ["contentScript.js"] }).then(() => {
            //Sace rge includeFee value in localStorage
            chrome.storage.local.set({ formSubmitted: false});
            // Reset the formSubmitted status to false
            chrome.storage.local.set({ formSubmitted: false});
            chrome.tabs.sendMessage(tabs.id, {action: "runCrispChecker", includeFee: includeFee });
        });
    });
    window.close();
}

document.getElementById("runCrispChecker").addEventListener("click", () => {
    runCrispChecker(true);
});

document.getElementById("runCrispCheckerWithoutFee").addEventListener("click", () => {
    runCrispChecker(false);
});