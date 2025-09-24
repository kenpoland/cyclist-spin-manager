// firebase-config.js - Fixed version!

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs-FWwuC4i3qVsGjlRCz0jzXW6TmYXEs4",
  authDomain: "cyclistspinmanager.firebaseapp.com",
  databaseURL: "https://cyclistspinmanager-default-rtdb.firebaseio.com", // ADD THIS LINE!
  projectId: "cyclistspinmanager",
  storageBucket: "cyclistspinmanager.appspot.com",
  messagingSenderId: "297071510855",
  appId: "1:297071510855:web:13143b8d3563e0aa53b862"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = firebase.database(); // ADD THIS LINE!