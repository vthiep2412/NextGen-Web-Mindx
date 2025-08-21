let productDetails = [];
let basicProducts = [];

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

async function isCurrentUserAdmin() {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
        return false;
    }

    const db = firebase.firestore();
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) {
        return false;
    }

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
            <div class="rating-stars-display-main" style="font-size: 1.5em; color: #ffc107; margin-bottom: 10px;"></div>
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

    const ratingsContainer = document.createElement('div');
    ratingsContainer.id = 'ratings-container';
    detailScreen.appendChild(ratingsContainer);

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
        const ratingFormContainer = document.createElement('div');
        ratingFormContainer.innerHTML = `
            <h4>Leave a Rating</h4>
            <div class="rating-stars">
                <span class="star" data-value="1">&#9733;</span>
                <span class="star" data-value="2">&#9733;</span>
                <span class="star" data-value="3">&#9733;</span>
                <span class="star" data-value="4">&#9733;</span>
                <span class="star" data-value="5">&#9733;</span>
            </div>
            <textarea id="rating-comment" placeholder="Write your comment..."></textarea>
            <button id="submit-rating">Submit</button>
        `;
        ratingsContainer.appendChild(ratingFormContainer);

        const stars = ratingFormContainer.querySelectorAll('.rating-stars .star');
        let currentRating = 0;

        function updateStars(rating) {
            stars.forEach(s => {
                const starValue = parseInt(s.getAttribute('data-value'));
                if (starValue <= rating) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        }

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const value = parseInt(star.getAttribute('data-value'));
                updateStars(value);
            });

            star.addEventListener('mouseout', () => {
                updateStars(currentRating);
            });

            star.addEventListener('click', () => {
                currentRating = parseInt(star.getAttribute('data-value'));
                updateStars(currentRating);
            });
        });

        const submitButton = ratingFormContainer.querySelector('#submit-rating');
        submitButton.addEventListener('click', () => {
            const rating = currentRating;
            const comment = ratingFormContainer.querySelector('#rating-comment').value;
            submitRating(product.id, rating, comment);
        });
    }

    const reviewsContainer = document.createElement('div');
    reviewsContainer.innerHTML = `
        <h3>Ratings & Reviews</h3>
        <div id="rating-summary-container"></div>
        <div id="ratings-list"></div>
    `;
    ratingsContainer.appendChild(reviewsContainer);
    detailScreen.appendChild(closeButton);

    setTimeout(() => {
        detailScreen.classList.add('show');
    }, 10);

    getAverageRating(product.id).then(averageRating => {
        const roundedAverage = Math.round(averageRating);
        const starsHTML = '&#9733;'.repeat(roundedAverage) + '&#9734;'.repeat(5 - roundedAverage);
        const ratingText = `(${averageRating.toFixed(1)})`;
        const starsContainer = detailScreen.querySelector('.rating-stars-display-main');
        if (starsContainer) {
            starsContainer.innerHTML = `${starsHTML} <span style="font-size: 0.7em; vertical-align: middle;">${ratingText}</span>`;
        }
    });

    fetchAndDisplayRatings(product.id);
}

async function submitRating(productId, rating, comment, replyTo = null) {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to submit a rating.");
        return;
    }

    if (rating === 0 && !replyTo) {
        alert("Please select a star rating.");
        return;
    }

    const db = firebase.firestore();
    let username = '';
    let photoURL = '';

    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) return;

    const email = session.user.email;
    const querySnapshot = await db.collection("users").where("email", "==", email).get();
    if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        username = userData.username || user.displayName || '';
        photoURL = userData.imageurl || '';
    }

    const ratingData = {
        username: username,
        photoURL: photoURL,
        rating: rating,
        comment: comment,
        date: new Date().toISOString(),
        replyTo: replyTo,
        adminReply: null
    };

    const ratingDocRef = db.collection("user-rating").doc(String(productId));

    try {
        await db.runTransaction(async (transaction) => {
            const ratingDoc = await transaction.get(ratingDocRef);
            if (!ratingDoc.exists) {
                transaction.set(ratingDocRef, { ratings: [ratingData] });
            } else {
                const newRatings = [...ratingDoc.data().ratings, ratingData];
                transaction.update(ratingDocRef, { ratings: newRatings });
            }
        });
        alert("Rating submitted successfully!");
        fetchAndDisplayRatings(productId);
    } catch (error) {
        console.error("Error submitting rating: ", error);
        alert("Error submitting rating. Please try again.");
    }
}

