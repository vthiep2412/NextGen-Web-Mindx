
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const user_session = JSON.parse(localStorage.getItem('user_session'));

    if (!user_session || !user_session.user || !user_session.user.uid) {
        window.location.href = 'index.html';
        return;
    }

    const uid = user_session.user.uid;
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const uploadForm = document.getElementById('avatar-upload-form');
    const uploadButton = document.getElementById('upload-button');
    const loadingDiv = document.getElementById('loading');

    // Function to generate a default avatar from username
    const generateAvatar = (username) => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const context = canvas.getContext('2d');
        context.fillStyle = '#007bff'; // A default background color
        context.fillRect(0, 0, 150, 150);
        context.font = 'bold 75px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(username.charAt(0).toUpperCase(), 75, 75);
        return canvas.toDataURL();
    };
    
    // Load current avatar
    firestore.collection('users').doc(uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            if (userData.imageurl) {
                avatarPreview.src = "https://tse1.mm.bing.net/th/id/OIP.2OZ3ttrQHOor2_PdiAG5qwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3";
            } else {
                avatarPreview.src = generateAvatar(userData.username);
            }
        }
    }).catch(error => {
        console.error("Error fetching user data:", error);
    });

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = avatarInput.files[0];
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        console.log('Upload form submitted');
        loadingDiv.style.display = 'block';
        uploadButton.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const apiKey = 'fc65d3021eb029b5f34cfb6a53c8d928'; // Replace with your ImgBB API key

            console.log('Uploading to ImgBB...');
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData,
            });

            console.log('ImgBB response:', response);
            const data = await response.json();
            console.log('ImgBB data:', data);

            if (!data.success) {
                throw new Error(data.error.message || 'ImgBB API error');
            }

            const imageUrl = data.data.url;
            console.log('Image URL to be saved:', imageUrl);
            console.log('User ID for Firestore update:', uid);

            if (!uid) {
                console.error("FATAL: UID is null or undefined before Firestore call.");
                alert("A critical error occurred. Your user ID is missing.");
                return;
            }

            if (!imageUrl) {
                console.error("FATAL: Image URL is null or undefined before Firestore call.");
                alert("A critical error occurred. The image URL from the upload service was empty.");
                return;
            }

            console.log('Attempting to update Firestore document...');
            const session = JSON.parse(localStorage.getItem("user_session"));
            const email = session.user.email;
            const querySnapshot = await db.collection("users").where("email", "==", email).get();
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                await db.collection('users').doc(userDoc.id).update({
                    imageurl: imageUrl,
                });
            }

            console.log('Firestore .set() call completed successfully.');
            alert('Avatar updated successfully! Redirecting...');
            window.location.href = 'main.html';

        } catch (error) {
            console.error('An error occurred in the upload process:', error);
            alert('An error occurred. Please check the console for details and try again.');
        } finally {
            loadingDiv.style.display = 'none';
            uploadButton.disabled = false;
        }
    });
});