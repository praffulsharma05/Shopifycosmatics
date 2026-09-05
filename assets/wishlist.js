(function() {
  const DB_APP_KEY = 'dhu8fqh1';
  const DB_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';
  let isDbSynced = false;

  function getWishlistKey() {
    const customerId = window.customerId;
    return customerId ? `shopify-wishlist-${customerId}` : null;
  }

  function getWishlist() {
    const key = getWishlistKey();
    if (!key) return [];
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function setWishlist(wishlist) {
    const key = getWishlistKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(wishlist));
  }

  async function syncWithDb() {
    const customerId = window.customerId;
    if (!customerId) {
      isDbSynced = true;
      return;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;

    try {
      const fetchOptions = controller ? { signal: controller.signal } : {};
      const response = await fetch(`${DB_BASE_URL}/GetValue/${DB_APP_KEY}/shopify-wishlist-${customerId}`, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Network response not ok');
      const text = await response.text();
      let dbWishlist = [];
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed !== 'none' && parsed !== '') {
          dbWishlist = parsed.split(',').map(h => h.trim()).filter(h => h.length > 0);
        }
      } catch (e) {
        if (text && text !== 'none' && text !== '""') {
          const cleanText = text.replace(/^"|"$/g, '');
          if (cleanText && cleanText !== 'none') {
            dbWishlist = cleanText.split(',').map(h => h.trim()).filter(h => h.length > 0);
          }
        }
      }

      // Save to localStorage
      const key = getWishlistKey();
      if (key && dbWishlist.length > 0) {
        localStorage.setItem(key, JSON.stringify(dbWishlist));
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      // Fail silently without blocking UI
    } finally {
      isDbSynced = true;
      // Update UI counts and button states with synced data
      updateHeaderCount();
      
      const wishlist = getWishlist();
      wishlist.forEach(handle => {
        updateCardButtonsState(handle, true);
      });

      // Render items on the wishlist page
      if (window.location.pathname.includes('/pages/wishlist')) {
        initWishlistPage();
      }
    }
  }

  function updateHeaderCount() {
    const wishlist = getWishlist();
    const count = wishlist.length;

    // Toggle active class on header wishlist icon
    const headerWishlistIcon = document.getElementById('wishlist-icon-bubble');
    if (headerWishlistIcon) {
      if (count > 0) {
        headerWishlistIcon.classList.add('active');
      } else {
        headerWishlistIcon.classList.remove('active');
      }
    }

    // Desktop Count Bubble
    const countBubble = document.querySelector('#wishlist-icon-bubble .wishlist-count-bubble');
    const countVal = document.getElementById('wishlist-count-val');
    if (countBubble && countVal) {
      countVal.textContent = count;
      if (count > 0) {
        countBubble.style.display = 'flex';
      } else {
        countBubble.style.display = 'none';
      }
    }

    // Mobile Drawer Count Bubble
    const mobileBubble = document.getElementById('wishlist-count-bubble-mobile');
    const mobileCountVal = document.getElementById('wishlist-count-val-mobile');
    if (mobileBubble && mobileCountVal) {
      mobileCountVal.textContent = count;
      if (count > 0) {
        mobileBubble.style.display = 'flex';
      } else {
        mobileBubble.style.display = 'none';
      }
    }
  }

  function updateCardButtonsState(handle, isActive) {
    const buttons = document.querySelectorAll(`.button-wishlist-icon[data-product-handle="${handle}"]`);
    buttons.forEach(button => {
      if (isActive) {
        button.classList.add('active');
        button.setAttribute('aria-label', 'Remove from wishlist');
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-label', 'Add to wishlist');
      }
    });
  }

  function showToast(title, img, isActive) {
    let container = document.getElementById('wishlist-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'wishlist-toast-container';
      container.className = 'wishlist-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'wishlist-toast';

    const iconClass = isActive ? 'wishlist-toast__icon--add' : 'wishlist-toast__icon--remove';
    const messageText = isActive ? 'Added to wishlist' : 'Removed from wishlist';
    
    const svgIcon = isActive 
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1.2rem;height:1.2rem;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2rem;height:1.2rem;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    let imgHtml = '';
    if (img) {
      imgHtml = `<img src="${img}" alt="${title}" class="wishlist-toast__image">`;
    }

    toast.innerHTML = `
      ${imgHtml}
      <div class="wishlist-toast__content">
        <p class="wishlist-toast__title">${title}</p>
        <p class="wishlist-toast__message">${messageText}</p>
      </div>
      <div class="wishlist-toast__icon ${iconClass}">
        ${svgIcon}
      </div>
      <div class="wishlist-toast__progress" style="background: ${isActive ? '#ff4d4f' : 'rgba(var(--color-foreground), 0.3)'}"></div>
    `;

    container.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  }

  function toggleWishlist(handle) {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(handle);
    let isActive = false;

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(handle);
      isActive = true;
    }

    setWishlist(wishlist);
    updateHeaderCount();
    updateCardButtonsState(handle, isActive);
    
    // Sync update to the DB in the background
    const customerId = window.customerId;
    if (customerId) {
      const val = wishlist.length > 0 ? wishlist.join(',') : 'none';
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      fetch(`${DB_BASE_URL}/UpdateValue/${DB_APP_KEY}/shopify-wishlist-${customerId}/${encodeURIComponent(val)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: '1',
        keepalive: true,
        signal: controller ? controller.signal : undefined
      })
      .then(() => { if (timeoutId) clearTimeout(timeoutId); })
      .catch(err => { if (timeoutId) clearTimeout(timeoutId); });
    }

    // Dispatch a custom event to notify other scripts
    document.dispatchEvent(new CustomEvent('wishlist:updated', {
      detail: { handle, isActive, wishlist }
    }));

    return isActive;
  }

  // Helper to handle card removal on wishlist page
  function handlePageRemoval(button, isActive) {
    if (!isActive && window.location.pathname.includes('/pages/wishlist')) {
      const gridItem = button.closest('.grid__item') || button.closest('li');
      if (gridItem) {
        gridItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        gridItem.style.opacity = '0';
        gridItem.style.transform = 'scale(0.85)';
        setTimeout(() => {
          gridItem.remove();
          const currentWishlist = getWishlist();
          if (currentWishlist.length === 0) {
            const grid = document.getElementById('wishlist-grid');
            const empty = document.getElementById('wishlist-empty');
            if (grid) grid.classList.add('hidden');
            if (empty) empty.classList.remove('hidden');
          }
        }, 300);
      }
    }
  }

  // Warning Modal for Unauthenticated Users
  function showAuthWarningModal() {
    let modal = document.getElementById('wishlist-auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wishlist-auth-modal';
      modal.className = 'wishlist-modal';
      modal.innerHTML = `
        <div class="wishlist-modal__overlay"></div>
        <div class="wishlist-modal__content">
          <div class="wishlist-modal__close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 2rem; height: 2rem;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <div class="wishlist-modal__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 4.8rem; height: 4.8rem; color: #e5a93b;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3 class="h3" style="margin-top: 1rem; margin-bottom: 1rem;">Sign in required</h3>
          <p style="margin-top: 0; margin-bottom: 2.5rem; color: rgba(var(--color-foreground), 0.6); font-size: 1.4rem; line-height: 1.4;">
            Please sign in or create an account to save items to your wishlist.
          </p>
          <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
            <a href="/account/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}" class="button button--primary" style="text-decoration: none; text-align: center; width: 100%;">
              Sign In
            </a>
            <a href="/account/login?return_to=${encodeURIComponent(window.location.pathname + window.location.search)}" class="button button--secondary" style="text-decoration: none; text-align: center; width: 100%;">
              Create Account
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      if (!document.getElementById('wishlist-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'wishlist-modal-styles';
        style.innerHTML = `
          .wishlist-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          .wishlist-modal.show {
            opacity: 1;
            pointer-events: auto;
          }
          .wishlist-modal__overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
          }
          .wishlist-modal__content {
            position: relative;
            background: rgb(var(--color-background));
            color: rgb(var(--color-foreground));
            width: 90%;
            max-width: 40rem;
            padding: 3rem 2.5rem;
            border-radius: var(--buttons-radius);
            box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.15);
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            z-index: 1;
          }
          .wishlist-modal.show .wishlist-modal__content {
            transform: scale(1);
          }
          .wishlist-modal__close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            cursor: pointer;
            color: rgba(var(--color-foreground), 0.5);
            transition: color 0.2s ease;
          }
          .wishlist-modal__close:hover {
            color: rgb(var(--color-foreground));
          }
          .wishlist-modal__icon {
            margin-bottom: 1.5rem;
            display: inline-flex;
            justify-content: center;
            align-items: center;
          }
        `;
        document.head.appendChild(style);
      }
    }

    const closeBtn = modal.querySelector('.wishlist-modal__close');
    const overlay = modal.querySelector('.wishlist-modal__overlay');

    function closeModal() {
      modal.classList.remove('show');
    }

    closeBtn.onclick = closeModal;
    overlay.onclick = closeModal;

    modal.offsetHeight; 
    modal.classList.add('show');
  }

  // Shopify Flow Back in Stock tag helper (100% Free & Native)
  async function tagCustomerForFlow(productHandle) {
    const email = window.customerEmail;
    if (!email) return;

    try {
      const response = await fetch(`/products/${productHandle}.js`);
      if (!response.ok) return;
      const product = await response.json();
      
      const firstVariant = product.variants[0];
      if (firstVariant && !firstVariant.available) {
        const variantId = firstVariant.id;
        
        // Submit a silent background newsletter form to tag the customer profile
        const formData = new URLSearchParams();
        formData.append('form_type', 'customer');
        formData.append('utf8', '✓');
        formData.append('contact[email]', email);
        formData.append('contact[tags]', `wishlist_${variantId}`);

        await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
        console.log(`Tagged customer with wishlist_${variantId}`);
      }
    } catch (err) {
      console.error('Failed to tag customer for Shopify Flow:', err);
    }
  }

  // Event Delegation for Wishlist Buttons click
  document.addEventListener('click', function(e) {
    const button = e.target.closest('.button-wishlist-icon');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    // Guest validation: Do not allow selecting/adding until signed up/logged in
    if (!window.customerId) {
      showAuthWarningModal();
      return;
    }

    const handle = button.getAttribute('data-product-handle');
    if (!handle) return;

    const title = button.getAttribute('data-product-title') || 'Product';
    const img = button.getAttribute('data-product-image') || '';

    const isActive = toggleWishlist(handle);
    showToast(title, img, isActive);
    handlePageRemoval(button, isActive);

    // Tag customer for Shopify Flow if item is sold out
    if (isActive) {
      tagCustomerForFlow(handle);
    }
  });

  // Load wishlist products on the wishlist page
  async function initWishlistPage() {
    const grid = document.getElementById('wishlist-grid');
    const loader = document.getElementById('wishlist-loader');
    const empty = document.getElementById('wishlist-empty');

    if (!grid || !loader || !empty) return;

    // Show loading indicator until the DB sync has completed
    if (window.customerId && !isDbSynced) {
      loader.classList.remove('hidden');
      grid.classList.add('hidden');
      empty.classList.add('hidden');
      return;
    }

    const wishlist = getWishlist();

    if (wishlist.length === 0) {
      loader.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    try {
      const fetchPromises = wishlist.map(async (handle) => {
        try {
          const response = await fetch(`/products/${handle}?view=card`);
          if (!response.ok) return null;
          const html = await response.text();
          if (!html.trim() || html.includes('template-404')) return null; // Skip non-existent products
          return { handle, html };
        } catch (err) {
          console.error(`Failed to fetch card for handle: ${handle}`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      const validResults = results.filter(item => item !== null);

      if (validResults.length === 0) {
        loader.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
      }

      loader.classList.add('hidden');
      grid.innerHTML = '';

      validResults.forEach(item => {
        const li = document.createElement('li');
        li.className = 'grid__item';
        li.innerHTML = item.html;
        
        // Remove class active if it's there, then set it properly
        const cardBtn = li.querySelector('.button-wishlist-icon');
        if (cardBtn) {
          cardBtn.classList.add('active');
        }

        grid.appendChild(li);
      });

      grid.classList.remove('hidden');

      // Initialize quick add JS components if present on the new cards
      if (window.Shopify && window.Shopify.PaymentButton) {
        window.Shopify.PaymentButton.init();
      }
      
      // Hook up any event dispatching or load events for Dawn components
      document.dispatchEvent(new CustomEvent('wishlist:page-loaded'));

    } catch (error) {
      console.error('Error loading wishlist page items:', error);
      loader.classList.add('hidden');
      empty.classList.remove('hidden');
    }
  }

  // Initialize wishlist state on load
  function init() {
    updateHeaderCount();

    // Mark active hearts for items in wishlist
    const wishlist = getWishlist();
    wishlist.forEach(handle => {
      updateCardButtonsState(handle, true);
    });

    // Check if on wishlist page
    if (window.location.pathname.includes('/pages/wishlist')) {
      initWishlistPage();
    }

    // Defer sync with cloud database to idle time so it never blocks main thread rendering
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => syncWithDb(), { timeout: 2000 });
    } else {
      setTimeout(() => syncWithDb(), 500);
    }
  }

  // Listen to DOMContentLoaded and Shopify custom events (e.g. for dynamic sections)
  document.addEventListener('DOMContentLoaded', init);
  
  // Theme editor support (when theme sections reload dynamically)
  document.addEventListener('shopify:section:load', function(e) {
    const wishlist = getWishlist();
    wishlist.forEach(handle => {
      updateCardButtonsState(handle, true);
    });
  });
})();
