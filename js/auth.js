class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });

        this.setupEventListeners();
        logger.info('AuthManager initialized');
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Modal controls
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Dashboard button
        document.getElementById('dashboardBtn').addEventListener('click', () => {
            this.showDashboard();
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            logger.info('Attempting user login', { email });
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            logger.info('User login successful', { email });
        } catch (error) {
            logger.error('Login failed', { email, error: error.message });
            this.showAlert('loginModal', error.message, 'error');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const userType = document.querySelector('input[name="userType"]:checked').value;

        try {
            logger.info('Attempting user registration', { email, userType });
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Save additional user data to Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name,
                email,
                userType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            logger.info('User registration successful', { email, userType });
        } catch (error) {
            logger.error('Registration failed', { email, error: error.message });
            this.showAlert('registerModal', error.message, 'error');
        }
    }

    handleUserLogin(user) {
        this.currentUser = user;
        
        // Get user data from Firestore
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                this.updateUIForLoggedInUser(userData);
                logger.info('User session restored', { email: user.email, userType: userData.userType });
            }
        }).catch((error) => {
            logger.error('Failed to fetch user data', { error: error.message });
        });
    }

    handleUserLogout() {
        this.currentUser = null;
        this.updateUIForLoggedOutUser();
        logger.info('User logged out');
    }

    async handleLogout() {
        try {
            await auth.signOut();
            logger.info('Logout successful');
        } catch (error) {
            logger.error('Logout failed', { error: error.message });
        }
    }

    updateUIForLoggedInUser(userData) {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('userName').textContent = userData.name;
        
        this.closeModals();
        this.showDashboard();
    }

    updateUIForLoggedOutUser() {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        
        // Show public sections
        document.querySelector('header').style.display = 'block';
        document.querySelector('.hero').style.display = 'block';
        document.querySelector('#products').style.display = 'block';
        document.querySelector('footer').style.display = 'block';
    }

    showLoginModal() {
        this.closeModals();
        document.getElementById('loginModal').style.display = 'block';
    }

    showRegisterModal() {
        this.closeModals();
        document.getElementById('registerModal').style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showDashboard() {
        document.querySelector('header').style.display = 'none';
        document.querySelector('.hero').style.display = 'none';
        document.querySelector('#products').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
    }

    showAlert(modalId, message, type) {
        const modal = document.getElementById(modalId);
        let alertDiv = modal.querySelector('.alert');
        
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.className = 'alert';
            modal.querySelector('.form-container').prepend(alertDiv);
        }
        
        alertDiv.textContent = message;
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.display = 'block';
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        // This would need to be implemented based on your user data structure
        return this.currentUser && this.currentUser.userType === 'admin';
    }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
