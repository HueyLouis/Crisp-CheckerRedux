function runCrispCheckerOnce() {
  // Disable the button to prevent multiple clicks
  this.disabled = true;

  // Execute the content script on the active tab.
  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["contentScript.js"],
    }).then(() => {
      // Use setTimeout to wait for the content script to load before sending the message.
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runCrispChecker" });
      }, 100);
    });
  });

  // Close the popup after a short delay to ensure the content script has time to execute.
  setTimeout(() => {
    window.close();
  }, 500);

  // Remove the event listener
  document.getElementById("runCrispChecker").removeEventListener("click", runCrispCheckerOnce);
}


function runCrispCheckerWithoutFeeOnce() {
  // Disable the button to prevent multiple clicks
  this.disabled = true;

  // Execute the content script on the active tab.
  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["contentScript.js"],
    }).then(() => {
      // Use setTimeout to wait for the content script to load before sending the message.
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "runCrispCheckerWithoutFee" });
      }, 100);
    });
  });

  // Close the popup after a short delay to ensure the content script has time to execute.
  setTimeout(() => {
    window.close();
  }, 500);

  // Remove the event listener
  document.getElementById("runCrispCheckerWithoutFee").removeEventListener("click", runCrispCheckerWithoutFeeOnce);
}

document.getElementById("runCrispChecker").addEventListener("click", runCrispCheckerOnce);
document.getElementById("runCrispCheckerWithoutFee").addEventListener("click", runCrispCheckerWithoutFeeOnce);