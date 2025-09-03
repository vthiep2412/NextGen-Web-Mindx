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
    // Clear previous loading indicators
    productListContainer.innerHTML = '';
    // Show loading indicator before rendering products
    const loadingDiv = document.createElement('div');
    loadingDiv.style.padding = '16px';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.color = '#888';
    loadingDiv.style.fontSize = '1.1em';
    loadingDiv.innerText = 'Loading products...';
    productListContainer.appendChild(loadingDiv);

    const detailsMap = new Map(productDetails.map(detail => [detail.id, detail]));
    const ratingPromises = basicProducts.map(p => getAverageRating(p.id));
    const ratings = await Promise.all(ratingPromises);
    const ratingsMap = new Map(basicProducts.map((p, i) => [p.id, ratings[i]]));

    // Remove loading indicator before rendering
    productListContainer.innerHTML = '';

    if (basicProducts.length == 0) {
        productListContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #888; font-size: 1.1em;">No products found.<br>Please check your database connection.</div>';
        return;
    }

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
                <button class="edit-btn btn btn-primary btn-sm" data-id="${product.id}">Edit</button>
                <button class="remove-btn btn btn-danger btn-sm" data-id="${product.id}">Remove</button>
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
                    <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
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
    const indexToClear = parseInt(e.target.dataset.index, 10);
    currentImageUrls[indexToClear] = "";
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
    for (let i = 1; product[`pic${i}`]; i++) {
        imageUrls.push(product[`pic${i}`]);
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


// Fetches user data from Firestore and displays it in the 'Accounts' tab.
async function fetchAndDisplayUsers() {
    console.log("Attempting to fetch and display users...");
    const accountListContainer = document.getElementById('account-list-admin');
    if (!accountListContainer) {
        console.error('Error: Account list container element not found in the DOM.');
        return;
    }
    // Format loading message like product loading
    accountListContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #888; font-size: 1.1em;">Loading accounts...</div>';
    console.log("Set account list container to 'Loading accounts...'.");

    try {
        const db = firebase.firestore();
        console.log("Fetching 'users' collection from Firestore...");
        const usersSnapshot = await db.collection("users").get();
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // console.log("Successfully fetched and processed user data:", usersData);

        // Client-side cannot list all Firebase Auth users directly.
        // This implementation relies on the 'users' collection in Firestore,
        // which should be populated when users sign up or log in.
        // The 'providerId' helps identify the authentication method.

        if (usersData.length === 0) {
            console.log("No users found in the 'users' collection.");
            accountListContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: #888; font-size: 1.1em;">No accounts found.<br>Please check your data.</div>';
            return;
        }

        let accountsHtml = '';
        console.log("Generating HTML for each user...");
        for (const user of usersData) {
            const avatar = user.imageurl || 'https://via.placeholder.com/50'; // Default avatar if none is set
            const userName = user.username || 'N/A'; // Default name if not available
            const provider = user.providerId || 'Email/Password'; // Assume default provider if not specified
            const userid = user.id || 'N/A';
            const email = user.email || 'N/A';
            // let emailHtml = '';
            // if ((provider == 'email' || provider == 'google') && user.email) {
            //     emailHtml = `<div class=\"account-email\">&lt;${user.email}&gt;</div>`;
            //     console.log(`Email found for user ${userName}: ${user.email}`);
            // }
            accountsHtml += `
                <div class=\"account-item\">
                    <img src=\"${avatar}\" alt=\"Avatar\" class=\"account-avatar\">
                    <div class=\"account-info\">
                        <div class=\"account-name\">@${userName}</div>
                        <div class=\"account-email account-method\">&lt;${email}&gt</div>
                        <div class=\"account-method\">Provider: ${provider}</div>
                        <div class=\"account-id account-method\">UserID: ${userid}</div>
                    </div>
                    <div class=\"account-actions\">
                        <button id=\"acc-edit-${userName}\" class=\"btn btn-primary btn-sm\" data-userid=\"${user.id}\">Edit</button>
                        <button id=\"acc-remove-${userName}\" class=\"btn btn-danger btn-sm\" data-userid=\"${user.id}\">Remove</button>
                    </div>
                </div>
                <hr>
            `;
        }
        accountListContainer.innerHTML = accountsHtml;
        //console.log("Successfully rendered user accounts in the list container.");
        // Attach event listeners to edit buttons
        usersData.forEach(user => {
            const btn = document.getElementById(`acc-edit-${user.username || 'N/A'}`);
            if (btn) {
                btn.addEventListener('click', function() {
                    showEditAccountScreen(user.id);
                    console.log("Edit account button clicked for user:", user.id);
                });
            }
        });
        // Attach event listeners to remove buttons
        usersData.forEach(user => {
            const btn = document.getElementById(`acc-remove-${user.username || 'N/A'}`);
            if (btn) {
                btn.addEventListener('click', function() {
                    removeUser(user.id);
                    console.log("Remove account button clicked for user:", user.id);
                });
            }
        });
    } catch (error) {
        console.error("Error fetching or displaying users:", error);
        accountListContainer.innerHTML = 'Error loading accounts. Please check the console for details.';
    }
}

// Add New Product Button logic for static HTML form
const addProductNavBtn = document.getElementById('add-product-nav-btn');
if (addProductNavBtn) {
    addProductNavBtn.addEventListener('click', () => {
        document.querySelectorAll('.admin-screen').forEach(screen => screen.style.display = 'none');
        document.getElementById('add-product-screen').style.display = 'block';
    });
}


document.getElementById('cancel-add-btn').addEventListener('click', () => {
    document.getElementById('add-product-screen').style.display = 'none';
    document.getElementById('products-view').style.display = 'block';
});

// Image upload logic for add product
let addProductImageUrls = [];
function renderAddProductImages(imageUrls) {
    const imagesContainer = document.getElementById('add-images-container');
    imagesContainer.innerHTML = '';
    addProductImageUrls = [...imageUrls];
    addProductImageUrls.forEach((url, index) => {
        if (url) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'edit-image-item';
            imgContainer.innerHTML = `
                <img src="${url}" alt="Product Image">
                <div class="image-actions">
                    <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
                </div>
            `;
            imagesContainer.appendChild(imgContainer);
        }
    });
    document.querySelectorAll('#add-images-container .remove-image-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            addProductImageUrls[idx] = "";
            renderAddProductImages(addProductImageUrls);
        });
    });
}

