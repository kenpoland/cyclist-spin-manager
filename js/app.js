// app.js - SIMPLIFIED VERSION

// Make functions available globally
window.showCreateSpin = function() {
    showSection('create-spin-section');
};

window.showApp = function() {
    showSection('app-section');
    loadSpins();
};

window.login = function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
        alert('Welcome back! 🚴');
    })
    .catch((error) => {
        alert('Login failed: ' + error.message);
    });
};

window.register = function() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const bikeType = document.getElementById('bike-type').value;
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        return window.database.ref('users/' + user.uid).set({
            name: name,
            email: email,
            bikeType: bikeType,
            joined: new Date().toISOString()
        });
    })
    .then(() => {
        alert('Account created successfully! 🎉');
    })
    .catch((error) => {
        alert('Registration failed: ' + error.message);
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
    
    if (!spinData.title || !spinData.time || !spinData.location || !spinData.distance) {
        alert('Please fill in all fields!');
        return;
    }
    
    console.log('Creating spin with data:', spinData);
    
    // Use window.database to make sure it's available
    window.database.ref('spins').push(spinData)
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
    
    // Use window.database to make sure it's available
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
        console.error('Error:', error);
    });
}

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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚴 Cycling app loaded!');
    
    // Set up logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            alert('Logged out successfully! 👋');
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
        }
    });
});