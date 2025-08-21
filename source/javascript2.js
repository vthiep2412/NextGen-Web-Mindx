async function getAverageRating(productId) {
    const db = firebase.firestore();
    const ratingDocRef = db.collection("user-rating").doc(String(productId));
    const ratingDoc = await ratingDocRef.get();

    if (ratingDoc.exists) {
        const ratingsData = ratingDoc.data();
        const ratings = ratingsData.ratings || [];
        const topLevelRatings = ratings.filter(r => !r.replyTo && r.rating > 0);
        const totalRatings = topLevelRatings.length;

        if (totalRatings > 0) {
            const sumOfRatings = topLevelRatings.reduce((acc, r) => acc + r.rating, 0);
            return (sumOfRatings / totalRatings);
        }
    }
    return 0;
}

async function fetchProducts2() {
    try {
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        const products = await response.json();
        console.log(products);
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const cartData = getCartFromLocalStorage();

    const sortedProducts = products
        .sort((a, b) => new Date(b["Date-add"]) - new Date(a["Date-add"]))
        .slice(0, 3);

    // Fetch all ratings in parallel
    const ratingPromises = sortedProducts.map(p => getAverageRating(p.id));
    const ratings = await Promise.all(ratingPromises);
    const ratingsMap = new Map(sortedProducts.map((p, i) => [p.id, ratings[i]]));

    sortedProducts.forEach(product => {
        const quantity = cartData[product.id] ? cartData[product.id].cnt : 0;
        console.log('Product ID:', product.id, 'Quantity:', quantity);

        const productItem = document.createElement('div');
        productItem.className = `product-item ${product.id}`;

        let additionalAttributes = '';
        for (const key in product) {
            if (!['id', 'name', 'description', 'price', 'Date-add'].includes(key) && !key.startsWith('pic')) {
                additionalAttributes += `<span class="attribute">${key}: ${product[key]}</span>`;
            }
        }

        const averageRating = ratingsMap.get(product.id) || 0;
        const roundedAverage = Math.round(averageRating);
        const starsHTML = '&#9733;'.repeat(roundedAverage) + '&#9734;'.repeat(5 - roundedAverage);
        const ratingText = `(${averageRating.toFixed(1)})`;

        productItem.innerHTML = `
            <img src="${product.pic1}" alt="${product.name}">
            <div class="product-item1">
                <h3>${product.name}</h3>
                <div class="rating-stars-display-main" style="font-size: 1.2em; color: #ffc107; margin-bottom: 5px;">
                   ${starsHTML} <span style="font-size: 0.7em; vertical-align: middle;">${ratingText}</span>
                </div>
                <p class="p-inbox">${product.description}</p>
                <p class="p-inbox">Price: $${product.price}</p>
                <p class="p-inbox">${additionalAttributes}</p>
            </div>
            <div class="product-item2">
                <div id="quantity-buttons-main-fix">
                    <div class="p-inbox" id="quantity-buttons-main">
                        <button class="quantity-button" id="quanti-butDec" onclick="updateQuantity('${product.id}', -1)">-</button>
                        <input type="number" id="input-change-cart" class="quantity-display" value="${quantity}" onchange="handleQuantityInput('${product.id}', this.value)">
                        <button class="quantity-button" id="quanti-butIn" onclick="updateQuantity('${product.id}', 1)">+</button>
                    </div>
                </div>
                <div class="buy-button-space">
                    <button class="buy-button" id="buy-button-fix" onclick="updateQuantity('${product.id}', 1); AlertCart('${product.id}')">
                        <img src="./pic/icons8-fast-cart-90 (1).png" alt="Shopping Cart" style=" width:40%; height: auto;">
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(productItem);

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
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
});
fetchProducts2();