document.getElementById('add-image-upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    const loadingIndicator = document.getElementById('add-loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    for (const file of files) {
        const newUrl = await uploadImageToImgBB(file);
        if (newUrl) {
            addProductImageUrls.push(newUrl);
        }
    }
    renderAddProductImages(addProductImageUrls);
    if (loadingIndicator) loadingIndicator.style.display = 'none';
});

// Enhance labels and placeholders for add product form fields
const addProductForm = document.getElementById('add-product-form');
if (addProductForm) {
    addProductForm.querySelectorAll('input, textarea').forEach(input => {
        switch(input.name) {
            case 'name':
                input.placeholder = 'Enter product name';
                input.title = 'Product Name';
                break;
            case 'price':
                input.placeholder = 'Enter price (e.g., 199.99)';
                input.title = 'Product Price';
                break;
            case 'Brand':
                input.placeholder = 'Enter brand (e.g., DeLonghi)';
                input.title = 'Brand';
                break;
            case 'Class':
                input.placeholder = 'Comma separated classes (e.g., Espresso, Automatic)';
                input.title = 'Product Class';
                break;
            case 'Date-add':
                input.placeholder = 'YYYY-MM-DD';
                input.title = 'Date Added';
                break;
            case 'description':
                input.placeholder = 'Enter a short description of the product';
                input.title = 'Description';
                break;
            case 'Dimensions':
                input.placeholder = 'e.g., 30x20x25 cm';
                input.title = 'Dimensions';
                break;
            case 'Weight':
                input.placeholder = 'e.g., 5kg';
                input.title = 'Weight';
                break;
            case 'Voltage':
                input.placeholder = 'e.g., 220V';
                input.title = 'Voltage';
                break;
            case 'Power':
                input.placeholder = 'e.g., 1500W';
                input.title = 'Power';
                break;
            case 'WaterPressure':
                input.placeholder = 'e.g., 15 bar';
                input.title = 'Water Pressure';
                break;
            case 'WaterCapacity':
                input.placeholder = 'e.g., 1.5L';
                input.title = 'Water Capacity';
                break;
        }
    });
}
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to add this product?')) return;
    const loadingIndicator = document.getElementById('add-loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    const form = e.target;
    const newProduct = {
        name: form.name.value,
        description: form.description.value,
        price: parseFloat(form.price.value),
        Brand: form.Brand.value,
        Class: form.Class.value.split(',').map(s => s.trim()),
        'Date-add': form['Date-add'].value,
    };
    // Add images
    addProductImageUrls.forEach((url, idx) => {
        newProduct[`pic${idx+1}`] = url;
    });
    let added;
    try {
        const res = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        if (!res.ok) throw new Error('Failed to add product');
        added = await res.json();
        alert('Product added successfully!');
        document.getElementById('add-product-screen').style.display = 'none';
        document.getElementById('products-view').style.display = 'block';
        addProductImageUrls = [];
        renderAddProductImages([]);
        await fetchAdminProduct();
    } catch (err) {
        alert('Error adding product: ' + err.message);
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    }
    // POST to neh endpoint for details
    const newDetails = {
        id: added.id,
        description: form.description.value,
        Dimensions: form.Dimensions.value,
        Weight: form.Weight.value,
        Voltage: form.Voltage.value,
        Power: form.Power.value,
        WaterPressure: form.WaterPressure.value,
        WaterCapacity: form.WaterCapacity.value
    };
    try {
        const res2 = await fetch('https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDetails)
        });
        if (!res2.ok) throw new Error('Failed to add product details');
    } catch (err) {
        alert('Error adding product details: ' + err.message);
    }
    if (loadingIndicator) loadingIndicator.style.display = 'none';
});

