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

## 🌟 How to Showcase Your Work (อวดคนอื่นยังไงดีหลังจาก Push GitHub)

เมื่อคุณพุชโปรเจกต์นี้ขึ้น GitHub แล้ว นี่คือวิธีแชร์และนำเสนอผลงานเพื่อให้ดูโดดเด่นและเป็นมืออาชีพที่สุด:

### 1. บันทึกวิดีโอเดโมสั้นๆ / ไฟล์ GIF (Show, Don't Tell)
คนส่วนใหญ่บน GitHub หรือ Social Media มักจะไม่มีเวลากดรันโค้ดเครื่องตัวเอง การมี GIF หรือคลิปสั้นแสดงวิธีรันจะช่วยดึงดูดสายตาได้ดีมาก:
- **แอปบันทึกแนะนำ**: ใช้โปรแกรมฟรีอย่าง [ScreenToGif](https://www.screentogif.com/) หรือ [Loom](https://www.loom.com/)
- **ฟีเจอร์เด่นที่ควรบันทึก**:
  - การเปลี่ยนโหมด **Light Mode / Dark Mode** ที่สมูท
  - การคลิกปุ่ม **Promotion Card** แล้วระบบตั้งค่าช่วงวันเช่าและแสดงกล่องตัวอักษรสีเขียวคำนวณส่วนลดประหยัดได้โดยอัตโนมัติ
  - การลากไฟล์รูปบัตรประชาชนในหน้า **Checkout**
  - การเปิดดูรูปในตัวขยายรูปขนาดใหญ่ (Modal Preview) ในหน้า **Admin Console**

### 2. เขียนโพสต์ลงโซเชียลมีเดีย (LinkedIn / Facebook / Medium)
นำเสนอความภูมิใจในโปรเจกต์นี้ด้วยการเล่าเรื่อง (Storytelling) เกี่ยวกับความท้าทายในการเขียนเว็บโดย **ไม่ใช้ Tailwind และ React** (ใช้เพียง Vanilla CSS และ Vanilla JS เท่านั้น!) 

**Template สำหรับโพสต์:**
> 🚀 **[Showcase] Daily Lens & Gear — Camera Rental Web App!**
> 
> ผมเพิ่งทำโปรเจกต์เว็บเช่ากล้องและเลนส์ระดับโปรเสร็จสมบูรณ์! ความท้าทายหลักของโปรเจกต์นี้คือการสร้างเว็บแอปพลิเคชันแบบ MERN Stack ที่มีฟีเจอร์ครบครันและการออกแบบระดับพรีเมียม โดย **ไม่พึ่งพา UI Frameworks หรือ React** เลย (ใช้เพียง HTML, Vanilla CSS และ Vanilla JS เท่านั้น!)
> 
> **Highlight ฟีเจอร์ที่พัฒนา:**
> - 🎨 **Custom Design System (Vanilla CSS)**: ออกแบบโครงสีส้มสด/เขียวสด รวมถึง Light/Dark Mode ที่รองรับสลับโหมดได้แบบสมูทด้วย CSS Custom Properties
> - 📅 **Smart Date & Availability Filter**: ระบบเช็คความว่างของกล้องตามช่วงวัน หากโดนจองในช่วงเวลาเดียวกัน กล้องจะถูกซ่อนจากแคตตาล็อกโดยอัตโนมัติ
> - ⚡ **Dynamic Promotion Engine**: เลือกโปรโมชั่นเพื่อคำนวณส่วนลดแบบเรียลไทม์ (4 วัน/7 วัน/10 วัน) พร้อมบอกส่วนลดที่ประหยัดได้เป็นจำนวนบาทและเปอร์เซ็นต์
> - 🔒 **Admin Console**: หน้าสำหรับแอดมินอนุมัติออเดอร์, เช็คยอดขายสะสม, และเปิด Modal ดูรูปบัตรประชาชนเพื่อยืนยันตัวตน
> 
> โปรเจกต์นี้ทำให้ผมได้ฝึกการเขียนโครงสร้าง CSS และการจัดการ DOM ด้วย JS ตั้งแต่ศูนย์ ทำให้เข้าใจระบบการทำงานเบื้องลึกได้อย่างชัดเจนขึ้นมากครับ!
> 
> 👉 เชิญรับชมโค้ดได้ที่ GitHub: `[ใส่ลิงก์ GitHub ของคุณ]`
> *(แนบไฟล์วิดีโอเดโมหรือรูปสกรีนช็อตสวยๆ)*

### 3. นำขึ้น Deploy บน Server จริง (Live Demo)
ให้ผู้เข้าชมสามารถกดลองเล่นแอปพลิเคชันของคุณได้จริงผ่านมือถือหรือเบราว์เซอร์:
- **บริการโฮสติ้งฟรี**: สามารถนำไป Deploy บน [Render](https://render.com/) หรือ [Fly.io](https://fly.io/) คู่กับฐานข้อมูล MongoDB Atlas (Free Tier Cluster)
- แปะลิงก์ **Live Demo** ไว้ที่ปุ่ม `About` ด้านขวาบนของหน้า GitHub Repository และด้านบนสุดของไฟล์ README.md
