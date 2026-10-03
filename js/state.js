// state.js - Reactive central state store with LocalStorage persistence

class EatyState {
  constructor() {
    this.listeners = new Map();
    this.loadState();
  }

  loadState() {
    // Default Bangalore Koramangala coordinates
    const defaultLocation = {
      lat: 12.9352,
      lng: 77.6245,
      locality: 'Koramangala 5th Block',
      addressLine: 'Near Sony World Signal, 80 Feet Road, Bengaluru',
      city: 'Bengaluru',
      isGps: false,
    };

    // Default User
    const defaultUser = {
      isLoggedIn: true,
      name: 'Aditya Sharma',
      phone: '+91 98765 43210',
      email: 'aditya.sharma@example.com',
      avatar: '👨‍💼',
      addresses: [
        {
          id: 'addr-1',
          type: 'Home',
          icon: '🏠',
          receiverName: 'Aditya Sharma',
          phone: '+91 98765 43210',
          flat: 'Flat 402, Green Glen Residency',
          landmark: 'Opposite Cult.Fit Gym',
          addressLine: 'Koramangala 5th Block, Bengaluru',
          lat: 12.9352,
          lng: 77.6245,
          isDefault: true,
        },
        {
          id: 'addr-2',
          type: 'Work',
          icon: '💼',
          receiverName: 'Aditya Sharma',
          phone: '+91 98765 43210',
          flat: 'Tower B, 6th Floor, Bagmane Tech Park',
          landmark: 'Near Outer Ring Road',
          addressLine: 'CV Raman Nagar, Bengaluru',
          lat: 12.9808,
          lng: 77.6638,
          isDefault: false,
        },
      ],
      paymentMethods: [
        { type: 'UPI', upiId: 'aditya@oksbi', name: 'Google Pay' },
        { type: 'UPI', upiId: '9876543210@paytm', name: 'Paytm UPI' },
      ],
    };

    const saved = this.getFromStorage('eaty_state');

    this.data = {
      // Location & Nearest restaurant search radius
      location: saved?.location || defaultLocation,
      searchRadiusKm: saved?.searchRadiusKm || 5.0, // 2, 5, 10, 15 km

      // Filters & Search
      searchQuery: '',
      activeCategory: 'all',
      pureVegOnly: false,
      sortBy: 'distance', // 'distance' | 'rating' | 'deliveryTime' | 'costAsc'
      ratingFilter: 0, // 0 | 4.0
      fastDeliveryOnly: false,

      // User
      user: saved?.user || defaultUser,

      // Partner / Admin Authentication
      partnerAuth: saved?.partnerAuth || {
        isLoggedIn: true,
        email: 'partner@meghana.in',
        restaurantId: 'rest-1',
        restaurantName: 'Meghana Foods',
        role: 'partner',
      },

      // Cart
      cart: saved?.cart || {
        restaurantId: null,
        restaurantName: '',
        items: [],
        appliedCoupon: null,
        tipAmount: 0,
        instructions: '',
        deliveryNote: '',
      },

      // Navigation & View
      currentView: 'home', // 'home' | 'restaurant' | 'cart' | 'checkout' | 'tracking' | 'profile' | 'admin' | 'login'
      activeRestaurantId: null,
      activeTrackingOrderId: saved?.activeTrackingOrderId || null,

      // Orders
      orders: saved?.orders || [],

      // Restaurants & Menus (Admin synced)
      restaurants: saved?.restaurants || window.EatyData?.restaurants || [],
      categories: window.EatyData?.categories || [],
      coupons: window.EatyData?.coupons || [],
    };
  }

  saveState() {
    try {
      localStorage.setItem(
        'eaty_state',
        JSON.stringify({
          location: this.data.location,
          searchRadiusKm: this.data.searchRadiusKm,
          user: this.data.user,
          partnerAuth: this.data.partnerAuth,
          cart: this.data.cart,
          activeTrackingOrderId: this.data.activeTrackingOrderId,
          orders: this.data.orders,
          restaurants: this.data.restaurants,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  getFromStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  // Subscribe to changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key).delete(callback);
  }

  emit(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => cb(value));
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb({ key, value }));
    }
    this.saveState();
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.emit(key, value);
  }

  // Location Helpers
  updateLocation(locationObj) {
    this.data.location = {
      ...this.data.location,
      ...locationObj,
    };
    this.emit('location', this.data.location);
  }

  setSearchRadius(radiusKm) {
    this.data.searchRadiusKm = Number(radiusKm);
    this.emit('searchRadiusKm', this.data.searchRadiusKm);
  }

  // Cart operations
  addToCart(restaurant, item, customizations = null) {
    const cart = this.data.cart;

    // Check if adding from a different restaurant
    if (cart.items.length > 0 && cart.restaurantId !== restaurant.id) {
      const confirmSwitch = confirm(
        `Your cart contains items from "${cart.restaurantName}". Would you like to clear your cart and add items from "${restaurant.name}" instead?`
      );
      if (!confirmSwitch) return false;
      this.clearCart();
    }

    cart.restaurantId = restaurant.id;
    cart.restaurantName = restaurant.name;
    cart.restaurantImage = restaurant.image;
    cart.restaurantLatitude = restaurant.latitude;
    cart.restaurantLongitude = restaurant.longitude;

    // Generate unique key for item + customization combo
    const customKey = customizations
      ? `${item.id}-${customizations.portion?.name || ''}-${(customizations.addOns || []).map(a => a.name).join('_')}-${customizations.spiceLevel || ''}`
      : item.id;

    const existingIndex = cart.items.findIndex(i => i.customKey === customKey);

    const basePrice = (customizations?.portion?.priceDelta ? item.price + customizations.portion.priceDelta : item.price);
    const addOnTotal = (customizations?.addOns || []).reduce((sum, a) => sum + (a.price || 0), 0);
    const unitPrice = basePrice + addOnTotal;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
      cart.items[existingIndex].itemTotal = cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice;
    } else {
      cart.items.push({
        id: item.id,
        customKey,
        name: item.name,
        price: item.price,
        unitPrice,
        isVeg: item.isVeg,
        image: item.image,
        quantity: 1,
        customizations,
        itemTotal: unitPrice,
      });
    }

    window.soundEffects.playPop();
    this.emit('cart', cart);
    return true;
  }

