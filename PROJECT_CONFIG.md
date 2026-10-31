# Project Configuration & Repository Documentation

This document records the repository information, credentials, project structure, and git operational commands for this application.

---

## 1. Repository & Account Information

| Property | Value |
| :--- | :--- |
| **GitHub Username** | `nikhilchauhan018` |
| **User Email** | `nikhilkumarchauhan165@gmail.com` |
| **Repository URL** | `https://github.com/nikhilchauhan018/ecom.git` |
| **Authenticated Remote URL** | `https://x-access-token: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@github.com/nikhilchauhan018/ecom.git` |

---

## 2. Project Architecture

This application is an **E-Commerce Store Admin Client** (`store-admin-client`), designed for back-office store operations.

### Key Features & Modules:
- **Dashboard (`/`)**: High-level store metrics, sales revenue charts, top performing categories, notifications, activity logs, and actionable to-do lists.
- **Orders (`/orders`)**: Complete order lifecycle tracking, search & status filters, order details, timeline, and order creation.
- **Products (`/products`)**: Product listing, multi-variant matrices, CSV import/export, descriptions, and status switches.
- **Categories (`/categories`)**: Product category hierarchies, category forms, and quick tagging.
- **Inventory (`/inventory`)**: Stock level tracking, low-stock alerts, warehouse replenishment indicators.
- **Customers (`/customers`)**: Customer accounts, purchase history, metrics, and profiles.
- **Discounts (`/discounts`)**: Promo code creation, coupon rules, discount triggers, and expiry tracking.
- **Invoices (`/invoices`)**: Invoice lists, status badges, printable invoice detail view.
- **Shipments & Shipping (`/shipments`, `/shipping`)**: Fulfillment monitoring, carrier dispatch, tracking IDs, and delivery routes.
- **Returns (`/returns`)**: Customer refund and exchange requests, return reason categorization.
- **Reviews (`/reviews`)**: Customer ratings and moderation workflows.

---

## 3. Technology Stack

- **Framework**: React 19 SPA powered by Vite 8
- **Routing**: `react-router-dom` v7
- **UI Components & Layout**:
  - React Bootstrap + Bootstrap 5
  - Tailwind CSS (v3 with `tw-` prefix to avoid utility collisions with Bootstrap)
  - Lucide React icons
  - `@fontsource/inter` typography
- **Data & Utilities**: PapaParse (CSV processing)
- **Dev Server**: Running on port `3000`, binding on `0.0.0.0`

---

## 4. Git Synchronization Commands

### Initialize and Link Remote:
```bash
git init
git config user.name "nikhilchauhan018"
git config user.email "nikhilkumarchauhan165@gmail.com"
git remote add origin https://x-access-token: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@github.com/nikhilchauhan018/ecom.git
```

### Commit and Push to GitHub:
```bash
git add .
git commit -m "Update ecom store admin frontend"
git branch -M main
git push -u origin main
```

### Pull latest changes:
```bash
git pull origin main
```

---

## 5. Development Scripts

- `npm run dev`: Starts the Vite development server on port 3000.
- `npm run build`: Compiles the production build into the `dist/` folder.
- `npm run lint`: Verifies TypeScript and syntax compilation (`tsc --noEmit`).
