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

async function fetchProducts() {
    try {
        // Use local temp.json instead of remote fetch
        const response = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        const products = await response.json();
        console.log(products);
        displayProductsByClass(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function createSectionForClass(className) {
    const section = document.createElement('section');
    section.id = className.replace(/\s+/g, '-').toLowerCase();
    section.className = 'product-class-section';
    const title = document.createElement('h2');
    title.textContent = className;
    title.className = 'class-title';
    section.appendChild(title);
    const productList = document.createElement('div');
    productList.className = 'product-list';
    // productList.id = 'product-list';
    // Remove id from productList
    section.appendChild(productList);
    return { section, productList };
}

async function displayProductsByClass(products) {
    const MAIN_CLASS = 'Coffee tools';
    const filteredProducts = products.filter(product => Array.isArray(product.Class) && product.Class.includes(MAIN_CLASS));

    const classSet = new Set();
    filteredProducts.forEach(product => {
        product.Class.forEach(cls => {
            if (cls !== MAIN_CLASS) classSet.add(cls);
        });
    });
    let allSubClasses = Array.from(classSet);
    const preferredOrder = ['Coffee Utilties','Milk Jug','Cleaning tools'];
    allSubClasses.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    const cartData = getCartFromLocalStorage ? getCartFromLocalStorage() : {};

    // Fetch all ratings in parallel
    const ratingPromises = filteredProducts.map(p => getAverageRating(p.id));
    const ratings = await Promise.all(ratingPromises);
    const ratingsMap = new Map(filteredProducts.map((p, i) => [p.id, ratings[i]]));
    for (const subClassName of allSubClasses) {
        const { section, productList } = createSectionForClass(subClassName);
        for (const product of filteredProducts) {
            if (product.Class.includes(subClassName)) {
                const quantity = cartData[product.id] ? cartData[product.id].cnt : 0;
                // Use two classes: 'product-item' and the product id as a class
                const productItem = document.createElement('div');
                productItem.className = `product-item ${product.id}`;
                // Remove setAttribute('id', ...)
                let additionalAttributes = '';
                for (const key in product) {
                    if (!['id', 'name', 'description', 'price'].includes(key) && !key.startsWith('pic')) {
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
                    }, 3000);
                }
            }
        }
        if (productList.children.length > 0) {
            productsContainer.appendChild(section);
        }
    }
    document.querySelectorAll('.product-list').forEach(applySmoothScroll);
}

function applySmoothScroll(productList) {
    if (productList.scrollWidth <= productList.clientWidth) {
        productList.style.justifyContent = "center";
        return;
    }

    productList.style.justifyContent = "flex-start";

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let animationFrame;

    function momentumScroll() {
        if (Math.abs(velocity) < 0.1) {
            cancelAnimationFrame(animationFrame);
            return;
        }
        productList.scrollLeft += velocity;
        velocity *= 0.95; // Damping factor
        animationFrame = requestAnimationFrame(momentumScroll);
    }

    if (!productList.dataset.scrollApplied) {
        productList.addEventListener('mousedown', (e) => {
            isDown = true;
            productList.classList.add('active');
            startX = e.pageX - productList.offsetLeft;
            scrollLeft = productList.scrollLeft;
            velocity = 0;
            cancelAnimationFrame(animationFrame);
        });

        productList.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            productList.classList.remove('active');
            animationFrame = requestAnimationFrame(momentumScroll);
        });

        productList.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            productList.classList.remove('active');
            animationFrame = requestAnimationFrame(momentumScroll);
        });

        productList.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - productList.offsetLeft;
            const walk = (x - startX);
            const newScrollLeft = scrollLeft - walk;
            velocity = newScrollLeft - productList.scrollLeft;
            productList.scrollLeft = newScrollLeft;
        });

        productList.dataset.scrollApplied = 'true';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
});
fetchProducts();

window.addEventListener('resize', () => {
    document.querySelectorAll('.product-list').forEach(applySmoothScroll);
});