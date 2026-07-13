# Implementation Plan: Daily Lens & Gear Camera Rental Web App

This document outlines the design and implementation plan for the **Daily Lens & Gear** Camera Rental Web Application. Based on your feedback, we are **prioritizing the frontend screens** while ensuring they successfully connect to and pull data from **MongoDB** via a lightweight Express backend API. Environment variables will be managed via a `.env` file at the root.

---

## Phased Approach

1.  **Phase 1 (Database & Backend API Base):**
    *   Configure environment variables in a `.env` file at the root using your MongoDB Atlas Sharded connection string.
    *   Create schemas for `User`, `Equipment`, and `Order` matching the `week-02` design.
    *   Create a seeder script (`seed.js`) to populate MongoDB Atlas with the original mock data from `week-02`.
    *   Build Express API endpoints (`GET /api/equipment`, `POST /api/auth/login`, etc.) to retrieve and manipulate data.
2.  **Phase 2 (Frontend Screens & Integration):**
    *   Create the core frontend pages (`index.html`, `login.html`, `checkout.html`, `bookings.html`, `admin.html`, `terms.html`) under `app/web/`.
    *   Style pages with premium Leaseycam themes (Amber Gold accents, rounded cards, slide-in drawer, and Dark Mode support).
    *   Write the client-side JavaScript to query the Express backend, pulling equipment lists, active bookings, and user states directly from MongoDB.

---

## File Structure & Configuration

We will organize the files as follows:

```
/ (workspace root)
├── db/                       # Local MongoDB data directory (optional fallback)
├── app/
│   ├── uploads/              # Uploaded ID card images
│   ├── api/
│   │   ├── models/
│   │   │   ├── User.js       # User schema (from week-02)
│   │   │   ├── Equipment.js  # Equipment schema (from week-02)
│   │   │   └── Order.js      # Order schema (from week-02)
│   │   ├── routes/
│   │   │   ├── auth.js       # Login / Register APIs
│   │   │   ├── equipment.js  # Equipment listing & overlap filtering
│   │   │   └── orders.js     # Booking creation & state updates
│   │   ├── server.js         # Express Server
│   │   └── seed.js           # Seeder script for mock data
│   └── web/
│       ├── index.html        # Catalog & Date selector
│       ├── checkout.html     # Checkout & ID upload
│       ├── bookings.html     # Booking history & current orders
│       ├── login.html        # Authentication page
│       ├── terms.html        # How it works & policies
│       ├── admin.html        # Admin management console
│       ├── css/
│       │   └── style.css     # Premium styling & dark mode toggle
│       └── js/
│           ├── app.js        # Catalog & user scripts
│           └── admin.js      # Admin dashboard operations
├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
├── package.json              # Express, mongoose, jwt, bcryptjs, multer, dotenv
└── README.md
```

---

## Configuration (`.env`)
The `.env` file at the root will store your MongoDB Atlas replica set URI:
```env
PORT=5000
MONGO_URI=mongodb://chirasak_db_user:<db_password>@ac-hdblqle-shard-00-00.k8xdan0.mongodb.net:27017,ac-hdblqle-shard-00-01.k8xdan0.mongodb.net:27017,ac-hdblqle-shard-00-02.k8xdan0.mongodb.net:27017/daily-lens-gear-db?ssl=true&replicaSet=atlas-g9047s-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=leaseycam_secret_jwt_key_2026
```
*(Note: Replace `<db_password>` in `.env` with your actual MongoDB Atlas database password before running the server.)*

---

## Database Schemas (Aligned with week-02)

*   **User (`User.js`):** `name`, `email`, `password` (hashed), `role` (`customer`/`admin`), `cart` (`[{ equipmentId, quantity }]`).
*   **Equipment (`Equipment.js`):** `name`, `brand`, `category` (`Body`/`Lens`/`Flash`/`Adapter`), `pricePerDay`, `status` (`available`/`maintenance`).
*   **Order (`Order.js`):** `renterId` (ref User), `equipmentId` (ref Equipment), `startDate`, `endDate`, `rentalFee`, `deposit`, `totalAmount`, `status` (`pending`/`active`/`returned`/`cancelled`), `verificationDoc` (`{ idCardImageUrl, uploadedAt }`), `cancelReason`.

---

## Verification Plan

*   **Database Check:** Verify that data is successfully seeded in MongoDB.
*   **API Check:** Fetch `/api/equipment` using curl or browser to confirm that JSON data is returned.
*   **Frontend Check:** Load pages locally, view seeded products in the catalog, adjust date ranges, and confirm the catalog dynamically updates products based on availability in MongoDB.
