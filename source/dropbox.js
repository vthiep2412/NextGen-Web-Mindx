// dropbox.js
// Handles sorting of product-item elements in each product-list based on dropbox selection

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(()=>{
        const sortBox = document.getElementById('sort-dropbox');
        if (!sortBox) return;
        // Sort on first load (default: A to Z)
        sortProducts('a-z');
        sortBox.value = 'a-z';
        sortBox.addEventListener('change', function() {
            sortProducts(sortBox.value);
        });
    },2500)
});

function sortProducts(sortType) {
    document.querySelectorAll('.product-list').forEach(productList => {
        const items = Array.from(productList.querySelectorAll('.product-item'));
        items.sort((a, b) => {
            if (sortType === 'price-high-low') {
                return getPrice(b) - getPrice(a);
            } else if (sortType === 'price-low-high') {
                return getPrice(a) - getPrice(b);
            } else if (sortType === 'a-z') {
                return getName(a).localeCompare(getName(b));
            } else if (sortType === 'z-a') {
                return getName(b).localeCompare(getName(a));
            }
            return 0;
        });
        // Remove all and re-append in sorted order
        items.forEach(item => productList.appendChild(item));
    });
}

function getPrice(item) {
    // Try to find the price in the product-item
    // Looks for <p class="p-inbox">Price: $123</p>
    const priceP = Array.from(item.querySelectorAll('.product-item1 .p-inbox'))
        .find(p => /Price:\s*\$/.test(p.textContent));
    if (!priceP) return 0;
    const match = priceP.textContent.match(/Price:\s*\$([\d.,]+)/);
    if (match) {
        // Remove commas and parse float
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
}

function getName(item) {
    return item.querySelector('h3')?.textContent?.trim() || '';
}