document.getElementById('back-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-product-screen').style.display = 'none';
    document.getElementById('products-view').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
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

            // if (targetId === 'accounts-view') {
                
            // }
        });
    });
    fetchAndDisplayUsers();
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
        // console.log("--- Basic Product Payload (for Postman) ---");
        // console.log(`Endpoint: PUT https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/nah/${productId}`);
        // console.log(JSON.stringify(updatedBasicProduct, null, 2));

        // if (updatedDetails) {
        //     console.log("--- Product Details Payload (for Postman) ---");
        //     console.log(`Endpoint: PUT https://6753cdf4f3754fcea7bc806a.mockapi.io/idk/neh/${productId}`);
        //     console.log(JSON.stringify(updatedDetails, null, 2));
        // }

        // alert('Payload logged to console for Postman. No data was sent to the server.');
        // if(loadingIndicator) loadingIndicator.style.display = 'none';

        // Commented out the PUT request as requested
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
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('add-product-date-add');
    const randomBtn = document.getElementById('random-date-btn');
    const todayBtn = document.getElementById('today-date-btn');
    const calendarVisual = document.getElementById('calendar-visual');
    if (dateInput) {
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
        dateInput.value = today;
        // Set min date to today - 15 years
        const minDateObj = new Date();
        minDateObj.setFullYear(minDateObj.getFullYear() - 15);
        const minDate = minDateObj.toISOString().split('T')[0];
        dateInput.min = minDate;
        // Visual display
        function updateCalendarVisual(date) {
            calendarVisual.textContent = 'Selected Date: ' + date;
        }
        updateCalendarVisual(dateInput.value);
        dateInput.addEventListener('change', function() {
            if (dateInput.value > today) {
                dateInput.value = today;
            }
            if (dateInput.value < minDate) {
                dateInput.value = minDate;
            }
            updateCalendarVisual(dateInput.value);
        });
        if (randomBtn) {
            randomBtn.addEventListener('click', function() {
                const start = minDateObj.getTime();
                const end = new Date().getTime();
                const randomTime = start + Math.random() * (end - start);
                const randomDate = new Date(randomTime);
                const formatted = randomDate.toISOString().split('T')[0];
                dateInput.value = formatted;
                updateCalendarVisual(formatted);
            });
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', function() {
                dateInput.value = today;
                updateCalendarVisual(today);
            });
        }
    }
});


async function showEditAccountScreen(accountId) {
    const db = firebase.firestore();
    console.log("Fetching 'users' collection from Firestore...");
    const usersSnapshot = await db.collection("users").get();
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const account = usersData.find(u => u.id == accountId);
    if (!account) {
        alert("Couldn't load account data for editing.");
        return;
    }
    document.getElementById('accounts-view').style.display = 'none';
    document.getElementById('edit-account-screen').style.display = 'block';
    document.getElementById('edit-account-id').value = account.id;
    document.getElementById('edit-account-email').innerText = account.email || '';
    document.getElementById('edit-account-username').innerText = account.username || '';
    // document.getElementById('edit-account-name').value = account.name || '';
    document.getElementById('edit-account-password').value = '';
}

document.getElementById("random-password-btn").addEventListener("click", function() {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var password = "";
    for (var i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("edit-account-password").textContent = password;
});

if (document.getElementById('confirm-password-btn')) {
    document.getElementById('confirm-password-btn').addEventListener('click', async () => {
        const userId = document.getElementById('edit-account-id').innerText;
        const newPassword = document.getElementById('edit-account-password').innerText;
        if (!newPassword || newPassword.length < 6) {
            alert('Please enter a new password with at least 6 characters.');
            return;
        }
        try {
            const auth = firebase.auth();
            // const user = await auth
            // You may need to call a cloud function or admin API to update password securely
            // Example Firestore update (does NOT update Firebase Auth password):
            const db = firebase.firestore();
            await user.updatePassword(newPassword);
            // await db.collection('users').doc(userId).update({ password: newPassword });
            alert('Password updated in Firestore. For real password change, use Firebase Admin SDK on server.');
        } catch (error) {
            alert('Error updating password: ' + error.message);
        }
    });
}

async function removeUser(userId) {
    try {
        if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;
        if (!confirm('Last warning: this action cannot be undone.')) return;
        const db = firebase.firestore();
        await db.collection('users').doc(userId).delete();
        alert('User removed successfully!');
        fetchAndDisplayUsers(); // Refresh the user list
    } catch (error) {
        alert('Error removing user: ' + error.message);
    }
}

if (document.getElementById('cancel-edit-account-btn')) {
    document.getElementById('cancel-edit-account-btn').addEventListener('click', function() {
        document.getElementById('edit-account-screen').style.display = 'none';
        document.getElementById('accounts-view').style.display = 'block';
    });
}

if (document.getElementById('back-edit-account-btn')) {
    document.getElementById('back-edit-account-btn').addEventListener('click', function() {
        document.getElementById('edit-account-screen').style.display = 'none';
        document.getElementById('accounts-view').style.display = 'block';
    });
}