let cartData = getCartFromLocalStorage();
let cartProducts = [];

async function fetchCartProducts() {
    try {
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        cartProducts = await response.json();
        displayCartItems();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function removeFromCart(productId) {
    const cartData = getCartFromLocalStorage();
    delete cartData[productId];
    saveCartToLocalStorage(cartData);
    displayCartItems();
}

function updateQuantity(productId, change) {
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
        displayCartItems();
        document.querySelectorAll('.cart-item').forEach(item => {
            addEventListener('click', (event) => {
                console.log("okok");
                if (event.target.closest('#quantity-buttons') || event.target.closest('#removeItem-button')) {
                    return;
                }
                if (checker) {
                    return;
                }
                checker = true;
                const productDiv = event.target.closest('.cart-item');
                if (!productDiv) return;
                const classList = Array.from(productDiv.classList);
                const productId = classList.find(cls => cls !== 'cart-item' && /^\d+$/.test(cls));
                if (productId) {
                    showProductDetail(Number(productId));
                    checker = true;
                }
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
    displayCartItems();
    document.querySelectorAll('.cart-item').forEach(item => {
        addEventListener('click', (event) => {
            console.log("okok");
            if (event.target.closest('#quantity-buttons') || event.target.closest('#removeItem-button')) {
                return;
            }
            if (checker) {
                return;
            }
            checker = true;
            const productDiv = event.target.closest('.cart-item');
            if (!productDiv) return;
            const classList = Array.from(productDiv.classList);
            const productId = classList.find(cls => cls !== 'cart-item' && /^\d+$/.test(cls));
            if (productId) {
                showProductDetail(Number(productId));
                checker = true;
            }
        });
    });
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('sec1');
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    const cartData = getCartFromLocalStorage();
    console.log(cartData);

    for (const productId in cartData) {
        const product = cartProducts.find(p => p.id == productId);
        const quantity = cartData[productId].cnt;

        if (product) {
            const itemTotal = product.price * quantity;
            const itemElement = document.createElement('div');
            itemElement.className = `cart-item ${productId}`;
            itemElement.innerHTML = `
                <div id="content-sec1">
                    <div style="flex: 1;" id="content1-sec1">
                        <h5 class="cart-title">${product.name}</h5>
                        <p class="p-inbox cart-money" style="font-weight:600; font-size:20px;">Price: $${product.price}</p>
                        <p class="cart-text">Quantity: </p>
                        <br>
                        <div class="p-inbox" id="quantity-buttons">
                            <button class="quantity-button" id="quanti-butDec" onclick="updateQuantity2('${productId}', -1)">-</button>
                            <input type="number" id="input-change-cart" class="quantity-display" value="${quantity}" onchange="handleQuantityInput2('${productId}', this.value)">
                            <button class="quantity-button" id="quanti-butIn"onclick="updateQuantity2('${productId}', 1)">+</button>
                        </div>
                        <p class="p-inbox">Total: $${itemTotal.toFixed(2)}</p>
                    </div>
                    <div style="flex: 0 0 100px;" id="content2-sec1">
                        <button id="removeItem-button" onclick="removeFromCart('${productId}')">X</button>
                        <div id="img-con"><img src="${product.pic1}" alt="${product.name}"></div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            totalPrice += itemTotal;
            let imageCount = 0;
            for (let i = 1; product[`pic${i}`]; i++) {
                imageCount++;
            }

            // if (imageCount > 1) {
            //     let currentPic = 1;
            //     setInterval(() => {
            //         const imgElement = itemElement.querySelector('img');
            //         imgElement.style.opacity = 0;

            //         setTimeout(() => {
            //             currentPic = currentPic === imageCount ? 1 : currentPic + 1;
            //             imgElement.src = product[`pic${currentPic}`];
            //             imgElement.style.opacity = 1;
            //         }, 1200);
            //     }, 3500);
            // }
        }
    }

    const tip = totalPrice * 0.05;
    const vat = totalPrice * 0.10;
    const grandTotal = totalPrice + tip + vat;

    document.getElementById('total-amount').innerText = totalPrice.toFixed(2);
    document.getElementById('tip-amount').innerText = tip.toFixed(2);
    document.getElementById('vat-amount').innerText = vat.toFixed(2);
    document.getElementById('grand-total').innerText = grandTotal.toFixed(2);
}

function updateQuantity2(productId, change) {
    const cartData = getCartFromLocalStorage();

    if (change > 0 && !cartData[productId]) {
        cartData[productId] = { id: productId, cnt: 0 };
    }

    if (cartData[productId]) {
        cartData[productId].cnt += change;

        if (cartData[productId].cnt < 1) {
            cartData[productId].cnt = 1;
        }
        else if (cartData[productId].cnt > 99) {
            cartData[productId].cnt = 99;
        }
        saveCartToLocalStorage(cartData);
        displayCartItems();
    }
}

function handleQuantityInput2(productId, value) {
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

    cartData[productId] = { id: productId, cnt: newQuantity };

    saveCartToLocalStorage(cartData);

    displayCartItems();
}

function getCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : {};
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCartProducts();
    displayCartItems();
});
