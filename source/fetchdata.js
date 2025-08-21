async function displayUserInfo() {
    const session = JSON.parse(localStorage.getItem("user_session"));
    if (!session || !session.user || !session.user.email) return;

    const email = session.user.email;

    try {
        const querySnapshot = await db.collection("users").where("email", "==", email).get();
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const userImage = document.getElementById("user-image");
            const userName = document.getElementById("user-name");

            if (userData.imageurl) {
                userImage.innerHTML = `<img id="user-avatar-img" src="${userData.imageurl}" alt="Avatar" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`;
            } else {
                const Fchar = userData.username[0].toUpperCase();
                userImage.outerHTML = `<div id="user-image"><span id="user-image2">${Fchar}</span></div>`;
            }

            if (userName) {
                userName.textContent = userData.username || "";
                userName.style.fontSize = "large";
            }
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
}