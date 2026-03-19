# 🛒 Web-Based POS System

> Point of Sale System with Staff Management & KHQR Payment Integration

![Laravel](https://img.shields.io/badge/Laravel-12-red)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)
![KHQR](https://img.shields.io/badge/KHQR-Bakong-green)

---

## 📋 Overview

A full-featured **Web-Based Point of Sale (POS) System** built for retail shops in Cambodia. Supports **KHQR Dynamic QR payment** via Bakong API (National Bank of Cambodia).

**Developer:** NHEM SOMEAN  
**Timeline:** 4 Weeks (28 Days)  
**Date:** March 2026

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Laravel 12 (PHP) |
| Database | MySQL |
| Payment | KHQR + Bakong API (NBC) |
| Auth | Laravel Sanctum |
| Version Control | Git + GitHub |

---

## ✨ Features

### 🔐 Authentication & Security
- Login/Logout with Laravel Sanctum
- Role-based access control (Admin & Cashier)
- Protected routes (Frontend + Backend)
- Admin-only: Products, Categories, Staff management
- Cashier-only: POS, Orders view

### 🛒 POS Interface
- Product grid with search & category filter
- Cart management (add, remove, quantity)
- Discount input
- Cash payment + change calculator
- **Real KHQR Dynamic QR payment via Bakong API**
- Auto polling payment status every 3 seconds
- Receipt generation & print

### 📦 Product Management (Admin only)
- CRUD with image upload
- Stock tracking & low stock alerts
- Category filter

### 🏷️ Category Management (Admin only)
- CRUD operations

### 👥 Staff Management (Admin only)
- CRUD with role assignment (Admin & Cashier)

### 📋 Orders
- Order history with filters
- Filter by date range, status, payment, cashier
- Archive/Unarchive orders
- Export CSV, Excel, PDF
- Order detail view

### 📊 Dashboard
- Daily & monthly revenue stats
- Best selling products (Pie chart)
- Revenue trend (Bar + Line charts)
- Low stock alerts
- Recent orders table

### 🧾 Receipt
- Auto-generated after cash checkout
- Print to browser

---

## 🚀 Installation

### Requirements
- PHP 8.2+
- Node.js 22+
- MySQL 8+
- Composer

### Backend Setup (Laravel)
```bash
# Clone repository
git clone https://github.com/NHEM-SOMEAN/pos-system.git
cd pos-system

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure .env
DB_DATABASE=pos_system
DB_USERNAME=root
DB_PASSWORD=

BAKONG_TOKEN=your_bakong_token
BAKONG_ACCOUNT_ID=your_bakong_id
BAKONG_MERCHANT_NAME="Your Shop Name"
BAKONG_MERCHANT_CITY="Phnom Penh"

# Generate app key
php artisan key:generate

# Run migrations & seeders
php artisan migrate --seed

# Create storage link
php artisan storage:link

# Start server
php artisan serve
```

### Frontend Setup (React)
```bash
cd pos-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pos.com | password |
| Cashier | cashier@pos.com | password |

---

## 📱 KHQR Payment Flow

1. Cashier clicks **Pay with KHQR**
2. System generates Dynamic QR via **Bakong API**
3. Customer scans with **ABA / ACLEDA / Wing** or any Bakong-supported app
4. Frontend polls every **3 seconds** to check payment status
5. Payment confirmed → Order saved → Receipt printed

> **Note:** Requires Bakong API token from https://api-bakong.nbc.gov.kh/register

---

## 🔒 Security

- Laravel Sanctum token authentication
- Role-based access control (Admin/Cashier)
- Admin only: Products, Categories, Staff
- Cashier only: POS, Orders view
- Backend API protected with role checks

---

## 📁 Project Structure
```
pos-system/
├── app/
│   └── Http/Controllers/API/
│       ├── AuthController.php
│       ├── DashboardController.php
│       ├── KHQRController.php
│       ├── ProductController.php
│       ├── CategoryController.php
│       ├── OrderController.php
│       └── StaffController.php
├── pos-frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── POS.jsx
│       │   ├── Products.jsx
│       │   ├── Categories.jsx
│       │   ├── Staff.jsx
│       │   └── Orders.jsx
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── Receipt.jsx
│       └── api/
│           └── axios.js
```

---

## 🌐 Deployment

### Laravel (VPS/Hostinger)
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### React (Vercel/Netlify)
```bash
npm run build
# Upload dist/ folder to Vercel/Netlify
```

---

## 📄 License

MIT License — NHEM SOMEAN © 2026