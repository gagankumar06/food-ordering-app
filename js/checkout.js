// checkout.js - Checkout flow, address selector, UPI payment demo, and order creation

const CheckoutModule = {
  selectedAddressId: null,
  selectedPaymentMethod: 'UPI', // 'UPI' | 'COD'
  selectedUpiApp: 'gpay', // 'gpay' | 'phonepe' | 'paytm' | 'custom'

  renderCheckout() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const state = window.eatyState;
    const cart = state.get('cart');

    if (cart.items.length === 0) {
      window.appRouter.navigate('home');
      return;
    }

    const bill = state.getCartBill();
    const user = state.get('user');

    if (!this.selectedAddressId && user.addresses.length > 0) {
      this.selectedAddressId = user.addresses[0].id;
    }

    container.innerHTML = `
      <div style="margin-top: 16px;">
        <button class="btn-secondary" style="margin-bottom: 16px;" onclick="window.appRouter.navigate('cart')">
          ← Back to Cart
        </button>
      </div>

      <div class="cart-layout">
        <!-- Left: Address & Payment Selection -->
        <div>
          <!-- Section 1: Delivery Address -->
          <div class="cart-card">
            <div class="checkout-section-header">
              <span>📍</span>
              <span>Select Delivery Address</span>
            </div>

            <div class="address-selection-grid">
              ${user.addresses
                .map(
                  addr => `
                <div
                  class="address-card-radio ${this.selectedAddressId === addr.id ? 'selected' : ''}"
                  onclick="CheckoutModule.selectAddress('${addr.id}')"
                >
                  <div class="address-tag-pill">
                    <span>${addr.icon || '📍'}</span>
                    <span>${addr.type}</span>
                  </div>
                  <div class="address-card-flat">${addr.flat}</div>
                  <div class="address-card-details">
                    ${addr.landmark ? `${addr.landmark}, ` : ''}${addr.addressLine}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
                    Receiver: ${addr.receiverName} • ${addr.phone}
                  </div>
                </div>
              `
                )
                .join('')}

              <!-- Add New Address Button Card -->
              <div
                class="address-card-radio"
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; border-style: dashed; text-align: center; min-height: 120px;"
                onclick="CheckoutModule.openAddAddressModal()"
              >
                <span style="font-size: 24px; color: var(--primary);">+</span>
                <span style="font-size: 13px; font-weight: 700; color: var(--primary);">Add New Address</span>
              </div>
            </div>
          </div>

          <!-- Section 2: Payment Method Choice -->
          <div class="cart-card">
            <div class="checkout-section-header">
              <span>💳</span>
              <span>Choose Payment Method</span>
            </div>

            <div class="payment-methods-list">
              <!-- UPI Option -->
              <div
                class="payment-method-card ${this.selectedPaymentMethod === 'UPI' ? 'selected' : ''}"
                onclick="CheckoutModule.selectPaymentMethod('UPI')"
              >
                <div class="payment-icon-badge" style="background: #e0f2fe; color: #0284c7;">
                  ⚡
                </div>
                <div class="payment-method-info">
                  <div class="payment-method-title">
                    <span>UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                    <span style="font-size: 11px; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px;">FASTEST</span>
                  </div>
                  <div class="payment-method-sub">Instant UPI pay via App or QR Code • Zero convenience fee</div>
                </div>
                <input type="radio" name="payment-method" ${this.selectedPaymentMethod === 'UPI' ? 'checked' : ''} />
              </div>

              <!-- Cash on Delivery (COD) Option -->
              <div
                class="payment-method-card ${this.selectedPaymentMethod === 'COD' ? 'selected' : ''}"
                onclick="CheckoutModule.selectPaymentMethod('COD')"
              >
                <div class="payment-icon-badge" style="background: #fef3c7; color: #d97706;">
                  💵
                </div>
                <div class="payment-method-info">
                  <div class="payment-method-title">
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <div class="payment-method-sub">Pay in cash or UPI scan when your food arrives at your door</div>
                </div>
                <input type="radio" name="payment-method" ${this.selectedPaymentMethod === 'COD' ? 'checked' : ''} />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary Breakdown -->
        <div>
          <div class="bill-summary-card">
            <h3 class="bill-title">Order Summary</h3>

            <div style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
              ${cart.restaurantName}
            </div>

            <div style="font-size: 13px; color: var(--text-sub); margin-bottom: 16px;">
              ${cart.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </div>

            <div class="bill-rows">
              <div class="bill-row">
                <span>Item Subtotal</span>
                <span>₹${bill.subtotal}</span>
              </div>
              <div class="bill-row">
                <span>Delivery Partner Fee</span>
                <span>${bill.deliveryFee === 0 ? '<strong style="color: var(--veg-color);">FREE</strong>' : `₹${bill.deliveryFee}`}</span>
              </div>
              <div class="bill-row">
                <span>Packaging & Taxes</span>
                <span>₹${bill.packagingFee + bill.gstTax}</span>
              </div>
              ${
                bill.discount > 0
                  ? `<div class="bill-row discount-row"><span>Discount (${bill.coupon?.code})</span><span>− ₹${bill.discount}</span></div>`
                  : ''
              }
              ${bill.tip > 0 ? `<div class="bill-row"><span>Delivery Tip</span><span>₹${bill.tip}</span></div>` : ''}

              <div class="bill-divider"></div>

              <div class="bill-total-row">
                <span>Total Amount</span>
                <span>₹${bill.grandTotal}</span>
              </div>
            </div>

            <button
              class="btn-checkout-proceed"
              onclick="CheckoutModule.initiatePayment()"
            >
              <span>${this.selectedPaymentMethod === 'UPI' ? 'PAY VIA UPI' : 'CONFIRM COD ORDER'}</span>
              <span>₹${bill.grandTotal}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  selectAddress(id) {
    this.selectedAddressId = id;
    this.renderCheckout();
  },

  selectPaymentMethod(method) {
    this.selectedPaymentMethod = method;
    this.renderCheckout();
  },

  openAddAddressModal() {
    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="admin-field-group">
          <label class="admin-label">Address Type</label>
          <select id="new-addr-type" class="admin-select">
            <option value="Home">Home 🏠</option>
            <option value="Work">Work 💼</option>
            <option value="Other">Other 📍</option>
          </select>
        </div>

        <div class="admin-field-group">
          <label class="admin-label">House / Flat / Block No.</label>
          <input type="text" id="new-addr-flat" class="admin-input" placeholder="e.g. Flat 302, Palm Meadows" />
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Street / Area / Locality</label>
          <input type="text" id="new-addr-area" class="admin-input" placeholder="e.g. Koramangala 4th Block" />
        </div>

        <div class="admin-field-group">
          <label class="admin-label">Landmark (Optional)</label>
          <input type="text" id="new-addr-landmark" class="admin-input" placeholder="e.g. Near Wipro Park" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="admin-field-group">
            <label class="admin-label">Receiver Name</label>
            <input type="text" id="new-addr-name" class="admin-input" value="Aditya Sharma" />
          </div>
          <div class="admin-field-group">
            <label class="admin-label">Phone Number</label>
            <input type="tel" id="new-addr-phone" class="admin-input" value="+91 98765 43210" />
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
      <button class="btn-primary" onclick="CheckoutModule.saveNewAddress()">Save Address</button>
    `;

    window.UI.openModal('Add New Delivery Address', modalHtml, footerHtml);
  },

  saveNewAddress() {
    const type = document.getElementById('new-addr-type').value;
    const flat = document.getElementById('new-addr-flat').value.trim();
    const area = document.getElementById('new-addr-area').value.trim();
    const landmark = document.getElementById('new-addr-landmark').value.trim();
    const name = document.getElementById('new-addr-name').value.trim();
    const phone = document.getElementById('new-addr-phone').value.trim();

    if (!flat || !area) {
      window.UI.toast('Please provide flat number and area', 'warning');
      return;
    }

    const icons = { Home: '🏠', Work: '💼', Other: '📍' };

    const newAddr = window.eatyState.addSavedAddress({
      type,
      icon: icons[type] || '📍',
      flat,
      landmark,
      addressLine: `${area}, Bengaluru`,
      receiverName: name,
      phone,
      lat: window.eatyState.get('location').lat,
      lng: window.eatyState.get('location').lng,
    });

    this.selectedAddressId = newAddr.id;
    window.UI.closeModal();
    window.soundEffects.playSuccess();
    window.UI.toast('New address saved!', 'success');
    this.renderCheckout();
  },

  initiatePayment() {
    if (!this.selectedAddressId) {
      window.UI.toast('Please select a delivery address', 'warning');
      return;
    }

    if (this.selectedPaymentMethod === 'COD') {
      this.confirmCodOrder();
    } else {
      this.openUpiPaymentModal();
    }
  },

  confirmCodOrder() {
    const state = window.eatyState;
    const cart = state.get('cart');
    const bill = state.getCartBill();
    const user = state.get('user');
    const address = user.addresses.find(a => a.id === this.selectedAddressId) || user.addresses[0];

    const orderPayload = {
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      restaurantImage: cart.restaurantImage,
      items: [...cart.items],
      bill,
      deliveryAddress: address,
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending (Pay on delivery)',
      instructions: cart.instructions,
    };

    const newOrder = state.createOrder(orderPayload);
    window.UI.toast(`Order placed successfully! ID: #${newOrder.id}`, 'success');
    window.appRouter.navigate('tracking');
  },

  /**
   * UPI Payment Flow with dynamic QR, countdown, and demo modes
   */
  openUpiPaymentModal() {
    const state = window.eatyState;
    const bill = state.getCartBill();

    const modalHtml = `
      <div class="upi-modal-content">
        <div class="upi-brand-header">
          <span class="upi-logo-pill">UPI</span>
          <span style="font-size: 14px; font-weight: 700; color: var(--text-sub);">Unified Payments Interface</span>
        </div>

        <div style="font-size: 13px; color: var(--text-sub); margin-bottom: 4px;">Total Payable Amount</div>
        <div class="upi-amount-badge">₹${bill.grandTotal}</div>

        <!-- Simulated UPI QR Code -->
        <div class="upi-qr-box">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=eatyfoods@upi&pn=Eaty%20India&am=${bill.grandTotal}&cu=INR"
            alt="Scan UPI QR"
            class="upi-qr-img"
          />
          <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); margin-top: 4px;">
            VPA: eatyfoods@upi
          </div>
        </div>

        <div class="upi-timer" id="upi-countdown">
          <span>⏱️</span>
          <span>QR expires in <strong id="upi-timer-text">04:59</strong></span>
        </div>

        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px;">
          <span class="filter-chip active">GPay</span>
          <span class="filter-chip active">PhonePe</span>
          <span class="filter-chip active">Paytm</span>
          <span class="filter-chip active">BHIM</span>
        </div>

        <!-- Interactive Demo Testing Mode -->
        <div class="demo-mode-box">
          <div class="demo-mode-title">⚡ Interactive Demo Payment Mode</div>
          <p style="font-size: 12px; color: var(--text-sub); margin-bottom: 12px;">
            Test the complete flow without real money:
          </p>
          <div class="demo-buttons-row">
            <button class="btn-demo-success" onclick="CheckoutModule.simulateUpiSuccess()">
              ✓ Simulate Success
            </button>
            <button class="btn-demo-fail" onclick="CheckoutModule.simulateUpiFailure()">
              ✕ Simulate Failure
            </button>
          </div>
        </div>
      </div>
    `;

    window.UI.openModal('Pay via UPI', modalHtml);
    this.startUpiTimer();
  },

  startUpiTimer() {
    let timeLeft = 299; // 5 mins
    clearInterval(this._upiTimerInterval);
    this._upiTimerInterval = setInterval(() => {
      timeLeft--;
      const min = Math.floor(timeLeft / 60);
      const sec = timeLeft % 60;
      const el = document.getElementById('upi-timer-text');
      if (el) {
        el.textContent = `0${min}:${sec < 10 ? '0' : ''}${sec}`;
      }
      if (timeLeft <= 0) {
        clearInterval(this._upiTimerInterval);
      }
    }, 1000);
  },

  simulateUpiSuccess() {
    clearInterval(this._upiTimerInterval);
    window.UI.closeModal();

    const state = window.eatyState;
    const cart = state.get('cart');
    const bill = state.getCartBill();
    const user = state.get('user');
    const address = user.addresses.find(a => a.id === this.selectedAddressId) || user.addresses[0];

    const orderPayload = {
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      restaurantImage: cart.restaurantImage,
      items: [...cart.items],
      bill,
      deliveryAddress: address,
      paymentMethod: 'UPI (PhonePe / GPay)',
      paymentStatus: 'Paid (TXN-UPI-' + Math.floor(100000 + Math.random() * 900000) + ')',
      instructions: cart.instructions,
    };

    const newOrder = state.createOrder(orderPayload);
    window.UI.toast(`UPI Payment Successful! Order #${newOrder.id} placed.`, 'success');
    window.appRouter.navigate('tracking');
  },

  simulateUpiFailure() {
    clearInterval(this._upiTimerInterval);
    window.soundEffects.playError();

    const errorHtml = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="font-size: 48px; color: var(--nonveg-color); margin-bottom: 12px;">❌</div>
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">UPI Payment Failed</h3>
        <p style="font-size: 13px; color: var(--text-sub); margin-bottom: 20px; line-height: 1.5;">
          Your issuing bank was unable to process the UPI transaction. No money was deducted.
          You can retry the transaction or choose Cash on Delivery.
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn-primary" onclick="CheckoutModule.openUpiPaymentModal()">
            Retry UPI Payment
          </button>
          <button class="btn-secondary" onclick="CheckoutModule.switchAndPlaceCod()">
            Switch to Cash on Delivery
          </button>
        </div>
      </div>
    `;

    window.UI.openModal('Payment Failure (Demo)', errorHtml);
  },

  switchAndPlaceCod() {
    window.UI.closeModal();
    this.selectedPaymentMethod = 'COD';
    this.confirmCodOrder();
  },
};

window.CheckoutModule = CheckoutModule;
