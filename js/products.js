class ProductsManager {
    constructor() {
        this.products = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        logger.info('ProductsManager initialized');
    }

    setupEventListeners() {
        // Add product form
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProduct();
        });
    }

    async loadProducts() {
        try {
            logger.info('Loading products from Firestore');
            const snapshot = await db.collection('products').get();
            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderProducts();
            this.renderDashboardProducts();
            logger.info('Products loaded successfully', { count: this.products.length });
        } catch (error) {
            logger.error('Failed to load products', { error: error.message });
        }
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product, false);
            grid.appendChild(productCard);
        });
    }

    renderDashboardProducts() {
        const grid = document.getElementById('dashboardProductsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product, true);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product, isDashboard = false) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <p class="product-description">${product.description}</p>
                ${isDashboard ? 
                    `<button class="btn btn-primary add-to-cart-dashboard" data-id="${product.id}">Add to Cart</button>` :
                    `<button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>`
                }
            </div>
        `;

        // Add event listener for add to cart button
        const addToCartBtn = card.querySelector('.add-to-cart, .add-to-cart-dashboard');
        addToCartBtn.addEventListener('click', () => {
            window.cartManager.addToCart(product.id);
        });

        return card;
    }

    async handleAddProduct() {
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const image = document.getElementById('productImage').value;

        try {
            logger.info('Adding new product', { name, price });
            const docRef = await db.collection('products').add({
                name,
                description,
                price,
                image,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: authManager.getCurrentUser().uid
            });

            // Add the new product to local array
            const newProduct = {
                id: docRef.id,
                name,
                description,
                price,
                image
            };
            this.products.push(newProduct);

            // Update UI
            this.renderProducts();
            this.renderDashboardProducts();

            // Reset form
            document.getElementById('addProductForm').reset();

            logger.info('Product added successfully', { productId: docRef.id });
            alert('Product added successfully!');
        } catch (error) {
            logger.error('Failed to add product', { error: error.message });
            alert('Error adding product: ' + error.message);
        }
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    getProducts() {
        return this.products;
    }
}

// Initialize ProductsManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsManager = new ProductsManager();
});
