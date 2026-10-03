// app.js - Customer-facing App Engine: Home, Search, Haversine Distance Sorting, and Restaurant Details

const App = {
  init() {
    this.bindEvents();
    this.renderHeader();
    this.renderCurrentView();

    // Listen to reactive state changes
    window.eatyState.subscribe('location', () => {
      this.renderHeader();
      if (window.eatyState.get('currentView') === 'home') {
        this.renderHome();
      } else if (window.eatyState.get('currentView') === 'restaurant') {
        this.renderRestaurantDetail(window.eatyState.get('activeRestaurantId'));
      }
      window.UI.updateStickyCart();
    });

    window.eatyState.subscribe('searchRadiusKm', () => {
      if (window.eatyState.get('currentView') === 'home') {
        this.renderHome();
      }
    });

    window.eatyState.subscribe('cart', () => {
      window.UI.updateStickyCart();
      if (window.eatyState.get('currentView') === 'restaurant') {
        this.renderRestaurantMenuOnly(window.eatyState.get('activeRestaurantId'));
      }
    });

    window.eatyState.subscribe('user', () => {
      this.renderHeader();
      if (window.eatyState.get('currentView') === 'profile') {
        window.ProfileModule.renderProfile();
      }
    });

    window.eatyState.subscribe('partnerAuth', () => {
      this.renderHeader();
      if (window.eatyState.get('currentView') === 'admin') {
        window.AdminModule.renderAdmin();
      }
    });
  },

  bindEvents() {
    // Top location bar click
    const locBtn = document.getElementById('deliver-to-selector');
    if (locBtn) {
      locBtn.onclick = () => window.UI.openLocationModal();
    }
  },

  renderHeader() {
    const loc = window.eatyState.get('location');
    const labelEl = document.getElementById('header-location-label');
    const addressEl = document.getElementById('header-location-address');

    if (labelEl) {
      labelEl.innerHTML = `DELIVERING TO ${loc.isGps ? '📍 (GPS)' : ''}`;
    }
    if (addressEl) {
      addressEl.textContent = loc.addressLine || `${loc.locality}, ${loc.city}`;
    }

    const user = window.eatyState.get('user');
    const loginBtnText = document.getElementById('header-login-btn-text');
    if (loginBtnText) {
      if (user && user.isLoggedIn) {
        loginBtnText.textContent = user.name ? user.name.split(' ')[0] : 'Account';
      } else {
        loginBtnText.textContent = 'Sign In';
      }
    }
  },

  renderCurrentView() {
    const view = window.eatyState.get('currentView');

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const targetView = item.getAttribute('data-view');
      item.classList.toggle('active', targetView === view);
    });

    switch (view) {
      case 'home':
        this.renderHome();
        break;
      case 'restaurant':
        this.renderRestaurantDetail(window.eatyState.get('activeRestaurantId'));
        break;
      case 'cart':
        window.CartModule.renderCart();
        break;
      case 'checkout':
        window.CheckoutModule.renderCheckout();
        break;
      case 'tracking':
        window.TrackingModule.renderTracking();
        break;
      case 'profile':
        window.ProfileModule.renderProfile();
        break;
      case 'admin':
        window.AdminModule.renderAdmin();
        break;
      case 'login':
        window.LoginModule.renderLoginView();
        break;
      default:
        this.renderHome();
    }

    window.UI.updateStickyCart();
  },

  /**
   * Render Home Page View
   */
  renderHome() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const userLoc = window.eatyState.get('location');
    const searchRadius = window.eatyState.get('searchRadiusKm');
    const searchQuery = window.eatyState.get('searchQuery') || '';
    const activeCat = window.eatyState.get('activeCategory') || 'all';
    const pureVeg = window.eatyState.get('pureVegOnly') || false;
    const fastDelivery = window.eatyState.get('fastDeliveryOnly') || false;
    const ratingFilter = window.eatyState.get('ratingFilter') || 0;

    // Process all restaurants: calculate real distance using Haversine
    const allRestaurants = window.eatyState.get('restaurants');
    const restaurantsWithDist = allRestaurants.map(rest => {
      const distanceKm = window.Geo.calculateDistance(
        userLoc.lat,
        userLoc.lng,
        rest.latitude,
        rest.longitude
      );
      const isDeliverable = window.Geo.isWithinDeliveryRadius(userLoc.lat, userLoc.lng, rest);
      const deliveryTime = window.Geo.calculateDeliveryTime(distanceKm);
      const deliveryFee = window.Geo.calculateDeliveryFee(distanceKm);

      return {
        ...rest,
        distanceKm,
        isDeliverable,
        deliveryTime,
        deliveryFee,
      };
    });

    // Sort by distance (Nearest to Farthest)
    restaurantsWithDist.sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter by search radius
    let nearbyList = restaurantsWithDist.filter(r => r.distanceKm <= searchRadius);

    // Apply additional category / search / veg filters
    if (activeCat !== 'all') {
      nearbyList = nearbyList.filter(
        r =>
          r.cuisines.some(c => c.toLowerCase().includes(activeCat.toLowerCase())) ||
          r.menu.some(m => m.category.toLowerCase().includes(activeCat.toLowerCase()))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nearbyList = nearbyList.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.cuisines.some(c => c.toLowerCase().includes(q)) ||
          r.menu.some(m => m.name.toLowerCase().includes(q))
      );
    }

    if (pureVeg) {
      nearbyList = nearbyList.filter(r => r.isPureVeg);
    }

    if (ratingFilter > 0) {
      nearbyList = nearbyList.filter(r => r.rating >= ratingFilter);
    }

    if (fastDelivery) {
      nearbyList = nearbyList.filter(r => r.distanceKm <= 3.5);
    }

    container.innerHTML = `
      <!-- Search & Discovery Bar -->
      <div class="search-container">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="home-search-input"
            class="search-input"
            placeholder="Search for restaurants, biryani, pizza, dosas, desserts..."
            value="${searchQuery}"
          />
          ${
            searchQuery
              ? `<span class="search-clear-btn" style="display:block;" onclick="App.clearSearch()">✖</span>`
              : ''
          }
        </div>
      </div>

      <!-- Configurable Search Radius & Quick Filters -->
      <div class="filters-bar">
        <!-- Search Radius Selector -->
        <div class="radius-filter-group" title="Filter restaurants by distance from your delivery location">
          <span class="radius-filter-label">📍 RADIUS:</span>
          ${[2, 5, 10, 15]
            .map(
              r => `
            <button
              class="radius-pill ${searchRadius === r ? 'active' : ''}"
              onclick="App.setSearchRadius(${r})"
            >
              ${r} km
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Veg Only Filter -->
        <button
          class="filter-chip veg-chip ${pureVeg ? 'active' : ''}"
          onclick="App.toggleVegFilter()"
        >
          ${window.UI.getFoodTypeIcon(true)} Pure Veg
        </button>

        <!-- Fast Delivery -->
        <button
          class="filter-chip ${fastDelivery ? 'active' : ''}"
          onclick="App.toggleFastDelivery()"
        >
          ⚡ Fast Delivery (&lt;30m)
        </button>

        <!-- Rating 4.0+ -->
        <button
          class="filter-chip ${ratingFilter >= 4.0 ? 'active' : ''}"
          onclick="App.toggleRatingFilter()"
        >
          ⭐ 4.0+ Rated
        </button>
      </div>

      <!-- Promotional Banner Strip -->
      <div class="promos-banner-row">
        <div class="promo-banner accent-orange">
          <div class="promo-content">
            <span class="promo-badge">FIRST ORDER SPECIAL</span>
            <h3 class="promo-heading">Flat 50% OFF</h3>
            <p class="promo-sub">Use coupon on orders above ₹199</p>
            <div class="promo-code-pill" onclick="App.copyCoupon('EATY50')">
              <span>CODE: <strong>EATY50</strong></span>
              <span>📋</span>
            </div>
          </div>
          <div class="promo-icon-art">🍗</div>
        </div>

        <div class="promo-banner accent-teal">
          <div class="promo-content">
            <span class="promo-badge">ZERO DELIVERY CHARGES</span>
            <h3 class="promo-heading">Free Delivery</h3>
            <p class="promo-sub">Enjoy free doorstep delivery on ₹149+</p>
            <div class="promo-code-pill" onclick="App.copyCoupon('FREEDEL')">
              <span>CODE: <strong>FREEDEL</strong></span>
              <span>📋</span>
            </div>
          </div>
          <div class="promo-icon-art">🛵</div>
        </div>
      </div>

      <!-- Food Categories -->
      <div class="categories-section">
        <div class="section-title-wrap">
          <div>
            <h2 class="section-title">What's on your mind?</h2>
            <div class="section-subtitle">Explore popular cravings in your city</div>
          </div>
        </div>
        <div class="categories-track">
          ${window.EatyData.categories
            .map(
              cat => `
            <div
              class="category-card ${activeCat === cat.id ? 'active' : ''}"
              onclick="App.selectCategory('${cat.id}')"
            >
              <div class="category-img-wrap">
                <img src="${cat.image}" alt="${cat.name}" class="category-img" loading="lazy" />
              </div>
              <span class="category-name">${cat.name}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Section: Restaurants Near You -->
      <div style="margin-top: 24px;">
        <div class="section-title-wrap">
          <div>
            <h2 class="section-title">
              Restaurants Near You
              <span style="font-size: 14px; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 2px 10px; border-radius: var(--radius-pill);">
                ${nearbyList.length} Found
              </span>
            </h2>
            <div class="section-subtitle">
              Calculated using Haversine formula from <strong>${userLoc.locality}</strong> (Within ${searchRadius} km)
            </div>
          </div>
        </div>

        <!-- Restaurants Grid or Empty State -->
        ${
          nearbyList.length > 0
            ? `
          <div class="restaurants-grid">
            ${nearbyList.map(rest => this.renderRestaurantCard(rest)).join('')}
          </div>
        `
            : `
          <div class="empty-state-box">
            <div class="empty-icon">📍</div>
            <h3 class="empty-title">No restaurants found within ${searchRadius} km</h3>
            <p class="empty-desc">
              We couldn't find any partner restaurants delivering to your coordinates within a ${searchRadius} km radius.
              Try widening your search radius or switch to another delivery hub!
            </p>
            <div class="empty-actions">
              <button class="btn-primary" onclick="App.setSearchRadius(10)">
                Expand Radius to 10 km
              </button>
              <button class="btn-primary" onclick="App.setSearchRadius(15)">
                Expand Radius to 15 km
              </button>
              <button class="btn-secondary" onclick="UI.openLocationModal()">
                Change Delivery Location
              </button>
            </div>
          </div>
        `
        }
      </div>
    `;

    // Bind real-time search input
    const searchInput = document.getElementById('home-search-input');
    if (searchInput) {
      searchInput.oninput = e => {
        window.eatyState.set('searchQuery', e.target.value);
        this.renderHome();
      };
    }
  },

  /**
   * Render single restaurant card in grid
   */
  renderRestaurantCard(rest) {
    const isOut = !rest.isDeliverable;

    return `
      <div class="restaurant-card" onclick="App.openRestaurant('${rest.id}')">
        <div class="restaurant-img-box">
          <img src="${rest.image}" alt="${rest.name}" class="restaurant-img" loading="lazy" />
          <div class="restaurant-img-gradient"></div>

          ${
            !rest.isOpen
              ? `<div class="restaurant-closed-overlay">
                  <span class="closed-badge">CLOSED</span>
                  <span style="font-size: 11px;">${rest.openingHours}</span>
                </div>`
              : ''
          }

          ${
            isOut
              ? `<div class="out-of-reach-badge">
                  <span>🚫 Outside Delivery Area (${rest.deliveryRadiusKm} km max)</span>
                </div>`
              : ''
          }

          ${
            rest.badge && rest.isOpen && !isOut
              ? `<div class="restaurant-badge-offer">
                  <span>🏷️ ${rest.badge}</span>
                </div>`
              : ''
          }
        </div>

        <div class="restaurant-body">
          <div class="rest-title-row">
            <h3 class="restaurant-name">${rest.name}</h3>
            <span class="rating-badge">
              <span>⭐</span>
              <span>${rest.rating}</span>
            </span>
          </div>

          <div class="rest-cuisines">
            ${rest.cuisines.join(', ')} • ₹${rest.costForTwo} for two
          </div>

          <div class="rest-meta-row">
            <div class="meta-item highlight-distance" title="Distance from your delivery location">
              <span>📍</span>
              <span>${rest.distanceKm} km</span>
            </div>
            <div class="meta-item" title="Estimated time to deliver">
              <span>⏱️</span>
              <span>${rest.deliveryTime}</span>
            </div>
            <div class="meta-item" title="Delivery charge">
              <span>🛵</span>
              <span>${rest.deliveryFee === 0 ? 'FREE' : `₹${rest.deliveryFee}`}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Open Restaurant Details & Menu Page
   */
  openRestaurant(restaurantId) {
    window.eatyState.set('activeRestaurantId', restaurantId);
    window.appRouter.navigate('restaurant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Render Restaurant Detail Page
   */
  renderRestaurantDetail(restaurantId) {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const rest = window.eatyState.get('restaurants').find(r => r.id === restaurantId);
    if (!rest) {
      container.innerHTML = `<div class="empty-state-box"><h3>Restaurant not found</h3></div>`;
      return;
    }

    const userLoc = window.eatyState.get('location');
    const distanceKm = window.Geo.calculateDistance(
      userLoc.lat,
      userLoc.lng,
      rest.latitude,
      rest.longitude
    );
    const isDeliverable = window.Geo.isWithinDeliveryRadius(userLoc.lat, userLoc.lng, rest);
    const deliveryTime = window.Geo.calculateDeliveryTime(distanceKm);
    const deliveryFee = window.Geo.calculateDeliveryFee(distanceKm);

    // Extract unique categories from menu
    const menuCategories = Array.from(new Set(rest.menu.map(m => m.category)));

    container.innerHTML = `
      <!-- Restaurant Details Hero -->
      <div class="restaurant-hero">
        <div class="rest-hero-banner">
          <img src="${rest.coverImage || rest.image}" alt="${rest.name}" class="rest-hero-img" />
          <div class="rest-hero-gradient"></div>

          <button class="back-to-home-btn" onclick="window.appRouter.navigate('home')">
            <span>← Back to Restaurants</span>
          </button>

          <div class="rest-hero-floating-details">
            <h1 class="rest-hero-name">${rest.name}</h1>
            <div class="rest-hero-cuisines">${rest.cuisines.join(' • ')} • ₹${rest.costForTwo} for two</div>
          </div>
        </div>

        <div class="rest-hero-meta-bar">
          <div class="rest-metrics-group">
            <div class="rest-metric">
              <span class="rest-metric-label">Rating</span>
              <span class="rest-metric-value" style="color: var(--rating-green);">
                ⭐ ${rest.rating} (${rest.ratingCount})
              </span>
            </div>

            <div class="rest-metric">
              <span class="rest-metric-label">Distance</span>
              <span class="rest-metric-value highlight-dist">
                📍 ${distanceKm} km away
              </span>
            </div>

            <div class="rest-metric">
              <span class="rest-metric-label">Delivery Time</span>
              <span class="rest-metric-value">
                ⏱️ ${deliveryTime}
              </span>
            </div>

            <div class="rest-metric">
              <span class="rest-metric-label">Delivery Fee</span>
              <span class="rest-metric-value">
                🛵 ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
          </div>

          <div>
            ${
              rest.isOpen
                ? `<span class="badge-status-pill delivered">🟢 OPEN NOW (${rest.openingHours})</span>`
                : `<span class="badge-status-pill preparing">🔴 CLOSED (${rest.openingHours})</span>`
            }
          </div>
        </div>

        ${
          !isDeliverable
            ? `
          <div class="radius-warning-banner">
            <span class="warning-icon">⚠️</span>
            <div>
              <strong>Outside Delivery Area:</strong> This restaurant only delivers up to ${rest.deliveryRadiusKm} km,
              but you are currently ${distanceKm} km away. Ordering from this restaurant is disabled for your current address.
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Menu Controls Bar -->
      <div class="menu-controls-bar">
        <!-- Veg Only Toggle -->
        <label class="veg-toggle-wrap">
          <input
            type="checkbox"
            id="detail-veg-toggle"
            class="veg-toggle-input"
            onchange="App.toggleDetailVegOnly(this.checked)"
          />
          <div class="veg-toggle-track">
            <div class="veg-toggle-thumb"></div>
          </div>
          <span class="veg-toggle-label">
            ${window.UI.getFoodTypeIcon(true)} Veg Only
          </span>
        </label>

        <!-- Category Jump Chips -->
        <div class="menu-category-chips">
          ${menuCategories
            .map(
              cat => `
            <button class="menu-nav-chip" onclick="App.scrollToCategory('${cat}')">
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Menu Items by Category Container -->
      <div id="restaurant-menu-container">
        ${this.generateMenuHtml(rest, isDeliverable)}
      </div>
    `;
  },

  /**
   * Re-render menu section only (for quantity updates or veg filter)
   */
  renderRestaurantMenuOnly(restaurantId) {
    const menuContainer = document.getElementById('restaurant-menu-container');
    if (!menuContainer) return;

    const rest = window.eatyState.get('restaurants').find(r => r.id === restaurantId);
    if (!rest) return;

    const userLoc = window.eatyState.get('location');
    const isDeliverable = window.Geo.isWithinDeliveryRadius(userLoc.lat, userLoc.lng, rest);

    menuContainer.innerHTML = this.generateMenuHtml(rest, isDeliverable);
  },

  /**
   * Generate Menu Section HTML
   */
  generateMenuHtml(rest, isDeliverable) {
    const vegOnly = document.getElementById('detail-veg-toggle')?.checked || false;
    const cart = window.eatyState.get('cart');

    let menuItems = rest.menu;
    if (vegOnly) {
      menuItems = menuItems.filter(m => m.isVeg);
    }

    const categories = Array.from(new Set(menuItems.map(m => m.category)));

    if (categories.length === 0) {
      return `
        <div class="empty-state-box">
          <div class="empty-icon">🥗</div>
          <h3>No items matching your filter</h3>
          <p class="empty-desc">Try turning off the Veg Only filter to see all menu items.</p>
        </div>
      `;
    }

    return categories
      .map(cat => {
        const items = menuItems.filter(m => m.category === cat);
        return `
          <div class="menu-section" id="cat-section-${cat.replace(/\s+/g, '-')}">
            <h3 class="menu-section-header">
              <span>${cat}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--text-sub);">(${items.length})</span>
            </h3>

            <div class="menu-items-list">
              ${items
                .map(item => {
                  // Check quantity in cart
                  const inCartItem =
                    cart.restaurantId === rest.id
                      ? cart.items.find(i => i.id === item.id)
                      : null;
                  const qty = inCartItem ? inCartItem.quantity : 0;

                  return `
                  <div class="food-item-card">
                    <div class="food-info-col">
                      <div class="food-type-row">
                        ${window.UI.getFoodTypeIcon(item.isVeg)}
                        ${
                          item.isBestseller
                            ? `<span class="bestseller-ribbon">★ Bestseller</span>`
                            : ''
                        }
                        ${
                          item.isSpicy
                            ? `<span style="font-size: 12px;" title="Spicy">🌶️</span>`
                            : ''
                        }
                      </div>

                      <h4 class="food-name">${item.name}</h4>

                      <div class="food-price-row">
                        <span class="food-price">₹${item.price}</span>
                        ${
                          item.rating
                            ? `<span class="food-rating-pill">⭐ ${item.rating} (${item.ratingCount})</span>`
                            : ''
                        }
                      </div>

                      <p class="food-desc">${item.description}</p>
                    </div>

                    <div class="food-action-col">
                      <img src="${item.image}" alt="${item.name}" class="food-item-img" loading="lazy" />

                      <div class="food-add-wrap">
                        ${
                          !rest.isOpen || !isDeliverable
                            ? `<button class="btn-add-food" disabled style="opacity: 0.5; cursor: not-allowed; font-size: 11px;">
                                ${!rest.isOpen ? 'CLOSED' : 'UNAVAILABLE'}
                               </button>`
                            : qty > 0
                            ? `
                              <div class="quantity-stepper">
                                <button class="stepper-btn" onclick="App.decrementItem('${inCartItem.customKey}')">−</button>
                                <span class="stepper-count">${qty}</span>
                                <button class="stepper-btn" onclick="App.incrementItem('${inCartItem.customKey}')">+</button>
                              </div>
                            `
                            : `
                              <button
                                class="btn-add-food ${item.customizable ? 'customisable' : ''}"
                                onclick="App.initiateAddItem('${rest.id}', '${item.id}')"
                              >
                                ADD +
                              </button>
                            `
                        }
                      </div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');
  },

  /**
   * Handle Add Item click (direct or open customization modal)
   */
  initiateAddItem(restaurantId, itemId) {
    const rest = window.eatyState.get('restaurants').find(r => r.id === restaurantId);
    if (!rest) return;
    const item = rest.menu.find(m => m.id === itemId);
    if (!item) return;

    if (item.customizable && item.customizationOptions) {
      this.openCustomizationModal(rest, item);
    } else {
      window.eatyState.addToCart(rest, item);
      window.UI.toast(`Added "${item.name}" to cart`, 'success');
    }
  },

  /**
   * Customization Modal for customizable items
   */
  openCustomizationModal(rest, item) {
    const opts = item.customizationOptions;
    let selectedPortion = opts.portions ? opts.portions[0] : null;
    let selectedSpice = opts.spiceLevel ? opts.spiceLevel[0] : null;
    let selectedAddOns = [];

    const calculateCurrentPrice = () => {
      const portionDelta = selectedPortion?.priceDelta || 0;
      const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
      return item.price + portionDelta + addOnsTotal;
    };

    const modalHtml = `
      <div id="custom-modal-content">
        <!-- Dish info banner -->
        <div style="display: flex; gap: 14px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light);">
          <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; border-radius: var(--radius-sm); object-fit: cover;" />
          <div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              ${window.UI.getFoodTypeIcon(item.isVeg)}
              <strong style="font-size: 16px;">${item.name}</strong>
            </div>
            <div style="font-size: 13px; color: var(--text-sub);">${item.description}</div>
          </div>
        </div>

        <!-- Portions / Sizes -->
        ${
          opts.portions
            ? `
          <div class="customization-section">
            <div class="customization-section-title">
              <span>Choose Size / Portion</span>
              <span style="font-size: 11px; color: var(--primary);">REQUIRED</span>
            </div>
            ${opts.portions
              .map(
                (p, idx) => `
              <div
                class="customization-option-row portion-row ${idx === 0 ? 'active' : ''}"
                onclick="App.selectCustomPortion('${p.name}', ${p.priceDelta}, this)"
              >
                <div class="custom-option-label">
                  <input type="radio" name="custom-portion" ${idx === 0 ? 'checked' : ''} />
                  <span>${p.name}</span>
                </div>
                <span class="custom-option-price">${p.priceDelta > 0 ? `+₹${p.priceDelta}` : 'Included'}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Spice Level -->
        ${
          opts.spiceLevel
            ? `
          <div class="customization-section">
            <div class="customization-section-title">
              <span>Select Spice Level</span>
            </div>
            ${opts.spiceLevel
              .map(
                (spice, idx) => `
              <div
                class="customization-option-row spice-row ${idx === 0 ? 'active' : ''}"
                onclick="App.selectCustomSpice('${spice}', this)"
              >
                <div class="custom-option-label">
                  <input type="radio" name="custom-spice" ${idx === 0 ? 'checked' : ''} />
                  <span>🌶️ ${spice}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Add-ons / Extras -->
        ${
          opts.addOns
            ? `
          <div class="customization-section">
            <div class="customization-section-title">
              <span>Extras & Add-ons</span>
              <span style="font-size: 11px; color: var(--text-muted);">OPTIONAL</span>
            </div>
            ${opts.addOns
              .map(
                addon => `
              <div
                class="customization-option-row addon-row"
                onclick="App.toggleCustomAddOn('${addon.name}', ${addon.price}, this)"
              >
                <div class="custom-option-label">
                  <input type="checkbox" />
                  <span>+ ${addon.name}</span>
                </div>
                <span class="custom-option-price">+₹${addon.price}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Cooking Instructions -->
        <div class="customization-section">
          <div class="customization-section-title">Cooking Note</div>
          <input
            type="text"
            id="custom-cooking-note"
            class="admin-input"
            placeholder="e.g. Less oil, extra green chutney"
            style="width: 100%;"
          />
        </div>
      </div>
    `;

    const footerHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div>
          <span style="font-size: 12px; color: var(--text-sub); display: block;">Total Item Price</span>
          <span id="custom-total-price" style="font-size: 20px; font-weight: 800; color: var(--text-main);">
            ₹${calculateCurrentPrice()}
          </span>
        </div>
        <button class="btn-primary" onclick="App.confirmCustomization('${rest.id}', '${item.id}')">
          Add Item to Cart
        </button>
      </div>
    `;

    // Store active customization context on window
    window._activeCustomCtx = {
      rest,
      item,
      selectedPortion,
      selectedSpice,
      selectedAddOns,
      calculateCurrentPrice,
    };

    window.UI.openModal(`Customize ${item.name}`, modalHtml, footerHtml);
  },

  selectCustomPortion(name, priceDelta, el) {
    document.querySelectorAll('.portion-row').forEach(r => r.classList.remove('active'));
    el.classList.add('active');
    el.querySelector('input').checked = true;

    window._activeCustomCtx.selectedPortion = { name, priceDelta };
    const priceEl = document.getElementById('custom-total-price');
    if (priceEl) priceEl.textContent = `₹${window._activeCustomCtx.calculateCurrentPrice()}`;
  },

  selectCustomSpice(spice, el) {
    document.querySelectorAll('.spice-row').forEach(r => r.classList.remove('active'));
    el.classList.add('active');
    el.querySelector('input').checked = true;
    window._activeCustomCtx.selectedSpice = spice;
  },

  toggleCustomAddOn(name, price, el) {
    const checkbox = el.querySelector('input');
    checkbox.checked = !checkbox.checked;
    el.classList.toggle('active', checkbox.checked);

    if (checkbox.checked) {
      window._activeCustomCtx.selectedAddOns.push({ name, price });
    } else {
      window._activeCustomCtx.selectedAddOns = window._activeCustomCtx.selectedAddOns.filter(
        a => a.name !== name
      );
    }

    const priceEl = document.getElementById('custom-total-price');
    if (priceEl) priceEl.textContent = `₹${window._activeCustomCtx.calculateCurrentPrice()}`;
  },

  confirmCustomization(restaurantId, itemId) {
    const ctx = window._activeCustomCtx;
    if (!ctx) return;

    const cookingNote = document.getElementById('custom-cooking-note')?.value.trim() || '';

    const customizations = {
      portion: ctx.selectedPortion,
      spiceLevel: ctx.selectedSpice,
      addOns: ctx.selectedAddOns,
      cookingNote,
    };

    window.eatyState.addToCart(ctx.rest, ctx.item, customizations);
    window.UI.closeModal();
    window.UI.toast(`Added customized "${ctx.item.name}" to cart!`, 'success');
  },

  incrementItem(customKey) {
    window.eatyState.updateItemQuantity(customKey, 1);
  },

  decrementItem(customKey) {
    window.eatyState.updateItemQuantity(customKey, -1);
  },

  setSearchRadius(radius) {
    window.eatyState.setSearchRadius(radius);
    window.soundEffects.playPop();
    window.UI.toast(`Search radius set to ${radius} km. Recalculated!`, 'info');
  },

  toggleVegFilter() {
    const current = window.eatyState.get('pureVegOnly');
    window.eatyState.set('pureVegOnly', !current);
    this.renderHome();
  },

  toggleFastDelivery() {
    const current = window.eatyState.get('fastDeliveryOnly');
    window.eatyState.set('fastDeliveryOnly', !current);
    this.renderHome();
  },

  toggleRatingFilter() {
    const current = window.eatyState.get('ratingFilter');
    window.eatyState.set('ratingFilter', current > 0 ? 0 : 4.0);
    this.renderHome();
  },

  selectCategory(catId) {
    window.eatyState.set('activeCategory', catId);
    this.renderHome();
  },

  clearSearch() {
    window.eatyState.set('searchQuery', '');
    this.renderHome();
  },

  copyCoupon(code) {
    navigator.clipboard?.writeText(code);
    window.soundEffects.playPop();
    window.UI.toast(`Coupon code ${code} copied! Use it in cart.`, 'success');
  },

  toggleDetailVegOnly(isVeg) {
    this.renderRestaurantMenuOnly(window.eatyState.get('activeRestaurantId'));
  },

  scrollToCategory(catName) {
    const target = document.getElementById(`cat-section-${catName.replace(/\s+/g, '-')}`);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  },
};

window.App = App;
