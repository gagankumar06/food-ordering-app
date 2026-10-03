// login.js - Authentication & Login Portal for Customers, Restaurant Partners, and Admin

const LoginModule = {
  currentTab: 'customer', // 'customer' | 'partner' | 'signup'
  showPassword: {}, // tracks visibility per input ID

  /**
   * Render the full Login Portal page view
   */
  renderLoginView(initialTab = null) {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    if (initialTab) {
      this.currentTab = initialTab;
    }

    const state = window.eatyState;
    const user = state.get('user');
    const partnerAuth = state.get('partnerAuth') || { isLoggedIn: false };

    container.innerHTML = `
      <div class="login-page-container">
        <!-- Main Card -->
        <div class="login-card">
          <!-- Header -->
          <div class="login-header">
            <div class="login-brand-badge">E</div>
            <h1 class="login-title">
              ${this.currentTab === 'partner' ? 'Restaurant Partner Portal' : this.currentTab === 'signup' ? 'Create an Eaty Account' : 'Welcome Back to Eaty'}
            </h1>
            <p class="login-subtitle">
              ${this.currentTab === 'partner'
                ? 'Sign in to access your kitchen dashboard, live dispatch & menus.'
                : this.currentTab === 'signup'
                ? 'Sign up to order delicious food with real-time GPS tracking & discounts.'
                : 'Sign in with your Mail ID & Password to explore menus & track orders.'}
            </p>
          </div>

          <!-- Role / Action Selector Tabs -->
          <div class="login-tabs-nav">
            <button
              class="login-tab-btn ${this.currentTab === 'customer' ? 'active' : ''}"
              onclick="LoginModule.switchTab('customer')"
            >
              <span>🍔</span>
              <span>Foodie Login</span>
            </button>
            <button
              class="login-tab-btn ${this.currentTab === 'partner' ? 'active partner-active' : ''}"
              onclick="LoginModule.switchTab('partner')"
            >
              <span>👨‍🍳</span>
              <span>Partner Portal</span>
            </button>
            <button
              class="login-tab-btn ${this.currentTab === 'signup' ? 'active' : ''}"
              onclick="LoginModule.switchTab('signup')"
            >
              <span>✨</span>
              <span>Register</span>
            </button>
          </div>

          <!-- Active Session Notice if already logged in -->
          ${
            this.currentTab === 'customer' && user?.isLoggedIn
              ? `
              <div class="logged-in-profile-banner">
                <div class="logged-in-avatar">${user.avatar || '👨‍💼'}</div>
                <div style="font-weight: 800; font-size: 15px; color: #065f46;">Currently signed in as ${user.name}</div>
                <div style="font-size: 13px; color: #047857; margin-top: 2px;">${user.email}</div>
                <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">
                  <button class="btn-primary" style="padding: 6px 16px; font-size: 13px;" onclick="window.appRouter.navigate('home')">
                    Continue to Food Home
                  </button>
                  <button class="btn-secondary" style="padding: 6px 14px; font-size: 13px; color: var(--nonveg-color);" onclick="LoginModule.logoutUser()">
                    Log Out
                  </button>
                </div>
              </div>
            `
              : ''
          }

          ${
            this.currentTab === 'partner' && partnerAuth?.isLoggedIn
              ? `
              <div class="logged-in-profile-banner" style="background: #eff6ff; border-color: #bfdbfe;">
                <div class="logged-in-avatar">👨‍🍳</div>
                <div style="font-weight: 800; font-size: 15px; color: #1e40af;">Currently Active: ${partnerAuth.restaurantName || 'Partner'}</div>
                <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">${partnerAuth.email}</div>
                <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">
                  <button class="btn-primary" style="padding: 6px 16px; font-size: 13px; background: #1e293b;" onclick="window.appRouter.navigate('admin')">
                    Go to Kitchen Dashboard
                  </button>
                  <button class="btn-secondary" style="padding: 6px 14px; font-size: 13px; color: var(--nonveg-color);" onclick="LoginModule.logoutPartner()">
                    Log Out Partner
                  </button>
                </div>
              </div>
            `
              : ''
          }

          <!-- Form Area -->
          <div id="login-form-area">
            ${this.renderFormContent()}
          </div>

          <!-- Quick 1-Click Demo Credentials Pill Bar -->
          <div class="demo-credentials-card">
            <div class="demo-credentials-title">
              <span>⚡ Quick Demo Credentials</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">Click to auto-fill</span>
            </div>
            <div class="demo-pills-row">
              <button class="demo-pill-btn" onclick="LoginModule.fillDemo('customer')">
                <span>👤</span>
                <span>Foodie: <strong>aditya@eaty.in</strong></span>
              </button>
              <button class="demo-pill-btn partner" onclick="LoginModule.fillDemo('partner')">
                <span>👨‍🍳</span>
                <span>Partner: <strong>partner@meghana.in</strong></span>
              </button>
              <button class="demo-pill-btn" onclick="LoginModule.fillDemo('admin')">
                <span>👑</span>
                <span>Admin: <strong>admin@eaty.in</strong></span>
              </button>
            </div>
          </div>

          <!-- Social Login Divider (for customer & signup) -->
          ${
            this.currentTab !== 'partner'
              ? `
              <div class="login-divider">Or continue with</div>
              <div class="social-buttons-grid">
                <button class="btn-social" onclick="LoginModule.handleSocialLogin('Google')">
                  <svg class="social-logo-svg" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button class="btn-social" onclick="LoginModule.handleSocialLogin('Apple')">
                  <svg class="social-logo-svg" viewBox="0 0 170 170" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.58-7.85-11.66-14.3-5.26-8.38-9.48-18.06-12.67-29.04-3.18-10.99-4.78-21.72-4.78-32.22 0-14.88 3.68-27.17 11.04-36.87 7.36-9.7 16.7-14.7 28.02-15.01 4.78 0 10.15 1.34 16.11 4.02 5.96 2.68 9.77 4.09 11.43 4.23 1.44-.14 5.34-1.6 11.7-4.38 6.36-2.77 11.9-3.95 16.63-3.53 12.68.79 22.88 5.6 30.6 14.42-11.04 6.72-16.42 16.14-16.13 28.27.29 9.69 4.05 17.65 11.29 23.88 7.23 6.22 15.82 9.7 25.76 10.45-2.09 6.25-4.66 12.56-7.73 18.94zM119.22 33.15c0-7.22 2.6-13.9 7.8-20.05 5.2-6.14 11.75-10.4 19.65-12.77-.38 2.02-.57 3.86-.57 5.51 0 7.23-2.67 14.07-8.02 20.52-5.35 6.45-12.01 10.68-19.98 12.69-.38-2.02-.58-3.86-.58-5.51z"/>
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>
            `
              : ''
          }

          <!-- Footer Switch -->
          <div class="login-footer-switch">
            ${
              this.currentTab === 'signup'
                ? `Already have an account? <a onclick="LoginModule.switchTab('customer')">Sign in here</a>`
                : this.currentTab === 'partner'
                ? `Hungry customer? <a onclick="LoginModule.switchTab('customer')">Switch to Foodie Login</a>`
                : `New to Eaty? <a onclick="LoginModule.switchTab('signup')">Create an account</a>`
            }
          </div>

          <!-- Security Badge -->
          <div class="login-security-badge">
            <span>🔒</span>
            <span>256-bit Secure Encryption • Zero Spam Policy</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Switch active role tab
   */
  switchTab(tab) {
    this.currentTab = tab;
    this.renderLoginView();
  },

  /**
   * Render HTML for the current form tab
   */
  renderFormContent() {
    if (this.currentTab === 'partner') {
      return this.renderPartnerLoginForm();
    } else if (this.currentTab === 'signup') {
      return this.renderSignUpForm();
    }
    return this.renderCustomerLoginForm();
  },

  /**
   * Customer / Foodie Login Form (Mail ID + Password)
   */
  renderCustomerLoginForm() {
    return `
      <form class="login-form" onsubmit="LoginModule.handleCustomerLogin(event)">
        <!-- Mail ID / Email Field -->
        <div class="login-field-group">
          <label class="login-label" for="login-email">
            <span>Mail ID / Email Address</span>
          </label>
          <div class="login-input-wrap">
            <span class="login-input-icon">✉️</span>
            <input
              type="email"
              id="login-email"
              class="login-input"
              placeholder="e.g. aditya.sharma@example.com"
              required
              autocomplete="email"
              value="aditya.sharma@example.com"
            />
          </div>
        </div>

        <!-- Password Field with Show/Hide Toggle -->
        <div class="login-field-group">
          <label class="login-label" for="login-password">
            <span>Password</span>
            <a class="login-forgot-link" onclick="LoginModule.openForgotPasswordModal()">Forgot Password?</a>
          </label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🔒</span>
            <input
              type="password"
              id="login-password"
              class="login-input"
              placeholder="Enter your account password"
              required
              autocomplete="current-password"
              value="EatyFoodie2026!"
            />
            <button
              type="button"
              class="password-toggle-btn"
              title="Show or hide password"
              onclick="LoginModule.togglePasswordVisibility('login-password', this)"
            >
              👁️
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="login-options-row">
          <label class="login-checkbox-label">
            <input type="checkbox" id="login-remember-me" checked />
            <span>Keep me signed in</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login-submit" id="btn-customer-submit">
          <span>Sign In to Eaty</span>
          <span>➔</span>
        </button>
      </form>
    `;
  },

  /**
   * Restaurant Partner / Kitchen Admin Login Form (Mail ID + Password + Restaurant Selection)
   */
  renderPartnerLoginForm() {
    const restaurants = window.eatyState.get('restaurants') || [];

    return `
      <form class="login-form" onsubmit="LoginModule.handlePartnerLogin(event)">
        <!-- Mail ID / Email Field -->
        <div class="login-field-group">
          <label class="login-label" for="partner-email">
            <span>Partner Mail ID</span>
          </label>
          <div class="login-input-wrap">
            <span class="login-input-icon">✉️</span>
            <input
              type="email"
              id="partner-email"
              class="login-input partner-focus"
              placeholder="e.g. partner@meghana.in"
              required
              autocomplete="email"
              value="partner@meghana.in"
            />
          </div>
        </div>

        <!-- Restaurant Selector -->
        <div class="login-field-group">
          <label class="login-label" for="partner-restaurant-select">
            <span>Select Associated Restaurant</span>
          </label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🏬</span>
            <select id="partner-restaurant-select" class="login-input partner-focus" style="cursor: pointer;">
              ${restaurants
                .map(
                  r => `
                <option value="${r.id}" ${r.id === 'rest-1' ? 'selected' : ''}>
                  ${r.name} (${r.isOpen ? '🟢 Open' : '🔴 Closed'})
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        </div>

        <!-- Password Field with Show/Hide Toggle -->
        <div class="login-field-group">
          <label class="login-label" for="partner-password">
            <span>Partner Security Key / Password</span>
            <a class="login-forgot-link" onclick="LoginModule.openForgotPasswordModal('partner')">Reset Key</a>
          </label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🔑</span>
            <input
              type="password"
              id="partner-password"
              class="login-input partner-focus"
              placeholder="Enter partner security password"
              required
              autocomplete="current-password"
              value="MeghanaPartner2026!"
            />
            <button
              type="button"
              class="password-toggle-btn"
              title="Show or hide password"
              onclick="LoginModule.togglePasswordVisibility('partner-password', this)"
            >
              👁️
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="login-options-row">
          <label class="login-checkbox-label">
            <input type="checkbox" id="partner-remember-me" checked />
            <span>Remember kitchen device</span>
          </label>
          <span style="font-size: 11px; color: var(--text-muted);">Admin &amp; Kitchen Access</span>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login-submit btn-login-partner" id="btn-partner-submit">
          <span>👨‍🍳 Enter Partner Dashboard</span>
          <span>➔</span>
        </button>
      </form>
    `;
  },

  /**
   * Customer Registration / Sign Up Form
   */
  renderSignUpForm() {
    return `
      <form class="login-form" onsubmit="LoginModule.handleSignUp(event)">
        <!-- Full Name -->
        <div class="login-field-group">
          <label class="login-label" for="signup-name">Full Name</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">👤</span>
            <input
              type="text"
              id="signup-name"
              class="login-input"
              placeholder="e.g. Priya Venkatesh"
              required
            />
          </div>
        </div>

        <!-- Mail ID / Email -->
        <div class="login-field-group">
          <label class="login-label" for="signup-email">Mail ID / Email Address</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">✉️</span>
            <input
              type="email"
              id="signup-email"
              class="login-input"
              placeholder="e.g. priya.v@example.com"
              required
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div class="login-field-group">
          <label class="login-label" for="signup-phone">Mobile Number</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">📱</span>
            <input
              type="tel"
              id="signup-phone"
              class="login-input"
              placeholder="98765 43210"
              pattern="[0-9]{10}"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="login-field-group">
          <label class="login-label" for="signup-password">Create Password</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🔒</span>
            <input
              type="password"
              id="signup-password"
              class="login-input"
              placeholder="At least 6 characters"
              minlength="6"
              required
            />
            <button
              type="button"
              class="password-toggle-btn"
              title="Show or hide password"
              onclick="LoginModule.togglePasswordVisibility('signup-password', this)"
            >
              👁️
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="login-field-group">
          <label class="login-label" for="signup-confirm-password">Confirm Password</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🔒</span>
            <input
              type="password"
              id="signup-confirm-password"
              class="login-input"
              placeholder="Re-enter password"
              minlength="6"
              required
            />
            <button
              type="button"
              class="password-toggle-btn"
              title="Show or hide password"
              onclick="LoginModule.togglePasswordVisibility('signup-confirm-password', this)"
            >
              👁️
            </button>
          </div>
        </div>

        <!-- Terms checkbox -->
        <div class="login-options-row">
          <label class="login-checkbox-label" style="font-size: 12px;">
            <input type="checkbox" id="signup-terms" required checked />
            <span>I agree to Eaty's Terms of Service &amp; Privacy Policy</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login-submit" id="btn-signup-submit">
          <span>Create Account &amp; Start Ordering</span>
          <span>✨</span>
        </button>
      </form>
    `;
  },

  /**
   * Interactive Show / Hide Password toggle
   */
  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.innerHTML = '🙈';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.innerHTML = '👁️';
    }
  },

  /**
   * Fill demo credentials quickly
   */
  fillDemo(role) {
    if (role === 'customer') {
      this.currentTab = 'customer';
      this.renderLoginView();
      const emailEl = document.getElementById('login-email');
      const passEl = document.getElementById('login-password');
      if (emailEl && passEl) {
        emailEl.value = 'aditya.sharma@example.com';
        passEl.value = 'EatyFoodie2026!';
        window.soundEffects.playPop();
        window.UI.toast('Filled Demo Customer credentials!', 'info');
      }
    } else if (role === 'partner') {
      this.currentTab = 'partner';
      this.renderLoginView();
      const emailEl = document.getElementById('partner-email');
      const passEl = document.getElementById('partner-password');
      if (emailEl && passEl) {
        emailEl.value = 'partner@meghana.in';
        passEl.value = 'MeghanaPartner2026!';
        window.soundEffects.playPop();
        window.UI.toast('Filled Demo Restaurant Partner credentials!', 'info');
      }
    } else if (role === 'admin') {
      this.currentTab = 'partner';
      this.renderLoginView();
      const emailEl = document.getElementById('partner-email');
      const passEl = document.getElementById('partner-password');
      if (emailEl && passEl) {
        emailEl.value = 'admin@eaty.in';
        passEl.value = 'EatyAdmin2026!';
        window.soundEffects.playPop();
        window.UI.toast('Filled Master Admin credentials!', 'info');
      }
    }
  },

  /**
   * Handle Customer Login with Mail ID & Password
   */
  handleCustomerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !this.isValidEmail(email)) {
      window.UI.toast('Please enter a valid Mail ID / Email address', 'warning');
      return;
    }

    if (!password || password.length < 4) {
      window.UI.toast('Please enter a valid password', 'warning');
      return;
    }

    // Authenticate customer in central state
    const userName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    window.eatyState.loginCustomer({
      email,
      name: userName || 'Foodie Customer',
    });

    window.soundEffects.playSuccess();
    window.UI.toast(`Welcome back, ${userName}! Signed in successfully.`, 'success');
    window.UI.closeModal();

    // Redirect to home
    window.appRouter.navigate('home');
  },

  /**
   * Handle Restaurant Partner Login with Mail ID & Password
   */
  handlePartnerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('partner-email')?.value.trim();
    const password = document.getElementById('partner-password')?.value;
    const restSelect = document.getElementById('partner-restaurant-select');
    const restaurantId = restSelect ? restSelect.value : 'rest-1';

    if (!email || !this.isValidEmail(email)) {
      window.UI.toast('Please enter a valid partner Mail ID', 'warning');
      return;
    }

    if (!password || password.length < 4) {
      window.UI.toast('Please enter a valid partner password', 'warning');
      return;
    }

    const restaurants = window.eatyState.get('restaurants') || [];
    const matchedRest = restaurants.find(r => r.id === restaurantId) || restaurants[0];

    window.eatyState.loginPartner({
      email,
      restaurantId: matchedRest.id,
      restaurantName: matchedRest.name,
      role: email.includes('admin') ? 'admin' : 'partner',
    });

    window.soundEffects.playSuccess();
    window.UI.toast(`Logged in to ${matchedRest.name} Partner Portal!`, 'success');
    window.UI.closeModal();

    // Redirect to Partner Portal
    if (window.AdminModule) {
      window.AdminModule.selectedRestaurantId = matchedRest.id;
    }
    window.appRouter.navigate('admin');
  },

  /**
   * Handle New User Sign Up
   */
  handleSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const phone = document.getElementById('signup-phone')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;

    if (!name) {
      window.UI.toast('Please enter your full name', 'warning');
      return;
    }

    if (!email || !this.isValidEmail(email)) {
      window.UI.toast('Please enter a valid Mail ID', 'warning');
      return;
    }

    if (!phone || phone.length < 10) {
      window.UI.toast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    if (!password || password.length < 6) {
      window.UI.toast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      window.UI.toast('Passwords do not match! Please check and re-enter.', 'error');
      return;
    }

    window.eatyState.registerCustomer({
      name,
      email,
      phone: `+91 ${phone}`,
    });

    window.soundEffects.playSuccess();
    window.UI.toast(`Account created! Welcome to Eaty, ${name}!`, 'success');
    window.UI.closeModal();

    window.appRouter.navigate('home');
  },

  /**
   * Forgot Password Modal
   */
  openForgotPasswordModal(type = 'customer') {
    const isPartner = type === 'partner';
    const modalHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 6px;">🔑</div>
          <h3 style="font-size: 18px; font-weight: 800;">Reset Your Password</h3>
          <p style="font-size: 13px; color: var(--text-sub); margin-top: 4px;">
            Enter the Mail ID associated with your ${isPartner ? 'Partner' : 'Foodie'} account and we will send you a password reset link.
          </p>
        </div>

        <div class="login-field-group">
          <label class="login-label">Registered Mail ID</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">✉️</span>
            <input
              type="email"
              id="reset-mail-id"
              class="login-input"
              placeholder="e.g. aditya.sharma@example.com"
              value="${isPartner ? 'partner@meghana.in' : 'aditya.sharma@example.com'}"
              required
            />
          </div>
        </div>

        <button
          class="btn-primary"
          style="justify-content: center; width: 100%;"
          onclick="LoginModule.sendPasswordResetLink()"
        >
          Send Reset Link (Demo)
        </button>
      </div>
    `;

    window.UI.openModal('Password Recovery', modalHtml);
  },

  sendPasswordResetLink() {
    const email = document.getElementById('reset-mail-id')?.value.trim();
    if (!email || !this.isValidEmail(email)) {
      window.UI.toast('Please enter a valid Mail ID', 'warning');
      return;
    }

    window.UI.closeModal();
    window.soundEffects.playSuccess();
    window.UI.toast(`Password reset instructions sent to ${email}! (Demo Mode)`, 'success', 4000);
  },

  /**
   * Simulated Social Login
   */
  handleSocialLogin(provider) {
    const name = provider === 'Google' ? 'Google User' : 'Apple User';
    const email = provider === 'Google' ? 'user.google@gmail.com' : 'user.apple@icloud.com';

    window.eatyState.loginCustomer({
      name,
      email,
    });

    window.soundEffects.playSuccess();
    window.UI.toast(`Successfully connected with ${provider}! Welcome, ${name}.`, 'success');
    window.UI.closeModal();
    window.appRouter.navigate('home');
  },

  /**
   * Log out active customer
   */
  logoutUser() {
    window.eatyState.logoutCustomer();
    window.soundEffects.playPop();
    window.UI.toast('You have been logged out of your customer account', 'info');
    this.renderLoginView();
  },

  /**
   * Log out partner
   */
  logoutPartner() {
    window.eatyState.logoutPartner();
    window.soundEffects.playPop();
    window.UI.toast('Partner logged out successfully', 'info');
    this.renderLoginView();
  },

  /**
   * Open Login Portal in Modal sheet
   */
  openLoginModal(defaultTab = 'customer') {
    this.currentTab = defaultTab;
    const modalContent = `
      <div style="padding: 4px 0;">
        <div class="login-tabs-nav" style="margin-bottom: 20px;">
          <button
            class="login-tab-btn ${this.currentTab === 'customer' ? 'active' : ''}"
            onclick="LoginModule.switchModalTab('customer')"
          >
            <span>🍔</span>
            <span>Foodie Login</span>
          </button>
          <button
            class="login-tab-btn ${this.currentTab === 'partner' ? 'active partner-active' : ''}"
            onclick="LoginModule.switchModalTab('partner')"
          >
            <span>👨‍🍳</span>
            <span>Partner Portal</span>
          </button>
          <button
            class="login-tab-btn ${this.currentTab === 'signup' ? 'active' : ''}"
            onclick="LoginModule.switchModalTab('signup')"
          >
            <span>✨</span>
            <span>Sign Up</span>
          </button>
        </div>

        <div id="modal-login-form-area">
          ${this.renderFormContent()}
        </div>

        <div class="demo-credentials-card" style="margin-top: 18px;">
          <div class="demo-credentials-title">
            <span>⚡ Demo Credentials</span>
            <span style="font-size: 11px; color: var(--text-muted);">1-Click</span>
          </div>
          <div class="demo-pills-row">
            <button class="demo-pill-btn" onclick="LoginModule.fillDemo('customer')">
              <span>👤</span>
              <span>Foodie</span>
            </button>
            <button class="demo-pill-btn partner" onclick="LoginModule.fillDemo('partner')">
              <span>👨‍🍳</span>
              <span>Partner</span>
            </button>
          </div>
        </div>
      </div>
    `;

    window.UI.openModal('Sign In to Eaty', modalContent);
  },

  switchModalTab(tab) {
    this.currentTab = tab;
    const formArea = document.getElementById('modal-login-form-area');
    if (formArea) {
      formArea.innerHTML = this.renderFormContent();
    }
  },

  /**
   * Helper: Email validator
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
};

window.LoginModule = LoginModule;
