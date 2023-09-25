console.log('Script starting...');

if (typeof rate === 'undefined') {
  rate = '';
}



if (!window.__crispCheckerContentScriptLoaded) {
  // Mark the content script as executed in the current tab
  window.__crispCheckerContentScriptLoaded = true;

  console.log("Content script top-level crispy code running.");

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'runCrispChecker') {
      console.log('Running Crisp Checker with fee included:', request.includeFee);
      updateRate(request.includeFee);
    }
  });  
}

console.log('Script starting...');

let formSubmitted = false;
let rateManuallyOverridden = false;

chrome.storage.local.get(['formSubmitted'], function(result) {
  formSubmitted = result.formSubmitted;
});

// Function to handle manager code entry
let rateInput = document.querySelector('input[name="I1PERCFLBS"]');
rateInput.addEventListener('keydown', function(event) {
  if (event.key === "Enter") { // If the user presses the Enter key
    let managerCode = prompt("Enter the manager code:"); // Prompt for the manager code
    if (managerCode === "1234") { // Replace "1234" with your actual manager code
      rateInput.readOnly = false; // If the correct manager code is entered, allow the user to change the rate
      rateManuallyOverridden = true; // Set the flag to true
    }
  }
});

async function updateRate(includeFee) {
  // If the rate was manually overridden, don't update it
  if (rateManuallyOverridden) {
    console.log('Rate manually overridden, skipping update');
    return;
  }

  let checkBox = document.querySelector('input[name="LCKPERCF"]'); // Check the checkbox
  let newRate = await fetchRate(); // Await fetchRate before proceeding
  rateInput.value = newRate; // Replace the current rate with the new rate
  rateInput.readOnly = true; // Prevent the user from changing the rate
  checkBox.checked = true;

  // Save the state in localStorage
  chrome.storage.local.set({ rateChanged: true });
  chrome.storage.local.set({ includeFee: includeFee });

  // Wait for formSubmitted
  formSubmitted = await new Promise(resolve => {
    chrome.storage.local.get(['formSubmitted'], function(result) {
      resolve(result.formSubmitted);
    });
  });

  // If the form has not been submitted yet
  if (!formSubmitted) {
    rateInput.value = newRate; // Replace the current rate with the new rate
    rateInput.readOnly = true; // Prevent the user from changing the rate
    checkBox.checked = true;

    // Wait a bit before reloading to ensure all changes are applied
    setTimeout(() => {
      let submitButton = document.querySelector('input[name="SUBMIT_3"]');
      if (submitButton) {
        console.log('Submit button found, clicking...');
        // Set formSubmitted to true in both the variable and chrome.storage.local
        formSubmitted = true;
        chrome.storage.local.set({ formSubmitted: true });
        // Reset the scriptInjected flag to false
        chrome.storage.local.set({ scriptInjected: false });
        submitButton.click();
        // Run the restoreState function after form submission
        document.addEventListener('DOMContentLoaded', () => {
          console.log('Page reloaded, DOM fully loaded and parsed');
          restoreState();
        });          
      } else {
        console.log('Submit button not found');
      }
    }, 500); // Adjust this delay as necessary
  } else {
    console.log('Form already submitted');
    displayMaxAllowedBinder(includeFee);
  }
}

function restoreState() {
  console.log('Running restoreState function...');
  chrome.storage.local.get(['rateChanged', 'formSubmitted'], function(result) {
    console.log('Restoring state from chrome.storage.local: rateChanged=', result.rateChanged, ', formSubmitted=', result.formSubmitted);

    if (result.rateChanged && !result.formSubmitted) {
      // Delay the execution of the checker
      setTimeout(() => {
        chrome.storage.local.get(['includeFee'], function(result) {
          // Skip calling displayMaxAllowedBinder here if it's being called in updateRate
          // displayMaxAllowedBinder(result.includeFee);
        });
      }, 5000); // Adjust this delay as necessary
    }
  });
}

console.log('About to add DOMContentLoaded event listener...');
document.addEventListener('DOMContentLoaded', restoreState);





