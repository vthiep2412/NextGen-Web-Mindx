// Global variable to track selected payment method
let selectedPaymentMethod = null;
function setSelectedPaymentMethod(paymentInfoId) {
    selectedPaymentMethod = paymentInfoId;
}

function getPaymentData() {
    if (!selectedPaymentMethod) {
        return null;
    }

    const visibleInfo = document.getElementById(selectedPaymentMethod);
    if (!visibleInfo) {
        return null;
    }

    const data = {};
    // Note: For MoMo, we will handle the amount separately.
    const inputs = visibleInfo.querySelectorAll('input, select');

    switch (selectedPaymentMethod) {
        case 'credit-card-info':
            data['cc-name'] = document.getElementById('cc-name').value;
            data['cc-number'] = document.getElementById('cc-number').value;
            data['cc-expiry'] = document.getElementById('cc-expiry').value;
            data['cc-cvv'] = document.getElementById('cc-cvv').value;
            break;
        case 'crypto-info':
            data['crypto-currency'] = document.getElementById('crypto-currency').value;
            data['wallet-address'] = '1234567890abcdef';
            break;
        case 'paypal-info':
            break;
        case 'google-pay-info':
            break;
        case 'apple-pay-info':
            break;
        case 'samsung-pay-info':
            break;
        case 'buy-now-pay-later-info':
            data['cc-name'] = document.getElementById('cc-name').value;
            data['cc-number'] = document.getElementById('cc-number').value;
            data['cc-expiry'] = document.getElementById('cc-expiry').value;
            data['cc-cvv'] = document.getElementById('cc-cvv').value;
            data['bnpl-amount'] = document.getElementById('bnpl-amount') ? document.getElementById('bnpl-amount').value : "";
            data['bnpl-date'] = document.getElementById('bnpl-date').value;
            break;
        case 'transfer-money-info':
            data['transfer-amount'] = document.getElementById('transfer-amount').value;
            data['transfer-account'] = document.getElementById('transfer-account').value;
            break;
        case 'momo-info':
            // For MoMo, we leave payment details empty here.
            break;
        case 'zalo-pay-info':
            break;
        case 'vnpay-info':
            break;
        case 'bruh-info':
            break;
        default:
            return null;
    }

    console.log('Retrieved Payment Data:', data);
    return data;
}

document.querySelectorAll('.payment-button').forEach(button => {
    button.addEventListener('click', (event) => {
        // Extract the paymentInfoId from the onclick attribute
        const match = event.currentTarget.getAttribute('onclick').match(/'([^']+)'/);
        if(match) {
            const paymentInfoId = match[1];
            setSelectedPaymentMethod(paymentInfoId);
        }
    });
});

// Helper function to show a Bootstrap toast with a given message
function showBootstrapToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error("Toast container not found.");
        return;
    }
    
    // Create a new toast element
    const toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");
    
    // Set the inner HTML of the toast
    toastEl.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">Notification</strong>
        <small>Now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    // Append the toast element to the container
    toastContainer.appendChild(toastEl);
    
    // Initialize and show the toast (with a 5-second delay before auto-hide)
    const bsToast = new bootstrap.Toast(toastEl, { delay: 5000 });
    bsToast.show();
    
    // Remove the toast element from the DOM after it hides
    toastEl.addEventListener('hidden.bs.toast', function () {
      toastEl.remove();
    });
}

