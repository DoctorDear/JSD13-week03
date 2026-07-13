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
  }
});

// ==========================================
// 1. Theme Configuration (Dark/Light Toggle)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
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
        <div class="card-img-placeholder">
          <img src="${item.imageUrl || '/images/body.png'}" alt="${item.name}">
        </div>
        <div class="card-brand">${item.brand}</div>
        <h4 class="card-title">${item.name}</h4>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-num">${item.pricePerDay.toLocaleString()} ฿</span>
            <span class="price-unit">per day</span>
          </div>
          <button class="btn ${btnClass}" onclick="addToCart('${item._id}')" ${disabledAttr}>${btnText}</button>
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
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-weight: 700;">${item.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.category} | ${item.pricePerDay.toLocaleString()} ฿/Day</div>
        </div>
        <div style="font-weight: 700; color: var(--primary-accent);">
          ${(item.pricePerDay * rentalDays).toLocaleString()} ฿
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