// fetchRate and displayMaxAllowedBinder functions...
    function fetchRate() {
      return new Promise((resolve, reject) => {
        // Get the selected FROM states
        let fromStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2)');

        if (!fromStateElement) {
          fromStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(2) > font');
        }        
        if (!fromStateElement) {
          fromStateElement = document.querySelector('body > table:nth-child(25) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr:nth-child(5) > td:nth-child(2) > font');
        }
        if (!fromStateElement) {
          fromStateElement = document.querySelector('body > table:nth-child(25) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2) > font');
        }
        if (fromStateElement) {
          
          let fromState = fromStateElement.value;
        } else {
          console.error("From state element not found");
        }
        // Get the selected TO states
        let toStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > font');

        if (!toStateElement) {
          toStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2) > font');
        }
        
        if (!toStateElement) {
          toStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td:nth-child(2) > font');
        }
        if (!toStateElement) {
          toStateElement = document.querySelector('body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        }

        const dateselector = `#Date5`
        const cfSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
        const cfTextSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
        const dateInput = document.querySelector(dateselector)?.value;
        const dateParts = dateInput.split("/");
        const dateObject = new Date(+dateParts[2], dateParts[0] - 1, +dateParts[1]);
        const dateToSend = dateObject.toISOString().split('T')[0];
        const cfValueFromText = parseInt(document.querySelector(cfTextSelector)?.innerText?.replace(/[^0-9]/g, '') || 0);
        const cf = cfValueFromText || parseInt(document.querySelector(cfSelector)?.innerText?.trim() || 0);
        
        // Extract the text content from the elements
        const fromState = fromStateElement ? fromStateElement.textContent.trim() : null;
        const toState = toStateElement ? toStateElement.textContent.trim() : null;
        console.log(`From state: ${fromState}, To state: ${toState}`);

    // Check if the states are valid
    if (!fromStateElement || !toStateElement) {
      console.error('From state or To state element not found');
      return Promise.reject(new Error('From state or To state element not found'));
    }
    

    fetch(`https://crispycheckerpro-f25c963c0e71.herokuapp.com/getRates?fromState=${fromState}&toState=${toState}&date=${dateToSend}&cf=${cf}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Update the rate variable
      rate = data.rate;
      console.log('Rate updated:', rate);
      resolve(rate); // Resolve the Promise with rate
    })
    .catch(error => {
      console.error('Error:', error);
      reject(error); // Reject the Promise
    });          
  });
}


async function displayMaxAllowedBinder(includeFee) {
  console.log('Running displayMaxAllowedBinder with fee included:', includeFee);
  try {
    const cf = await fetchRate(); // Get cf from fetchRate
  // Define the selectors for the elements
  let subtotalSelector =
  'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(20) > td:nth-child(2) > b';

let subtotalElement = document.querySelector(subtotalSelector);

if (subtotalElement === null) {
  // If the first selector doesn't work, try the second one
  subtotalSelector =
    'body > table:nth-child(25) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(10) > td:nth-child(2) > b';
  subtotalElement = document.querySelector(subtotalSelector);
}

if (subtotalElement === null) {
  // If the second selector doesn't work either, try the third one
  subtotalSelector =
    'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(10) > td:nth-child(2) > b';
  subtotalElement = document.querySelector(subtotalSelector);
}
  const lineCharge1Selector = 'input[name="EXTRA2AMT"]';
  const lineCharge2Selector = 'input[name="EXTRA3AMT"]';
  const packingMaterialsSelector = 'input[name="MATTOTAL"]';
  const binderSelector = 'input[name="EXTRA1AMT"]';
  const discountSelector = 'input[name="DISCOUNT"]';
  

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
    const totalCost = subtotal + adjustedDeposit+ lineCharge1 + lineCharge2 + packingMaterials;

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
  font-size: 0.9em;  // Adjust this value to change the font size
  width: 300px; // Set a fixed width for the results div
  overflow: auto; // Add a scrollbar if the content is too long
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
  <div style="font-size: 17px; font-weight: bold; margin-bottom: 10px;margin-top: -20px; color: #4CAF50;">Crisp Checker 2.0</div>
  <div style="font-weight: bold; margin-bottom: 20px;">Max Binder: $${maxBinderAllowed.toFixed(2)}</div>
  ${adjustedDeposit > 2000 ? `<div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Convenience Fee<span style="font-size: 12px;">(4%)</span>:</span></div>
    <div>$${processingFee.toFixed(2)}</div>
  </div>` : ''}
  <div style="display: flex; justify-content: space-between;">
    <div style="font-weight: bold;"><span style="font-size: 14px;">Line Haul<span style="font-size: 12px;">(${(percentage * 100).toFixed(0)}%)</span>:</span></div>
    <div>$${lineHaul.toFixed(2)}</div>
  </div>
  <div style="display: flex; justify-content: space-between;">
  <div style="font-weight: bold;"><span style="font-size: 14px;">Rate:</span></div>
  <div>${rate}</div>
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
  <div class="additional-info" style="font-size: 0.8em; display: flex; flex-direction: column; align-items: flex-start;">
  <div style="margin-top: 10px; display: flex; justify-content: space-between; width: 100%;">
   <div>
     <label style="cursor: pointer;"><input type="checkbox" id="storage"> Storage</label><br>
     <label style="cursor: pointer;"><input type="checkbox" id="militaryBase"> Military Base</label>
   </div>
   <div>
     <label style="cursor: pointer;"><input type="checkbox" id="weightTickets"> Weight Tickets</label><br>
     <label style="cursor: pointer;"><input type="checkbox" id="coi"> COI Needed</label>
   </div>
 </div>
<label style="margin-top: 20px; cursor: pointer;">Payment Method:
 <select id="paymentMethod" style="cursor: pointer;">
   <option>Money Order</option>
   <option>Cashiers Check</option>
   <option>Cash</option>
   <option>Venmo</option>
   <option>Credit Card</option>
 </select>
</label><br>
<div id="managerCode" style="display: none;">
  <label>Manager Code:
    <input type="text" id="managerCodeInput" style="width: 50px;">
  </label>
</div>
 </label><br>
 <label style="cursor: pointer;">Type of Delivery:
   <select id="deliveryType" style="cursor: pointer;">
     <option>Standard</option>
     <option>Expedited</option>
     <option>Guaranteed</option>
   </select>
 </label><br>
<div style="margin-left: auto; margin-right: auto;">
 <button id="copyButton" style="margin-top: 10px; background-color: #7B96B5; color: #ffffff; padding: 5px 10px; cursor: pointer;">Submit To Notes</button>
 <span id="copyStatus" style="font-size: 15px; display: block;"></span>
</div>
`;
// Add this after your "ccApproval" div
const managerCodeDiv = document.createElement('div');
managerCodeDiv.id = 'managerCode';
managerCodeDiv.style.display = 'none';
managerCodeDiv.innerHTML = `
 <label>Manager Code:
   <input type="password" id="managerCodeInput">
 </label>
`;
resultsDiv.appendChild(managerCodeDiv);
   // Append the div to the page
   document.body.appendChild(resultsDiv);

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



  document.getElementById('paymentMethod').addEventListener('change', function () {
    const paymentMethod = this.value;
    const managerCodeDiv = document.getElementById('managerCode');
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Venmo') {
      managerCodeDiv.style.display = 'block';
    } else {
      managerCodeDiv.style.display = 'none';
    }
  });
  
  

    
        // Add click event listener for the "SUBMIT TO NOTES" button
        document.getElementById('copyButton').addEventListener('click', function () {
        // Get the current date and time
        const now = new Date();
        const timestamp = now.toLocaleString();

        // Get the values of the checkboxes and dropdowns
        const storage = document.getElementById('storage').checked ? 'Yes' : 'No';
        const militaryBase = document.getElementById('militaryBase').checked ? 'Yes' : 'No';
        const weightTickets = document.getElementById('weightTickets').checked ? 'Yes' : 'No'; // Corrected ID
        const coi = document.getElementById('coi').checked ? 'Yes' : 'No';
        const paymentMethod = document.getElementById('paymentMethod').value;
        const deliveryType = document.getElementById('deliveryType').value;
        const i1percflbs = document.getElementsByName('I1PERCFLBS')[0].value; 

        // Get the value of the "CC Approved By Dispatch" checkbox
        const managerCode = document.getElementById('managerCodeInput').value;
        const validCodes = ['12', '90', 'JakinCode', 'RayCode', 'GavinCode', 'ChrisCode'];
        if (!validCodes.includes(managerCode)) {
        document.getElementById('copyStatus').textContent = "Invalid manager code.";
        return;
         }


        const textToCopy = `
Crisp Checker Results
Timestamp: ${timestamp}
Max Binder: $${maxBinderAllowed.toFixed(2)}
Convenience Fee(4%): $${processingFee.toFixed(2)}
Line Haul(${(percentage * 100).toFixed(0)}%): $${lineHaul.toFixed(2)}
Actual Binder: $${adjustedBinder.toFixed(2)}
Total Move Cost: $${totalmove2.toFixed(2)}
Deposit: $${adjustedDeposit.toFixed(2)}
Balance: $${remainingBalance.toFixed(2)}
Pick up: $${pickUpPayment.toFixed(2)}
Delivery: $${deliveryPayment.toFixed(2)}
Rate: ${i1percflbs}
CF: ${cf}
----------------
Dispatch Info
Storage: ${storage}
Military Base: ${militaryBase}
Weight Tickets Needed: ${weightTickets}
COI Needed: ${coi}
Payment Method On Pickup: ${paymentMethod} 
Type of Delivery: ${deliveryType}
`;

        // Split the text by new lines, trim each line, and then join them back together
          const cleanedTextToCopy = textToCopy.split('\n').map(line => line.trim()).join('\n');

          // Set the value of the text box to the text you want to copy
          document.getElementsByName('REPNOTESX')[0].value = cleanedTextToCopy;

         navigator.clipboard.writeText(cleanedTextToCopy).then(function () {
          /* clipboard successfully set */
          document.getElementById('copyStatus').textContent = "Check Your Notes!";
          // Click the "Submit Charges" button
          document.getElementsByName('SUBMIT_3')[0].click();
          }, function () {
        /* clipboard write failed */
        document.getElementById('copyStatus').textContent = "Failed to copy.";
    });
});
} catch (error) {
  console.error('Failed to fetch rate:', error);
}
}

