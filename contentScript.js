if (!window.__crispCheckerContentScriptLoaded) {
    // Mark the content script as executed in the current tab
    window.__crispCheckerContentScriptLoaded = true;

    console.log("Content script top-level code running.");

    // Establish a connection with the background script
    chrome.runtime.connect({ name: "contentScript" });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'runCrispChecker') {
            displayMaxAllowedBinder(true);
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'runCrispCheckerWithoutFee') {
            displayMaxAllowedBinder(false);
        }
    });
}




function displayMaxAllowedBinder(includeFee) {

    // Define the selectors for the elements
    const subtotalSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(10) > td:nth-child(2) > b';
    const lineCharge1Selector = 'input[name="EXTRA2AMT"]';
    const lineCharge2Selector = 'input[name="EXTRA3AMT"]';
    const packingMaterialsSelector = 'input[name="MATTOTAL"]';
    const cfSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
    const binderSelector = 'input[name="EXTRA1AMT"]';
    const discountSelector = 'input[name="DISCOUNT"]';
    const cfTextSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
    const cfValueFromText = parseInt(document.querySelector(cfTextSelector)?.innerText?.replace(/[^0-9]/g, '') || 0);
    const cf = cfValueFromText || parseInt(document.querySelector(cfSelector)?.innerText?.trim() || 0);

    // Fetch the values from the page using the selectors
    const subtotal = parseFloat(document.querySelector(subtotalSelector).innerText.replace(/[$,]/g, ''));
    const lineCharge1 = parseFloat(document.querySelector(lineCharge1Selector)?.innerText?.replace(/[$,]/g, '') || 0);
    const lineCharge2 = parseFloat(document.querySelector(lineCharge2Selector)?.innerText?.replace(/[$,]/g, '') || 0);
    const packingMaterials = parseFloat(document.querySelector(packingMaterialsSelector)?.value?.replace(/[$,]/g, '') || 0);
    const binder = parseFloat(document.querySelector(binderSelector)?.value?.replace(/[$,]/g, '') || 0);
    const discount = parseFloat(document.querySelector(discountSelector)?.value?.replace(/[$,]/g, '') || 0);

    // Calculate the percentage based on CF
    const percentage = cf <= 499 ? 0.1 : 0.15;

    // Calculate the line haul
    const lineHaul = subtotal * percentage;

    // Calculate the total without binder and deposit
    const totalWithoutBinder = subtotal + lineCharge1 + lineCharge2 + packingMaterials;

    // Calculate the deposit percentage
    const depositPercentage = 0.43441;

    // Calculate the max allowed binder
    const deposit = subtotal * (percentage + 0.10);
    const maxAllowedTotal = totalWithoutBinder / (1 - depositPercentage);
    let maxBinderAllowed = maxAllowedTotal - totalWithoutBinder - deposit;

    // Ensure the binder + deposit is less than or equal to 43% of the total cost
    if (deposit > totalWithoutBinder * depositPercentage) {
        maxBinderAllowed = (totalWithoutBinder * depositPercentage - deposit) / (1 + percentage);
    }

    // Calculate the adjusted binder and deposit
    const adjustedBinder = binder - discount;
    let adjustedDeposit = lineHaul + adjustedBinder;

    // Calculate the deposit
    const deposit2 = lineHaul + adjustedBinder;

    // Calculate the processing fee (4% surcharge) if the adjusted deposit is over 2,000
    let processingFee = 0;
    if (adjustedDeposit > 2000 && includeFee) {
        processingFee = deposit2 * 0.04;
        adjustedDeposit += processingFee; // Include the processing fee in the adjusted deposit
    }

    // Calculate the total cost
    const totalCost = subtotal + adjustedDeposit + lineCharge1 + lineCharge2 + packingMaterials;

    // Calculate the remaining balance after the deposit
    const remainingBalance = totalCost - adjustedDeposit - lineHaul;

    // Split the remaining balance in half for pick up and delivery
    const pickUpPayment = remainingBalance / 2;
    const deliveryPayment = remainingBalance / 2;


    const totalmove2 = remainingBalance + adjustedDeposit + lineCharge1 + lineCharge2;


    // Create a div element to display the max allowed binder
    const resultsDiv = document.createElement('div');
    resultsDiv.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-family: Arial, sans-serif;
`;

    // Create a header div for dragging
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
  height: 20px;
  background-color: #ddd;
  cursor: move;
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #ccc;
`;

    headerDiv.textContent = "Drag from here";

    // Append the header div to the results div
    resultsDiv.appendChild(headerDiv);

    // Variables for dragging
    let dragging = false;
    let offsetX, offsetY;

    // Function to handle mouse down event
    function onMouseDown(e) {
        const rect = resultsDiv.getBoundingClientRect();
        if (e.clientY - rect.top <= 20) { // Check if the mouse is within the top 20 pixels
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
    resultsDiv.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);


    // Display the results
    resultsDiv.innerHTML = `
  <div style="font-size: 17px; font-weight: bold; margin-bottom: 10px;margin-top: -20px; color: #4CAF50;">Crisp Checker</div>
  <div style="font-weight: bold; margin-bottom: 20px;">Max Binder: $${maxBinderAllowed.toFixed(2)}</div>
  ${adjustedDeposit > 2000 ? `<div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Credit Card Fee<span style="font-size: 12px;">(4%)</span>:</span></div>
    <div>$${processingFee.toFixed(2)}</div>
  </div>` : ''}
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Line Haul<span style="font-size: 12px;">(${(percentage * 100).toFixed(0)}%)</span>:</span></div>
    <div>$${lineHaul.toFixed(2)}</div>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Actual Binder:</span></div>
    <div style="${adjustedBinder > maxBinderAllowed ? 'color: red;' : ''}">$${adjustedBinder.toFixed(2)}</div>
  </div>
   <div style="height: 1px; background-color: #e9ecef; width: 100%; margin-bottom: 10px;"></div>
  </div>
    <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Total Move Cost:</span></div>
    <div>$${totalmove2.toFixed(2)}</div>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Deposit:</span></div>
    <div>$${adjustedDeposit.toFixed(2)}</div>
  </div>
  </div>  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Balance:</span></div>
    <div>$${remainingBalance.toFixed(2)}</div>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Pick up:</span></div>
    <div>$${pickUpPayment.toFixed(2)}</div>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Delivery:</span></div>
    <div>$${deliveryPayment.toFixed(2)}</div>
  </div>

`;

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.style.cssText = `
    position: absolute;
    top: 0px;
    right: 0px;
    background-color: #f44336;
    border: none;
    border-radius: 5px;
    padding: 3px 7px;
    color: #ffffff;
    cursor: pointer;
  `;

    // Append the close button to the resultsDiv
    resultsDiv.appendChild(closeButton);

    // Append the div to the page
    document.body.appendChild(resultsDiv);

    // Add click event listener for the closeButton
    closeButton.addEventListener('click', () => {
        resultsDiv.remove();
    });
}


