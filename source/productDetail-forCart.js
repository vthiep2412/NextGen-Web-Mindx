let productDetails = [];
let basicProducts = [];
let checker = false;


async function fetchProductDetails() {
    try {
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh');
        productDetails = await response.json();
        console.log('Fetched Product Details:', productDetails);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

async function fetchBasicProducts() {
    try {
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        basicProducts = await response.json();
        console.log('Fetched Basic Products:', basicProducts);
    } catch (error) {
        console.error('Error fetching basic products:', error);
    }
}

async function showProductDetail(productId) {
    const product = productDetails.find(p => p.id === productId);
    const basicProduct = basicProducts.find(p => p.id === productId);

    if (!product || !basicProduct) {
        console.error('Product not found');
        return;
    }

    const detailScreen = document.createElement('div');
    detailScreen.id = 'detail-screen';
    let PicSrc = basicProduct.pic1;
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '20px';
    closeButton.style.fontSize = '24px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';

    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s';

    document.body.appendChild(overlay);
    document.body.appendChild(detailScreen);

    closeButton.addEventListener('click', () => {
        detailScreen.classList.remove('show');
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(detailScreen);
            checker = false;
            document.body.removeChild(overlay);
        }, 500);
    });

    overlay.addEventListener('click', () => {
        closeButton.click();
    });

    let buttonContent = '';
    let i = 1;
    while (basicProduct[`pic${i}`]) {
        buttonContent += `
            <button id="imageChange-thumbnails" onclick="document.getElementById('detail-img').src='${basicProduct[`pic${i}`]}';">
                <img src="${basicProduct[`pic${i}`]}" alt="Image ${i}">
            </button>
        `;
        i++;
    }

    const cartData = getCartFromLocalStorage();
    const quantity = cartData[productId] ? cartData[productId].cnt : 0;

    const productContent = `
        <div class="item1" style="flex: 0 0 200px; text-align: left;">
            <img id="detail-img" src="${PicSrc}" alt="${basicProduct.name}">
        </div>
        <div class="item4">
            ${buttonContent}
        </div>
        <div class="item2" style="flex: 1; padding-right: 20px; max-width: 600px; text-align: left">
            <h2 class="responsive-text2 Product-Detail-Text2">${basicProduct.name}</h2>
            <p class="responsive-text1 Product-Detail-Text"><strong>Brand:</strong> ${basicProduct.Brand}<br>
                <strong>Price:</strong> $${basicProduct.price}<br>
                <strong>Dimensions:</strong> ${product.Dimensions}<br>
                <strong>Weight:</strong> ${product.Weight}<br>
                <strong>Voltage:</strong> ${product.Voltage}<br>
                <strong>Power:</strong> ${product.Power}<br>
                <strong>Water pressure:</strong> ${product.WaterPressure}<br>
                <strong>Water capacity:</strong> ${product.WaterCapacity}<br>
            </p>
        </div>
        <div class="item3" style="flex: 0 0 200px; text-align: left;">
            <div class="buy-button-space">
                <h3 class="responsive-text25">Product description:</h3>
                <div class="p-inbox" id="quantity-buttons-main-fix">
                <div class="p-inbox" id="quantity-buttons-main">
                    <button class="quantity-button" id="quanti-butDec" onclick="updateQuantity('${product.id}', -1)">-</button>
                    <input type="number" id="input-change-cart" class="quantity-display" value="${quantity}" onchange="handleQuantityInput('${product.id}', this.value)">
                    <button class="quantity-button" id="quanti-butIn"onclick="updateQuantity('${product.id}', 1)">+</button>
                </div>
                <button class="buy-button" onclick="updateQuantity('${basicProduct.id}', 1);AlertCart('${basicProduct.id}')" id="add-to-cart-button">
                    Add to cart
                    <img src="./pic/icons8-fast-cart-90 (1).png" alt="Shopping Cart" style=" width:10%; height: auto;">
                </button>
                </div>
            </div>
            <p class="responsive-text3">${product.description}</p>
        </div>
    `;

    const contentContainer = document.createElement('div');
    contentContainer.className = 'Detail-screen-content';
    contentContainer.innerHTML = productContent;
    detailScreen.appendChild(contentContainer);
    detailScreen.appendChild(closeButton);

    setTimeout(() => {
        detailScreen.classList.add('show');
        overlay.style.opacity = '1';
    }, 10);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBasicProducts();
    fetchProductDetails();

    document.getElementById('search-results').addEventListener('click', (event) => {
        if (event.target.closest('.buy-button') || event.target.closest('#quantity-buttons-search')) {
            return;
        }
        // Use classList to get the product id (second class)
        const productDiv = event.target.closest('.search-product-item');
        if (!productDiv) return;
        const classList = Array.from(productDiv.classList);
        const productId = classList.find(cls => cls !== 'search-product-item' && /^\d+$/.test(cls));
        if (productId) {
            showProductDetail(Number(productId));
            const item1 = document.querySelector('.item1');
            const item4 = document.querySelector('.item4');
            if (item1 && item4) {
                item4.style.maxHeight = (item1.offsetHeight - 50) + 'px';
            }
        }
    });
    setTimeout(() => {
        document.querySelectorAll('.cart-item').forEach(item => {
            addEventListener('click', (event) => {
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
                    const item1 = document.querySelector('.item1');
                    const item4 = document.querySelector('.item4');
                    if (item1 && item4) {
                        item4.style.maxHeight = (item1.offsetHeight - 50) + 'px';
                    }
                }
            });
        });
    },1000);

});
