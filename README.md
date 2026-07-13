# 📷 Daily Lens & Gear — Professional Camera Rental Ecosystem

A high-fidelity, premium camera and lens rental web platform built using a Node.js/Express REST API, MongoDB/Mongoose database, and a completely custom, responsive **Vanilla CSS** design system (Aperture & Flow guidelines) with automatic light/dark mode transitions.

---

## 🚀 Key Features

### 1. Dynamic Catalog & Filters
- **Real-Time Availability**: Date range filters automatically query the database and hide any equipment items currently out on hire or undergoing maintenance.
- **Multi-layered Sorting**: Filter gear dynamically by categories (Bodies, Lenses, Flashes, Adapters) and brand chips (Canon, Sony, Nikon, Fujifilm, Sigma, etc.).

### 2. Interactive Product Details (`detail.html`)
- **Mock Gallery**: Smooth thumbnail navigation previews.
- **Date-based Availability Checker**: Instantly queries overlapping orders for the selected dates and alerts the user if the item is free or booked.
- **Clickable Promotion Rates**: Click-to-apply rates (4 days = 25% off, 7 days = 29% off, 10 days = 35% off) which auto-set dates, compute savings in real-time, and display total discounts.
- **Flexible Delivery Selection**: Toggle between Self-Pickup or Messenger Delivery.

### 3. Checkouts & Verification (`checkout.html`)
- **Drag-and-Drop ID Upload**: Upload identity documents required for verification before shop pickup.
- **Sticky Breakdown Panel**: Real-time display of rental subtotal, estimated security deposits, and final amount payable.

### 4. Admin Management Console (`admin.html`)
- **Key Metrics Grid**: Live tracking of active rentals, pending approvals, and total earnings.
- **Approval Queue**: Review bookings, view uploaded ID documents in an interactive modal, approve requests, and confirm gear returns.
- **Inventory Manager**: Dynamically adjust daily hire rates and toggle maintenance switches.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
- **Authentication**: JWT token storage, bcrypt password hashing.
- **Frontend**: HTML5, Vanilla CSS3 (Custom design tokens, CSS variables, glassmorphism, Inter & JetBrains Mono, and custom animations), Vanilla JavaScript (ES6+).

---

## 📦 Local Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Seeding**:
   Reset and seed MongoDB with initial users, cameras, and mock rental histories:
   ```bash
   npm run seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` to interact with the application.

---
