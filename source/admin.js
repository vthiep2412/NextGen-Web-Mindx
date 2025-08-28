// Global variables to hold product data
let basicProducts = [];
let productDetails = [];
let currentImageUrls = []; // To track images for the product being edited

// fetch data
async function fetchAdminProduct() {
    try {
        const response_details = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh');
        const response_basic = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah');
        
        basicProducts = await response_basic.json();
        productDetails = await response_details.json();

        adminProductDisplay(basicProducts, productDetails);
        console.log('Fetched Product Details:', productDetails);
        console.log('Fetched Basic Products:', basicProducts);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

async function isCurrentUserAdmin() {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) return false;

    const db = firebase.firestore();
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) return false;

    const email = session.user.email;
    try {
        const querySnapshot = await db.collection("users").where("email", "==", email).get();
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            return userData.isAdmin === true;
        }
    } catch (error) {
        console.error("Error checking admin status:", error);
    }
    return false;
}

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

//showing product and product sub screen
async function adminProductDisplay(basicProducts, productDetails) {
    const productListContainer = document.getElementById('product-list-admin');
    if (!productListContainer) {
        console.error('Error: The container element with id "product-list-admin" was not found in your HTML.');
        return;
    }
    productListContainer.innerHTML = '';

    const detailsMap = new Map(productDetails.map(detail => [detail.id, detail]));
    const ratingPromises = basicProducts.map(p => getAverageRating(p.id));
    const ratings = await Promise.all(ratingPromises);
    const ratingsMap = new Map(basicProducts.map((p, i) => [p.id, ratings[i]]));

    for (const product of basicProducts) {
        const detail = detailsMap.get(product.id);
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item-admin';

        const averageRating = ratingsMap.get(product.id) || 0;
        const roundedAverage = Math.round(averageRating);
        const starsHTML = '&#9733;'.repeat(roundedAverage) + '&#9734;'.repeat(5 - roundedAverage);
        const ratingText = `(${averageRating.toFixed(1)})`;

        productDiv.innerHTML = `
            <img class="product-image-admin" src="${product.pic1}" alt="${product.name}">
            <div class="product-info-admin">
                <h4 class="product-name-admin">${product.name}</h4>
                <div class="rating-stars-display-main" style="font-size: 1.2em; color: #ffc107; margin-bottom: 5px;">
                    ${starsHTML} <span style="font-size: 0.7em; vertical-align: middle;">${ratingText}</span>
                </div>
                <p class="product-id-admin">ID: ${product.id}</p>
                <p class="product-price-admin">Price: $${product.price}</p>
                <p class="product-brand-admin">Brand: ${product.Brand}</p>
                <p class="product-description-admin">Description: ${product.description}</p>
            </div>
            <div class="product-actions-admin">
                <button class="edit-btn" data-id="${product.id}">Edit</button>
                <button class="remove-btn" data-id="${product.id}">Remove</button>
            </div>
        `;
        productListContainer.appendChild(productDiv);
    }
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            showEditScreen(productId);
        });
    });
}

function renderProductImages(imageUrls) {
    const imagesContainer = document.getElementById('edit-images-container');
    imagesContainer.innerHTML = ''; // Clear existing images
    currentImageUrls = [...imageUrls];

    currentImageUrls.forEach((url, index) => {
        if (url) { // Ensure the URL is not null or empty
            const imgContainer = document.createElement('div');
            imgContainer.className = 'edit-image-item';
            imgContainer.innerHTML = `
                <img src="${url}" alt="Product Image">
                <div class="image-actions">
                    <button type="button" class="remove-image-btn" data-url="${url}">&times;</button>
                    <button type="button" class="edit-image-btn" data-index="${index}">Edit</button>
                </div>
            `;
            imagesContainer.appendChild(imgContainer);
        }
    });

    // Re-attach event listeners for the remove and edit buttons
    document.querySelectorAll('.remove-image-btn').forEach(button => {
        button.addEventListener('click', handleImageDelete);
    });

    document.querySelectorAll('.edit-image-btn').forEach(button => {
        button.addEventListener('click', handleImageEdit);
    });
}

