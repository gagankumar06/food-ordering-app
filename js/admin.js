// admin.js - Restaurant / Partner Portal Dashboard, live order dispatcher, menu & coordinates manager

const AdminModule = {
  activeAdminTab: 'orders', // 'orders' | 'restaurant' | 'menu'
  selectedRestaurantId: 'rest-1',

  renderAdmin() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const state = window.eatyState;

    // Check if partner is logged in with Mail ID & Password
    if (!state.isPartnerLoggedIn()) {
      container.innerHTML = `
        <div class="login-page-container">
          <div class="login-card">
            <div class="login-header">
              <div class="login-brand-badge" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">👨‍🍳</div>
              <h1 class="login-title">Partner Portal Login</h1>
              <p class="login-subtitle">
                Enter your Restaurant Partner Mail ID &amp; Password to access the live kitchen dispatcher &amp; menu controls.
              </p>
            </div>

            <!-- Login Form -->
            <form class="login-form" onsubmit="AdminModule.handleInlinePartnerLogin(event)">
              <div class="login-field-group">
                <label class="login-label" for="inline-partner-email">Partner Mail ID / Email</label>
                <div class="login-input-wrap">
                  <span class="login-input-icon">✉️</span>
                  <input
                    type="email"
                    id="inline-partner-email"
                    class="login-input partner-focus"
                    placeholder="partner@meghana.in"
                    value="partner@meghana.in"
                    required
                  />
                </div>
              </div>

              <div class="login-field-group">
                <label class="login-label" for="inline-partner-rest">Select Restaurant Outlet</label>
                <div class="login-input-wrap">
                  <span class="login-input-icon">🏬</span>
                  <select id="inline-partner-rest" class="login-input partner-focus">
                    ${(state.get('restaurants') || []).map(r => `
                      <option value="${r.id}" ${r.id === this.selectedRestaurantId ? 'selected' : ''}>
                        ${r.name} (${r.isOpen ? '🟢 Open' : '🔴 Closed'})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="login-field-group">
                <label class="login-label" for="inline-partner-password">
                  <span>Partner Password</span>
                  <a class="login-forgot-link" onclick="window.LoginModule.openForgotPasswordModal('partner')">Forgot Password?</a>
                </label>
                <div class="login-input-wrap">
                  <span class="login-input-icon">🔒</span>
                  <input
                    type="password"
                    id="inline-partner-password"
                    class="login-input partner-focus"
                    placeholder="••••••••"
                    value="MeghanaPartner2026!"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle-btn"
                    title="Show/Hide Password"
                    onclick="window.LoginModule.togglePasswordVisibility('inline-partner-password', this)"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-login-submit btn-login-partner">
                <span>Sign In to Partner Portal</span>
                <span>➔</span>
              </button>
            </form>

            <!-- Quick Demo Auto-fill -->
            <div class="demo-credentials-card" style="margin-top: 20px;">
              <div class="demo-credentials-title">
                <span>⚡ 1-Click Demo Login</span>
              </div>
              <div class="demo-pills-row">
                <button class="demo-pill-btn partner" onclick="AdminModule.fillInlineDemo('partner')">
                  <span>👨‍🍳</span>
                  <span>Meghana Foods Partner</span>
                </button>
                <button class="demo-pill-btn" onclick="AdminModule.fillInlineDemo('admin')">
                  <span>👑</span>
                  <span>Eaty Master Admin</span>
                </button>
              </div>
            </div>

            <div class="login-footer-switch" style="margin-top: 18px;">
              Need to order food? <a onclick="window.appRouter.navigate('home')">Return to Customer View</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const restaurants = state.get('restaurants');
    const selectedRest = restaurants.find(r => r.id === this.selectedRestaurantId) || restaurants[0];
    const partnerAuth = state.get('partnerAuth');

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Partner Portal Header -->
        <div class="admin-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h1 class="admin-header-title">Eaty Partner Portal</h1>
              <span class="admin-partner-badge">KITCHEN DASHBOARD</span>
            </div>
            <p style="font-size: 13px; opacity: 0.85; margin-top: 4px;">
              Signed in as <strong>${partnerAuth?.email || 'Partner'}</strong> • Manage live orders, coordinates &amp; menus.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <!-- Restaurant Switcher -->
            <select
              id="admin-rest-selector"
              class="admin-select"
              style="background: #334155; color: #fff; border-color: #475569; font-weight: 700;"
              onchange="AdminModule.switchRestaurant(this.value)"
            >
              ${restaurants
                .map(
                  r => `
                <option value="${r.id}" ${r.id === selectedRest.id ? 'selected' : ''}>
                  ${r.name} (${r.isOpen ? '🟢 Open' : '🔴 Closed'})
                </option>
              `
                )
                .join('')}
            </select>

            <button class="btn-primary" style="background: #f59e0b; color: #000;" onclick="AdminModule.openAddRestaurantModal()">
              + New Restaurant
            </button>

            <button class="btn-secondary" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);" onclick="AdminModule.logoutPartner()">
              🚪 Logout
            </button>

            <button class="btn-secondary" style="background: #ffffff; color: #0f172a;" onclick="window.appRouter.navigate('home')">
              ← Customer View
            </button>
          </div>
        </div>

        <!-- Dashboard Navigation Tabs -->
        <div class="admin-tabs-row">
          <button
            class="admin-tab-btn ${this.activeAdminTab === 'orders' ? 'active' : ''}"
            onclick="AdminModule.switchTab('orders')"
          >
            🔥 Incoming Orders (${state.get('orders').length})
          </button>
          <button
            class="admin-tab-btn ${this.activeAdminTab === 'restaurant' ? 'active' : ''}"
            onclick="AdminModule.switchTab('restaurant')"
          >
            📍 Coordinates & Delivery Radius
          </button>
          <button
            class="admin-tab-btn ${this.activeAdminTab === 'menu' ? 'active' : ''}"
            onclick="AdminModule.switchTab('menu')"
          >
            📋 Menu Items (${selectedRest.menu.length})
          </button>
        </div>

        <!-- Active Tab Content -->
        <div id="admin-tab-content">
          ${this.renderTabContent(selectedRest)}
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeAdminTab = tab;
    this.renderAdmin();
  },

  switchRestaurant(restId) {
    this.selectedRestaurantId = restId;
    this.renderAdmin();
  },

  renderTabContent(rest) {
    const state = window.eatyState;
    const orders = state.get('orders');

    // Tab 1: Live Kitchen Orders Dispatcher
    if (this.activeAdminTab === 'orders') {
      const restOrders = orders.filter(o => o.restaurantId === rest.id || !o.restaurantId);

      if (restOrders.length === 0) {
        return `
          <div class="empty-state-box">
            <div class="empty-icon">🔔</div>
            <h3>No Live Orders for ${rest.name}</h3>
            <p class="empty-desc">When customers place orders from this restaurant, they appear here live with dispatch controls.</p>
            <button class="btn-primary" onclick="window.appRouter.navigate('restaurant')">
              Place a Test Order as Customer
            </button>
          </div>
        `;
      }

      return `
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title">Live Kitchen Orders for ${rest.name}</h3>
            <span style="font-size: 13px; color: var(--text-sub);">Updates reflect immediately on customer's tracking screen</span>
          </div>

          <div style="overflow-x: auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer & Address</th>
                  <th>Items Ordered</th>
                  <th>Bill Total</th>
                  <th>Current Status</th>
                  <th>Action / Dispatch</th>
                </tr>
              </thead>
              <tbody>
                ${restOrders
                  .map(
                    o => `
                  <tr>
                    <td>
                      <strong>#${o.id}</strong>
                      <div style="font-size: 11px; color: var(--text-muted);">${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <strong>${o.deliveryAddress?.receiverName || 'Customer'}</strong>
                      <div style="font-size: 12px; color: var(--text-sub);">${o.deliveryAddress?.flat}, ${o.deliveryAddress?.addressLine}</div>
                      <div style="font-size: 11px; color: var(--primary);">${o.deliveryAddress?.phone}</div>
                    </td>
                    <td>
                      <div style="font-size: 13px;">
                        ${o.items.map(i => `<div>${window.UI.getFoodTypeIcon(i.isVeg)} ${i.quantity}x ${i.name}</div>`).join('')}
                      </div>
                      ${o.instructions ? `<div style="font-size: 11px; color: var(--warning); margin-top: 4px;">Note: "${o.instructions}"</div>` : ''}
                    </td>
                    <td>
                      <strong>₹${o.bill.grandTotal}</strong>
                      <div style="font-size: 11px; color: var(--text-muted);">${o.paymentMethod.split(' ')[0]}</div>
                    </td>
                    <td>
                      <span class="badge-status-pill ${o.status}">${o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      ${this.renderOrderActionButtons(o)}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Tab 2: Coordinates & Delivery Radius
    if (this.activeAdminTab === 'restaurant') {
      return `
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title">Manage Location Coordinates & Delivery Radius</h3>
            <span style="font-size: 13px; color: var(--text-sub);">Used by Haversine formula to compute live distance</span>
          </div>

          <form onsubmit="AdminModule.saveRestaurantSettings(event, '${rest.id}')">
            <div class="admin-form-grid">
              <div class="admin-field-group">
                <label class="admin-label">Restaurant Name</label>
                <input type="text" id="admin-rest-name" class="admin-input" value="${rest.name}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Latitude (GPS Coords)</label>
                <input type="number" step="0.000001" id="admin-rest-lat" class="admin-input" value="${rest.latitude}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Longitude (GPS Coords)</label>
                <input type="number" step="0.000001" id="admin-rest-lng" class="admin-input" value="${rest.longitude}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Delivery Radius (km)</label>
                <input type="number" step="0.5" min="1" max="25" id="admin-rest-radius" class="admin-input" value="${rest.deliveryRadiusKm}" required />
                <span style="font-size: 11px; color: var(--text-muted);">Users beyond this radius cannot place orders</span>
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Minimum Order Amount (₹)</label>
                <input type="number" id="admin-rest-min-order" class="admin-input" value="${rest.minOrder || 99}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Cost For Two (₹)</label>
                <input type="number" id="admin-rest-cost-two" class="admin-input" value="${rest.costForTwo || 300}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Operating Hours</label>
                <input type="text" id="admin-rest-hours" class="admin-input" value="${rest.openingHours}" required />
              </div>

              <div class="admin-field-group">
                <label class="admin-label">Open / Closed Status</label>
                <select id="admin-rest-open-status" class="admin-select">
                  <option value="true" ${rest.isOpen ? 'selected' : ''}>🟢 Open for Orders</option>
                  <option value="false" ${!rest.isOpen ? 'selected' : ''}>🔴 Closed / Kitchen Paused</option>
                </select>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 14px;">
              <button type="submit" class="btn-primary">
                Save Restaurant Location & Settings
              </button>
            </div>
          </form>
        </div>
      `;
    }

    // Tab 3: Menu Items & Prices
    if (this.activeAdminTab === 'menu') {
      return `
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3 class="admin-card-title">${rest.name} Menu Items</h3>
              <div style="font-size: 12px; color: var(--text-sub);">Toggle availability or update prices</div>
            </div>
            <button class="btn-primary" onclick="AdminModule.openAddDishModal('${rest.id}')">
              + Add New Dish
            </button>
          </div>

          <div style="overflow-x: auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rest.menu
                  .map(
                    item => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover;" />
                        <div>
                          <strong>${item.name}</strong>
                          <div style="font-size: 11px; color: var(--text-sub);">${item.description.slice(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="filter-chip" style="font-size: 11px; padding: 2px 8px;">${item.category}</span></td>
                    <td>${window.UI.getFoodTypeIcon(item.isVeg)} ${item.isVeg ? 'Veg' : 'Non-Veg'}</td>
                    <td>
                      <input
                        type="number"
                        class="admin-input"
                        style="width: 85px; padding: 4px 8px; font-weight: 800;"
                        value="${item.price}"
                        onchange="AdminModule.updateDishPrice('${rest.id}', '${item.id}', this.value)"
                      />
                    </td>
                    <td>
                      <span class="badge-status-pill delivered">IN STOCK</span>
                    </td>
                    <td>
                      <button style="color: var(--primary); font-size: 12px; font-weight: 700;" onclick="UI.toast('Price updated!', 'success')">
                        Save
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return '';
  },

  renderOrderActionButtons(order) {
    if (order.status === 'placed') {
      return `
        <button class="btn-primary" style="font-size: 11px; padding: 6px 12px;" onclick="AdminModule.updateOrderStatus('${order.id}', 'accepted')">
          Accept Order ➔
        </button>
      `;
    }
    if (order.status === 'accepted') {
      return `
        <button class="btn-primary" style="font-size: 11px; padding: 6px 12px; background: #ea580c;" onclick="AdminModule.updateOrderStatus('${order.id}', 'preparing')">
          Start Cooking ➔
        </button>
      `;
    }
    if (order.status === 'preparing') {
      return `
        <button class="btn-primary" style="font-size: 11px; padding: 6px 12px; background: #4f46e5;" onclick="AdminModule.updateOrderStatus('${order.id}', 'out_for_delivery')">
          Dispatch Rider ➔
        </button>
      `;
    }
    if (order.status === 'out_for_delivery') {
      return `
        <button class="btn-primary" style="font-size: 11px; padding: 6px 12px; background: var(--veg-color);" onclick="AdminModule.updateOrderStatus('${order.id}', 'delivered')">
          Mark Delivered ➔
        </button>
      `;
    }
    return `<span style="font-size: 12px; color: var(--text-muted);">Completed</span>`;
  },

  updateOrderStatus(orderId, newStatus) {
    window.eatyState.updateOrderStatus(orderId, newStatus);
    window.soundEffects.playPop();
    window.UI.toast(`Order #${orderId} marked as ${newStatus.replace(/_/g, ' ')}!`, 'success');
    this.renderAdmin();
  },

  saveRestaurantSettings(event, restId) {
    event.preventDefault();
    const name = document.getElementById('admin-rest-name').value.trim();
    const lat = parseFloat(document.getElementById('admin-rest-lat').value);
    const lng = parseFloat(document.getElementById('admin-rest-lng').value);
    const radius = parseFloat(document.getElementById('admin-rest-radius').value);
    const minOrder = parseInt(document.getElementById('admin-rest-min-order').value);
    const costForTwo = parseInt(document.getElementById('admin-rest-cost-two').value);
    const hours = document.getElementById('admin-rest-hours').value.trim();
    const isOpen = document.getElementById('admin-rest-open-status').value === 'true';

    window.eatyState.updateRestaurant(restId, {
      name,
      latitude: lat,
      longitude: lng,
      deliveryRadiusKm: radius,
      minOrder,
      costForTwo,
      openingHours: hours,
      isOpen,
    });

    window.soundEffects.playSuccess();
    window.UI.toast('Restaurant details & coordinates saved! Distances updated.', 'success');
    this.renderAdmin();
  },

  updateDishPrice(restId, dishId, newPrice) {
    const rest = window.eatyState.get('restaurants').find(r => r.id === restId);
    if (!rest) return;
    const item = rest.menu.find(m => m.id === dishId);
    if (item) {
      item.price = Number(newPrice) || item.price;
      window.eatyState.emit('restaurants', window.eatyState.get('restaurants'));
    }
  },

  openAddDishModal(restId) {
    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="admin-field-group">
          <label class="admin-label">Dish Name</label>
          <input type="text" id="new-dish-name" class="admin-input" placeholder="e.g. Tandoori Chicken Tikka" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="admin-field-group">
            <label class="admin-label">Category</label>
            <input type="text" id="new-dish-cat" class="admin-input" placeholder="e.g. Starters / Biryani" required />
          </div>

          <div class="admin-field-group">
            <label class="admin-label">Price (₹)</label>
            <input type="number" id="new-dish-price" class="admin-input" placeholder="250" required />
          </div>
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Food Type</label>
          <select id="new-dish-veg" class="admin-select">
            <option value="true">Pure Vegetarian 🟢</option>
            <option value="false">Non-Vegetarian 🔴</option>
          </select>
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Description</label>
          <textarea id="new-dish-desc" class="admin-input" placeholder="Ingredients, flavor notes..."></textarea>
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Image URL</label>
          <input type="url" id="new-dish-img" class="admin-input" value="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80" />
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn-primary" onclick="AdminModule.saveNewDish('${restId}')">Add Dish to Menu</button>
    `;

    window.UI.openModal('Add New Dish', modalHtml, footerHtml);
  },

  saveNewDish(restId) {
    const name = document.getElementById('new-dish-name')?.value.trim();
    const cat = document.getElementById('new-dish-cat')?.value.trim();
    const price = parseInt(document.getElementById('new-dish-price')?.value);
    const isVeg = document.getElementById('new-dish-veg')?.value === 'true';
    const desc = document.getElementById('new-dish-desc')?.value.trim();
    const img = document.getElementById('new-dish-img')?.value.trim();

    if (!name || isNaN(price)) {
      window.UI.toast('Please provide valid name and price', 'warning');
      return;
    }

    window.eatyState.addMenuItem(restId, {
      name,
      category: cat || 'Specials',
      price,
      isVeg,
      description: desc || 'Freshly prepared delicious item.',
      image: img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      customizable: false,
    });

    window.UI.closeModal();
    window.soundEffects.playSuccess();
    window.UI.toast(`Added "${name}" to menu!`, 'success');
    this.renderAdmin();
  },

  openAddRestaurantModal() {
    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="admin-field-group">
          <label class="admin-label">Restaurant Name</label>
          <input type="text" id="new-rest-name" class="admin-input" placeholder="e.g. Nagarjuna Andhra Meals" required />
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Cuisines (Comma separated)</label>
          <input type="text" id="new-rest-cuisines" class="admin-input" placeholder="Biryani, Andhra, South Indian" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="admin-field-group">
            <label class="admin-label">Latitude</label>
            <input type="number" step="0.0001" id="new-rest-lat" class="admin-input" value="12.9719" required />
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Longitude</label>
            <input type="number" step="0.0001" id="new-rest-lng" class="admin-input" value="77.6070" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="admin-field-group">
            <label class="admin-label">Delivery Radius (km)</label>
            <input type="number" id="new-rest-radius" class="admin-input" value="8" required />
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Cost For Two (₹)</label>
            <input type="number" id="new-rest-cost" class="admin-input" value="450" required />
          </div>
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Cover Image URL</label>
          <input type="url" id="new-rest-img" class="admin-input" value="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80" />
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn-primary" onclick="AdminModule.saveNewRestaurant()">Create Restaurant</button>
    `;

    window.UI.openModal('Register New Restaurant', modalHtml, footerHtml);
  },

  saveNewRestaurant() {
    const name = document.getElementById('new-rest-name')?.value.trim();
    const cuisines = document.getElementById('new-rest-cuisines')?.value.split(',').map(c => c.trim()) || ['Indian'];
    const lat = parseFloat(document.getElementById('new-rest-lat')?.value) || 12.9716;
    const lng = parseFloat(document.getElementById('new-rest-lng')?.value) || 77.5946;
    const radius = parseFloat(document.getElementById('new-rest-radius')?.value) || 7.0;
    const cost = parseInt(document.getElementById('new-rest-cost')?.value) || 400;
    const img = document.getElementById('new-rest-img')?.value.trim();

    if (!name) {
      window.UI.toast('Please provide a restaurant name', 'warning');
      return;
    }

    const newRest = window.eatyState.addRestaurant({
      name,
      cuisines,
      latitude: lat,
      longitude: lng,
      deliveryRadiusKm: radius,
      costForTwo: cost,
      minOrder: 149,
      openingHours: '11:00 AM - 11:00 PM',
      image: img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      badge: 'NEW ON EATY',
      menu: [
        {
          id: `m-${Date.now()}-1`,
          name: `${name} Signature Platter`,
          category: 'Specials',
          price: 299,
          isVeg: false,
          description: 'Chef signature combination plate served with aromatic rice and accompaniments.',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
          customizable: false,
        }
      ]
    });

    this.selectedRestaurantId = newRest.id;
    window.UI.closeModal();
    window.soundEffects.playSuccess();
    window.UI.toast(`Restaurant "${name}" registered successfully!`, 'success');
    this.renderAdmin();
  },

  handleInlinePartnerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('inline-partner-email')?.value.trim();
    const password = document.getElementById('inline-partner-password')?.value;
    const restId = document.getElementById('inline-partner-rest')?.value || 'rest-1';

    if (!email || !email.includes('@')) {
      window.UI.toast('Please enter a valid partner Mail ID', 'warning');
      return;
    }

    if (!password || password.length < 4) {
      window.UI.toast('Please enter your partner password', 'warning');
      return;
    }

    const restaurants = window.eatyState.get('restaurants') || [];
    const matched = restaurants.find(r => r.id === restId) || restaurants[0];

    window.eatyState.loginPartner({
      email,
      restaurantId: matched.id,
      restaurantName: matched.name,
      role: email.includes('admin') ? 'admin' : 'partner',
    });

    this.selectedRestaurantId = matched.id;
    window.soundEffects.playSuccess();
    window.UI.toast(`Signed in as ${matched.name} Partner!`, 'success');
    this.renderAdmin();
  },

  fillInlineDemo(role) {
    const emailInput = document.getElementById('inline-partner-email');
    const passInput = document.getElementById('inline-partner-password');
    if (!emailInput || !passInput) return;

    if (role === 'partner') {
      emailInput.value = 'partner@meghana.in';
      passInput.value = 'MeghanaPartner2026!';
      window.UI.toast('Filled Meghana Foods Partner credentials', 'info');
    } else {
      emailInput.value = 'admin@eaty.in';
      passInput.value = 'EatyAdmin2026!';
      window.UI.toast('Filled Master Admin credentials', 'info');
    }
    window.soundEffects.playPop();
  },

  logoutPartner() {
    window.eatyState.logoutPartner();
    window.soundEffects.playPop();
    window.UI.toast('Partner logged out successfully', 'info');
    this.renderAdmin();
  },
};

window.AdminModule = AdminModule;