  updateItemQuantity(customKey, delta) {
    const cart = this.data.cart;
    const index = cart.items.findIndex(i => i.customKey === customKey);
    if (index === -1) return;

    cart.items[index].quantity += delta;
    if (cart.items[index].quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].itemTotal = cart.items[index].quantity * cart.items[index].unitPrice;
    }

    if (cart.items.length === 0) {
      this.clearCart();
    } else {
      window.soundEffects.playPop();
      this.emit('cart', cart);
    }
  }

  clearCart() {
    this.data.cart = {
      restaurantId: null,
      restaurantName: '',
      restaurantImage: '',
      restaurantLatitude: null,
      restaurantLongitude: null,
      items: [],
      appliedCoupon: null,
      tipAmount: 0,
      instructions: '',
      deliveryNote: '',
    };
    this.emit('cart', this.data.cart);
  }

  applyCoupon(couponCode) {
    const code = couponCode.toUpperCase().trim();
    const coupon = this.data.coupons.find(c => c.code === code);
    if (!coupon) {
      return { success: false, message: 'Invalid promo code. Try WELCOME100 or EATY50' };
    }

    const subtotal = this.getCartSubtotal();
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Min order amount for ${coupon.code} is ₹${coupon.minOrder}. Add ₹${coupon.minOrder - subtotal} more!`,
      };
    }

    this.data.cart.appliedCoupon = coupon;
    window.soundEffects.playSuccess();
    this.emit('cart', this.data.cart);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  }

  removeCoupon() {
    this.data.cart.appliedCoupon = null;
    this.emit('cart', this.data.cart);
  }

  setCartTip(amount) {
    this.data.cart.tipAmount = Math.max(0, Number(amount) || 0);
    this.emit('cart', this.data.cart);
  }

  getCartSubtotal() {
    return this.data.cart.items.reduce((sum, item) => sum + item.itemTotal, 0);
  }

  getCartItemCount() {
    return this.data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Calculate detailed bill breakdown
  getCartBill() {
    const subtotal = this.getCartSubtotal();
    const rest = this.data.restaurants.find(r => r.id === this.data.cart.restaurantId);

    let distanceKm = 2.0;
    if (rest && this.data.location.lat && this.data.location.lng) {
      distanceKm = window.Geo.calculateDistance(
        this.data.location.lat,
        this.data.location.lng,
        rest.latitude,
        rest.longitude
      );
    }

    let deliveryFee = window.Geo.calculateDeliveryFee(distanceKm, subtotal);
    const packagingFee = subtotal > 0 ? 25 : 0;
    const gstTax = Math.round(subtotal * 0.05); // 5% GST standard for restaurant food in India
    let discount = 0;

    const coupon = this.data.cart.appliedCoupon;
    if (coupon) {
      if (coupon.discountType === 'flat') {
        discount = Math.min(coupon.discountValue, subtotal);
      } else if (coupon.discountType === 'percent') {
        discount = Math.min(Math.round((subtotal * coupon.discountValue) / 100), coupon.maxDiscount);
      } else if (coupon.discountType === 'free_delivery') {
        discount = deliveryFee;
        deliveryFee = 0;
      }
    }

    const tip = this.data.cart.tipAmount || 0;
    const grandTotal = Math.max(0, subtotal + deliveryFee + packagingFee + gstTax + tip - discount);

    return {
      subtotal,
      distanceKm,
      deliveryFee,
      packagingFee,
      gstTax,
      discount,
      tip,
      grandTotal,
      coupon,
    };
  }

  // Orders
  createOrder(orderPayload) {
    const newOrder = {
      id: `EATY-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      ...orderPayload,
      status: 'placed', // placed -> accepted -> preparing -> out_for_delivery -> delivered
      statusHistory: [
        { status: 'placed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title: 'Order Placed', desc: 'Received by Eaty' },
      ],
      deliveryPartner: {
        name: 'Rajesh M. Kumar',
        phone: '+91 94812 04918',
        rating: 4.9,
        vehicle: 'Hero Splendor (KA-01-EA-4920)',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        badge: 'Vaccinated & Verified',
      }
    };

    this.data.orders.unshift(newOrder);
    this.data.activeTrackingOrderId = newOrder.id;
    this.clearCart();
    window.soundEffects.playOrderPlaced();
    this.emit('orders', this.data.orders);
    this.emit('activeTrackingOrderId', newOrder.id);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    const stageTitles = {
      placed: { title: 'Order Placed', desc: 'Received by Eaty' },
      accepted: { title: 'Restaurant Accepted', desc: 'Kitchen confirmed your order' },
      preparing: { title: 'Food Preparing', desc: 'Freshly cooking your food' },
      out_for_delivery: { title: 'Out for Delivery', desc: 'Rider is on the way to your door' },
      delivered: { title: 'Delivered', desc: 'Enjoy your hot meal!' },
      cancelled: { title: 'Cancelled', desc: 'Order was cancelled' },
    };

    const stage = stageTitles[newStatus] || { title: newStatus, desc: '' };
    order.statusHistory.push({
      status: newStatus,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: stage.title,
      desc: stage.desc,
    });

    this.emit('orders', this.data.orders);
    if (this.data.activeTrackingOrderId === orderId) {
      this.emit('activeOrderUpdated', order);
    }
  }

  // Authentication & Session Management
  loginCustomer({ email, name, phone }) {
    this.data.user = {
      ...this.data.user,
      isLoggedIn: true,
      email: email || this.data.user.email,
      name: name || this.data.user.name,
      phone: phone || this.data.user.phone,
    };
    this.emit('user', this.data.user);
  }

  registerCustomer({ email, name, phone }) {
    this.data.user = {
      ...this.data.user,
      isLoggedIn: true,
      email,
      name,
      phone: phone || '+91 98765 43210',
    };
    this.emit('user', this.data.user);
  }

  logoutCustomer() {
    this.data.user = {
      ...this.data.user,
      isLoggedIn: false,
    };
    this.emit('user', this.data.user);
  }

  loginPartner({ email, restaurantId, restaurantName, role }) {
    this.data.partnerAuth = {
      isLoggedIn: true,
      email: email || 'partner@meghana.in',
      restaurantId: restaurantId || 'rest-1',
      restaurantName: restaurantName || 'Meghana Foods',
      role: role || 'partner',
    };
    this.emit('partnerAuth', this.data.partnerAuth);
  }

  logoutPartner() {
    this.data.partnerAuth = {
      isLoggedIn: false,
      email: '',
      restaurantId: 'rest-1',
      restaurantName: '',
      role: 'partner',
    };
    this.emit('partnerAuth', this.data.partnerAuth);
  }

  isPartnerLoggedIn() {
    return !!(this.data.partnerAuth && this.data.partnerAuth.isLoggedIn);
  }

  isCustomerLoggedIn() {
    return !!(this.data.user && this.data.user.isLoggedIn);
  }

  // User Profile
  updateUserProfile(updatedFields) {
    this.data.user = {
      ...this.data.user,
      ...updatedFields,
    };
    this.emit('user', this.data.user);
  }

  addSavedAddress(newAddress) {
    const id = `addr-${Date.now()}`;
    const address = {
      id,
      ...newAddress,
      isDefault: this.data.user.addresses.length === 0,
    };
    this.data.user.addresses.push(address);
    this.emit('user', this.data.user);
    return address;
  }

  removeSavedAddress(id) {
    this.data.user.addresses = this.data.user.addresses.filter(a => a.id !== id);
    this.emit('user', this.data.user);
  }

  // Admin restaurant updates
  updateRestaurant(restaurantId, updatedFields) {
    const idx = this.data.restaurants.findIndex(r => r.id === restaurantId);
    if (idx > -1) {
      this.data.restaurants[idx] = {
        ...this.data.restaurants[idx],
        ...updatedFields,
      };
      this.emit('restaurants', this.data.restaurants);
    }
  }

  addRestaurant(restaurant) {
    const newRest = {
      id: `rest-${Date.now()}`,
      rating: 4.5,
      ratingCount: '100+',
      isOpen: true,
      menu: [],
      ...restaurant,
    };
    this.data.restaurants.push(newRest);
    this.emit('restaurants', this.data.restaurants);
    return newRest;
  }

  addMenuItem(restaurantId, item) {
    const rest = this.data.restaurants.find(r => r.id === restaurantId);
    if (!rest) return;
    const newItem = {
      id: `m-${Date.now()}`,
      rating: 4.5,
      ratingCount: 1,
      ...item,
    };
    rest.menu.push(newItem);
    this.emit('restaurants', this.data.restaurants);
    return newItem;
  }
}

window.eatyState = new EatyState();
