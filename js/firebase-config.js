// firebase-config.js - SIMPLIFIED

// Wait for Firebase to load
document.addEventListener('DOMContentLoaded', function() {
    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCs-FWwuC4i3qVsGjlRCz0jzXW6TmYXEs4",
        authDomain: "cyclistspinmanager.firebaseapp.com",
        projectId: "cyclistspinmanager",
        storageBucket: "cyclistspinmanager.appspot.com",
        messagingSenderId: "297071510855",
  appId: "1:297071510855:web:13143b8d3563e0aa53b862",
          databaseURL: "https://cyclistspinmanager-default-rtdb.europe-west1.firebasedatabase.app",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Make database available globally
    window.database = firebase.database();
    
    console.log('✅ Firebase configured successfully!');
    console.log('Database object:', window.database);
});