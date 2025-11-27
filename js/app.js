class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDashboardNavigation();
        logger.info('App initialized');
    }

    setupEventListeners() {
        // Mobile menu toggle
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Explore button
        document.getElementById('exploreBtn').addEventListener('click', () => {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                window.authManager.closeModals();
            }
        });
    }

    setupDashboardNavigation() {
        const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
        
        sidebarMenuItems.forEach(item => {
            if (!item.id) { // Exclude logout button
                item.addEventListener('click', () => {
                    // Remove active class from all items
                    sidebarMenuItems.forEach(i => i.classList.remove('active'));
                    // Add active class to clicked item
                    item.classList.add('active');
                    
                    // Hide all sections
                    document.querySelectorAll('.dashboard-section').forEach(section => {
                        section.classList.remove('active');
                    });
                    
                    // Show the selected section
                    const sectionId = item.getAttribute('data-section');
                    document.getElementById(sectionId).classList.add('active');

                    // Load section-specific data
                    this.loadSectionData(sectionId);
                });
            }
        });
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'viewProducts':
                window.productsManager.renderDashboardProducts();
                break;
            case 'cart':
                window.cartManager.renderCart();
                break;
            case 'myOrders':
                window.ordersManager.loadOrders();
                break;
            case 'myProfile':
                window.profileManager.loadProfile();
                break;
        }
    }

    toggleMobileMenu() {
        const nav = document.getElementById('mainNav');
        nav.classList.toggle('active');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
