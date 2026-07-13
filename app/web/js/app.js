/*
   Daily Lens & Gear - Main Client Script
   Handles Catalog filtering, Cart Drawer, User Auth, Theme toggles, and Checkout.
*/

// API Base URL
const API_URL = '';

// Global State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedStartDate = localStorage.getItem('startDate') || '';
let selectedEndDate = localStorage.getItem('endDate') || '';
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkAuth();
  setupEventListeners();
  
  // Page specific initializers
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html' || path === '') {
    initCatalogPage();
  } else if (path.includes('checkout.html')) {
    initCheckoutPage();
  } else if (path.includes('bookings.html')) {
    initBookingsPage();
  } else if (path.includes('detail.html')) {
    initDetailPage();
  }
});

// ==========================================
// 1. Theme Configuration (Dark/Light Toggle)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  
  if (sunIcon && moonIcon) {
    if (savedTheme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', newTheme);
  
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  
  if (sunIcon && moonIcon) {
    if (newTheme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

// ==========================================
// 2. Authentication State Management
// ==========================================
async function checkAuth() {
  const token = localStorage.getItem('token');
  const authContainer = document.getElementById('auth-status-container');
  const bookingsLink = document.getElementById('bookings-link');
  const adminLink = document.getElementById('admin-link');
  
  if (!token) {
    if (authContainer) {
      authContainer.innerHTML = `<a href="/login.html" class="btn btn-secondary" style="padding: 8px 18px; font-size: 0.85rem;">Sign In</a>`;
    }
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      currentUser = await res.json();
      
      // Show link based on role
      if (bookingsLink) bookingsLink.style.display = 'block';
      if (currentUser.role === 'admin' && adminLink) {
        adminLink.style.display = 'block';
      }
      
      if (authContainer) {
        authContainer.innerHTML = `
          <span class="user-name">Hello, ${currentUser.name.split(' ')[0]}</span>
          <button class="btn btn-secondary" id="signout-btn" style="padding: 8px 14px; font-size: 0.85rem; border-radius: 12px;">Sign Out</button>
        `;
        document.getElementById('signout-btn').addEventListener('click', signOut);
      }
    } else {
      // Invalid token
      localStorage.removeItem('token');
      if (authContainer) {
        authContainer.innerHTML = `<a href="/login.html" class="btn btn-secondary" style="padding: 8px 18px; font-size: 0.85rem;">Sign In</a>`;
      }
    }
  } catch (error) {
    console.error("Auth check error:", error);
  }
}

function signOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('cart');
  window.location.href = '/';
}

// ==========================================
// 3. Global Events setup
// ==========================================
function setupEventListeners() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
  
  // Cart drawer triggers
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawer = document.getElementById('shopping-cart-drawer');
  
  if (openCartBtn && cartDrawer && cartOverlay) {
    openCartBtn.addEventListener('click', () => {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      renderCartDrawer();
    });
  }
  
  if (closeCartBtn && cartDrawer && cartOverlay) {
    const closeCart = () => {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
    };
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
  }
  
  // Sign In Form listener
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register Form listener
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

// ==========================================
// 4. Catalog Page Logic (Homepage)
// ==========================================
function initCatalogPage() {
  const startDateInput = document.getElementById('rent-start-date');
  const endDateInput = document.getElementById('rent-end-date');
  const checkBtn = document.getElementById('confirm-dates-btn');
  
  // Set minimum date to today
  const todayStr = new Date().toISOString().split('T')[0];
  if (startDateInput) {
    startDateInput.min = todayStr;
    if (selectedStartDate) startDateInput.value = selectedStartDate;
  }
  if (endDateInput) {
    endDateInput.min = todayStr;
    if (selectedEndDate) endDateInput.value = selectedEndDate;
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const start = startDateInput.value;
      const end = endDateInput.value;
      
      if (!start || !end) {
        alert("Please select both start and end dates.");
        return;
      }
      if (new Date(start) > new Date(end)) {
        alert("End date must be on or after start date.");
        return;
      }
      
      selectedStartDate = start;
      selectedEndDate = end;
      localStorage.setItem('startDate', start);
      localStorage.setItem('endDate', end);
      
      // If dates change, clear cart since availability changes
      cart = [];
      localStorage.removeItem('cart');
      updateCartBadge();
      
      fetchCatalog();
    });
  }

  // Brand Chips
  const chips = document.querySelectorAll('.brand-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterCatalog();
    });
  });

  // Category Checkboxes
  const checkBoxes = document.querySelectorAll('.category-checkbox');
  checkBoxes.forEach(box => {
    box.addEventListener('change', filterCatalog);
  });

  fetchCatalog();
}

