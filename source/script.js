const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const mobileRegisterLink = document.getElementById('mobile-register-link');
const mobileLoginLink = document.getElementById('mobile-login-link');
const SignIn = document.getElementById('Sign-in');
const SignUp = document.getElementById('Sign-up');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

mobileRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add("active");
});

mobileLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove("active");
});

function fetchFBUserData(emailOrUsername, password) {
    const handleSuccessfulLogin = async (userCredential) => {
        const user = userCredential.user;
        const UsernameRef = await db.collection("users").where("username", "==", emailOrUsername).get()
        const username = UsernameRef.docs[0].data().username;
        const userSession = {
            user: user,
            username: username,
            expiry: new Date().getTime() + 12 * 60 * 60 * 1000 // 12 hours
        };
        localStorage.setItem('user_session', JSON.stringify(userSession));
        alert("Đăng nhập thành công");
        window.location.href = 'main.html';
    };

    const handleLoginError = (error) => {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            alert('Sai mật khẩu hoặc tài khoản không tồn tại. Vui lòng thử lại.');
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    };

    if (emailOrUsername.includes('@')) {
        // Sign in with email
        firebase.auth().signInWithEmailAndPassword(emailOrUsername, password)
            .then(handleSuccessfulLogin)
            .catch(handleLoginError);
    } else {
        // Sign in with username
        db.collection("users").where("username", "==", emailOrUsername).get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    alert("Tên người dùng không tồn tại.");
                    return;
                }
                // Assuming username is unique, so there should be only one doc.
                const userDoc = querySnapshot.docs[0];
                const email = userDoc.data().email;
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(handleSuccessfulLogin)
                    .catch(handleLoginError);
            })
            .catch((error) => {
                console.error("Lỗi khi truy vấn người dùng:", error);
                alert("Đã xảy ra lỗi khi đăng nhập.");
            });
    }
}

async function writeDataUser(data) {
    firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            // Thông tin người dùng
            let userData = data;
            console.log(userData);

            // Thêm user vào Firestore
            db.collection("users").add(userData)
                .then((docRef) => {
                    alert("Đăng ký thành công");
                    // window.location.href = "/client/login.html";
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch((error) => {
                    alert("Đăng ký thất bại");
                    console.error("Error adding document: ", error);
                });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // ..
            alert(`Lỗi: ${errorMessage}`);
            console.log(errorMessage);
        });
}

function SignUpUser(event) {
    event.preventDefault();
    const username = document.getElementById('Username-signUp').value;
    const email = document.getElementById('email-signUp').value;
    const password = document.getElementById('pass-signUp').value;
    const confirmPassword = document.getElementById('confirm-pass-signUp').value;

    if (password === confirmPassword) {
        const newUser = {
            username: username,
            email: email,
            password: password,
            isLoggedIn: false,
            isAdmin: false,
            cart: {1:{}},
            imageurl: ""
        };

        writeDataUser(newUser);
        clearSignUpInputs();
        
        container.classList.remove("active");
        
    } else {
        alert("Passwords do not match!");
    }
}

function clearSignUpInputs() {
    document.getElementById('Username-signUp').value = "";
    document.getElementById('email-signUp').value = "";
    document.getElementById('pass-signUp').value = "";
    document.getElementById('confirm-pass-signUp').value = "";
}

function SignInUser(event) {
    event.preventDefault();
    const emailOrUsername = document.getElementById('email-login').value;
    const password = document.getElementById('pass-login').value;
    fetchFBUserData(emailOrUsername, password);
}

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '👁️';
    } else {
      input.type = 'password';
      button.textContent = '🙈';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
});