function handleImageDelete(e) {
    const urlToRemove = e.target.dataset.url;
    currentImageUrls = currentImageUrls.filter(url => url !== urlToRemove);
    renderProductImages(currentImageUrls);
}

async function handleImageEdit(e) {
    const indexToEdit = e.target.dataset.index;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator) loadingIndicator.style.display = 'block';

        const newUrl = await uploadImageToImgBB(file);

        if (newUrl) {
            currentImageUrls[indexToEdit] = newUrl;
            renderProductImages(currentImageUrls);
        }

        if(loadingIndicator) loadingIndicator.style.display = 'none';
    };
    fileInput.click();
}

async function uploadImageToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    const apiKey = 'fc65d3021eb029b5f34cfb6a53c8d928';

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            console.error('ImgBB upload failed:', data.error.message);
            return null;
        }
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        return null;
    }
}

async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files.length) return;

    const loadingIndicator = document.getElementById('loading-indicator');
    if(loadingIndicator) loadingIndicator.style.display = 'block';

    for (const file of files) {
        const newUrl = await uploadImageToImgBB(file);
        if (newUrl) {
            currentImageUrls.push(newUrl);
        }
    }

    renderProductImages(currentImageUrls);
    if(loadingIndicator) loadingIndicator.style.display = 'none';
}

