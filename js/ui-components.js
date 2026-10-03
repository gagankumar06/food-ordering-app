// ui-components.js - Reusable UI helpers: toasts, modals, location picker, sticky cart

const UI = {
  /**
   * Display toast notification
   */
  toast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = {
      success: '✅',
      error: '❌',
      info: '🔔',
      warning: '⚠️',
    };

    toast.innerHTML = `
      <span>${iconMap[type] || '🔔'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Open a responsive modal with custom HTML
   */
  openModal(title, contentHtml, footerHtml = '') {
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.id = 'active-modal-overlay';
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close-btn" onclick="UI.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    overlay.onclick = () => this.closeModal();
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const existing = document.getElementById('active-modal-overlay');
    if (existing) {
      existing.remove();
      document.body.style.overflow = '';
    }
  },

  /**
   * Location Selection Modal (GPS, Indian City Presets, Custom Input)
   */
  openLocationModal() {
    const state = window.eatyState;
    const currentLocation = state.get('location');
    const presets = window.EatyData.presetLocations;

    const html = `
      <div class="location-modal-body">
        <!-- Detect GPS Button -->
        <div class="gps-detect-card" onclick="UI.detectCurrentGpsLocation()">
          <div class="gps-icon-bubble">📍</div>
          <div>
            <div class="gps-title">Use Current Device Location</div>
            <div class="gps-subtitle">Detect GPS latitude & longitude via browser</div>
          </div>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: var(--text-sub); text-transform: uppercase; margin-top: 8px;">
          Or Select a Popular Food Hub:
        </div>

        <!-- Presets List -->
        <div class="preset-locations-list">
          ${presets
            .map(
              p => `
            <div class="preset-location-item ${
              p.lat === currentLocation.lat && p.lng === currentLocation.lng ? 'selected' : ''
            }" onclick="UI.selectPresetLocation('${p.name}')">
              <div class="location-item-icon">📌</div>
              <div>
                <div class="location-item-name">${p.name} (${p.city})</div>
                <div class="location-item-desc">${p.address}</div>
                <div style="font-size: 11px; color: var(--primary); font-weight: 700; margin-top: 2px;">
                  Coords: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Custom Manual Address Input -->
        <div style="margin-top: 10px; border-top: 1px solid var(--border-light); padding-top: 14px;">
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Enter Delivery Address Manually:</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <input type="text" id="manual-address-input" class="admin-input" placeholder="e.g. Flat 301, Brigade Metropolis, Whitefield" />
            <div style="display: flex; gap: 8px;">
              <input type="number" step="0.0001" id="manual-lat-input" class="admin-input" placeholder="Latitude (e.g. 12.9716)" style="flex:1" />
              <input type="number" step="0.0001" id="manual-lng-input" class="admin-input" placeholder="Longitude (e.g. 77.5946)" style="flex:1" />
            </div>
            <button class="btn-primary" style="justify-content: center; margin-top: 4px;" onclick="UI.submitManualLocation()">
              Set Custom Address & Recalculate
            </button>
          </div>
        </div>
      </div>
    `;

    this.openModal('Select Delivery Location', html);
  },

  async detectCurrentGpsLocation() {
    this.toast('Requesting device GPS coordinates...', 'info');
    try {
      const pos = await window.Geo.getCurrentLocation();
      const area = window.Geo.getClosestKnownArea(pos.lat, pos.lng);

      window.eatyState.updateLocation({
        lat: pos.lat,
        lng: pos.lng,
        locality: area.locality,
        addressLine: area.addressLine,
        city: area.city,
        isGps: true,
      });

      this.closeModal();
      window.soundEffects.playSuccess();
      this.toast(`Location updated! Accuracy: ±${Math.round(pos.accuracy)}m`, 'success');
    } catch (err) {
      window.soundEffects.playError();
      this.toast(err.message, 'error', 4500);
    }
  },

  selectPresetLocation(name) {
    const preset = window.EatyData.presetLocations.find(p => p.name === name);
    if (!preset) return;

    window.eatyState.updateLocation({
      lat: preset.lat,
      lng: preset.lng,
      locality: preset.name,
      addressLine: preset.address,
      city: preset.city,
      isGps: false,
    });

    this.closeModal();
    window.soundEffects.playPop();
    this.toast(`Delivering to ${preset.name}! Distances recalculated.`, 'success');
  },

  submitManualLocation() {
    const address = document.getElementById('manual-address-input')?.value.trim();
    let lat = parseFloat(document.getElementById('manual-lat-input')?.value);
    let lng = parseFloat(document.getElementById('manual-lng-input')?.value);

    if (!address) {
      this.toast('Please enter an address line', 'warning');
      return;
    }

    // Default to central Bengaluru coordinates if user leaves lat/lng empty
    if (isNaN(lat) || isNaN(lng)) {
      lat = 12.9716;
      lng = 77.5946;
    }

    const area = window.Geo.getClosestKnownArea(lat, lng);

    window.eatyState.updateLocation({
      lat,
      lng,
      locality: address.split(',')[0],
      addressLine: address,
      city: area.city,
      isGps: false,
    });

    this.closeModal();
    window.soundEffects.playSuccess();
    this.toast('Delivery address updated! Nearest restaurants recalculated.', 'success');
  },

  /**
   * Render Sticky Bottom Cart Bar
   */
  updateStickyCart() {
    let bar = document.getElementById('sticky-cart-bar');
    const state = window.eatyState;
    const cart = state.get('cart');
    const itemCount = state.getCartItemCount();
    const currentView = state.get('currentView');

    // Only show if items present and not currently on cart or checkout
    if (itemCount > 0 && currentView !== 'cart' && currentView !== 'checkout') {
      const bill = state.getCartBill();

      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'sticky-cart-bar';
        bar.className = 'sticky-cart-bar';
        bar.onclick = () => window.appRouter.navigate('cart');
        document.body.appendChild(bar);
      }

      bar.innerHTML = `
        <div class="sticky-cart-left">
          <div class="sticky-cart-count">${itemCount} ${itemCount === 1 ? 'ITEM' : 'ITEMS'} ADDED</div>
          <div class="sticky-cart-rest">From ${cart.restaurantName}</div>
        </div>
        <div class="sticky-cart-right">
          <span>₹${bill.grandTotal}</span>
          <span style="font-size: 13px; font-weight: 700; margin-left: 6px;">VIEW CART →</span>
        </div>
      `;
      bar.style.display = 'flex';
    } else if (bar) {
      bar.style.display = 'none';
    }

    // Also update header cart badge
    const headerBadges = document.querySelectorAll('.cart-counter-badge, .bottom-cart-badge');
    headerBadges.forEach(b => {
      b.textContent = itemCount;
      b.style.display = itemCount > 0 ? 'inline-flex' : 'none';
    });
  },

  /**
   * Helper for FSSAI Veg / Non-Veg Icon
   */
  getFoodTypeIcon(isVeg) {
    return `
      <span class="food-type-icon ${isVeg ? 'veg' : 'non-veg'}" title="${isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}">
        <span class="type-dot"></span>
      </span>
    `;
  },

  /**
   * Theme Manager (Electric Indigo default + Multi-Palette & Dark Mode)
   */
  currentTheme: 'indigo',
  isDarkMode: false,

  initTheme() {
    const savedTheme = localStorage.getItem('eaty_color_theme') || 'indigo';
    const savedDarkMode = localStorage.getItem('eaty_dark_mode') === 'true';

    this.setTheme(savedTheme, false);
    this.setDarkMode(savedDarkMode, false);

    // Global listener to close popover when clicked outside
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('theme-menu-popover');
      const wrap = document.getElementById('theme-dropdown-wrap');
      if (popover && wrap && !wrap.contains(e.target)) {
        popover.style.display = 'none';
      }
    });
  },

  toggleThemeDropdown(e) {
    if (e) e.stopPropagation();
    const popover = document.getElementById('theme-menu-popover');
    if (!popover) return;
    const isVisible = popover.style.display === 'block';
    popover.style.display = isVisible ? 'none' : 'block';
  },

  setTheme(themeName, showToast = true) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-color-theme', themeName);
    document.body.setAttribute('data-color-theme', themeName);
    localStorage.setItem('eaty_color_theme', themeName);

    // Update active state in theme popover
    document.querySelectorAll('.theme-palette-item').forEach(item => {
      const c = item.getAttribute('data-color');
      item.classList.toggle('active', c === themeName);
    });

    const themeTitles = {
      indigo: '⚡ Electric Indigo & Violet',
      emerald: '🌿 Emerald Mint',
      ruby: '🍓 Crimson Ruby',
      orange: '🍊 Sunset Orange',
      cyan: '🌌 Cyber Cyan',
    };

    if (showToast) {
      this.toast(`Theme updated to ${themeTitles[themeName] || themeName}!`, 'success', 2200);
      const popover = document.getElementById('theme-menu-popover');
      if (popover) popover.style.display = 'none';
    }
  },

  toggleDarkMode(e) {
    if (e) e.stopPropagation();
    this.setDarkMode(!this.isDarkMode, true);
  },

  setDarkMode(isDark, showToast = true) {
    this.isDarkMode = isDark;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('eaty_dark_mode', isDark);

    const darkIcon = document.getElementById('dark-mode-icon');
    const darkLabel = document.getElementById('dark-mode-label');
    if (darkIcon) darkIcon.textContent = isDark ? '☀️' : '🌙';
    if (darkLabel) darkLabel.textContent = isDark ? 'Light' : 'Dark';

    if (showToast) {
      this.toast(`${isDark ? 'Dark Mode' : 'Light Mode'} enabled!`, 'info', 2000);
    }
  },
};

window.UI = UI;