async function requestVNPayPayment(amount) {
    // VNPay expects the amount in the smallest currency unit.
    // For example, if amount is in VND, multiply by 100.
    const vnp_Amount = amount * 24000;
    
    // Dummy VNPay sandbox parameters
    const params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: "YOUR_VNPAY_TMN_CODE", // Replace with your VNPay TMN code
        vnp_Amount: vnp_Amount.toString(),
        vnp_CurrCode: "VND",
        vnp_TxnRef: Date.now().toString(),
        vnp_OrderInfo: "Payment for order " + Date.now().toString(),
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: "https://yourdomain.com/vnpay_return", // Replace with your return URL
        vnp_IpAddr: "127.0.0.1", // Replace with the user's IP address if available
        vnp_CreateDate: new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14)
    };

    // Sort the parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    let queryString = "";
    sortedKeys.forEach((key, index) => {
        queryString += `${key}=${encodeURIComponent(params[key])}`;
        if (index < sortedKeys.length - 1) {
            queryString += "&";
        }
    });

    // Normally, you'd compute the secure hash (signature) using your secret key.
    // For demonstration purposes, we use a dummy signature.
    const secretKey = "YOUR_VNPAY_SECRET_KEY"; // Replace with your secret key
    const vnp_SecureHash = "dummySecureHash";

    // Append the signature to the query string
    queryString += `&vnp_SecureHash=${vnp_SecureHash}`;

    // Construct the final VNPay URL using the sandbox endpoint
    const vnpUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${queryString}`;
    console.log("VNPay payment URL:", vnpUrl);

    // Redirect the user to VNPay's payment page
    window.location.href = vnpUrl;
}

// Function to request MoMo payment in sandbox mode
async function requestMoMoPayment(amount) {
    // Dummy sandbox credentials (replace with your actual sandbox credentials)
    const partnerCode = "MOMO";
    const accessKey = "ACCESS_KEY";
    const secretKey = "SECRET_KEY";
    const requestId = Date.now().toString();
    const orderId = "ORDER" + requestId;
    const orderInfo = "Payment for order " + orderId;
    const returnUrl = "https://yourdomain.com/return";
    const notifyUrl = "https://yourdomain.com/notify";
    const extraData = ""; // Optional
    
    // Normally, you would compute the HMAC-SHA256 signature with your secretKey.
    // For demonstration purposes, we use a dummy signature.
    const signature = "dummySignature";
    
    const params = {
        partnerCode,
        accessKey,
        requestId,
        amount: amount.toString(),
        orderId,
        orderInfo,
        returnUrl,
        notifyUrl,
        extraData,
        signature
    };

    console.log("Sending MoMo payment request with params:", params);

    try {
        const response = await fetch("https://test-payment.momo.vn/v2/gateway/api/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });
        const result = await response.json();
        console.log("MoMo payment response:", result);
        if (result.payUrl) {
            // Redirect to the MoMo payment page
            window.location.href = result.payUrl;
        } else {
            showBootstrapToast("MoMo payment failed.");
        }
    } catch (error) {
        console.error("Error sending MoMo payment request:", error);
        showBootstrapToast("Error sending MoMo payment request.");
    }
}

// Update the 'buy-now' button event listener
document.getElementById('buy-now').addEventListener('click', () => {
    const paymentData = getPaymentData();
    const address = document.getElementById('address-autocomplete').value;

    if (!paymentData && selectedPaymentMethod !== "momo-info" && selectedPaymentMethod !== "vnpay-info") {
        showBootstrapToast("No payment method selected.");
        return;
    }
    if (!address || address.trim() === "") {
        showBootstrapToast("Please enter your address.");
        return;
    }
    
    console.log('Payment Data:', paymentData);
    console.log('Address:', address);
    
    // Get the total amount from the DOM (e.g., grand total)
    const totalAmountStr = document.getElementById('grand-total').innerText;
    console.log('Total Amount:', totalAmountStr);
    const totalAmount = parseFloat(totalAmountStr);
    
    if (selectedPaymentMethod === "momo-info") {
        requestMoMoPayment(totalAmount);
    } else if (selectedPaymentMethod === "vnpay-info") {
        // Call the VNPay integration function
        requestVNPayPayment(totalAmount);
    } else if (localStorage.getItem('cart') == null){
        const toastMessage = `Your cart doesn't have any item.`;
        showBootstrapToast(toastMessage);
    }
    else {
        const toastMessage = `Your item will be shipped to ${address} in ꝏ of time.`;
        showBootstrapToast(toastMessage);
        localStorage.removeItem('cart');
        cartData = {};
        syncLocalCartToFirebase()
        displayCartItems();
    }
});
document.getElementById('clear-cart').addEventListener('click', () => {
    let toastMessageClear = `Your cart has been cleared!`;
    showBootstrapToast(toastMessageClear);
    localStorage.removeItem('cart');
    cartData = {};
    syncLocalCartToFirebase()
    displayCartItems();
});