function showEditScreen(productId) {
    console.log(`Attempting to show edit screen for product ID: ${productId}`);
    const product = basicProducts.find(p => p.id == productId);
    console.log('Found basic product:', product);

    const details = productDetails.find(d => d.id == productId);
    console.log('Found product details:', details);

    if (!product) {
        console.error('Product not found for editing. ID:', productId);
        alert("Couldn't load product data for editing.");
        return;
    }

    // Switch to the edit screen
    document.getElementById('products-view').style.display = 'none';
    document.getElementById('edit-product-screen').style.display = 'block';

    // Populate basic information
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-brand').value = product.Brand;
    document.getElementById('edit-product-class').value = product.Class;
    document.getElementById('edit-product-date-add').value = product['Date-add'];
    document.getElementById('edit-product-description').value = product.description;

    // Populate images
    const imageUrls = [];
    for (let i = 1; i <= 10; i++) { // Assuming up to 10 images
        if (product[`pic${i}`]) {
            imageUrls.push(product[`pic${i}`]);
        }
    }
    renderProductImages(imageUrls);

    // Populate detailed information
    const detailsContainer = document.getElementById('edit-details-container');
    detailsContainer.innerHTML = ''; // Clear previous details

    if (details) {
        const detailFields = {
            'Description': details.description,
            'Dimensions': details.Dimensions,
            'Weight': details.Weight,
            'Voltage': details.Voltage,
            'Power': details.Power,
            'Water Pressure': details.WaterPressure,
            'Water Capacity': details.WaterCapacity
        };

        for (const [key, value] of Object.entries(detailFields)) {
            const fieldId = `edit-detail-${key.replace(/\s+/g, '-')}`;
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.innerHTML = `
                <label for="${fieldId}">${key}:</label>
                <input type="text" id="${fieldId}" value="${value || ''}">
            `;
            detailsContainer.appendChild(formGroup);
        }
    } else {
        console.log(`No extended details found for product with ID: ${productId}`);
        detailsContainer.innerHTML = '<p>This product does not have extended details.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const screens = document.querySelectorAll('.admin-screen');

    const firstScreen = document.querySelector('.admin-screen');
    if (firstScreen) firstScreen.style.display = 'block';

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            screens.forEach(screen => {
                screen.style.display = (screen.id === targetId) ? 'block' : 'none';
            });
        });
    });

    fetchAdminProduct();

    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('edit-product-screen').style.display = 'none';
        document.getElementById('products-view').style.display = 'block';
    });
    
    const imageUploadInput = document.getElementById('edit-image-upload');
    const addImageLabel = document.getElementById('add-image-label');

    if (addImageLabel) {
        addImageLabel.addEventListener('click', () => imageUploadInput.click());
    }
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }


    document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!confirm('Are you sure you want to save these changes?')) {
            return; // Stop if the user cancels
        }

        const loadingIndicator = document.getElementById('loading-indicator');
        if(loadingIndicator) loadingIndicator.style.display = 'block';

        const productId = document.getElementById('edit-product-id').value;

        // Find the original product to get all its data, since the form might not have everything.
        const originalProduct = basicProducts.find(p => p && p.id == productId);
        if (!originalProduct) {
            alert('Error: Could not find the original product data to update.');
            if(loadingIndicator) loadingIndicator.style.display = 'none';
            return;
        }

        // --- Update Basic Product Info ---
        const updatedBasicProduct = {
            ...originalProduct, // Start with the original data
            name: document.getElementById('edit-product-name').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            Brand: document.getElementById('edit-product-brand').value,
            Class: document.getElementById('edit-product-class').value.split(',').map(s => s.trim()),
            description: document.getElementById('edit-product-description').value,
        };

        // Clear old pic fields and add updated images
        Object.keys(updatedBasicProduct).forEach(key => {
            if (key.startsWith('pic')) {
                delete updatedBasicProduct[key];
            }
        });
        currentImageUrls.forEach((url, index) => {
            updatedBasicProduct[`pic${index + 1}`] = url;
        });

        // --- Update Product Details (if they exist) ---
        const originalDetails = productDetails.find(d => d && d.id == productId);
        let updatedDetails;
        if (originalDetails) {
            updatedDetails = {
                ...originalDetails,
                description: document.getElementById('edit-detail-Description').value,
                Dimensions: document.getElementById('edit-detail-Dimensions').value,
                Weight: document.getElementById('edit-detail-Weight').value,
                Voltage: document.getElementById('edit-detail-Voltage').value,
                Power: document.getElementById('edit-detail-Power').value,
                WaterPressure: document.getElementById('edit-detail-Water-Pressure').value,
                WaterCapacity: document.getElementById('edit-detail-Water-Capacity').value,
            };
        }

        // Log payload for Postman
        console.log("--- Basic Product Payload (for Postman) ---");
        console.log(`Endpoint: PUT https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah/${productId}`);
        console.log(JSON.stringify(updatedBasicProduct, null, 2));

        if (updatedDetails) {
            console.log("--- Product Details Payload (for Postman) ---");
            console.log(`Endpoint: PUT https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh/${productId}`);
            console.log(JSON.stringify(updatedDetails, null, 2));
        }

        alert('Payload logged to console for Postman. No data was sent to the server.');
        if(loadingIndicator) loadingIndicator.style.display = 'none';

        /* // Commented out the PUT request as requested
        try {
            // --- Send the updated data to the server for the specific product ---
            const basicResponse = await fetch(`https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBasicProduct),
            });

            if (!basicResponse.ok) {
                const errorText = await basicResponse.text();
                throw new Error(`Failed to update basic product info. Status: ${basicResponse.status}. Body: ${errorText}`);
            }

            if (updatedDetails) {
                const detailsResponse = await fetch(`https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedDetails),
                });
                if (!detailsResponse.ok) {
                    const errorText = await detailsResponse.text();
                    throw new Error(`Failed to update product details. Status: ${detailsResponse.status}. Body: ${errorText}`);
                }
            }

            alert('Product updated successfully!');
            await fetchAdminProduct(); // Refresh the product list
            document.getElementById('edit-product-screen').style.display = 'none';
            document.getElementById('products-view').style.display = 'block';

        } catch (error) {
            console.error('Error updating product:', error);
            alert(`Failed to update product: ${error.message}`);
        } finally {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
        }
        */
    });
});