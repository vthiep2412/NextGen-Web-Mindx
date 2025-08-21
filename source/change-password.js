passwordNotContain = [' ','\,','"',"'",'-'];
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const user_session = JSON.parse(localStorage.getItem('user_session'));

    if (!user_session || !user_session.user || !user_session.user.uid) {
        window.location.href = 'index.html';
        return;
    }

    const uid = user_session.user.uid;
    const currentP = document.getElementById('current-password');
    const newP = document.getElementById('new-password');
    const confirmP = document.getElementById('confirm-password');
    const PCbutton = document.getElementById('change-password-button');

    PCbutton.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentPassword = currentP.value;
        const newPassword = newP.value;
        const confirmPassword = confirmP.value;

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert('No user is signed in.');
            return;
        }

        try {
            // Re-authenticate the user
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            await user.reauthenticateWithCredential(credential);

            // Update the password in Firebase Authentication
            await user.updatePassword(newPassword);
            const session = JSON.parse(localStorage.getItem("user_session"));
            const email = session.user.email;
            const querySnapshot = await db.collection("users").where("email", "==", email).get();
            const userDoc = querySnapshot.docs[0];
                await db.collection('users').doc(userDoc.id).update({
                    password: newPassword,
                });
            // Optionally, update the password in Firestore if you need it for other purposes (NOT RECOMMENDED)
            // await firestore.collection('users').doc(uid).update({ password: newPassword });

            alert('Password updated successfully! Logging Out...');
            setTimeout(() => {
                logOut()
            }, 2000);

        } catch (error) {
            console.error('Error updating password:', error);
            if (error.code === 'auth/wrong-password') {
                alert('Incorrect current password.');
            } else {
                alert(`An error occurred: ${error.message}`);
            }
        }
    });
});