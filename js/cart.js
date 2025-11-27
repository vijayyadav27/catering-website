class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        logger.info('CartManager initialized');
    }

    setupEventListeners() {
        // Place order button
        document.getElementById('placeOrderBtn').addEventListener('click', () => {
            this.handlePlaceOrder();
        });
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('cateringCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.renderCart();
        }
    }

    saveCartToStorage() {
        localStorage.setItem('cateringCart', JSON.stringify(this.cart));
    }

    addToCart(productId) {
        const product = window.productsManager.getProductById(productId);
        
        if (!product) {
            logger.error('Product not found for cart', { productId });
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCartToStorage();
        this.renderCart();
        
        logger.info('Product added to cart', { productId, productName: product.name });
        alert(`${product.name} added to cart!`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.renderCart();
        
        logger.info('Product removed from cart', { productId });
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.renderCart();
            
            logger.debug('Cart quantity updated', { productId, newQuantity });
        }
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');

        if (!cartItems) return;

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty.</p>';
            subtotalEl.textContent = '$0.00';
            totalEl.textContent = '$5.00';
            return;
        }

        let subtotal = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="btn btn-outline remove-item" data-id="${item.id}" style="margin-left: 15px;">Remove</button>
                    </div>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
            `;
            cartItems.appendChild(cartItem);
        });

        // Add event listeners for quantity controls
        cartItems.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        cartItems.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        cartItems.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.getAttribute('data-id');
                const newQuantity = parseInt(e.target.value);
                this.updateQuantity(productId, newQuantity);
            });
        });

        cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                this.removeFromCart(productId);
            });
        });

        const shipping = 5.00;
        const total = subtotal + shipping;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    async handlePlaceOrder() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const user = authManager.getCurrentUser();
        if (!user) {
            alert('Please log in to place an order.');
            return;
        }

        try {
            logger.info('Placing new order', { userId: user.uid, itemCount: this.cart.length });
            
            const orderData = {
                userId: user.uid,
                items: this.cart,
                subtotal: this.calculateSubtotal(),
                shipping: 5.00,
                total: this.calculateTotal(),
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('orders').add(orderData);
            
            // Clear cart
            this.cart = [];
            this.saveCartToStorage();
            this.renderCart();

            logger.info('Order placed successfully', { orderId: docRef.id });
            alert('Order placed successfully! Your order ID is: ' + docRef.id);

            // Refresh orders display
            if (window.ordersManager) {
                window.ordersManager.loadOrders();
            }
        } catch (error) {
            logger.error('Failed to place order', { error: error.message });
            alert('Error placing order: ' + error.message);
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateTotal() {
        return this.calculateSubtotal() + 5.00; // $5 shipping
    }

    getCart() {
        return this.cart;
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Initialize CartManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
