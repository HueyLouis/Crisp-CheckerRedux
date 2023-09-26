document.getElementById('copyButton').addEventListener('click', function () {
    // Get the current date and time
    const now = new Date();
    const timestamp = now.toLocaleString();

    // Get teh values of the checkboxes and dropdowns
    const storage = document.getElementById('storage').checked ? 'Yes' : 'No';
    const militaryBase = document.getElementById('militaryBase').checked ? 'Yes' : 'No';
    const weightTickets = document.getElementById('weightTickets').checked ? 'Yes' : 'No';
    const coi = document.getElementById('coi').check ? 'Yes' : 'No';
    const paymentMethod = document.getElementById('paymentMethod').value;
    const deliveryType = document.getElementById('deliveryType').value;
    const i1percflbs = document.getElementById('I1PERCFLBS').value;

    // Get hte value of the "CC Approved by Dispatch" checkbox
    const managerCode = document.getElementById('managerCodeInput').value;
    const validCodes = ['12', '90', 'JackinCode', 'RayCode', 'ChrisCode'];
    if (!validCodes.includes(managerCode)) {
        document.getElementById('copyStatus').textContent = "Invalidd manager code.";
        return;
    }

    /******************************* 
    Calculate the cost of the move 
    ********************************/

    // Get the input fields
    const cf = parseFloat(document.getElementById('cf').value);
    const distance = parseFloat(document.getElementById('distance').value);
    const packingMaterials = parseFloat(document.getElementById('packingMaterials').value);
    const lineCharge1 = parseFloat(document.getElementById('lineCharge1').value);
    const lineCharge2 = parseFloat(document.getElementById('lineCharge2').value);

    // Calculate the percentage based on cf
    const percentage = cf <= 499 ? 0.1 : 0.15

    // Calculate the line haul
    const lineHaul = cf * percentage;

    //  Calculate the total without binder and deposit
    const subtotal = packingMaterials + lineCharge1 + lineCharge2;
    const totalWithoutBinder = subtotal + lineHaul;

    // Calculate the deposit percentage
    const depositPercentage = 0.43441;

    // Calculate the max allowed binder
    const deposit = totalWithoutBinder * (percentage + 0.10);
    const maxAllowedTotal =totalWithoutBinder / (1 - depositPercentage);
    let maxBinderAllowed = maxAllowedTotal - totalWithoutBinder - deposit;

    // Ensure the binder + deposit is less than or equal to 43% of the total cost
    if (deposit > totalWithoutBinder * depositPercentage) {
        maxBinderAllowed = (totalWithoutBinder * depositPercentage - deposit) / (1 + percentage);
    }

    // Calculate the adjusted binder and deposit
    const binder = parseFloat(document.getElementById('binder').value);
    const discount = parseFloat(document.getElementById('discount').value);
    const adjustedBinder = binder + discount;
    let adjustedDeposit = lineHaul + adjustedBinder;

    // Calculate the deposit
    const deposit2 = lineHaul + adjustedBinder;

    // Calculate the processing fee
    let processingFee = 0;
    if (adjustedDeposit > 2000) {
        processingFee = deposit2 * 0.04;
    }

    adjustedDeposit += processingFee;   //Include the processing fee in the adjusted deposit

    // Calculate the total cost
    const totalCost = subtotal + adjustedDeposit + lineCharge1 + lineCharge2 + packingMaterials;

    // Calculate the remaining balance after the deposit
    const remainingBalance = totalCost - adjustedDeposit - lineHaul;

    // Split the remaining balance in half for pick up and delivery
    const pickUpPayment = remainingBalance / 2;
    const deliveryPayment = remainingBalance / 2;

    const totalmove2 = remainingBalance + adjustedDeposit + lineCharge1 + lineCharge2;

    /***************************************
    Display the results in the div element 
    ****************************************/
   
});