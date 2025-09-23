// app.js - The brain of our cycling app!

// Check if user is logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showApp();
        document.getElementById('user-name').textContent = user.email;
        document.getElementById('logout-btn').classList.remove('btn-hidden');
        loadSpins();
    } else {
        // No user signed in
        showLogin();
        document.getElementById('user-name').textContent = 'Guest';
        document.getElementById('logout-btn').classList.add('btn-hidden');
    }
});

// Show/hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function showLogin() {
    showSection('login-section');
    document.querySelector('.register-form').classList.add('hidden');
    document.querySelector('.login-form').classList.remove('hidden');
}

function showRegister() {
    showSection('login-section');
    document.querySelector('.login-form').classList.add('hidden');
    document.querySelector('.register-form').classList.remove('hidden');
}

function showApp() {
    showSection('app-section');
    loadSpins();
}

function showCreateSpin() {
    showSection('create-spin-section');
}

// Login function
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        alert('Welcome back! 🚴');
    })
    .catch((error) => {
        alert('Login failed: ' + error.message);
    });
}

// Register function
function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const bikeType = document.getElementById('bike-type').value;
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Save user info to database
        const user = userCredential.user;
        return firebase.database().ref('users/' + user.uid).set({
            name: name,
            email: email,
            bikeType: bikeType,
            joined: new Date().toISOString()
        });
    })
    .then(() => {
        alert('Account created successfully! Welcome to the cycling community! 🎉');
    })
    .catch((error) => {
        alert('Registration failed: ' + error.message);
    });
}

// Logout function
document.getElementById('logout-btn').addEventListener('click', () => {
    firebase.auth().signOut()
    .then(() => {
        alert('Logged out successfully. Ride safe! 👋');
    });
});

// Create a new spin
function createSpin() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please log in to create a spin');
        return;
    }
    
    const spinData = {
        title: document.getElementById('spin-title').value,
        type: document.getElementById('spin-type').value,
        time: document.getElementById('spin-time').value,
        location: document.getElementById('spin-location').value,
        distance: document.getElementById('spin-distance').value,
        createdBy: user.uid,
        creatorEmail: user.email,
        createdAt: new Date().toISOString(),
        participants: [user.uid]
    };
    
    // Save to Firebase database
    firebase.database().ref('spins').push(spinData)
    .then(() => {
        alert('Spin created successfully! 🎉');
        showApp();
        document.getElementById('spin-title').value = '';
        document.getElementById('spin-time').value = '';
        document.getElementById('spin-location').value = '';
        document.getElementById('spin-distance').value = '';
    })
    .catch((error) => {
        alert('Error creating spin: ' + error.message);
    });
}

// Load all spins from database
function loadSpins() {
    const spinsContainer = document.getElementById('spins-container');
    spinsContainer.innerHTML = '<p>Loading spins... 🚴</p>';
    
    firebase.database().ref('spins').once('value')
    .then((snapshot) => {
        spinsContainer.innerHTML = '';
        
        if (!snapshot.exists()) {
            spinsContainer.innerHTML = '<p>No spins scheduled yet. Be the first to create one!</p>';
            return;
        }
        
        snapshot.forEach((childSnapshot) => {
            const spin = childSnapshot.val();
            spin.id = childSnapshot.key;
            renderSpinCard(spin);
        });
    })
    .catch((error) => {
        spinsContainer.innerHTML = '<p>Error loading spins. Please try again.</p>';
        console.error('Error:', error);
    });
}

// Display a spin card
function renderSpinCard(spin) {
    const spinsContainer = document.getElementById('spins-container');
    const card = document.createElement('div');
    card.className = 'spin-card';
    
    card.innerHTML = `
        <h3>${spin.title}</h3>
        <div>
            <span class="spin-type ${spin.type}">${spin.type.toUpperCase()}</span>
            <strong>${spin.distance}km</strong>
        </div>
        <p>📅 ${new Date(spin.time).toLocaleString()}</p>
        <p>📍 ${spin.location}</p>
        <p>👥 ${spin.participants ? spin.participants.length : 1} riders</p>
        <p>Created by: ${spin.creatorEmail}</p>
        <button onclick="joinSpin('${spin.id}')" class="btn-primary">Join Spin!</button>
    `;
    
    spinsContainer.appendChild(card);
}

// Join a spin
function joinSpin(spinId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please log in to join a spin');
        return;
    }
    
    // Add user to participants list
    firebase.database().ref('spins/' + spinId + '/participants').transaction((participants) => {
        if (participants === null) {
            return [user.uid];
        }
        if (participants.indexOf(user.uid) === -1) {
            participants.push(user.uid);
        }
        return participants;
    })
    .then(() => {
        alert('You joined the spin! 🎉');
        loadSpins(); // Refresh the list
    })
    .catch((error) => {
        alert('Error joining spin: ' + error.message);
    });
}