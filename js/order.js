class OrdersManager {
    constructor() {
        this.orders = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        logger.info('OrdersManager initialized');
    }

    setupEventListeners() {
        // Orders will be loaded when user logs in
    }

    async loadOrders() {
        const user = authManager.getCurrentUser();
        if (!user) return;

        try {
            logger.info('Loading user orders', { userId: user.uid });
            const snapshot = await db.collection('orders')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.renderOrders();
            logger.info('Orders loaded successfully', { count: this.orders.length });
        } catch (error) {
            logger.error('Failed to load orders', { error: error.message });
        }
    }

    renderOrders() {
        const table = document.getElementById('ordersTable');
        if (!table) return;

        table.innerHTML = '';

        if (this.orders.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No orders found.</td></tr>';
            return;
        }

        this.orders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
            const itemCount = order.items ? order.items.reduce((total, item) => total + item.quantity, 0) : 0;
            
            row.innerHTML = `
                <td>${order.id.substring(0, 8)}...</td>
                <td>${orderDate}</td>
                <td>${itemCount} items</td>
                <td>$${order.total ? order.total.toFixed(2) : '0.00'}</td>
                <td><span class="order-status ${order.status}">${order.status}</span></td>
            `;
            table.appendChild(row);
        });
    }

    async getOrderById(orderId) {
        try {
            const doc = await db.collection('orders').doc(orderId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            logger.error('Failed to get order', { orderId, error: error.message });
            throw error;
        }
    }

    getOrders() {
        return this.orders;
    }
}

// Initialize OrdersManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ordersManager = new OrdersManager();
});
