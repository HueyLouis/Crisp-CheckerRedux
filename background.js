let contentScriptConnected = false;

function runCrispCheckerOnce() {
  // Disable the button to prevent multiple clicks
  this.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (!contentScriptConnected) {
      // Inject the content script if not injected before
      console.log("Injecting content script...");
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"]
        },
        () => {
          console.log("Content script injected successfully.");
          // Establish a connection with the content script
          const port = chrome.tabs.connect(tabs[0].id);
          port.onDisconnect.addListener(() => {
            contentScriptConnected = false;
          });
          contentScriptConnected = true;
        }
      );
    } else {
      // Send the message to the content script
      chrome.tabs.sendMessage(tabs[0].id, { action: "runCrispChecker" });
    }
  });

  // Close the popup after a short delay to ensure the content script has time to execute.
  setTimeout(() => {
    window.close();
  }, 500);
}

document.getElementById("runCrispChecker").addEventListener("click", runCrispCheckerOnce);
