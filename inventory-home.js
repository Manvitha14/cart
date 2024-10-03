let cart = [];
const apiUrl = 'https://firestore.googleapis.com/v1/projects/inventorydetails-6d9ae/databases/(default)/documents/invetorydetails';

// Fetch inventory and display items
async function fetchInventory() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error.message}`);
        }
        displayInventory(data.documents);
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

function displayInventory(items) {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';

    items.forEach(item => {
        const fields = item.fields;
        const title = fields.Title.stringValue;
        const price = fields.Price.doubleValue;
        const imageUrl = fields.ImageUrl.stringValue;
        const id = item.name.split('/').pop();

        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        productDiv.innerHTML = `
            <img src="${imageUrl}" alt="${title}" />
            <h3>${title}</h3>
            <p>$${price.toFixed(2)}</p>
            <button class="addToCartButton" onclick="addToCart('${id}', '${title}', ${price})">Add to Cart</button>
            <button class="buyButton" onclick="showOrderDetailsModal('${title}', ${price})">Buy Now</button>
        `;

        inventoryList.appendChild(productDiv);
    });
}

// Add item to cart
function addToCart(productId, title, price) {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, title, price, quantity: 1 });
    }
    updateCartNotification();
    saveCartToLocalStorage();
}

// Update cart notification count
function updateCartNotification() {
    const cartNotification = document.getElementById('cartNotification');
    cartNotification.textContent = cart.length;
    cartNotification.classList.toggle('hidden', cart.length === 0);
}

// Show cart items when cart icon is clicked
function showCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('li');
            cartItem.innerHTML = `
                <img src="images/${item.title}.jpg" alt="${item.title}" width="50" />
                <span>${item.title} - ${item.quantity} x $${item.price.toFixed(2)}</span>
            `;
            cartList.appendChild(cartItem);
        });
    }

    document.getElementById('cartItems').classList.remove('hidden');
}

// Save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCartFromLocalStorage() {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) {
        cart = savedCart;
        updateCartNotification();
    }
}

// Checkout functionality
function checkout() {
    alert('Proceeding to checkout...');
    cart = [];
    updateCartNotification();
    saveCartToLocalStorage();
    document.getElementById('cartItems').classList.add('hidden');
}

// Close cart modal
document.getElementById('closeCartModal').addEventListener('click', function() {
    document.getElementById('cartItems').classList.add('hidden');
});

// Load inventory and cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    loadCartFromLocalStorage();
});

// JavaScript to toggle menu visibility
const menuIcon = document.getElementById('menuIcon');
const menuItems = document.getElementById('menuItems');

menuIcon.addEventListener('click', () => {
    menuItems.classList.toggle('hidden');

    // Toggle the display style
    if (menuItems.style.display === 'flex') {
        menuItems.style.display = 'none';
    } else {
        menuItems.style.display = 'flex';
    }
});

// Show the order details modal
function showOrderDetailsModal(productTitle, productPrice) {
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    orderDetailsModal.classList.remove('hidden');
    
    // You can store the product title and price for confirmation later
    console.log(`Buying: ${productTitle} for $${productPrice.toFixed(2)}`);
}

// Close the order details modal
document.getElementById('closeOrderModal').addEventListener('click', () => {
    document.getElementById('orderDetailsModal').classList.add('hidden');
});

// Handle payment button click
document.getElementById('paymentButton').addEventListener('click', () => {
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (address && phone) {
        // Proceed with payment logic here (e.g., integrating a payment gateway)
        alert(`Order confirmed! Address: ${address}, Phone: ${phone}`);
        
        // Close the modal after confirmation
        document.getElementById('orderDetailsModal').classList.add('hidden');
    } else {
        alert("Please fill in all fields.");
    }
});

// Show the cart when cart icon is clicked
document.getElementById('cartIcon').addEventListener('click', showCart);
