// tracking.js - Multi-stage live order tracking, rider map route animation, auto-advance demo

const TrackingModule = {
  autoAdvanceTimer: null,

  renderTracking() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const state = window.eatyState;
    const orders = state.get('orders');
    const activeId = state.get('activeTrackingOrderId');

    const order = orders.find(o => o.id === activeId) || orders[0];

    if (!order) {
      container.innerHTML = `
        <div class="empty-state-box" style="margin-top: 40px;">
          <div class="empty-icon">📦</div>
          <h2 class="empty-title">No Active Orders</h2>
          <p class="empty-desc">You don't have any live orders being prepared right now.</p>
          <button class="btn-primary" onclick="window.appRouter.navigate('home')">
            Order Food Now
          </button>
        </div>
      `;
      return;
    }

    const stages = [
      { key: 'placed', label: 'Order Placed', desc: 'Order received by restaurant', icon: '📋' },
      { key: 'accepted', label: 'Restaurant Accepted', desc: 'Kitchen acknowledged order', icon: '👨‍🍳' },
      { key: 'preparing', label: 'Food Preparing', desc: 'Chef is cooking your fresh meal', icon: '🍳' },
      { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to you', icon: '🛵' },
      { key: 'delivered', label: 'Delivered', desc: 'Enjoy your hot meal!', icon: '✅' },
    ];

    const currentStageIndex = stages.findIndex(s => s.key === order.status);

    // Rider position percentage along the route
    const stagePositions = {
      placed: 15,
      accepted: 25,
      preparing: 40,
      out_for_delivery: 70,
      delivered: 85,
    };
    const riderPos = stagePositions[order.status] || 15;

    container.innerHTML = `
      <div style="margin-top: 16px;">
        <button class="btn-secondary" style="margin-bottom: 16px;" onclick="window.appRouter.navigate('home')">
          ← Back to Home
        </button>
      </div>

      <div class="tracking-layout">
        <!-- Main Tracking Left Column -->
        <div class="tracking-main-card">
          <div class="tracking-header-row">
            <span class="tracking-order-id-badge">ORDER #${order.id}</span>
            <div class="tracking-eta-box">
              <span>⏱️</span>
              <span>${order.status === 'delivered' ? 'DELIVERED' : 'Est. Delivery in 22 mins'}</span>
            </div>
          </div>

          <h2 class="tracking-headline">
            ${
              order.status === 'delivered'
                ? 'Order Delivered!'
                : order.status === 'out_for_delivery'
                ? 'Rider is arriving soon!'
                : 'Preparing your meal'
            }
          </h2>
          <p class="tracking-subline">
            From <strong>${order.restaurantName}</strong> to <strong>${order.deliveryAddress?.flat || 'Your Location'}</strong>
          </p>

          <!-- Interactive Demo Toolbar -->
          <div class="tracking-demo-toolbar">
            <div class="demo-toolbar-label">
              <span>⚡</span>
              <span>Demo Simulation Controls</span>
            </div>
            <div class="demo-toolbar-actions">
              ${
                order.status !== 'delivered'
                  ? `
                <button class="btn-step-next" onclick="TrackingModule.advanceToNextStage('${order.id}')">
                  Advance to Next Stage ➔
                </button>
              `
                  : `
                <button class="btn-step-next" style="background: var(--veg-color);" onclick="TrackingModule.resetOrderDemo('${order.id}')">
                  Restart Demo Flow ↺
                </button>
              `
              }
              <label style="font-size: 12px; font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                <input
                  type="checkbox"
                  id="auto-advance-check"
                  ${this.autoAdvanceTimer ? 'checked' : ''}
                  onchange="TrackingModule.toggleAutoAdvance('${order.id}', this.checked)"
                />
                Auto-Advance (15s)
              </label>
            </div>
          </div>

          <!-- Animated Rider Map Route Simulation -->
          <div class="tracking-map-canvas-container">
            <div class="map-grid-bg"></div>

            <!-- Route Track -->
            <div class="map-route-line">
              <div class="map-route-progress" style="width: ${Math.min(100, ((riderPos - 15) / 70) * 100)}%;"></div>
            </div>

            <!-- Restaurant Pin -->
            <div class="map-pin rest-pin">
              <div class="pin-bubble">🍳</div>
              <div class="pin-label">${order.restaurantName.split(' ')[0]}</div>
            </div>

            <!-- Animated Rider -->
            <div class="map-rider-bike" style="left: ${riderPos}%;">
              🛵
            </div>

            <!-- Customer Destination Pin -->
            <div class="map-pin dest-pin">
              <div class="pin-bubble">🏠</div>
              <div class="pin-label">Home</div>
            </div>
          </div>

          <!-- 5-Stage Live Timeline -->
          <div class="tracking-timeline">
            ${stages
              .map((st, idx) => {
                const isCompleted = idx < currentStageIndex || order.status === 'delivered';
                const isActive = st.key === order.status;
                const historyEntry = order.statusHistory?.find(h => h.status === st.key);

                return `
                <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                  <div class="step-marker">
                    ${isCompleted ? '✓' : st.icon}
                  </div>
                  <div class="step-content-row">
                    <span class="step-title">${st.label}</span>
                    <span class="step-time">${historyEntry?.time || (isActive ? 'Now' : '--')}</span>
                  </div>
                  <div class="step-desc">${historyEntry?.desc || st.desc}</div>
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- Delivery Partner Details Card (Active during delivery) -->
          ${
            order.deliveryPartner && (order.status === 'out_for_delivery' || order.status === 'delivered')
              ? `
            <div class="delivery-partner-card">
              <div class="partner-info-left">
                <img src="${order.deliveryPartner.photo}" alt="${order.deliveryPartner.name}" class="partner-avatar" />
                <div>
                  <div class="partner-name">
                    ${order.deliveryPartner.name}
                    <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">
                      ⭐ ${order.deliveryPartner.rating}
                    </span>
                  </div>
                  <div class="partner-vehicle">${order.deliveryPartner.vehicle}</div>
                  <div style="font-size: 11px; color: var(--veg-color); font-weight: 700;">
                    🛡️ ${order.deliveryPartner.badge} (Temp: 98.4°F)
                  </div>
                </div>
              </div>

              <button class="partner-call-btn" onclick="TrackingModule.callPartner('${order.deliveryPartner.phone}')" title="Call Delivery Partner">
                📞
              </button>
            </div>
          `
              : ''
          }
        </div>

        <!-- Right Column: Order Invoice & Actions -->
        <div>
          <div class="bill-summary-card">
            <h3 class="bill-title">Order Details</h3>

            <div style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">
              ${order.restaurantName}
            </div>
            <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 14px;">
              Ordered on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>

            <!-- Items -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; border-bottom: 1px dashed var(--border-light); padding-bottom: 14px;">
              ${order.items
                .map(
                  i => `
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                  <div>
                    ${window.UI.getFoodTypeIcon(i.isVeg)}
                    <strong>${i.quantity}x</strong> ${i.name}
                  </div>
                  <span>₹${i.itemTotal}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <!-- Bill Breakdown -->
            <div class="bill-rows" style="font-size: 13px;">
              <div class="bill-row">
                <span>Item Total</span>
                <span>₹${order.bill.subtotal}</span>
              </div>
              <div class="bill-row">
                <span>Delivery & Taxes</span>
                <span>₹${order.bill.deliveryFee + order.bill.packagingFee + order.bill.gstTax}</span>
              </div>
              ${
                order.bill.discount > 0
                  ? `<div class="bill-row discount-row"><span>Coupon Discount</span><span>− ₹${order.bill.discount}</span></div>`
                  : ''
              }
              <div class="bill-divider"></div>
              <div class="bill-total-row" style="font-size: 16px;">
                <span>Total Paid</span>
                <span>₹${order.bill.grandTotal}</span>
              </div>
            </div>

            <!-- Payment & Delivery address info -->
            <div style="background: var(--bg-alt); padding: 12px; border-radius: var(--radius-md); margin-top: 16px; font-size: 12px;">
              <div><strong>Payment:</strong> ${order.paymentMethod}</div>
              <div style="color: var(--veg-color); font-weight: 700;">Status: ${order.paymentStatus}</div>
              <div style="margin-top: 6px;"><strong>Deliver to:</strong> ${order.deliveryAddress?.flat}, ${order.deliveryAddress?.addressLine}</div>
            </div>

            <!-- 1-Click Reorder Button -->
            <button
              class="btn-primary"
              style="width: 100%; justify-content: center; margin-top: 16px;"
              onclick="TrackingModule.reorder('${order.id}')"
            >
              🔄 Reorder This Meal
            </button>
          </div>
        </div>
      </div>
    `;
  },

  advanceToNextStage(orderId) {
    const state = window.eatyState;
    const order = state.get('orders').find(o => o.id === orderId);
    if (!order) return;

    const stages = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = stages.indexOf(order.status);

    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      state.updateOrderStatus(orderId, nextStage);
      window.soundEffects.playPop();
      if (nextStage === 'delivered') {
        window.soundEffects.playSuccess();
        window.UI.toast('Food delivered safely! Enjoy your meal 🍽️', 'success');
      } else {
        window.UI.toast(`Order updated: ${nextStage.replace(/_/g, ' ')}`, 'info');
      }
      this.renderTracking();
    }
  },

  resetOrderDemo(orderId) {
    const state = window.eatyState;
    state.updateOrderStatus(orderId, 'placed');
    window.UI.toast('Order stage reset to "Order Placed" for demo testing', 'info');
    this.renderTracking();
  },

  toggleAutoAdvance(orderId, enabled) {
    if (enabled) {
      window.UI.toast('Auto-advance simulation enabled (updates every 15s)', 'info');
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = setInterval(() => {
        const order = window.eatyState.get('orders').find(o => o.id === orderId);
        if (order && order.status !== 'delivered') {
          this.advanceToNextStage(orderId);
        } else {
          clearInterval(this.autoAdvanceTimer);
          this.autoAdvanceTimer = null;
        }
      }, 15000);
    } else {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
      window.UI.toast('Auto-advance simulation paused', 'info');
    }
  },

  callPartner(phone) {
    window.UI.toast(`Calling Delivery Partner at ${phone}...`, 'info');
  },

  reorder(orderId) {
    const state = window.eatyState;
    const order = state.get('orders').find(o => o.id === orderId);
    if (!order) return;

    const rest = state.get('restaurants').find(r => r.id === order.restaurantId);
    if (!rest) {
      window.UI.toast('Restaurant is no longer available', 'error');
      return;
    }

    state.clearCart();
    order.items.forEach(item => {
      state.addToCart(rest, item, item.customizations);
    });

    window.soundEffects.playSuccess();
    window.UI.toast('Items added to cart! Proceed to checkout.', 'success');
    window.appRouter.navigate('checkout');
  },
};

window.TrackingModule = TrackingModule;
