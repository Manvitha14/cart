let cart = [];
const apiUrl = 'https://firestore.googleapis.com/v1/projects/inventorydetails-6d9ae/databases/(default)/documents/invetorydetails';
const ordersApiUrl = 'https://firestore.googleapis.com/v1/projects/inventorydetails-6d9ae/databases/(default)/documents/orders';

// Fetch inventory and display items
async function fetchInventory() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error.message}`);
        }
        
        if (data.documents) {
            displayInventory(data.documents);
        } else {
            console.error("No documents found in the response");
        }
        
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

function displayInventory(items) {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = ''; // Clear previous products if any

    items.forEach(item => {
        const fields = item.fields;
        const title = fields.Title.stringValue;
        const price = fields.Price.doubleValue || fields.Price.integerValue;  // Handle both double and integer price values
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

// Store order in Firestore
async function storeOrderInFirestore(orderData) {
    try {
        const response = await fetch(ordersApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    Address: { stringValue: orderData.address },
                    Phone: { stringValue: orderData.phone },
                    CartItems: { arrayValue: { values: orderData.cart.map(item => ({ mapValue: { fields: item }})) } },
                    TotalPrice: { doubleValue: orderData.totalPrice },
                    Date: { timestampValue: new Date().toISOString() }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        console.log('Order stored in Firestore:', result);
        alert('Order successfully placed!');
    } catch (error) {
        console.error('Error storing order in Firestore:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Handle payment button click
document.getElementById('paymentButton').addEventListener('click', () => {
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (address && phone && cart.length > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            address,
            phone,
            cart: cart.map(item => ({
                productId: { stringValue: item.productId },
                title: { stringValue: item.title },
                quantity: { integerValue: item.quantity },
                price: { doubleValue: item.price }
            })),
            totalPrice
        };

        // Store the order in Firestore
        storeOrderInFirestore(orderData);

        // Clear the cart after storing the order
        cart = [];
        updateCartNotification();
        saveCartToLocalStorage();
        document.getElementById('orderDetailsModal').classList.add('hidden');
    } else {
        alert('Please fill in all fields and add items to your cart.');
    }
});

// Show order details modal for checkout
function showOrderDetailsModal(title, price) {
    document.getElementById('orderDetailsModal').classList.remove('hidden');
}

// Event listener for cart icon click to toggle cart modal
document.getElementById("cartIcon").addEventListener("click", () => {
    showCart();
});

// Close order modal
document.getElementById('closeOrderModal').addEventListener('click', function() {
    document.getElementById('orderDetailsModal').classList.add('hidden');
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    loadCartFromLocalStorage();
});
