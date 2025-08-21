/*// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA_oHBujPF6bNcrw_yattUxr2H2lc90OSo",
    authDomain: "coffee-4ef69.firebaseapp.com",
    projectId: "coffee-4ef69",
    storageBucket: "coffee-4ef69.firebasestorage.app",
    messagingSenderId: "776788004091",
    appId: "1:776788004091:web:dc13a5f83a330c2cbb345e",
    measurementId: "G-BKG55H95PC"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);  

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// Initialize Cloud Storage and get a reference to the service
const storage = firebase.storage();*/
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // Import the services you need from their specific paths
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyA_oHBujPF6bNcrw_yattUxr2H2lc90OSo",
    authDomain: "coffee-4ef69.firebaseapp.com",
    projectId: "coffee-4ef69",
    storageBucket: "coffee-4ef69.firebasestorage.app",
    messagingSenderId: "776788004091",
    appId: "1:776788004091:web:dc13a5f83a330c2cbb345e",
    measurementId: "G-BKG55H95PC"
  };

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services and get a reference to them
// You call the 'get' function for each service you want to use
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
// const analytics = firebase.analytics(); // If you need analytics too!

// Now you can export these initialized services to use in other parts of your app
// export { auth, db, storage, analytics };