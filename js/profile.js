class ProfileManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        logger.info('ProfileManager initialized');
    }

    setupEventListeners() {
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate();
        });
    }

    async loadProfile() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            logger.info('Loading user profile', { userId: user.uid });
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists) {
                this.userData = doc.data();
                this.renderProfile();
                logger.info('Profile loaded successfully', { email: this.userData.email });
            }
        } catch (error) {
            logger.error('Failed to load profile', { error: error.message });
        }
    }

    renderProfile() {
        if (!this.userData) return;

        document.getElementById('profileName').value = this.userData.name || '';
        document.getElementById('profileEmail').value = this.userData.email || '';
        document.getElementById('profilePhone').value = this.userData.phone || '';
        document.getElementById('profileAddress').value = this.userData.address || '';
    }

    async handleProfileUpdate() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        const updatedData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            logger.info('Updating user profile', { userId: user.uid });
            await db.collection('users').doc(user.uid).update(updatedData);
            
            // Update local data
            this.userData = { ...this.userData, ...updatedData };
            
            // Update UI
            document.getElementById('userName').textContent = updatedData.name;
            
            logger.info('Profile updated successfully');
            alert('Profile updated successfully!');
        } catch (error) {
            logger.error('Failed to update profile', { error: error.message });
            alert('Error updating profile: ' + error.message);
        }
    }

    getUserData() {
        return this.userData;
    }
}

// Initialize ProfileManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});
