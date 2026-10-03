# 🍛 Eaty India - Modern Mobile-First Food Ordering & Delivery App

**Eaty** is a complete, modern, mobile-first food delivery application for India inspired by Swiggy and Zomato. It is fully functional with live distance calculations, dynamic delivery geofencing, custom menu options, interactive cart and coupons, Indian UPI and COD payments with demo testing modes, multi-stage live order tracking, customer profile management, and a restaurant partner dashboard.

---

## 🌟 Key Features

### 📍 1. Geolocation & Haversine Distance Engine
- **Real GPS Detection**: Uses the browser's `navigator.geolocation` API with high-accuracy GPS coordinates.
- **Haversine Distance Formula**: Computes precise aerial distance in kilometers between the user's latitude/longitude and each restaurant's real stored coordinates:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2(\Delta\phi/2) + \cos(\phi_1)\cos(\phi_2)\sin^2(\Delta\lambda/2)}\right)$$
- **Automatic Nearest Sorting**: "Restaurants Near You" are sorted in real-time from nearest to farthest.
- **Configurable Radius Filter**: Instant pills for **2 km, 5 km (default), 10 km, and 15 km**.
- **Geofenced Restaurant Delivery Radii**: Every restaurant defines its own maximum delivery radius (e.g. 5 km, 8 km, 12 km). If a customer's address is outside that restaurant's delivery radius, ordering is blocked with a clear warning badge.
- **Friendly Empty State**: When no restaurants exist within the selected radius, prompts the user to expand to 10 km / 15 km or switch delivery location.
- **Dynamic Delivery Estimators**: Automatically recalculates delivery charges (base ₹25 + ₹9/km or FREE over ₹499) and delivery time (15m prep + 4.5m/km) whenever delivery address changes.

### 🍽️ 2. Discovery, Categories & Cuisines
- **Indian Locality Presets**: One-click switching between Koramangala, Indiranagar, HSR Layout, MG Road, Bandra (Mumbai), Connaught Place (Delhi), and Hitec City (Hyderabad).
- **Search Bar**: Live real-time search across restaurants, cuisines, and dish names.
- **Indian Food Categories**: Biryani, Pizza, Burgers, South Indian, North Indian, Chinese, Desserts, Beverages, and Rolls & Wraps.
- **FSSAI Food Indicators**: Indian green dot square for Pure Veg and red triangle/dot square for Non-Veg.
- **Quick Filters**: Pure Veg toggle, Fast Delivery (<30 mins), and 4.0+ Star Rating.

### 🥘 3. Restaurant Menu & Customization
- **Rich Menu Layout**: Organized by categories (Recommended, Bestsellers, Starters, Main Course, Biryani, Desserts).
- **Item Customization Modal**: Choose portions/sizes, add-ons (extra cheese, boiled eggs, dips), spice level (Mild, Medium, Andhra Fiery), and special cooking notes.
- **Interactive Quantity Counters**: Smooth `- 1 +` stepper directly on dish cards.

### 🛒 4. Cart & Dynamic Bill Itemization
- **Sticky Bottom Cart Bar**: Slides up when items are in cart with real-time item count and subtotal.
- **Multi-Restaurant Protection**: Prompts user before clearing cart if adding items from another restaurant.
- **Delivery Partner Tips**: One-tap tips (₹10, ₹20, ₹30, ₹50) with 100% pass-through.
- **Coupons Engine**:
  - `WELCOME100`: Flat ₹100 off on ₹299+
  - `EATY50`: 50% off up to ₹120 on ₹199+
  - `FREEDEL`: Free delivery on ₹149+
  - `BIRYANI25`: 25% off on Biryani items
- **Indian GST (5%) & Packaging Fees**: Realistic Indian food billing breakdown.

### 💳 5. Checkout & UPI Demo Mode
- **Address Manager**: Select saved addresses (Home, Work, Other) or add new delivery address with Indian phone and landmark.
- **Cash on Delivery (COD)**: Instant order confirmation.
- **UPI Gateway Simulation**:
  - Dynamic QR code generation for scan & pay via PhonePe, GPay, Paytm, BHIM.
  - Expiry countdown timer (5 minutes).
  - **Demo Mode Controls**:
    - `✓ Simulate Success`: Simulates successful UPI callback and creates order.
    - `✕ Simulate Failure`: Simulates bank failure with retry or COD switch option.
  - Zero sensitive payment storage; ready for Razorpay/Cashfree SDK injection.

### 🛵 6. Live Order Tracking
- **Unique Indian Order ID**: e.g., `#EATY-2026-98241`.
- **5-Stage Visual Timeline**:
  1. 📋 Order Placed
  2. 👨‍🍳 Restaurant Accepted
  3. 🍳 Food Preparing
  4. 🛵 Out for Delivery
  5. ✅ Delivered
- **Animated Rider Map Route**: Animated scooter icon progressing smoothly from restaurant pin to customer home pin.
- **Delivery Partner Card**: Photo, name, vehicle number, star rating, verified badge, and phone call trigger.
- **Simulation Controls**: "Advance to Next Stage" button and auto-advance timer for testing every phase.
- **1-Click Reorder**: Automatically adds past meal items to cart and opens checkout.

### 👨‍🍳 7. Restaurant Partner / Admin Dashboard
- Switch seamlessly between Customer View and Partner Portal.
- **Live Kitchen Orders Dispatcher**: View incoming orders in real-time and advance statuses (`Accept Order` → `Start Cooking` → `Dispatch Rider` → `Mark Delivered`).
- **Coordinates & Radius Manager**: Edit restaurant GPS latitude, longitude, and custom delivery radius in km.
- **Menu Editor**: Add new dishes, adjust prices, and toggle in-stock/sold-out status.
- **Add New Restaurant**: Register new partner restaurants with custom coordinates.

---

## 🚀 Running Locally

The app includes a zero-dependency static server in PowerShell:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\server.ps1 -Port 3000
```

Open your browser at:
```
http://localhost:3000/
```

Or simply open `index.html` directly in any modern web browser.
