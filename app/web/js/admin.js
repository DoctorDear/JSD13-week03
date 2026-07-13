/*
   Daily Lens & Gear - Admin Dashboard Script
   Handles Metrics calculation, Pending Orders approvals, Returns logging, and Stock maintenance.
*/

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

// Global state
let allOrders = [];
let allEquipment = [];

async function initAdminDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html?redirect=admin.html';
    return;
  }

  // Double check admin role by loading User state
  try {
    const authRes = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (authRes.ok) {
      const user = await authRes.json();
      if (user.role !== 'admin') {
        alert("Access Denied: You are not authorized to view the admin panel.");
        window.location.href = '/';
        return;
      }
    } else {
      window.location.href = '/login.html?redirect=admin.html';
      return;
    }
  } catch (error) {
    console.error("Admin auth check error:", error);
    window.location.href = '/';
    return;
  }

  // Setup tab listeners
  const pendingTab = document.getElementById('admin-tab-pending');
  const historyTab = document.getElementById('admin-tab-history');

  if (pendingTab && historyTab) {
    pendingTab.addEventListener('click', () => {
      pendingTab.classList.add('active');
      historyTab.classList.remove('active');
      renderOrdersTable(true);
    });

    historyTab.addEventListener('click', () => {
      historyTab.classList.add('active');
      pendingTab.classList.remove('active');
      renderOrdersTable(false);
    });
  }

  // Setup modal close
  const imageModal = document.getElementById('image-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn && imageModal) {
    closeModalBtn.addEventListener('click', () => {
      imageModal.classList.remove('active');
    });
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal || e.target === closeModalBtn) {
        imageModal.classList.remove('active');
      }
    });
  }

  // Fetch initial dashboard data
  fetchDashboardData();
}

async function fetchDashboardData() {
  const token = localStorage.getItem('token');

  try {
    // Fetch all orders
    const ordersRes = await fetch('/api/orders/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (ordersRes.ok) {
      allOrders = await ordersRes.json();
      calculateMetrics();
      
      // Default render pending orders
      const pendingTab = document.getElementById('admin-tab-pending');
      const renderPending = pendingTab ? pendingTab.classList.contains('active') : true;
      renderOrdersTable(renderPending);
    }

    // Fetch all inventory
    const eqRes = await fetch('/api/equipment/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (eqRes.ok) {
      allEquipment = await eqRes.json();
      renderInventoryTable();
    }

  } catch (error) {
    console.error("Fetch dashboard data error:", error);
  }
}

function calculateMetrics() {
  const pendingCountEl = document.getElementById('metric-pending-count');
  const activeCountEl = document.getElementById('metric-active-count');
  const earningsEl = document.getElementById('metric-earnings-total');

  let pendingCount = 0;
  let activeCount = 0;
  let totalEarnings = 0;

  allOrders.forEach(order => {
    if (order.status === 'pending') pendingCount++;
    if (order.status === 'active') activeCount++;
    if (order.status === 'returned' || order.status === 'active') {
      // Sum the rental fees as revenue (excluding deposit since it is refunded)
      totalEarnings += order.rentalFee;
    }
  });

  if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  if (activeCountEl) activeCountEl.textContent = activeCount;
  if (earningsEl) earningsEl.textContent = `${totalEarnings.toLocaleString()} THB`;
}

