// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADU5yKQyf2EuMxZX8WWMrncbp6-Rmmnww",
    authDomain: "catering-website-41067.firebaseapp.com",
    projectId: "catering-website-41067",
    storageBucket: "catering-website-41067.firebasestorage.app",
    messagingSenderId: "548514111244",
    appId: "1:548514111244:web:620a94e5c4a05f51667329"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

logger.info('Firebase initialized successfully');
