# System Architecture & Design Specification: Daily Lens & Gear

This document consolidated the business context, system architecture, database models, and user interface specifications for the **Daily Lens & Gear** Camera Rental Web Application, utilizing the **Leaseycam** design system.

---

## 1. Core Objectives & Business Model
*   **Platform Name:** Daily Lens & Gear (Camera & Lens Rental Web Application)
*   **Target Audience:** Photographers, content creators, and hobbyists needing high-end gear temporarily.
*   **Fulfillment & Payment Workflow (Lens Lineup Style):**
    1.  **Reserve Online (Pay at Pickup):** Customers browse the catalog, select their rental dates, review pricing, and place a booking request *without* paying online.
    2.  **Manual Verification:** The shop staff contacts the renter by phone to verify credentials and quote the security deposit.
    3.  **Fulfillment:** Renter picks up the physical gear at the shop, presents their physical ID card, pays the rental fee + security deposit, and returns it when done.
    4.  **Deposit Refund:** The shop checks the camera condition on return and manually refunds the deposit.

---

## 2. Visual Identity & Theme System (Leaseycam Style)
To deliver a premium, modern experience, the UI adheres to the following visual tokens:

*   **Color Palette:**
    *   **Background:** Clean Pure White (`#FFFFFF`) with a light gray canvas (`#F8F9FA`).
    *   **Primary Accent:** Warm Amber Gold (`#F5A623` / `#FFB200`) used for primary buttons, active states, active tab highlights, and sale tags.
    *   **Text & Headings:** Deep Charcoal Black (`#1A1A1A`) for strong readability.
    *   **Muted Text:** Soft Slate Gray (`#7A7A7A`) for categories, secondary info, and metadata.
    *   **Status Colors:** Soft Mint Green (`#2EC4B6` or `#4CAF50`) for active rentals/shipping, soft Coral Red (`#E63946`) for cancelled.
*   **Typography:** Elegant Sans-Serif (e.g., "Inter" or "Outfit"). Bold headers, clear font weights.
*   **Border Radius:** Highly rounded corners (`16px` to `24px` for cards, buttons, and input fields) to match the friendly premium UI kit look.
*   **Shadows:** Extremely soft, subtle drop-shadows (`box-shadow: 0 8px 30px rgba(0,0,0,0.04)`).
*   **Micro-animations:** Hover transitions on buttons and catalog cards (`transform: scale(1.02)` or subtle box shadow enhancements).

---

## 3. Page & Screen Specifications (Desktop Web)

The application consists of 6 core screens, built using **pure HTML, Vanilla CSS, and Vanilla JavaScript** with support for Light and Dark theme toggles.

### A. Homepage & Catalog (`index.html`)
*   **Navigation Header:**
    *   *Left side:* Lowercase logo **"leaseycam"** in charcoal black with a warm gold camera shutter icon.
    *   *Center links:* "Cameras", "Lenses", "Flashes", "My Bookings".
    *   *Right side:* Greeting text "Hello, Guest" or User Avatar, and a Shopping Cart icon with an amber gold badge counting items.
*   **Hero Date Widget:** Prominent date picker inputs forcing users to select start/end dates before reserving gear.
*   **Dynamic Catalog Grid:** Filters out items currently booked (overlapping dates in `Orders` with `active`/`pending` status) or under maintenance.
*   **Brand Filters:** Logo badges (Canon, Sony, Nikon, Fujifilm, Leica, Panasonic) to filter grid. Outlined with an amber-gold ring when active.
*   **Shopping Cart Drawer:** Slide-out drawer displaying items, total days, subtotal cost, and a "Verify Booking" CTA.

### B. Checkout Review (`checkout.html`)
*   **Verify Items Column:** Cards showing selected gear, rates, and rental subtotals.
*   **Rental Details Column:** Displays duration, "Pickup at Shop" status, pickup date/time box, return date/time box, cost sum, deposit notice ("Staff will call to quote deposit"), total payable on pickup day, and "Book Equipment" orange CTA.
*   **ID Card Upload Area:** Dashed-border drag-and-drop upload zone for verification documents.

### C. My Bookings Portal (`bookings.html`)
*   **Tabs:** "Active Rentals" and "Rental History".
*   **Order Cards:** Product thumbnail, name, date range, price per day, and status badges (e.g. `● Pending`, `● Active`, `● Returned`, `● Cancelled`).
*   **Action Buttons:** "Cancel Order" (for Pending) and "Request Return" (for Active).

### D. Login & Register (`login.html`)
*   **Authentication Card:** Simple, minimalist double-sided forms for customer/admin login and register, storing credentials and generating JWT tokens.