async function submitAdminReply(productId, parentRatingDate, comment) {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to reply.");
        return;
    }

    const db = firebase.firestore();
    const ratingDocRef = db.collection("user-rating").doc(String(productId));

    try {
        await db.runTransaction(async (transaction) => {
            const ratingDoc = await transaction.get(ratingDocRef);
            if (ratingDoc.exists) {
                const ratings = ratingDoc.data().ratings || [];
                const parentRatingIndex = ratings.findIndex(r => r.date === parentRatingDate);

                if (parentRatingIndex !== -1) {
                    ratings[parentRatingIndex].adminReply = {
                        comment: comment,
                        date: new Date().toISOString()
                    };
                    transaction.update(ratingDocRef, { ratings: ratings });
                } else {
                    throw new Error("Parent comment not found.");
                }
            }
        });
        alert("Admin reply submitted successfully!");
        fetchAndDisplayRatings(productId);
    } catch (error) {
        console.error("Error submitting admin reply: ", error);
        alert("Error submitting admin reply. Please try again.");
    }
}

async function fetchAndDisplayRatings(productId) {
    const ratingsList = document.getElementById('ratings-list');
    const summaryContainer = document.getElementById('rating-summary-container');
    if (!ratingsList || !summaryContainer) return;

    ratingsList.innerHTML = '';
    summaryContainer.innerHTML = '';

    const db = firebase.firestore();
    const ratingDocRef = db.collection("user-rating").doc(String(productId));
    const ratingDoc = await ratingDocRef.get();

    if (ratingDoc.exists) {
        const ratingsData = ratingDoc.data();
        const ratings = ratingsData.ratings || [];
        
        const topLevelRatings = ratings.filter(r => !r.replyTo);
        
        const ratingsForSummary = topLevelRatings.filter(r => r.rating > 0);
        const totalRatings = ratingsForSummary.length;
        if (totalRatings > 0) {
            const sumOfRatings = ratingsForSummary.reduce((acc, r) => acc + r.rating, 0);
            const averageRating = (sumOfRatings / totalRatings).toFixed(1);
            const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            ratingsForSummary.forEach(r => {
                if (r.rating >= 1 && r.rating <= 5) {
                    ratingCounts[r.rating]++;
                }
            });

            const summaryHTML = `
                <div class="d-flex align-items-center mb-3 justify-content-center helpfull">
                    <h4 class="display-4 me-3">${averageRating}</h4>
                    <div>
                        <div class="rating-stars-display">${'&#9733;'.repeat(Math.round(averageRating))}${'&#9734;'.repeat(5 - Math.round(averageRating))}</div>
                        <p class="mb-0">Based on ${totalRatings} reviews</p>
                    </div>
                </div>
                <div class="rating-breakdown">
            ` + [5, 4, 3, 2, 1].map(star => {
                const count = ratingCounts[star];
                const percentage = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(0) : 0;
                return `
                    <div class="rating-breakdown-row">
                        <div class="me-2">${star} star</div>
                        <div class="progress flex-grow-1">
                            <div class="progress-bar bg-warning" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="ms-2">${percentage}%</div>
                    </div>
                `;
            }).join('') + '</div>';
            summaryContainer.innerHTML = summaryHTML;
        }

        const ratingsList = document.getElementById('ratings-list');
        ratingsList.innerHTML = '';

        ratings.sort((a, b) => new Date(a.date) - new Date(b.date));

        const ratingInfoMap = new Map(ratings.map(r => [r.date, { username: r.username || 'Anonymous', comment: r.comment }]));

        ratings.forEach(rating => {
            const ratingElement = document.createElement('div');
            ratingElement.className = 'rating-item';
            if (rating.replyTo) {
                ratingElement.classList.add('reply-item');
            }

            let profilePictureHTML = '';
            if (rating.photoURL && rating.photoURL.trim() !== '') {
                profilePictureHTML = `<img src="${rating.photoURL}" alt="${rating.username}" class="rating-profile-pic">`;
            } else {
                profilePictureHTML = `<div class="rating-profile-pic-placeholder"></div>`;
            }

            if(rating.username == ""){
                rating.username = "Anonymous";
            }

            const starsHTML = rating.rating > 0 ? `<span class="rating-stars-display">${'&#9733;'.repeat(rating.rating)}${'&#9734;'.repeat(5 - rating.rating)}</span>` : '';

            let repliedToText = '';
            if (rating.replyTo) {
                const parentInfo = ratingInfoMap.get(rating.replyTo);
                if (parentInfo) {
                    const parentCommentText = parentInfo.comment.length > 40 ? parentInfo.comment.substring(0, 37) + '...' : parentInfo.comment;
                    repliedToText = `<span class="replied-to-text"> replying to: <i>"${parentCommentText}"</i></span>`;
                }
            }
            const parentInfo = ratingInfoMap.get(rating.replyTo);
            let commentHTML = `<p class="comment">${rating.comment}</p>`;
            const parentUsername = parentInfo ? parentInfo.username : 'user';
            if (rating.replyTo) {
                commentHTML = `<p class="comment reply-text"><strong>@${parentUsername} | </strong>${rating.comment}</p>`;
            }


            const currentUser = firebase.auth().currentUser;
            const session = JSON.parse(localStorage.getItem("user_session"));
            const Uusername = session ? session.username : '';
            const isOwner = currentUser && Uusername === rating.username;
            const isAdmin = isCurrentUserAdmin();
            // console.log(!(!isAdmin));

            ratingElement.innerHTML = `
                <div class="rating-header">
                    ${profilePictureHTML}
                    <span class="username">${rating.username}</span>
                    ${repliedToText}
                    ${starsHTML}
                </div>
                ${commentHTML}
                <div class="after-comment">
                    <span class="date">${new Date(rating.date).toLocaleString()}</span>
                    <button class="reply-button">Reply</button>
                    ${isOwner? '<button class="edit-button reply-button">Edit</button>' : ''}
                    ${isOwner? '<button class="remove-button reply-button">Remove</button>' : ''}
                </div>
            `;
            
            ratingsList.appendChild(ratingElement);

            if (rating.adminReply && rating.adminReply.comment) {
                const adminReplyElement = document.createElement('div');
                adminReplyElement.className = 'rating-item reply-item admin-reply-item';
                const adminProfilePic = `<img src="./pic/logo.png" alt="Aromis Café" class="rating-profile-pic2">`;
                adminReplyElement.innerHTML = `
                    <div class="rating-header">
                        ${adminProfilePic}
                        <span class="username">Aromis Café</span>
                    </div>
                    <p class="comment">${rating.adminReply.comment}</p>
                    <div class="after-comment">
                        <span class="date">${new Date(rating.adminReply.date).toLocaleString()}</span>
                    </div>
                `;
                const separator = document.createElement('hr');
                separator.className = 'reply-separator';
                ratingElement.appendChild(separator);
                ratingElement.appendChild(adminReplyElement);
            }

            const replyButton = ratingElement.querySelector('.reply-button');
            if(replyButton) {
                replyButton.addEventListener('click', () => {
                    const existingReplyForm = ratingElement.querySelector('.reply-form');
                    const existingEditForm = ratingElement.querySelector('.edit-form');
                    if (existingEditForm) {
                        existingEditForm.remove();
                    }
                    if (existingReplyForm) {
                        existingReplyForm.remove();
                        return;
                    }

                    const replyForm = document.createElement('div');
                    replyForm.className = 'reply-form';
                    replyForm.innerHTML = `
                        <textarea class="reply-comment" placeholder="Write a reply..."></textarea>
                        <button class="submit-reply">Submit Reply</button>
                    `;
                    ratingElement.appendChild(replyForm);

                    const submitReplyButton = replyForm.querySelector('button');
                    submitReplyButton.addEventListener('click', async () => {
                        const replyComment = replyForm.querySelector('textarea').value;
                        if (replyComment) {
                            const isAdmin = await isCurrentUserAdmin();
                            if (isAdmin) {
                                submitAdminReply(productId, rating.date, replyComment);
                            } else {
                                submitRating(productId, 0, replyComment, rating.date);
                            }
                            replyForm.remove();
                        }
                    });
                });
            }

            //edit button event listener
            const editButton = ratingElement.querySelector('.edit-button');
            if(editButton) {
                editButton.addEventListener('click', () => {
                    const existingEditForm = ratingElement.querySelector('.edit-form');
                    const existingReplyForm = ratingElement.querySelector('.reply-form');
                    if (existingReplyForm) {
                        existingReplyForm.remove();
                    }
                    if (existingEditForm) {
                        existingEditForm.remove();
                        return;
                    }
                    const commentText = ratingElement.querySelector('.comment');
                    const commentTextHTML = commentText.innerHTML;
                    const commentTextPlain = commentTextHTML.replace(/<\/?strong>/g, '');
                    const editForm = document.createElement('div');
                    editForm.className = 'edit-form';
                    editForm.innerHTML = `
                        <div class="stars-rating">
                            <span class="star2" data-value="1">&#9733;</span>
                            <span class="star2" data-value="2">&#9733;</span>
                            <span class="star2" data-value="3">&#9733;</span>
                            <span class="star2" data-value="4">&#9733;</span>
                            <span class="star2" data-value="5">&#9733;</span>
                        </div>
                        <textarea class="edit-comment" placeholder="Edit comment...">${commentTextPlain}</textarea>
                        <button class="submit-edit">Submit Edit</button>
                    `;
                    ratingElement.appendChild(editForm);

                    const stars2 = editForm.querySelectorAll('.stars-rating .star2');

                    function updateStars(rating) {
                        stars2.forEach(s => {
                            const starValue = parseInt(s.getAttribute('data-value'));
                            if (starValue <= rating) {
                                s.classList.add('selected');
                            } else {
                                s.classList.remove('selected');
                            }
                        });
                    }
                    currentRating = rating.rating;
                    updateStars(currentRating);
                    stars2.forEach(star => {
                        star.addEventListener('mouseover', () => {
                            const value = parseInt(star.getAttribute('data-value'));
                            updateStars(value);
                        });

                        star.addEventListener('mouseout', () => {
                            updateStars(currentRating);
                        });

                        star.addEventListener('click', () => {
                            currentRating = parseInt(star.getAttribute('data-value'));
                            updateStars(currentRating);
                        });
                    });

                    const submitEditButton = editForm.querySelector('button');
                    submitEditButton.addEventListener('click', () => {
                        const newComment = editForm.querySelector('textarea').value;
                        if (newComment) {
                            submitEdit(productId, rating.date, newComment, currentRating);
                            editForm.remove();
                        }
                    });
                });
            }
            //remove button event listener
            const removeButton = ratingElement.querySelector('.remove-button');
            if(removeButton) {
                removeButton.addEventListener('click', () => {
                    submitRemove(productId, rating.date);
                });
            }
        });

        if (ratings.length === 0) {
            ratingsList.innerHTML = '<p>No ratings yet.</p>';
            summaryContainer.innerHTML = '';
        }
    } else {
        ratingsList.innerHTML = '<p>No ratings yet.</p>';
        summaryContainer.innerHTML = '';
    }
}

