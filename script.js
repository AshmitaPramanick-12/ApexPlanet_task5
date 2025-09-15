// ===================================
//  API & DYNAMIC PRODUCT LOGIC
// ===================================

// Global variable to store products fetched from the API
let allProducts = [];

async function getProducts() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    allProducts = await response.json();
    initializePageContent();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

function initializePageContent() {
  const featuredContainer = document.getElementById("featured-products");
  if (featuredContainer) {
    displayProducts(allProducts.slice(0, 4), featuredContainer);
  }

  const allProductsContainer = document.getElementById("all-products");
  if (allProductsContainer) {
    displayProducts(allProducts, allProductsContainer);
    const searchInput = document.getElementById("search");
    const filterSelect = document.getElementById("filter");
    function applyFilters() {
      const searchText = searchInput.value.toLowerCase();
      const filterCategory = filterSelect.value;
      const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchText);
        const matchesCategory = filterCategory === "all" || product.category === filterCategory;
        return matchesSearch && matchesCategory;
      });
      displayProducts(filteredProducts, allProductsContainer);
    }
    searchInput.addEventListener("input", applyFilters);
    filterSelect.addEventListener("change", applyFilters);
  }

  const productDetailsContainer = document.getElementById("product-details");
  if (productDetailsContainer) {
    displaySingleProductDetails();
  }
}

function displayProducts(productList, container) {
  container.innerHTML = "";
  if (!productList || productList.length === 0) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }
  productList.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <a href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </a>
      <h3>${product.title}</h3>
      <div class="price">₹${(product.price * 83).toFixed(2)}</div>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

function displaySingleProductDetails() {
    const productDetailsContainer = document.getElementById("product-details");
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"));
    const product = allProducts.find(p => p.id === productId);

    if (product) {
        productDetailsContainer.innerHTML = `
            <img src="${product.image}" alt="${product.title}" style="max-width: 300px; border-radius: 8px;">
            <div class="product-info">
                <h2>${product.title}</h2>
                <p>${product.description}</p>
                <div class="price">₹${(product.price * 83).toFixed(2)}</div>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    } else {
        productDetailsContainer.innerHTML = "<p>Product not found.</p>";
    }
}

// ===================================
//  CART LOGIC
// ===================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id) {
  const product = allProducts.find(p => p.id === id);
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    const cartItem = { id: product.id, name: product.title, price: (product.price * 83).toFixed(2), image: product.image, qty: 1 };
    cart.push(cartItem);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${product.title} has been added to your cart!`);
}

function loadCart() {
  const cartContainer = document.getElementById("cart-container");
  const totalElement = document.getElementById("cart-total");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalElement.textContent = "Total: ₹0";
    return;
  }
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.classList.add("product-card");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₹${item.price} x ${item.qty}</p>
      <div>
        <button onclick="updateQty(${index}, 'decrease')">-</button>
        <button onclick="updateQty(${index}, 'increase')">+</button>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });
  totalElement.textContent = `Total: ₹${total.toFixed(2)}`;
}

function updateQty(index, action) {
  if (action === "increase") {
    cart[index].qty += 1;
  } else if (action === "decrease" && cart[index].qty > 1) {
    cart[index].qty -= 1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// ===================================
//  FORM HANDLING
// ===================================
const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    if (name && cart.length > 0) {
      alert(`✅ Thank you, ${name}! Your order has been placed.`);
      localStorage.removeItem("cart");
      checkoutForm.reset();
      window.location.href = "index.html";
    } else {
      alert("⚠️ Please fill in all fields and ensure your cart is not empty.");
    }
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const message = document.getElementById("auth-message");
    if (email === "user@example.com" && password === "password123") {
      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "green";
      localStorage.setItem("isLoggedIn", "true");
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    } else {
      message.textContent = "⚠️ Invalid email or password.";
      message.style.color = "red";
    }
  });
}

// --- NEW: Contact Form Logic ---
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    const contactMsg = document.getElementById("contact-msg");
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const name = document.getElementById("c-name").value.trim();
      const email = document.getElementById("c-email").value.trim();
      const message = document.getElementById("c-message").value.trim();
      if (!name || !email || !message) {
        contactMsg.textContent = "⚠️ Please fill all fields.";
        contactMsg.style.color = "red";
        return;
      }
      contactMsg.textContent = `✅ Thank you, ${name}! We have received your message.`;
      contactMsg.style.color = "green";
      contactForm.reset();
    });
}

// ===================================
//  INITIAL SCRIPT EXECUTION
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    getProducts();
    loadCart();
});