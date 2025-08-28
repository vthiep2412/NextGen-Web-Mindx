let products = [];
let checkForShowing = false;

async function fetchProducts() {
    try {
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        products = await response.json();
        console.log('Fetched Products:', products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

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
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
    bsToast.show();
    
    // Remove the toast element from the DOM after it hides
    toastEl.addEventListener('hidden.bs.toast', function () {
      toastEl.remove();
    });
}

function AlertCart(id) {
    const product = products.find(product => product.id === Number(id));
    let toastMessage = `No product found.`;
    if (product !== undefined) {
        toastMessage = `${product.name} added to cart`;
        showBootstrapToast(toastMessage);
        return 0;
    } else {
        showBootstrapToast(toastMessage);
        return 0;
    }
}

function updateQuantity(productId, change) {
    console.log('updateQuantity called with productId:', productId, 'and change:', change);
    const cartData = getCartFromLocalStorage();
    if (change > 0 && !cartData[productId]) {
        cartData[productId] = { id: productId, cnt: 0 };
    }

    if (cartData[productId]) {
        cartData[productId].cnt += change;

        if (cartData[productId].cnt < 0) {
            cartData[productId].cnt = 0;
        }
        if (cartData[productId].cnt === 0) {
            delete cartData[productId];
        } else if (cartData[productId].cnt > 999) {
            cartData[productId].cnt = 999;
        }
        saveCartToLocalStorage(cartData);
        const productItem = document.getElementById(productId);
        if (productItem) {
            // const quantityDisplay = productItem.querySelector('.quantity-display');
            // quantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
            productItem.querySelectorAll('.quantity-display').forEach(quantityDisplay => {
                quantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
            });
        }

        const detailQuantityDisplay = document.querySelector('#detail-screen .quantity-display');
        if (detailQuantityDisplay) {
            detailQuantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
        }

        // Update all product-item and search-product-item elements with this product id
        const productItems = document.querySelectorAll('.product-item[class~="' + productId + '"]');
        const searchProductItems = document.querySelectorAll('.search-product-item[class~="' + productId + '"]');
        [...productItems, ...searchProductItems].forEach(item => {
            item.querySelectorAll('.quantity-display').forEach(quantityDisplay => {
                quantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
            });
        });
    }
}

function handleQuantityInput(productId, value) {
    let cartData = getCartFromLocalStorage();

    if (!cartData) {
        cartData = {};
    }

    let newQuantity = parseInt(value, 10);

    if (newQuantity < 0) {
        newQuantity = 0;
    } else if (newQuantity > 99) {
        newQuantity = 99;
    }

    if (newQuantity === 0) {
        delete cartData[productId];
    } else {
        cartData[productId] = { id: productId, cnt: newQuantity };
    }

    saveCartToLocalStorage(cartData);
    const productItem = document.getElementById(productId);
    if (productItem) {
        const quantityDisplay = productItem.querySelector('.quantity-display');
        quantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
    }

    const detailQuantityDisplay = document.querySelector('#detail-screen .quantity-display');
    if (detailQuantityDisplay) {
        detailQuantityDisplay.value = cartData[productId] ? cartData[productId].cnt : 0;
    }
}


function removeExtraSpace(str) {
    while (str.includes("  ")) {
        str = str.replace("  ", " ");
    }
    return str.trim();
}

function filterProducts(searchTerm) {
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayFilteredProducts(filteredProducts);
}

async function displayFilteredProducts(filteredProducts) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (filteredProducts.length === 0) {
        searchResults.innerHTML = '<p>No products found.</p>';
        //console.log('tempScreen display set to block in displayFilteredProducts (no products found)');
        tempScreen.style.display = 'block';
        return;
    }

    const cartData = getCartFromLocalStorage();

    filteredProducts.forEach(product => {
        const quantity = cartData[product.id] ? cartData[product.id].cnt : 0;

        // Use two classes: 'search-product-item' and the product id as a class
        const productItem = document.createElement('div');
        productItem.className = `search-product-item ${product.id}`;
        let additionalAttributes = '';
        for (const key in product) {
            if (!['id', 'name', 'description', 'price'].includes(key) && !key.startsWith('pic')) {
                additionalAttributes += `<span class="attribute">${key}: ${product[key]}</span>`;
            }
        }
        productItem.innerHTML = `
            <div style="flex: 1;">
                <img src="${product.pic1}" alt="${product.name}" style="height: auto;">
                <h5>${product.name}</h5>
                <p class="p-inbox">${product.description}</p>
                <p>Price: $${product.price}</p>
                <p class="p-inbox">${additionalAttributes}</p>
            </div>
            <div style="flex: 0 0 100px;">
                <div class="p-inbox" id="quantity-buttons-search">
                    <button class="quantity-button" id="quanti-butDec" onclick="updateQuantity('${product.id}', -1)">-</button>
                    <input type="number" id="input-change-cart" class="quantity-display" value="${quantity}" onchange="handleQuantityInput('${product.id}', this.value)">
                    <button class="quantity-button" id="quanti-butIn"onclick="updateQuantity('${product.id}', 1)">+</button>
                </div>
                <button class="buy-button" id="buy-search-button-fix" onclick="updateQuantity('${product.id}', 1);AlertCart('${product.id}')">
                    <img src="./pic/icons8-fast-cart-90 (1).png" alt="Shopping Cart" style=" width:20%; height: auto;">
                </button>
            </div>
        `;
        searchResults.appendChild(productItem);
        
        let imageCount = 0;
        for (let i = 1; product[`pic${i}`]; i++) {
            imageCount++;
        }

        if (imageCount > 1) {
            let currentPic = 1;
            setInterval(() => {
                const imgElement = productItem.querySelector('img');
                imgElement.style.opacity = 0;

                setTimeout(() => {
                    currentPic = currentPic === imageCount ? 1 : currentPic + 1;
                    imgElement.src = product[`pic${currentPic}`];
                    imgElement.style.opacity = 1;
                }, 1200);
            }, 3500);
        }
    });
    if(!checkForShowing){
        tempScreen.style.display = 'block';
    } else{
        checkForShowing = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    const searchInput = document.querySelector('.form-control');
    searchInput.addEventListener('input', (event) => {
        let searchTerm = event.target.value;
        searchTerm = removeExtraSpace(searchTerm);
        if (searchTerm === '') {
            displayFilteredProducts(products);
        } else {
            filterProducts(searchTerm);
        }
    });

    document.getElementById('close-search').addEventListener('click', () => {
        // checkForShowing = true;
        // const tempScreen = document.getElementById('temp-screen');
        // setTimeout(() => {
        //     tempScreen.style.display = 'none';
        //     tempScreen.style.maxHeight = 'calc(100vh - 100px)';
        // },500)
        // tempScreen.style.maxHeight = '0';
        const searchBT = document.getElementById("search-button");
        searchBT.click();
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const tempScreen = document.getElementById('temp-screen');
        const serchPlace = document.getElementById('search-collapse');
        if (tempScreen.style.display != 'none') {
            setTimeout(() => {
                tempScreen.style.display = 'none';
            },500)
            tempScreen.style.maxHeight = '0';
        } else {
            if(serchPlace.classList.contains('show') === false) {
                tempScreen.style.maxHeight = 'calc(100vh - 100px)';
                let searchTerm = searchInput.value;
                searchTerm = removeExtraSpace(searchTerm);
                if (searchTerm === '') {
                    displayFilteredProducts(products);
                } else {
                    filterProducts(searchTerm);
                }
            }
        }
    });
});