async function fetchCatalog() {
  const container = document.getElementById('equipment-grid-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
      Searching available equipment...
    </div>
  `;

  let url = `${API_URL}/api/equipment`;
  if (selectedStartDate && selectedEndDate) {
    url += `?startDate=${selectedStartDate}&endDate=${selectedEndDate}`;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      products = await res.json();
      filterCatalog();
    } else {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--coral-red);">
          Error loading catalog. Please try again.
        </div>
      `;
    }
  } catch (error) {
    console.error("Fetch catalog error:", error);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--coral-red);">
        Connection failed. Make sure your backend API server is running.
      </div>
    `;
  }
}

function filterCatalog() {
  const container = document.getElementById('equipment-grid-container');
  if (!container) return;

  // Get active brand
  const activeBrandBtn = document.querySelector('.brand-chip.active');
  const brandFilter = activeBrandBtn ? activeBrandBtn.dataset.brand : '';

  // Get checked categories
  const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(box => box.value);

  const filtered = products.filter(item => {
    const matchesBrand = brandFilter ? item.brand === brandFilter : true;
    const matchesCategory = checkedCategories.includes(item.category);
    return matchesBrand && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
        No available items match your filters.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const inCart = cart.some(c => c.equipmentId === item._id);
    const hasDates = selectedStartDate && selectedEndDate;
    
    let btnText = "Add to Cart";
    let btnClass = "btn-primary";
    let disabledAttr = "";

    if (!hasDates) {
      btnText = "Select Dates First";
      btnClass = "btn-secondary";
      disabledAttr = "disabled";
    } else if (inCart) {
      btnText = "Added to Cart";
      btnClass = "btn-secondary";
      disabledAttr = "disabled";
    }

    return `
      <div class="equipment-card" data-id="${item._id}">
        <span class="card-badge">${item.category}</span>
        <a href="/detail.html?id=${item._id}">
          <div class="card-img-placeholder">
            <img src="${item.imageUrl || '/images/body.png'}" alt="${item.name}">
          </div>
        </a>
        <div class="card-content-area">
          <div class="card-brand">${item.brand}</div>
          <h4 class="card-title">
            <a href="/detail.html?id=${item._id}" style="color: inherit; text-decoration: none;">${item.name}</a>
          </h4>
          <div class="card-footer">
            <div class="card-price">
              <span class="price-num">${item.pricePerDay.toLocaleString()} ฿</span>
              <span class="price-unit">per day</span>
            </div>
            <button class="btn ${btnClass}" onclick="addToCart('${item._id}')" ${disabledAttr}>${btnText}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  updateCartBadge();
}

