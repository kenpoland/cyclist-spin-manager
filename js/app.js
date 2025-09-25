// app.js - COMPLETE FIXED VERSION

// Make all functions available globally
window.showCreateSpin = function() {
    showSection('create-spin-section');
};

window.showApp = function() {
    showSection('app-section');
    loadSpins();
};

window.showLogin = function() {
    showSection('login-section');
    document.querySelector('.register-form').classList.add('hidden');
    document.querySelector('.login-form').classList.remove('hidden');
};

window.showRegister = function() {
    showSection('login-section');
    document.querySelector('.login-form').classList.add('hidden');
    document.querySelector('.register-form').classList.remove('hidden');
};

window.login = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log('Attempting to login:', email);
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        console.log('Login successful:', userCredential.user.email);
        alert('Welcome back! 🚴');
    })
    .catch((error) => {
        console.error('Login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            alert('No account found with this email. Please register first.');
        } else if (error.code === 'auth/wrong-password') {
            alert('Incorrect password. Please try again.');
        } else {
            alert('Login failed: ' + error.message);
        }
    });
};

window.register = function() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const bikeType = document.getElementById('bike-type').value;
    
    console.log('Attempting to register user:', email);
    
    // Basic validation
    if (!email || !password || !name) {
        alert('Please fill in all required fields!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        console.log('User created successfully:', userCredential.user.uid);
        
        // Save user info to database
        const user = userCredential.user;
        return window.database.ref('users/' + user.uid).set({
            name: name,
            email: email,
            bikeType: bikeType,
            joined: new Date().toISOString()
        });
    })
    .then(() => {
        console.log('User data saved to database');
        alert('Account created successfully! Welcome to the cycling community! 🎉');
        
        // Clear the form
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-name').value = '';
    })
    .catch((error) => {
        console.error('Registration error:', error);
        
        // Better error messages
        if (error.code === 'auth/email-already-in-use') {
            alert('This email is already registered. Please try logging in instead.');
        } else if (error.code === 'auth/invalid-email') {
            alert('Please enter a valid email address.');
        } else if (error.code === 'auth/weak-password') {
            alert('Password is too weak. Please use at least 6 characters.');
        } else {
            alert('Registration failed: ' + error.message);
        }
    });
};

window.createSpin = function() {
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
    
    console.log('Creating spin with data:', spinData);
    
    if (!spinData.title || !spinData.time || !spinData.location || !spinData.distance) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Test database connection first
    console.log('Testing database connection...');
    window.database.ref('.info/connected').once('value')
    .then((snap) => {
        console.log('Database connected:', snap.val());
        
        // Now try to save the spin
        return window.database.ref('spins').push(spinData);
    })
    .then(() => {
        console.log('✅ Spin saved successfully!');
        alert('Spin created successfully! 🎉');
        showApp();
        // Clear form
        document.getElementById('spin-title').value = '';
        document.getElementById('spin-time').value = '';
        document.getElementById('spin-location').value = '';
        document.getElementById('spin-distance').value = '';
    })
    .catch((error) => {
        console.error('❌ Error saving spin:', error);
        alert('Error creating spin: ' + error.message);
    });
};

window.joinSpin = function(spinId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please log in to join a spin');
        return;
    }
    
    window.database.ref('spins/' + spinId + '/participants').transaction((participants) => {
        if (participants === null) return [user.uid];
        if (participants.indexOf(user.uid) === -1) participants.push(user.uid);
        return participants;
    })
    .then(() => {
        alert('You joined the spin! 🎉');
        loadSpins();
    })
    .catch((error) => {
        alert('Error joining spin: ' + error.message);
    });
};

// Helper functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function loadSpins() {
    const spinsContainer = document.getElementById('spins-container');
    spinsContainer.innerHTML = '<p>Loading spins... 🚴</p>';
    
    window.database.ref('spins').once('value')
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
        console.error('Error loading spins:', error);
    });
}

function renderSpinCard(spin) {
    const spinsContainer = document.getElementById('spins-container');
    const card = document.createElement('div');
    card.className = 'spin-card';
    
    // Format the date properly
    let displayDate = 'Date not set';
    try {
        if (spin.time) {
            displayDate = new Date(spin.time).toLocaleString();
        }
    } catch (e) {
        console.log('Date formatting error:', e);
    }
    
    card.innerHTML = `
        <h3>${spin.title || 'Untitled Spin'}</h3>
        <div>
            <span class="spin-type ${spin.type}">${(spin.type || 'road').toUpperCase()}</span>
            <strong>${spin.distance || '0'}km</strong>
        </div>
        <p>📅 ${displayDate}</p>
        <p>📍 ${spin.location || 'Location not set'}</p>
        <p>👥 ${spin.participants ? spin.participants.length : 1} riders</p>
        <p>Created by: ${spin.creatorEmail || 'Unknown'}</p>
        <button onclick="joinSpin('${spin.id}')" class="btn-primary">Join Spin!</button>
    `;
    
    spinsContainer.appendChild(card);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚴 Cycling app loaded!');
    
    // Set up logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            alert('Logged out successfully! 👋');
            // Reset forms
            document.querySelector('.register-form').classList.add('hidden');
            document.querySelector('.login-form').classList.remove('hidden');
        });
    });
    
    // Check auth state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('User logged in:', user.email);
            document.getElementById('user-name').textContent = user.email;
            document.getElementById('logout-btn').classList.remove('btn-hidden');
            showApp();
        } else {
            console.log('No user logged in');
            document.getElementById('user-name').textContent = 'Guest';
            document.getElementById('logout-btn').classList.add('btn-hidden');
            showSection('login-section');
            
            // Make sure login form is visible by default
            document.querySelector('.register-form').classList.add('hidden');
            document.querySelector('.login-form').classList.remove('hidden');
        }
    });
    
    // Test database connection
    if (window.database) {
        window.database.ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true) {
                console.log('✅ Database connected successfully!');
            }
        });
    }
});