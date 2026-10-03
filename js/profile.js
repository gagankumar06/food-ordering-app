// profile.js - User authentication, profile manager, saved addresses, and past orders

const ProfileModule = {
  activeTab: 'orders', // 'orders' | 'addresses' | 'payments'

  renderProfile() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const state = window.eatyState;
    const user = state.get('user');
    const orders = state.get('orders');

    container.innerHTML = `
      <div style="margin: 24px 0 50px 0;">
        <!-- User Profile Card -->
        <div class="cart-card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 32px; border: 2px solid var(--primary);">
              ${user.avatar || '👨‍💼'}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 20px; font-weight: 800;">${user.name}</h2>
                <span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-pill);">
                  ★ EATY GOLD
                </span>
              </div>
              <div style="font-size: 13px; color: var(--text-sub); margin-top: 2px;">
                ${user.phone} • ${user.email}
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" onclick="ProfileModule.openAuthModal()">
              ${user.isLoggedIn ? 'Switch / Edit Account' : 'Login / Signup'}
            </button>
            ${
              user.isLoggedIn
                ? `<button class="btn-secondary" style="color: var(--nonveg-color);" onclick="ProfileModule.logout()">
                    Logout
                   </button>`
                : ''
            }
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs-row" style="margin-top: 20px;">
          <button
            class="admin-tab-btn ${this.activeTab === 'orders' ? 'active' : ''}"
            onclick="ProfileModule.switchTab('orders')"
          >
            📦 My Orders (${orders.length})
          </button>
          <button
            class="admin-tab-btn ${this.activeTab === 'addresses' ? 'active' : ''}"
            onclick="ProfileModule.switchTab('addresses')"
          >
            🏠 Saved Addresses (${user.addresses.length})
          </button>
          <button
            class="admin-tab-btn ${this.activeTab === 'payments' ? 'active' : ''}"
            onclick="ProfileModule.switchTab('payments')"
          >
            💳 Payment Preferences
          </button>
          <button
            class="admin-tab-btn ${this.activeTab === 'appearance' ? 'active' : ''}"
            onclick="ProfileModule.switchTab('appearance')"
          >
            🎨 Theme & Colors
          </button>
        </div>

        <!-- Tab Content -->
        <div id="profile-tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.renderProfile();
  },

  renderTabContent() {
    const state = window.eatyState;
    const user = state.get('user');
    const orders = state.get('orders');

    if (this.activeTab === 'orders') {
      if (orders.length === 0) {
        return `
          <div class="empty-state-box">
            <div class="empty-icon">🍽️</div>
            <h3>No past orders yet</h3>
            <p class="empty-desc">Your past culinary adventures will be listed here.</p>
            <button class="btn-primary" onclick="window.appRouter.navigate('home')">
              Order Your First Meal
            </button>
          </div>
        `;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${orders
            .map(
              o => `
            <div class="cart-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h3 style="font-size: 16px; font-weight: 800;">${o.restaurantName}</h3>
                  <div style="font-size: 12px; color: var(--text-sub);">
                    ORDER #${o.id} • ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div>
                  <span class="badge-status-pill ${o.status}">${o.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <!-- Item summary -->
              <div style="font-size: 13px; color: var(--text-sub); margin-bottom: 14px; line-height: 1.5;">
                ${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-light); padding-top: 12px;">
                <div style="font-size: 15px; font-weight: 800;">
                  Total: ₹${o.bill.grandTotal} (${o.paymentMethod.split(' ')[0]})
                </div>

                <div style="display: flex; gap: 10px;">
                  <button class="btn-secondary" style="font-size: 13px; padding: 6px 14px;" onclick="ProfileModule.trackOrder('${o.id}')">
                    📍 Track Order
                  </button>
                  <button class="btn-primary" style="font-size: 13px; padding: 6px 16px;" onclick="TrackingModule.reorder('${o.id}')">
                    🔄 Reorder
                  </button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    if (this.activeTab === 'addresses') {
      return `
        <div>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
            <button class="btn-primary" onclick="CheckoutModule.openAddAddressModal()">
              + Add New Address
            </button>
          </div>

          <div class="address-selection-grid">
            ${user.addresses
              .map(
                addr => `
              <div class="address-card-radio">
                <div class="address-tag-pill">
                  <span>${addr.icon || '📍'}</span>
                  <span>${addr.type}</span>
                  ${addr.isDefault ? `<span style="background: var(--veg-bg); color: var(--veg-color); padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">DEFAULT</span>` : ''}
                </div>
                <div class="address-card-flat">${addr.flat}</div>
                <div class="address-card-details">
                  ${addr.landmark ? `${addr.landmark}, ` : ''}${addr.addressLine}
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
                  ${addr.receiverName} • ${addr.phone}
                </div>
                <div style="display: flex; gap: 10px; margin-top: 12px; border-top: 1px solid var(--border-light); padding-top: 10px;">
                  <button style="font-size: 12px; font-weight: 700; color: var(--primary);" onclick="ProfileModule.useAddressForDelivery('${addr.id}')">
                    Deliver Here
                  </button>
                  <button style="font-size: 12px; font-weight: 700; color: var(--nonveg-color); margin-left: auto;" onclick="ProfileModule.deleteAddress('${addr.id}')">
                    Delete
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'payments') {
      return `
        <div class="cart-card">
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 16px;">Saved Payment Methods</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${(user.paymentMethods || [])
              .map(
                pm => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--bg-alt); border-radius: var(--radius-md);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 20px;">⚡</span>
                  <div>
                    <strong>${pm.name}</strong>
                    <div style="font-size: 12px; color: var(--text-sub);">${pm.upiId}</div>
                  </div>
                </div>
                <span class="badge-status-pill delivered">VERIFIED</span>
              </div>
            `
              )
              .join('')}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--bg-alt); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💵</span>
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <div style="font-size: 12px; color: var(--text-sub);">Enabled for your delivery pin code</div>
                </div>
              </div>
              <span class="badge-status-pill delivered">AVAILABLE</span>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'appearance') {
      const currentTheme = window.UI.currentTheme || 'indigo';
      const isDark = window.UI.isDarkMode;

      const themes = [
        { id: 'indigo', name: 'Electric Indigo & Violet', desc: 'Modern, vibrant, high-energy tech aesthetic (Primary Default)', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', primary: '#6366f1' },
        { id: 'emerald', name: 'Emerald Mint', desc: 'Fresh, organic and healthy green aesthetic', gradient: 'linear-gradient(135deg, #059669, #10b981)', primary: '#059669' },
        { id: 'ruby', name: 'Crimson Ruby', desc: 'Bold, appetizing and passionate dining red', gradient: 'linear-gradient(135deg, #e11d48, #fb7185)', primary: '#e11d48' },
        { id: 'orange', name: 'Sunset Orange', desc: 'Warm and vibrant Indian street food orange', gradient: 'linear-gradient(135deg, #ff5200, #ff782d)', primary: '#ff5200' },
        { id: 'cyan', name: 'Cyber Cyan', desc: 'Futuristic ocean cyan & electric violet delivery palette', gradient: 'linear-gradient(135deg, #0284c7, #06b6d4)', primary: '#0284c7' },
      ];

      return `
        <div style="margin-top: 20px;">
          <!-- Dark Mode Card -->
          <div class="cart-card" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-weight: 800; font-size: 16px;">App Display Mode</div>
              <div style="font-size: 13px; color: var(--text-sub);">Switch between sleek dark mode and vibrant light mode</div>
            </div>
            <button class="btn-primary" onclick="window.UI.toggleDarkMode(); ProfileModule.renderProfile();" style="padding: 8px 18px;">
              <span>${isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}</span>
            </button>
          </div>

          <!-- Color Palettes Grid -->
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px;">Select App Color Palette</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
            ${themes.map(t => `
              <div
                class="cart-card"
                style="cursor: pointer; border: 2px solid ${t.id === currentTheme ? 'var(--primary)' : 'var(--border-light)'}; background: ${t.id === currentTheme ? 'var(--primary-light)' : 'var(--bg-surface)'}; transition: all 0.2s ease; position: relative;"
                onclick="window.UI.setTheme('${t.id}'); ProfileModule.renderProfile();"
              >
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 10px;">
                  <div style="width: 40px; height: 40px; border-radius: 12px; background: ${t.gradient}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                    ${t.id === currentTheme ? '✓' : ''}
                  </div>
                  <div>
                    <div style="font-weight: 800; font-size: 15px; color: var(--text-main);">${t.name}</div>
                    <div style="font-size: 11px; font-weight: 700; color: ${t.primary}; text-transform: uppercase;">${t.primary}</div>
                  </div>
                </div>
                <p style="font-size: 12px; color: var(--text-sub); line-height: 1.4; margin: 0;">${t.desc}</p>
                ${t.id === currentTheme ? `<span style="position: absolute; top: 12px; right: 12px; background: var(--primary); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-pill);">ACTIVE</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  },

  trackOrder(orderId) {
    window.eatyState.set('activeTrackingOrderId', orderId);
    window.appRouter.navigate('tracking');
  },

  useAddressForDelivery(addrId) {
    const user = window.eatyState.get('user');
    const addr = user.addresses.find(a => a.id === addrId);
    if (!addr) return;

    window.eatyState.updateLocation({
      lat: addr.lat || 12.9352,
      lng: addr.lng || 77.6245,
      locality: addr.type,
      addressLine: `${addr.flat}, ${addr.addressLine}`,
      city: 'Bengaluru',
      isGps: false,
    });

    window.UI.toast(`Delivery location updated to ${addr.type}!`, 'success');
  },

  deleteAddress(addrId) {
    if (confirm('Delete this saved address?')) {
      window.eatyState.removeSavedAddress(addrId);
      window.UI.toast('Address removed', 'info');
      this.renderProfile();
    }
  },

  /**
   * Login / Signup Modal with Mail ID & Password (and quick phone OTP option)
   */
  openAuthModal() {
    window.LoginModule.openLoginModal('customer');
  },

  logout() {
    window.eatyState.logoutCustomer();
    window.soundEffects.playPop();
    window.UI.toast('Logged out successfully', 'info');
    this.renderProfile();
  },
};

window.ProfileModule = ProfileModule;
