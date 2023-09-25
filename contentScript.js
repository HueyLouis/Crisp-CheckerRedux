class CrispChecker {
  constructor() {
    if (!window.__crispCheckerContentScriptLoaded) {
      window.__crispCheckerContentScriptLoaded = true;
      console.log("Content script top-level code running.");
      chrome.runtime.connect({ name: "contentScript" });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'runCrispChecker') {
          this.displayMaxAllowedBinder(true);
        }
      });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'runCrispCheckerWithoutFee') {
          this.displayMaxAllowedBinder(false);
        }
      });
    }
  }

  displayMaxAllowedBinder(includeFee) {
    const calculator = new Calculator();
    const resultsDiv = new ResultsDiv(calculator, includeFee);
    document.body.appendChild(resultsDiv.element);
  
    // Add a timer to log the time taken to load the resultsDiv
    setTimeout(() => {
      console.log('ResultsDiv loaded after 5 seconds');
    }, 5000);
  }
}

//This class handles calculations
class Calculator {
  constructor() {
    this.subtotalSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(10) > td:nth-child(2) > b';
    this.lineCharge1Selector = 'input[name="EXTRA2AMT"]';
    this.lineCharge2Selector = 'input[name="EXTRA3AMT"]';
    this.packingMaterialsSelector = 'input[name="MATTOTAL"]';
    this.cfSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
    this.binderSelector = 'input[name="EXTRA1AMT"]';
    this.discountSelector = 'input[name="DISCOUNT"]';
    this.cfTextSelector = 'body > table:nth-child(26) > tbody > tr > td > div > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > form > table:nth-child(2) > tbody > tr > td:nth-child(1) > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)';
  }

  get subtotal() {
    return parseFloat(document.querySelector(this.subtotalSelector).innerText.replace(/[$,]/g, ''));
  }

  get lineCharge1() {
    return parseFloat(document.querySelector(this.lineCharge1Selector)?.innerText?.replace(/[$,]/g, '') || 0);
  }

  get lineCharge2() {
    return parseFloat(document.querySelector(this.lineCharge2Selector)?.innerText?.replace(/[$,]/g, '') || 0);
  }

  get packingMaterials() {
    return parseFloat(document.querySelector(this.packingMaterialsSelector)?.value?.replace(/[$,]/g, '') || 0);
  }

  get binder() {
    return parseFloat(document.querySelector(this.binderSelector)?.value?.replace(/[$,]/g, '') || 0);
  }

  get discount() {
    return parseFloat(document.querySelector(this.discountSelector)?.value?.replace(/[$,]/g, '') || 0);
  }

  get cf() {
    const cfValueFromText = parseInt(document.querySelector(this.cfTextSelector)?.innerText?.replace(/[^0-9]/g, '') || 0);
    return cfValueFromText || parseInt(document.querySelector(this.cfSelector)?.innerText?.trim() || 0);
  }

  get percentage() {
    return this.cf <= 499 ? 0.1 : 0.15;
  }

  get lineHaul() {
    return this.subtotal * this.percentage;
  }

  get totalWithoutBinder() {
    return this.subtotal + this.lineCharge1 + this.lineCharge2 + this.packingMaterials;
  }

  get depositPercentage() {
    return 0.43441;
  }

  get deposit() {
    return this.subtotal * (this.percentage + 0.10);
  }

  get maxAllowedTotal() {
    return this.totalWithoutBinder / (1 - this.depositPercentage);
  }

  get maxBinderAllowed() {
    let maxBinderAllowed = this.maxAllowedTotal - this.totalWithoutBinder - this.deposit;
    if (this.deposit > this.totalWithoutBinder * this.depositPercentage) {
      maxBinderAllowed = (this.totalWithoutBinder * this.depositPercentage - this.deposit) / (1 + this.percentage);
    }
    return maxBinderAllowed;
  }

  get adjustedBinder() {
    return this.binder - this.discount;
  }

  get adjustedDeposit() {
    return this.lineHaul + this.adjustedBinder;
  }

  get deposit2() {
    return this.lineHaul + this.adjustedBinder;
  }

  get processingFee() {
    if (this.adjustedDeposit > 2000 && includeFee) {
      return this.deposit2 * 0.04;
    }
    return 0;
  }

  get totalCost() {
    return this.subtotal + this.adjustedDeposit + this.lineCharge1 + this.lineCharge2 + this.packingMaterials;
  }

  get remainingBalance() {
    return this.totalCost - this.adjustedDeposit - this.lineHaul;
  }

  get pickUpPayment() {
    return this.remainingBalance / 2;
  }

  get deliveryPayment() {
    return this.remainingBalance / 2;
  }
}


//This class parses results
class ResultsDiv {
  constructor(calculator, includeFee) {
    this.calculator = calculator;
    this.includeFee = includeFee;
    this.element = document.createElement('div');
    this.element.style.cssText = ` position: fixed; top: 10px; right: 10px; background-color: #ffffff; border: 1px solid #ccc; border-radius: 10px; padding: 20px; box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1); z-index: 1000; font-family: Arial, sans-serif; `;
    this.headerDiv = this.createHeaderDiv();
    this.contentDiv = this.createContentDiv();
    this.closeButton = this.createCloseButton();
    this.element.appendChild(this.headerDiv);
    this.element.appendChild(this.contentDiv);
    this.element.appendChild(this.closeButton);
    this.addEventListeners();
  }

  createHeaderDiv() {
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = ` height: 20px; background-color: #ddd; cursor: move; width: 100%; text-align: center; border-bottom: 1px solid #ccc; `;
    headerDiv.textContent = "Drag from here";
    return headerDiv;
  }
}