document.getElementById('copyButton').addEventListener('click', function () {
    // Get data from the page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getData'}, function(response) {
        // Do something with the response data
        document.getElementById('copyStatus').textContent = "Data received!";
      });
    });
  });
  
  // Variables for dragging
let dragging = false;
let offsetX, offsetY;

// Function to handle mouse down event
function onMouseDown(e) {
  const rect = resultsDiv.getBoundingClientRect();
  if (e.clientY - rect.top <= 20) {
    dragging = true;
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  }
}

// Function to handle mouse up event
function onMouseUp() {
  dragging = false;
}

// Function to handle mouse move event
function onMouseMove(e) {
  if (!dragging) return;
  resultsDiv.style.left = `${e.clientX - offsetX}px`;
  resultsDiv.style.top = `${e.clientY - offsetY}px`;
  resultsDiv.style.right = 'auto';
}

// Attach event listeners
document.getElementById('resultsDiv').addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousemove', onMouseMove);

// Add other JavaScript code here
