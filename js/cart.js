// cart.js - Cart management, bill itemization, tip selector, and coupons

const CartModule = {
  renderCart() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const state = window.eatyState;
    const cart = state.get('cart');

    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="margin-top: 40px;">
          <div class="empty-icon">🛒</div>
          <h2 class="empty-title">Your Cart is Empty</h2>
          <p class="empty-desc">Good food is always waiting for you. Explore the nearest restaurants and add something delicious!</p>
          <button class="btn-primary" onclick="window.appRouter.navigate('home')">
            Browse Nearby Restaurants
          </button>
        </div>
      `;
      return;
    }

    const bill = state.getCartBill();
    const rest = state.get('restaurants').find(r => r.id === cart.restaurantId);

    container.innerHTML = `
      <div style="margin-top: 16px;">
        <button class="btn-secondary" style="margin-bottom: 16px;" onclick="window.appRouter.navigate('restaurant')">
          ← Back to Menu
        </button>
      </div>

      <div class="cart-layout">
        <!-- Left Column: Items, Notes, Tips, Coupons -->
        <div>
          <!-- Restaurant Header Card -->
          <div class="cart-card">
            <div class="cart-card-header">
              <div class="cart-rest-info">
                <img src="${cart.restaurantImage || rest?.image}" alt="${cart.restaurantName}" class="cart-rest-avatar" />
                <div>
                  <h3 class="cart-rest-title">${cart.restaurantName}</h3>
                  <div class="cart-rest-sub">📍 ${bill.distanceKm} km from your delivery address</div>
                </div>
              </div>
              <button class="btn-secondary" style="font-size: 12px; padding: 4px 10px; color: var(--nonveg-color);" onclick="CartModule.clearCartConfirm()">
                Clear Cart
              </button>
            </div>

            <!-- Items Table -->
            <div class="cart-items-table">
              ${cart.items
                .map(
                  item => `
                <div class="cart-item-row">
                  <div class="cart-item-details">
                    <div class="cart-item-name-row">
                      ${window.UI.getFoodTypeIcon(item.isVeg)}
                      <span>${item.name}</span>
                    </div>

                    ${
                      item.customizations
                        ? `
                      <div class="cart-item-custom-tags">
                        ${item.customizations.portion ? `<span>Size: ${item.customizations.portion.name}</span>` : ''}
                        ${item.customizations.spiceLevel ? `<span>• Spice: ${item.customizations.spiceLevel}</span>` : ''}
                        ${
                          item.customizations.addOns?.length
                            ? `<span>• Addons: ${item.customizations.addOns.map(a => a.name).join(', ')}</span>`
                            : ''
                        }
                        ${item.customizations.cookingNote ? `<div><em>Note: "${item.customizations.cookingNote}"</em></div>` : ''}
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <!-- Stepper -->
                  <div style="width: 90px; height: 32px;">
                    <div class="quantity-stepper">
                      <button class="stepper-btn" onclick="CartModule.updateQuantity('${item.customKey}', -1)">−</button>
                      <span class="stepper-count">${item.quantity}</span>
                      <button class="stepper-btn" onclick="CartModule.updateQuantity('${item.customKey}', 1)">+</button>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="cart-item-price">
                    ₹${item.itemTotal}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>

            <button class="btn-secondary" style="width: 100%; justify-content: center; font-size: 13px;" onclick="window.appRouter.navigate('restaurant')">
              + Add More Items
            </button>
          </div>

          <!-- Cooking & Delivery Instructions -->
          <div class="cart-card">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Delivery & Cooking Instructions</h4>
            <textarea
              class="delivery-notes-input"
              placeholder="e.g. Leave order at door, don't ring doorbell, call upon arrival..."
              oninput="window.eatyState.get('cart').instructions = this.value"
            >${cart.instructions || ''}</textarea>
          </div>

          <!-- Tip Delivery Executive -->
          <div class="cart-card">
            <div class="tip-title">
              <span>🛵</span>
              <span>Say thanks with a Tip to your Delivery Executive</span>
            </div>
            <p style="font-size: 12px; color: var(--text-sub); margin-bottom: 12px;">
              100% of your tip goes directly to the delivery partner.
            </p>
            <div class="tip-chips-row">
              ${[0, 10, 20, 30, 50]
                .map(
                  amt => `
                <button
                  class="tip-chip ${cart.tipAmount === amt ? 'active' : ''}"
                  onclick="CartModule.setTip(${amt})"
                >
                  ${amt === 0 ? 'No Tip' : `₹${amt}`}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Right Column: Coupons & Bill Breakdown -->
        <div>
          <!-- Apply Coupon Card -->
          <div class="cart-card" style="margin-bottom: 16px;">
            <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <span>🏷️</span>
              <span>Offers & Coupons</span>
            </h4>

            ${
              bill.coupon
                ? `
              <div class="applied-coupon-tag">
                <div class="coupon-success-text">
                  <span>🎉</span>
                  <div>
                    <strong>${bill.coupon.code}</strong> Applied!
                    <div style="font-size: 11px; font-weight: 500;">Saved ₹${bill.discount}</div>
                  </div>
                </div>
                <button class="btn-remove-coupon" onclick="CartModule.removeCoupon()">REMOVE</button>
              </div>
            `
                : `
              <div class="coupon-input-box">
                <input
                  type="text"
                  id="coupon-code-input"
                  class="coupon-field"
                  placeholder="Enter Promo Code"
                />
                <button class="btn-apply-coupon" onclick="CartModule.applyCoupon()">
                  APPLY
                </button>
              </div>

              <!-- Available Coupons List -->
              <div style="font-size: 12px; font-weight: 700; color: var(--text-sub); margin-bottom: 6px;">Available Coupons:</div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${state.get('coupons').map(c => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-alt); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px;">
                    <div>
                      <strong style="color: var(--primary);">${c.code}</strong> - ${c.title}
                    </div>
                    <button style="color: var(--primary); font-weight: 800;" onclick="CartModule.quickApplyCoupon('${c.code}')">APPLY</button>
                  </div>
                `).join('')}
              </div>
            `
            }
          </div>

          <!-- Bill Summary Card -->
          <div class="bill-summary-card">
            <h3 class="bill-title">Bill Details</h3>

            <div class="bill-rows">
              <div class="bill-row">
                <span>Item Subtotal</span>
                <span>₹${bill.subtotal}</span>
              </div>

              <div class="bill-row">
                <span>Delivery Partner Fee (${bill.distanceKm} km)</span>
                <span>${bill.deliveryFee === 0 ? '<strong style="color: var(--veg-color);">FREE</strong>' : `₹${bill.deliveryFee}`}</span>
              </div>

              <div class="bill-row">
                <span>Restaurant Packaging Charges</span>
                <span>₹${bill.packagingFee}</span>
              </div>

              <div class="bill-row">
                <span>Govt. Taxes & GST (5%)</span>
                <span>₹${bill.gstTax}</span>
              </div>

              ${
                bill.discount > 0
                  ? `
                <div class="bill-row discount-row">
                  <span>Discount (${bill.coupon?.code})</span>
                  <span>− ₹${bill.discount}</span>
                </div>
              `
                  : ''
              }

              ${
                bill.tip > 0
                  ? `
                <div class="bill-row">
                  <span>Delivery Tip</span>
                  <span>₹${bill.tip}</span>
                </div>
              `
                  : ''
              }

              <div class="bill-divider"></div>

              <div class="bill-total-row">
                <span>To Pay</span>
                <span>₹${bill.grandTotal}</span>
              </div>
            </div>

            <!-- Proceed to Checkout Button -->
            <button class="btn-checkout-proceed" onclick="window.appRouter.navigate('checkout')">
              <span>PROCEED TO CHECKOUT</span>
              <span>₹${bill.grandTotal} →</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  updateQuantity(customKey, delta) {
    window.eatyState.updateItemQuantity(customKey, delta);
    this.renderCart();
  },

  clearCartConfirm() {
    if (confirm('Are you sure you want to clear all items in your cart?')) {
      window.eatyState.clearCart();
      this.renderCart();
      window.UI.toast('Cart cleared', 'info');
    }
  },

  setTip(amount) {
    window.eatyState.setCartTip(amount);
    window.soundEffects.playPop();
    this.renderCart();
  },

  applyCoupon() {
    const input = document.getElementById('coupon-code-input');
    if (!input || !input.value.trim()) {
      window.UI.toast('Please enter a coupon code', 'warning');
      return;
    }
    const res = window.eatyState.applyCoupon(input.value.trim());
    if (res.success) {
      window.UI.toast(res.message, 'success');
    } else {
      window.soundEffects.playError();
      window.UI.toast(res.message, 'error');
    }
    this.renderCart();
  },

  quickApplyCoupon(code) {
    const res = window.eatyState.applyCoupon(code);
    if (res.success) {
      window.UI.toast(res.message, 'success');
    } else {
      window.soundEffects.playError();
      window.UI.toast(res.message, 'error');
    }
    this.renderCart();
  },

  removeCoupon() {
    window.eatyState.removeCoupon();
    window.UI.toast('Coupon removed', 'info');
    this.renderCart();
  },
};

window.CartModule = CartModule;