function renderOrdersTable(showPendingOnly = true) {
  const tbody = document.getElementById('admin-orders-table-body');
  if (!tbody) return;

  const filtered = allOrders.filter(order => {
    return showPendingOnly ? order.status === 'pending' : true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">
          No bookings found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const renter = order.renterId || { name: 'Unknown User', email: '' };
    const gear = order.equipmentId || { name: 'Unknown Gear', brand: '', category: 'Adapter' };
    
    const startStr = new Date(order.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = new Date(order.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const rentalDays = Math.ceil(Math.abs(new Date(order.endDate) - new Date(order.startDate)) / (1000 * 60 * 60 * 24)) || 1;

    let statusClass = 'status-pending';
    if (order.status === 'active') statusClass = 'status-active';
    if (order.status === 'returned') statusClass = 'status-returned';
    if (order.status === 'cancelled') statusClass = 'status-cancelled';

    // Verification Document preview thumbnail
    const idCardUrl = order.verificationDoc ? order.verificationDoc.idCardImageUrl : '';
    let thumbnailHtml = `<span style="color:var(--text-secondary); font-size:0.8rem;">No Document</span>`;
    
    if (idCardUrl) {
      thumbnailHtml = `
        <img class="id-thumbnail" src="${idCardUrl}" alt="ID Thumb" onclick="previewImage('${idCardUrl}')">
      `;
    }

    // Dynamic actions based on status
    let actionsHtml = `<span style="color:var(--text-secondary); font-size:0.85rem;">None</span>`;
    
    if (order.status === 'pending') {
      actionsHtml = `
        <div class="admin-actions-cell">
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;" 
            onclick="updateOrderStatus('${order._id}', 'active')">Approve</button>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; color: var(--coral-red); border-color: var(--coral-red);" 
            onclick="rejectOrderPrompt('${order._id}')">Reject</button>
        </div>
      `;
    } else if (order.status === 'active') {
      actionsHtml = `
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; background-color: var(--mint-green); color: white;" 
          onclick="updateOrderStatus('${order._id}', 'returned')">Confirm Return</button>
      `;
    }

    return `
      <tr>
        <td>
          <div style="font-weight:700;">${renter.name}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${renter.email}</div>
        </td>
        <td>${thumbnailHtml}</td>
        <td>
          <div style="font-weight:600;">${gear.name}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${gear.category}</div>
        </td>
        <td>
          <div style="font-weight:600;">${rentalDays} Days</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${startStr} - ${endStr}</div>
        </td>
        <td>
          <div style="font-weight:700;">${order.totalAmount.toLocaleString()} ฿</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Fee: ${order.rentalFee.toLocaleString()} | Dep: ${order.deposit.toLocaleString()}</div>
        </td>
        <td>
          <span class="status-badge ${statusClass}">● ${order.status}</span>
        </td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

function previewImage(url) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image-el');
  if (modal && modalImg) {
    modalImg.src = url;
    modal.classList.add('active');
  }
}

async function updateOrderStatus(orderId, status, cancelReason = '') {
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(`/api/orders/admin/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, cancelReason })
    });

    if (res.ok) {
      alert(`Order status updated to ${status}!`);
      fetchDashboardData();
    } else {
      const data = await res.json();
      alert(`Update failed: ${data.message}`);
    }
  } catch (error) {
    console.error("Update order status error:", error);
  }
}

function rejectOrderPrompt(orderId) {
  const reason = prompt("Please enter the reason for rejecting/cancelling this order:");
  if (reason === null) return; // Cancelled dialog
  if (reason.trim() === '') {
    alert("Reason is required to reject an order.");
    return;
  }
  updateOrderStatus(orderId, 'cancelled', reason);
}

// ==========================================
// 9. Inventory management logic
// ==========================================
function renderInventoryTable() {
  const tbody = document.getElementById('admin-inventory-table-body');
  if (!tbody) return;

  if (allEquipment.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">
          Inventory is empty.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allEquipment.map(item => {
    const isAvailable = item.status === 'available';

    return `
      <tr data-eq-id="${item._id}">
        <td style="font-weight:700;">${item.name}</td>
        <td>${item.brand}</td>
        <td><span class="status-badge" style="background-color:var(--bg-color); color:var(--text-primary); border:1px solid var(--border-color);">${item.category}</span></td>
        <td>
          <input type="number" class="admin-table-price-input" id="price-input-${item._id}" value="${item.pricePerDay}">
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <label class="switch">
              <input type="checkbox" id="status-switch-${item._id}" ${isAvailable ? 'checked' : ''} onchange="toggleEquipmentStatus('${item._id}')">
              <span class="slider"></span>
            </label>
            <span style="font-size:0.85rem; font-weight:600;" id="status-label-${item._id}">
              ${item.status}
            </span>
          </div>
        </td>
        <td>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;" 
            onclick="updateEquipmentPrice('${item._id}')">Save Price</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleEquipmentStatus(id) {
  const token = localStorage.getItem('token');
  const checkbox = document.getElementById(`status-switch-${id}`);
  const label = document.getElementById(`status-label-${id}`);
  
  if (!checkbox || !label) return;
  const newStatus = checkbox.checked ? 'available' : 'maintenance';

  try {
    const res = await fetch(`/api/equipment/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      label.textContent = newStatus;
      // Update local array
      const itemIndex = allEquipment.findIndex(eq => eq._id === id);
      if (itemIndex > -1) allEquipment[itemIndex].status = newStatus;
    } else {
      // Revert checkbox state on error
      checkbox.checked = !checkbox.checked;
      alert("Failed to update status.");
    }
  } catch (error) {
    console.error("Toggle status error:", error);
    checkbox.checked = !checkbox.checked;
  }
}

async function updateEquipmentPrice(id) {
  const token = localStorage.getItem('token');
  const priceInput = document.getElementById(`price-input-${id}`);
  
  if (!priceInput) return;
  const newPrice = Number(priceInput.value);

  if (isNaN(newPrice) || newPrice < 0) {
    alert("Please enter a valid price.");
    return;
  }

  try {
    const res = await fetch(`/api/equipment/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pricePerDay: newPrice })
    });

    if (res.ok) {
      alert("Price updated successfully!");
      // Update local array
      const itemIndex = allEquipment.findIndex(eq => eq._id === id);
      if (itemIndex > -1) allEquipment[itemIndex].pricePerDay = newPrice;
    } else {
      alert("Failed to update price.");
    }
  } catch (error) {
    console.error("Update price error:", error);
  }
}