// ==========================================
// 5. Shopping Cart Drawer Operations
// ==========================================
function addToCart(id) {
  const item = products.find(p => p._id === id);
  if (!item || !selectedStartDate || !selectedEndDate) return;

  if (!cart.some(c => c.equipmentId === id)) {
    cart.push({
      equipmentId: item._id,
      name: item.name,
      pricePerDay: item.pricePerDay,
      category: item.category,
      imageUrl: item.imageUrl
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Refresh catalog card state
    filterCatalog();
    renderCartDrawer();
    
    // Open drawer automatically for micro-animation response
    document.getElementById('shopping-cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-overlay').classList.add('active');
  }
}

function removeFromCart(id) {
  cart = cart.filter(c => c.equipmentId !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  filterCatalog();
  renderCartDrawer();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (badge) badge.textContent = cart.length;
}

function estimateDeposit(category, name) {
  if (category === 'Body') {
    if (name.includes('C70')) return 10000;
    if (name.includes('R5') && !name.includes('R50')) return 8000;
    if (name.includes('FX3')) return 8000;
    if (name.includes('R50')) return 3000;
    return 5000;
  }
  if (category === 'Lens') {
    if (name.includes('70-200')) return 4000;
    if (name.includes('85mm')) return 4000;
    if (name.includes('50mm')) return 1000;
    return 3000;
  }
  if (category === 'Flash') {
    if (name.includes('AD200')) return 2000;
    return 1000;
  }
  if (category === 'Adapter') {
    return 500;
  }
  return 1000;
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const durationBanner = document.getElementById('cart-duration-display');
  const subtotalDisplay = document.getElementById('cart-subtotal-display');
  const depositDisplay = document.getElementById('cart-deposit-display');
  const totalDisplay = document.getElementById('cart-total-display');
  const checkoutBtn = document.getElementById('checkout-cart-btn');
  
  updateCartBadge();
  
  if (cart.length === 0) {
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Your cart is empty.
        </div>
      `;
    }
    if (durationBanner) durationBanner.style.display = 'none';
    if (subtotalDisplay) subtotalDisplay.textContent = '0 THB';
    if (depositDisplay) depositDisplay.textContent = '0 THB';
    if (totalDisplay) totalDisplay.textContent = '0 THB';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  // Calculate rental duration days
  let rentalDays = 0;
  if (selectedStartDate && selectedEndDate) {
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const diff = Math.abs(end - start);
    rentalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
    
    if (durationBanner) {
      durationBanner.style.display = 'block';
      durationBanner.textContent = `Rental Selected: ${rentalDays} Days (${selectedStartDate} to ${selectedEndDate})`;
    }
  }

  if (container) {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img" style="overflow:hidden;">
          <img src="${item.imageUrl || '/images/body.png'}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${(item.pricePerDay * rentalDays).toLocaleString()} ฿ <span style="font-size:0.75rem; color:var(--text-secondary);">(${item.pricePerDay.toLocaleString()} ฿/day)</span></div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.equipmentId}')">&times;</button>
      </div>
    `).join('');
  }

  let subtotal = 0;
  let deposit = 0;
  cart.forEach(item => {
    subtotal += item.pricePerDay * rentalDays;
    deposit += estimateDeposit(item.category, item.name);
  });

  const total = subtotal + deposit;

  if (subtotalDisplay) subtotalDisplay.textContent = `${subtotal.toLocaleString()} THB`;
  if (depositDisplay) depositDisplay.textContent = `${deposit.toLocaleString()} THB`;
  if (totalDisplay) totalDisplay.textContent = `${total.toLocaleString()} THB`;
  
  if (checkoutBtn) {
    checkoutBtn.disabled = rentalDays === 0;
    // Bind checkout action
    checkoutBtn.onclick = () => {
      window.location.href = '/checkout.html';
    };
  }
}

// ==========================================
// 6. Checkout Page Logic
// ==========================================
let idCardFile = null;

function initCheckoutPage() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html?redirect=checkout.html';
    return;
  }

  if (cart.length === 0 || !selectedStartDate || !selectedEndDate) {
    window.location.href = '/';
    return;
  }

  renderCheckoutSummary();
  setupUploadArea();

  const confirmBtn = document.getElementById('confirm-booking-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleCheckoutSubmit);
  }
}

