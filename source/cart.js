function saveCartToLocalStorage(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
    syncLocalCartToFirebase();
}

function getCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : {};
}

function fetchCartData() {
    return getCartFromLocalStorage();
}

// Convert and sync localStorage cart to Firestore for the current user
async function syncLocalCartToFirebase() {
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) return;
    const email = session.user.email;
    let localCart = localStorage.getItem('cart');
    let parsedCart = {};
    try {
        parsedCart = localCart ? JSON.parse(localCart) : {};
    } catch (e) {
        parsedCart = {};
    }
    // Only keep id and cnt for each product
    function sanitizeCart(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(sanitizeCart);
        const clean = {};
        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
            const val = obj[key];
            if (typeof val === 'object' && val !== null && 'id' in val && 'cnt' in val) {
                clean[key] = { id: val.id, cnt: val.cnt };
            }
        }
        return clean;
    }
    const sanitizedCart = sanitizeCart(parsedCart);
    try {
        const querySnapshot = await db.collection("users").where("email", "==", email).get();
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await db.collection("users").doc(userDoc.id).update({
                cart: sanitizedCart
            });
        }
    } catch (error) {
        console.error("Error syncing cart to Firestore:", error);
    }
}

// Retrieve cart from Firestore and put it in localStorage for the current user
async function syncFirebaseCartToLocal() {
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) return;
    const email = session.user.email;
    try {
        const querySnapshot = await db.collection("users").where("email", "==", email).get();
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            if (userData.cart == {}) {
                const cart = {};
                localStorage.setItem('cart', JSON.stringify(cart));
            } else {
                localStorage.setItem('cart', JSON.stringify(userData.cart));
            }
        }
    } catch (error) {
        console.error("Error syncing cart from Firestore to localStorage:", error);
    }
}