async function submitEdit(productId, commentDate, newComment, newRating) {
    const db = firebase.firestore();
    const ratingDocRef = db.collection("user-rating").doc(String(productId));

    try {
        await db.runTransaction(async (transaction) => {
            const ratingDoc = await transaction.get(ratingDocRef);
            if (ratingDoc.exists) {
                const ratings = ratingDoc.data().ratings || [];
                const ratingIndex = ratings.findIndex(r => r.date === commentDate);

                if (ratingIndex !== -1) {
                    ratings[ratingIndex].comment = newComment;
                    ratings[ratingIndex].rating = newRating;
                    transaction.update(ratingDocRef, { ratings: ratings });
                } else {
                    throw new Error("Comment not found.");
                }
            }
        });
        alert("Comment updated successfully!");
        fetchAndDisplayRatings(productId);
    } catch (error) {
        console.error("Error updating comment: ", error);
        alert("Error updating comment. Please try again.");
    }
}
//rating remove function
async function submitRemove(productId, commentDate) {
    const db = firebase.firestore();
    const ratingDocRef = db.collection("user-rating").doc(String(productId));

    try {
        await db.runTransaction(async (transaction) => {
            const ratingDoc = await transaction.get(ratingDocRef);
            if (ratingDoc.exists) {
                const allRatings = ratingDoc.data().ratings || [];
                
                const finalRatings = allRatings.filter(rating => {
                    const isCommentToDelete = rating.date === commentDate;
                    const isReplyToDelete = rating.replyTo === commentDate;
                    return !isCommentToDelete && !isReplyToDelete;
                });

                transaction.update(ratingDocRef, { ratings: finalRatings });
            }
        });
        alert("Comment and replies removed successfully!");
        fetchAndDisplayRatings(productId);
    } catch (error) {
        console.error("Error removing comment: ", error);
        alert("Error removing comment. Please try again.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    fetchBasicProducts();
    fetchProductDetails();

    setTimeout(() => {
        document.querySelectorAll('.product-list').forEach(productList => {
            productList.addEventListener('click', (event) => {
                if (event.target.closest('.buy-button') || event.target.closest('#quantity-buttons-main-fix')) {
                    return;
                }
                console.log("oi something clicked");
                const productDiv = event.target.closest('.product-item');
                if (!productDiv) return;
                const classList = Array.from(productDiv.classList);
                const productId = classList.find(cls => /^\d+$/.test(cls));
                if (productId) {
                    showProductDetail(Number(productId));
                    const item1 = document.querySelector('.item1');
                    const item4 = document.querySelector('.item4');
                    if (item1 && item4) {
                        item4.style.maxHeight = (item1.offsetHeight - 50) + 'px';
                    }
                }
            });
        });
        document.getElementById('search-results').addEventListener('click', (event) => {
            if (event.target.closest('.buy-button') || event.target.closest('#quantity-buttons-search')) {
                return;
            }
            console.log("oi something clicked");
            const productDiv = event.target.closest('.search-product-item');
            if (!productDiv) return;
            const classList = Array.from(productDiv.classList);
            const productId = classList.find(cls => cls !== 'search-product-item' && /^\d+$/.test(cls));
            if (productId) {
                showProductDetail(Number(productId));
            }
        }); 
    },2500)
});
window.addEventListener("resize", function() {
    const item1 = document.querySelector('.item1');
    const item4 = document.querySelector('.item4');
    if (item1 && item4) {
        item4.style.maxHeight = (item1.offsetHeight - 50) + 'px';
    }
});