function renderCheckoutSummary() {
  const listContainer = document.getElementById('checkout-items-list');
  const summaryDates = document.getElementById('summary-dates');
  const summaryDays = document.getElementById('summary-days');
  const summaryFee = document.getElementById('summary-rental-fee');
  const summaryDep = document.getElementById('summary-deposit');
  const summaryTot = document.getElementById('summary-total-fee');

  const start = new Date(selectedStartDate);
  const end = new Date(selectedEndDate);
  const diff = Math.abs(end - start);
  const rentalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;

  if (summaryDates) summaryDates.textContent = `${selectedStartDate} to ${selectedEndDate}`;
  if (summaryDays) summaryDays.textContent = `${rentalDays} Days`;

  if (listContainer) {
    listContainer.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <div class="checkout-item-img">
          <img src="${item.imageUrl || '/images/body.png'}" alt="${item.name}">
        </div>
        <div class="checkout-item-details">
          <div class="checkout-item-name">${item.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.category} | ${item.pricePerDay.toLocaleString()} ฿/Day</div>
          <div class="checkout-item-price">
            ${(item.pricePerDay * rentalDays).toLocaleString()} ฿
          </div>
        </div>
      </div>
    `).join('');
  }

  let subtotal = 0;
  let deposit = 0;
  cart.forEach(item => {
    subtotal += item.pricePerDay * rentalDays;
    deposit += estimateDeposit(item.category, item.name);
  });

  const total = subtotal + deposit;

  if (summaryFee) summaryFee.textContent = `${subtotal.toLocaleString()} THB`;
  if (summaryDep) summaryDep.textContent = `${deposit.toLocaleString()} THB`;
  if (summaryTot) summaryTot.textContent = `${total.toLocaleString()} THB`;
}

function setupUploadArea() {
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('id-card-input');
  const previewImg = document.getElementById('upload-preview-el');
  const statusText = document.getElementById('upload-status-text');
  const confirmBtn = document.getElementById('confirm-booking-btn');

  if (!uploadBox || !fileInput) return;

  uploadBox.addEventListener('click', () => fileInput.click());

  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--primary-accent)';
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = 'var(--border-color)';
  });

  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    idCardFile = file;
    statusText.textContent = `File selected: ${file.name}`;
    
    // Render preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);

    if (confirmBtn) confirmBtn.disabled = false;
  }
}

async function handleCheckoutSubmit() {
  const token = localStorage.getItem('token');
  const errorMsg = document.getElementById('checkout-error-msg');
  const confirmBtn = document.getElementById('confirm-booking-btn');

  if (!idCardFile || cart.length === 0 || !selectedStartDate || !selectedEndDate) return;

  if (confirmBtn) confirmBtn.disabled = true;
  if (errorMsg) errorMsg.style.display = 'none';

  const formData = new FormData();
  formData.append('startDate', selectedStartDate);
  formData.append('endDate', selectedEndDate);
  formData.append('idCard', idCardFile);

  const eqIds = cart.map(c => c.equipmentId);
  formData.append('equipmentIds', JSON.stringify(eqIds));

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (res.ok) {
      // Clear cart
      cart = [];
      localStorage.removeItem('cart');
      alert("Your booking request has been submitted successfully!");
      window.location.href = '/bookings.html';
    } else {
      const data = await res.json();
      if (errorMsg) {
        errorMsg.textContent = data.message || "Failed to create booking.";
        errorMsg.style.display = 'block';
      }
      if (confirmBtn) confirmBtn.disabled = false;
    }
  } catch (error) {
    console.error("Checkout submit error:", error);
    if (errorMsg) {
      errorMsg.textContent = "Network error. Failed to send request.";
      errorMsg.style.display = 'block';
    }
    if (confirmBtn) confirmBtn.disabled = false;
  }
}

// ==========================================
// 7. My Bookings Page Logic
// ==========================================
async function initBookingsPage() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html?redirect=bookings.html';
    return;
  }

  const activeTab = document.getElementById('tab-active-btn');
  const historyTab = document.getElementById('tab-history-btn');

  if (activeTab && historyTab) {
    activeTab.addEventListener('click', () => {
      activeTab.classList.add('active');
      historyTab.classList.remove('active');
      fetchBookings(false);
    });

    historyTab.addEventListener('click', () => {
      historyTab.classList.add('active');
      activeTab.classList.remove('active');
      fetchBookings(true);
    });
  }

  fetchBookings(false);
}

async function fetchBookings(showHistoryOnly = false) {
  const container = document.getElementById('bookings-list-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
      Loading your bookings...
    </div>
  `;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const orders = await res.json();
      
      const filtered = orders.filter(order => {
        const isHistorical = order.status === 'returned' || order.status === 'cancelled';
        return showHistoryOnly ? isHistorical : !isHistorical;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No bookings found in this category.
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(order => {
        const gear = order.equipmentId || { name: 'Unknown Equipment', brand: '', category: 'Adapter' };
        
        const startStr = new Date(order.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const endStr = new Date(order.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        let statusClass = 'status-pending';
        if (order.status === 'active') statusClass = 'status-active';
        if (order.status === 'returned') statusClass = 'status-returned';
        if (order.status === 'cancelled') statusClass = 'status-cancelled';

        let actionBtn = '';
        if (order.status === 'pending') {
          actionBtn = `
            <button class="btn btn-secondary" style="color: var(--coral-red); border-color: var(--coral-red); padding: 8px 16px; font-size: 0.8rem; border-radius:12px; margin-top:10px;" 
              onclick="cancelOwnOrder('${order._id}')">
              Cancel Request
            </button>
          `;
        }

        let reasonHtml = '';
        if (order.status === 'cancelled' && order.cancelReason) {
          reasonHtml = `
            <div style="margin-top: 10px; font-size: 0.85rem; color: var(--coral-red); background-color: rgba(230, 57, 70, 0.05); padding: 10px; border-radius: 8px;">
              <strong>Reason:</strong> ${order.cancelReason}
            </div>
          `;
        }

        return `
          <div class="booking-card">
            <div class="booking-card-img" style="overflow:hidden;">
              <img src="${gear.imageUrl || '/images/body.png'}" alt="${gear.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="booking-card-details">
              <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div class="booking-card-title">${gear.name}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${gear.brand} | ${gear.category}</div>
                </div>
                <span class="status-badge ${statusClass}">● ${order.status}</span>
              </div>
              <div class="booking-card-dates">
                <strong>Period:</strong> ${startStr} - ${endStr}
              </div>
              <div style="margin-top: 10px; font-size: 0.9rem; display: flex; gap: 20px;">
                <span><strong>Rental Fee:</strong> ${order.rentalFee.toLocaleString()} ฿</span>
                <span><strong>Deposit:</strong> ${order.deposit.toLocaleString()} ฿</span>
                <span><strong>Total:</strong> ${order.totalAmount.toLocaleString()} ฿</span>
              </div>
              ${reasonHtml}
              ${actionBtn}
            </div>
          </div>
        `;
      }).join('');

    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--coral-red);">
          Failed to fetch bookings.
        </div>
      `;
    }
  } catch (error) {
    console.error("Fetch bookings error:", error);
  }
}

async function cancelOwnOrder(id) {
  if (!confirm("Are you sure you want to cancel this booking request?")) return;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/api/orders/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'cancelled',
        cancelReason: 'Cancelled by customer.'
      })
    });

    if (res.ok) {
      alert("Booking request cancelled successfully.");
      fetchBookings(false);
    } else {
      alert("Failed to cancel order.");
    }
  } catch (error) {
    console.error("Cancel order error:", error);
  }
}

// ==========================================
// 8. Auth Page Logic (Login / Register)
// ==========================================
async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorMsg = document.getElementById('login-error-msg');
  
  if (!emailInput || !passwordInput) return;

  const email = emailInput.value;
  const password = passwordInput.value;
  if (errorMsg) errorMsg.style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      
      // Redirect logic
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        window.location.href = `/${redirect}`;
      } else {
        window.location.href = '/';
      }
    } else {
      if (errorMsg) {
        errorMsg.textContent = data.message || "Invalid login credentials.";
        errorMsg.style.display = 'block';
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    if (errorMsg) {
      errorMsg.textContent = "Network error. Failed to reach server.";
      errorMsg.style.display = 'block';
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const roleInput = document.getElementById('register-role');
  const errorMsg = document.getElementById('register-error-msg');

  if (!nameInput || !emailInput || !passwordInput || !roleInput) return;

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const role = roleInput.value;
  if (errorMsg) errorMsg.style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      alert("Registration completed successfully!");
      window.location.href = '/';
    } else {
      if (errorMsg) {
        errorMsg.textContent = data.message || "Registration failed.";
        errorMsg.style.display = 'block';
      }
    }
  } catch (error) {
    console.error("Register error:", error);
    if (errorMsg) {
      errorMsg.textContent = "Network error. Failed to reach server.";
      errorMsg.style.display = 'block';
    }
  }
}

// ==========================================
// 8. Product Details Page Initialization
// ==========================================
async function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    window.location.href = '/';
    return;
  }

  // Bind date values
  const startInput = document.getElementById('rent-start-date');
  const endInput = document.getElementById('rent-end-date');
  if (startInput && endInput) {
    startInput.value = selectedStartDate;
    endInput.value = selectedEndDate;
  }

  try {
    const res = await fetch(`${API_URL}/api/equipment/${id}`);
    if (!res.ok) {
      alert('Equipment item not found.');
      window.location.href = '/';
      return;
    }
    const product = await res.json();
    
    // Render details
    renderProductDetails(product);

    // Setup promotion card triggers
    setupPromoCardClick(product);

    // Setup input listeners
    if (startInput && endInput) {
      startInput.addEventListener('change', (e) => {
        selectedStartDate = e.target.value;
        localStorage.setItem('startDate', selectedStartDate);
        updateDetailPricing(product);
        checkDetailAvailability(product._id);
      });
      endInput.addEventListener('change', (e) => {
        selectedEndDate = e.target.value;
        localStorage.setItem('endDate', selectedEndDate);
        updateDetailPricing(product);
        checkDetailAvailability(product._id);
      });
    }

    // Tabs listener for pickup methods
    const tabs = ['btn-pickup-shop', 'btn-pickup-messenger'];
    tabs.forEach(tabId => {
      const el = document.getElementById(tabId);
      if (el) {
        el.addEventListener('click', () => {
          tabs.forEach(t => document.getElementById(t)?.classList.remove('active'));
          el.classList.add('active');
        });
      }
    });

    // Check initial availability
    checkDetailAvailability(product._id);

    // Book CTA trigger
    const bookBtn = document.getElementById('detail-book-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        if (!selectedStartDate || !selectedEndDate) {
          alert('Please select rental dates first.');
          return;
        }

        const inCart = cart.some(item => item.equipmentId === product._id);
        if (!inCart) {
          cart.push({
            equipmentId: product._id,
            name: product.name,
            pricePerDay: product.pricePerDay,
            category: product.category,
            imageUrl: product.imageUrl
          });
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartBadge();
          renderCartDrawer();
        }
        window.location.href = '/checkout.html';
      });
    }

  } catch (err) {
    console.error("Error loading product detail page:", err);
  }
}

function renderProductDetails(product) {
  // Text details
  const categoryLabel = document.getElementById('breadcrumb-category');
  if (categoryLabel) {
    categoryLabel.textContent = product.category;
    categoryLabel.href = `/?category=${product.category}`;
  }
  const nameLabel = document.getElementById('breadcrumb-product');
  if (nameLabel) nameLabel.textContent = product.name;
  
  const titleEl = document.getElementById('detail-product-name');
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.getElementById('detail-product-price');
  if (priceEl) priceEl.textContent = `${product.pricePerDay.toLocaleString()} บาท/วัน`;

  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) mainImg.src = product.imageUrl || '/images/body.png';

  // Available badge
  const badgeEl = document.getElementById('detail-badge-status');
  if (badgeEl) {
    const isAvail = product.status === 'available';
    badgeEl.textContent = isAvail ? 'Available' : product.status;
    badgeEl.className = isAvail ? 'card-badge badge-available' : 'card-badge status-badge status-pending';
  }

  // Thumbnails row
  const thumbsContainer = document.getElementById('detail-thumb-gallery');
  if (thumbsContainer) {
    const imgUrl = product.imageUrl || '/images/body.png';
    const thumbs = [
      imgUrl,
      imgUrl,
      imgUrl,
      imgUrl
    ];
    thumbsContainer.innerHTML = thumbs.map((url, index) => `
      <div class="gallery-thumb ${index === 0 ? 'active' : ''}" onclick="selectGalleryThumb(this, '${url}')">
        <img src="${url}" alt="Angle view ${index + 1}">
      </div>
    `).join('');
  }

  // Render Promo Estimates
  const p4 = document.getElementById('promo-calc-4');
  const p4avg = document.getElementById('promo-calc-4-avg');
  const p7 = document.getElementById('promo-calc-7');
  const p7avg = document.getElementById('promo-calc-7-avg');
  const p10 = document.getElementById('promo-calc-10');
  const p10avg = document.getElementById('promo-calc-10-avg');

  const baseRate = product.pricePerDay;
  if (p4) p4.textContent = `${(baseRate * 4 * 0.75).toLocaleString()}฿`;
  if (p4avg) p4avg.textContent = `เฉลี่ย ${Math.round(baseRate * 0.75).toLocaleString()} ฿/วัน`;
  if (p7) p7.textContent = `${(baseRate * 7 * 0.71).toLocaleString()}฿`;
  if (p7avg) p7avg.textContent = `เฉลี่ย ${Math.round(baseRate * 0.71).toLocaleString()} ฿/วัน`;
  if (p10) p10.textContent = `${(baseRate * 10 * 0.65).toLocaleString()}฿`;
  if (p10avg) p10avg.textContent = `เฉลี่ย ${Math.round(baseRate * 0.65).toLocaleString()} ฿/วัน`;

  // Specs & Accessories lists
  const specList = document.getElementById('detail-spec-list');
  const accList = document.getElementById('detail-accessories-list');

  const category = product.category.toLowerCase();
  let specsHtml = '';
  let accHtml = '';

  if (category.includes('body') || category.includes('camera')) {
    specsHtml = `
      <li>เซนเซอร์ CMOS ฟูลเฟรม 24.2 ล้านพิกเซล</li>
      <li>บันทึกวิดีโอภายในสูงสุด 4K60p 10-bit พร้อม C-Log 3</li>
      <li>ระบบตรวจจับและโฟกัสอัตโนมัติความเร็วสูง (Dual Pixel CMOS AF II)</li>
      <li>ระบบกันสั่นในตัวบอดี้ 5 แกน ชดเชยสูงสุด 8 สต็อป</li>
      <li>ถ่ายภาพต่อเนื่องสูงสุด 40 fps ด้วยชัตเตอร์อิเล็กทรอนิกส์</li>
    `;
    accHtml = `
      <li>แบตเตอรี่แท้ 2 ก้อน (พร้อมกล่องใส่)</li>
      <li>แท่นชาร์จแบตเตอรี่ พร้อมสาย AC</li>
      <li>กระเป๋ากล้องผ้าใบกันกระแทกอย่างดี</li>
      <li>สายคล้องคอตรงรุ่น</li>
      <li>SD Card 64GB Extreme Pro 170MB/s</li>
    `;
  } else if (category.includes('lens')) {
    specsHtml = `
      <li>โครงสร้างชิ้นเลนส์ประสิทธิภาพสูงพร้อมชิ้นเลนส์พิเศษ ED</li>
      <li>รูรับแสงกว้างสุดคงที่ f/2.8 เพื่อการถ่ายภาพในที่แสงน้อยและโบเก้สวยงาม</li>
      <li>มอเตอร์โฟกัสอัตโนมัติรวดเร็วและแม่นยำ ไร้เสียงรบกวน</li>
      <li>เคลือบสารป้องกันแสงสะท้อนและแสงแฟลร์ขั้นสูง</li>
      <li>โครงสร้างป้องกันฝุ่นละอองและหยดน้ำ (Weather-sealed)</li>
    `;
    accHtml = `
      <li>ฝาปิดหน้าเลนส์ (Lens Front Cap)</li>
      <li>ฝาปิดท้ายเลนส์ (Lens Rear Cap)</li>
      <li>ฮูดบังแสงเลนส์ (Lens Hood)</li>
      <li>ฟิลเตอร์ป้องกันหน้าเลนส์ (UV Filter)</li>
      <li>กระเป๋าใส่เลนส์บุนุ่มกันกระแทก</li>
    `;
  } else {
    specsHtml = `
      <li>ชิ้นส่วนโลหะแข็งแรงทนทาน น้ำหนักเบา</li>
      <li>ส่งต่อข้อมูลและกระแสไฟเต็มระบบอัตโนมัติ</li>
      <li>ขั้วต่อเคลือบทองป้องกันสัญญาณรบกวน</li>
    `;
    accHtml = `
      <li>ฝาปิดหน้าและหลังป้องกันฝุ่น</li>
      <li>กระเป๋าเก็บอแดปเตอร์ขนาดพกพา</li>
    `;
  }

  if (specList) specList.innerHTML = specsHtml;
  if (accList) accList.innerHTML = accHtml;

  // Initialize Price calculation
  updateDetailPricing(product);
}

function selectGalleryThumb(el, url) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) mainImg.src = url;
}

function updateDetailPricing(product) {
  const daysCalc = document.getElementById('detail-days-calc');
  const feeCalc = document.getElementById('detail-fee-calc');
  if (!daysCalc || !feeCalc) return;

  if (!selectedStartDate || !selectedEndDate) {
    daysCalc.textContent = '-';
    feeCalc.textContent = '-';
    return;
  }

  const start = new Date(selectedStartDate);
  const end = new Date(selectedEndDate);
  const diff = Math.abs(end - start);
  const rentalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;

  daysCalc.textContent = `${rentalDays} วัน`;
  
  // Calculate with promo discounts
  let discount = 1.0;
  if (rentalDays >= 10) discount = 0.65;
  else if (rentalDays >= 7) discount = 0.71;
  else if (rentalDays >= 4) discount = 0.75;

  const totalFee = Math.round(product.pricePerDay * rentalDays * discount);
  feeCalc.textContent = `${totalFee.toLocaleString()} บาท`;

  // Display savings discount
  const standardFee = product.pricePerDay * rentalDays;
  const discountAmt = standardFee - totalFee;
  const discountRow = document.getElementById('detail-discount-row');
  const discountCalc = document.getElementById('detail-discount-calc');
  if (discountAmt > 0) {
    if (discountRow && discountCalc) {
      discountRow.style.display = 'flex';
      discountCalc.textContent = `-${discountAmt.toLocaleString()} บาท (${Math.round((1 - discount) * 100)}%)`;
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  // Active promo card highlights
  const card4 = document.getElementById('promo-card-4');
  const card7 = document.getElementById('promo-card-7');
  const card10 = document.getElementById('promo-card-10');
  
  if (card4) card4.classList.remove('active');
  if (card7) card7.classList.remove('active');
  if (card10) card10.classList.remove('active');

  if (rentalDays === 4 && card4) card4.classList.add('active');
  else if (rentalDays === 7 && card7) card7.classList.add('active');
  else if (rentalDays === 10 && card10) card10.classList.add('active');
}

async function checkDetailAvailability(productId) {
  const statusText = document.getElementById('detail-status-text');
  const bookBtn = document.getElementById('detail-book-btn');
  if (!statusText || !bookBtn) return;

  if (!selectedStartDate || !selectedEndDate) {
    statusText.textContent = "กรุณาเลือกวันที่เช่าก่อนทำการจอง";
    statusText.className = "drawer-dates-alert";
    statusText.style.backgroundColor = "var(--surface-container)";
    statusText.style.color = "var(--text-secondary)";
    statusText.style.borderColor = "var(--border-color)";
    bookBtn.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/equipment?startDate=${selectedStartDate}&endDate=${selectedEndDate}`);
    if (res.ok) {
      const availableItems = await res.json();
      const isAvailable = availableItems.some(item => item._id === productId);
      if (isAvailable) {
        statusText.textContent = "อุปกรณ์ว่าง สามารถทำรายการจองได้";
        statusText.className = "drawer-dates-alert";
        statusText.style.backgroundColor = "var(--tertiary-container)";
        statusText.style.color = "var(--tertiary)";
        statusText.style.borderColor = "rgba(16, 185, 129, 0.2)";
        bookBtn.disabled = false;
      } else {
        statusText.textContent = "อุปกรณ์ไม่ว่างในวันที่เลือก (ถูกเช่าแล้ว)";
        statusText.className = "drawer-dates-alert";
        statusText.style.backgroundColor = "var(--error-container)";
        statusText.style.color = "var(--on-error-container)";
        statusText.style.borderColor = "rgba(186, 26, 26, 0.2)";
        bookBtn.disabled = true;
      }
    }
  } catch (err) {
    console.error("Availability check failed:", err);
  }
}

function setupPromoCardClick(product) {
  const cards = [
    { id: 'promo-card-4', days: 4 },
    { id: 'promo-card-7', days: 7 },
    { id: 'promo-card-10', days: 10 }
  ];

  cards.forEach(card => {
    const el = document.getElementById(card.id);
    if (el) {
      el.addEventListener('click', () => {
        // If no start date is selected, default to today
        let start = selectedStartDate;
        if (!start) {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          start = `${yyyy}-${mm}-${dd}`;
          selectedStartDate = start;
          localStorage.setItem('startDate', start);
          const startInput = document.getElementById('rent-start-date');
          if (startInput) startInput.value = start;
        }

        // Calculate end date = start date + card.days
        const startDateObj = new Date(start);
        const endDateObj = new Date(startDateObj.getTime() + card.days * 24 * 60 * 60 * 1000);
        
        const yyyy = endDateObj.getFullYear();
        const mm = String(endDateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(endDateObj.getDate()).padStart(2, '0');
        const endStr = `${yyyy}-${mm}-${dd}`;

        selectedEndDate = endStr;
        localStorage.setItem('endDate', endStr);
        const endInput = document.getElementById('rent-end-date');
        if (endInput) endInput.value = endStr;

        // Recalculate and update UI
        updateDetailPricing(product);
        checkDetailAvailability(product._id);
      });
    }
  });
}