### E. Admin Dashboard (`admin.html`)
*   **Stat overview widgets:** Total active rentals, pending verification, monthly earnings.
*   **Booking Management Table:** Filterable by status (Pending, Active, Completed/History) showing customer info, ID card upload preview thumbnail, rented gear, dates, and actions ("Approve & Release Gear" for Pending, "Confirm Return" for Active, "Cancel").
*   **Inventory Stock Controller:** List of gear with toggles to change status to "Maintenance" and rate input fields.

### F. Steps & Conditions (`terms.html`)
*   **How it Works:** Informational section detailing the 4 steps of renting, store policies, pickup/return hours, and late fee conditions.

---

## 4. Database Schema Mapping (MongoDB)
*   **Users:** `_id`, `name`, `email`, `password` (hashed), `role` (`'customer'` / `'admin'`), `cart` (`[{ equipmentId, quantity }]`).
*   **Equipment:** `_id`, `name`, `brand`, `category` (`'Body'`, `'Lens'`, `'Flash'`, `'Adapter'`), `pricePerDay`, `deposit`, `status` (`'available'`, `'maintenance'`).
*   **Orders:** `_id`, `renterId` (ref User), `equipmentId` (ref Equipment), `startDate`, `endDate`, `rentalFee`, `deposit`, `totalAmount`, `status` (`'pending'`, `'active'`, `'returned'`, `'cancelled'`), `cancelReason`.

---

## 5. Stitch UI Generation Prompt Template

Below is the design prompt to copy and paste into a Stitch UI builder tool:

```markdown
### 1. Visual Design & Theme System (Leaseycam Style)
*   **Design Aesthetic:** Minimalist, clean, airy, and modern Web interface.
*   **Color Palette:**
    *   **Background:** Clean Pure White (#FFFFFF) with light gray canvas (#F8F9FA).
    *   **Primary Accent:** Warm Amber Gold (#F5A623 / #FFB200) used for primary buttons, active states, active tab highlights, and sale tags.
    *   **Text & Headings:** Deep Charcoal Black (#1A1A1A) for strong readability.
    *   **Muted Text:** Soft Slate Gray (#7A7A7A) for categories and metadata.
    *   **Status Colors:** Soft green (#2EC4B6 or #4CAF50) for active rentals, soft red (#E63946) for cancelled.
*   **Typography:** Elegant Sans-Serif (e.g., "Inter" or "Outfit"). Bold headers, clear font weights.
*   **Border Radius:** Highly rounded corners (16px to 24px for cards, buttons, and input fields) to match the friendly premium UI kit look.
*   **Shadows:** Extremely soft, subtle drop-shadows (box-shadow: 0 8px 30px rgba(0,0,0,0.04)).

### 2. Screen 1: Homepage & Rental Catalog (index.html)
*   **Navigation Header:**
    *   Left side: Logo "leaseycam" in lowercase charcoal black with a warm gold camera shutter icon.
    *   Center links: "Cameras", "Lenses", "Flashes", "My Bookings".
    *   Right side: Greeting text "Hello, Guest" or User Avatar, and a Shopping Cart icon with an amber gold badge.
*   **"Select Rental Dates" Search Banner (Hero):**
    *   Inputs: "Select Start Date" and "Select End Date" with calendar icons.
    *   Large, filled Amber Gold button with rounded corners.
*   **Brand Filters:**
    *   Horizontal scrolling list of round brand-logo badges: Canon, Sony, Nikon, Fujifilm, Leica, Panasonic.
*   **Equipment Catalog Grid (Product Cards):**
    *   White card background with a soft outline.
    *   Top right: small heart icon (wishlist).
    *   Details: Model Name, Category, price badge e.g. "1,500 THB/Day", CTA button: "Add to Cart" or "Select Dates" (or disabled gray "Unavailable").

### 3. Screen 2: Shopping Cart & Checkout Drawer
*   Slide-out drawer from the right side.
*   Items list with product image, title, daily rate, quantity adjuster.
*   Rental Duration Banner: "Selected Rental: 7 Days (17 Aug - 24 Aug)".
*   Fees Summary: Rental Subtotal, Security Deposit (Fully Refundable), and bold Total Price.
*   Dashed-border upload widget: "Drag and drop a photo of your ID Card".
*   Checkout Button: Large Amber Gold button reading "Confirm and Reserve Gear".

### 4. Screen 3: "My Bookings" Portal (bookings.html)
*   Tabs: [ Active Rentals ] and [ Rental History ].
*   Order Card List showing camera image, Model Name, Date Range, Price/Day, status badge (e.g. green ● Active, gray ● Returned, red ● Cancelled), and Action Buttons (e.g. "Cancel Order" or "Request Return").

### 5. Screen 4: Admin Dashboard (admin.html)
*   Statistics widgets: Active Rentals, Pending Approvals, Monthly Earnings.
*   Verification Approvals Table showing customer name, ID Card upload preview, total price, and actions: "Approve Rental" and "Reject".
*   Inventory List with toggle switch to flag gear as "Available" or "Maintenance".
```
