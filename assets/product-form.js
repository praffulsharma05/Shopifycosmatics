if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        const variantId = formData.get('id');
        const quantity = parseInt(formData.get('quantity')) || 1;
        const MAX_ALLOWED = 5;

        const checkCartPromise = typeof CartItems !== 'undefined' && CartItems.fetchCartData
          ? CartItems.fetchCartData()
          : fetch(`${routes.cart_url}.json`).then((res) => res.json()).catch(() => null);

        checkCartPromise
          .then((cartData) => {
            let currentCartQty = 0;
            if (cartData && cartData.items) {
              const existingItem = cartData.items.find((item) => item.id == variantId || item.variant_id == variantId);
              if (existingItem) {
                currentCartQty = existingItem.quantity;
              }
            }

            if (currentCartQty + quantity > MAX_ALLOWED) {
              const remainingAllowed = MAX_ALLOWED - currentCartQty;
              let errorMsg = '';
              if (remainingAllowed <= 0) {
                errorMsg = `You already have ${currentCartQty} unit(s) of this item in your cart. Maximum limit allowed is ${MAX_ALLOWED} of the same item.`;
              } else {
                errorMsg = `You already have ${currentCartQty} unit(s) of this item in your cart. You can only add up to ${remainingAllowed} more (maximum ${MAX_ALLOWED} allowed).`;
              }

              this.handleErrorMessage(errorMsg);
              this.dispatchCartErrorEvent(errorMsg, 'INVALID');
              return Promise.reject({ isValidationError: true });
            }

            const linesUpdateDeferred = this.createCartLinesUpdateEvent(variantId, quantity);

            return fetch(`${routes.cart_add_url}`, config)
              .then((response) => response.json())
              .then((response) => {
                if (response.status) {
                  publish(PUB_SUB_EVENTS.cartError, {
                    source: 'product-form',
                    productVariantId: variantId,
                    errors: response.errors || response.description,
                    message: response.message,
                  });
                  this.handleErrorMessage(response.description);
                  this.dispatchCartErrorEvent(response.description || response.message, 'INVALID');
                  linesUpdateDeferred?.reject(new Error(response.description || response.message));

                  const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
                  if (!soldOutMessage) return;
                  this.submitButton.setAttribute('aria-disabled', true);
                  this.submitButtonText.classList.add('hidden');
                  soldOutMessage.classList.remove('hidden');
                  this.error = true;
                  return;
                } else if (!this.cart) {
                  this.resolveCartLinesUpdate(linesUpdateDeferred);
                  window.location = window.routes.cart_url;
                  return;
                }

                this.resolveCartLinesUpdate(linesUpdateDeferred);

                const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
                if (!this.error)
                  publish(PUB_SUB_EVENTS.cartUpdate, {
                    source: 'product-form',
                    productVariantId: variantId,
                    cartData: response,
                  }).then(() => {
                    CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
                  });
                this.error = false;
                const quickAddModal = this.closest('quick-add-modal');
                if (quickAddModal) {
                  document.body.addEventListener(
                    'modalClosed',
                    () => {
                      setTimeout(() => {
                        CartPerformance.measure("add:paint-updated-sections", () => {
                          this.cart.renderContents(response);
                        });
                      });
                    },
                    { once: true }
                  );
                  quickAddModal.hide(true);
                } else {
                  CartPerformance.measure("add:paint-updated-sections", () => {
                    this.cart.renderContents(response);
                  });
                }
              });
          })
          .catch((e) => {
            if (e && e.isValidationError) return;
            console.error(e);
            this.dispatchCartErrorEvent(e.message || 'Network error', 'SERVICE_UNAVAILABLE');
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      createCartLinesUpdateEvent(variantId, quantity) {
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return null;

        const deferred = CartLinesUpdateEvent.createPromise();
        this.dispatchEvent(
          new CartLinesUpdateEvent({
            action: 'add',
            context: 'product',
            lines: [{ merchandiseId: variantId, quantity }],
            promise: deferred.promise,
          })
        );
        return deferred;
      }

      resolveCartLinesUpdate(deferred) {
        if (!deferred) return;
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return;

        const pendingCartDataPromise = typeof CartItems !== 'undefined'
          ? CartItems.fetchCartData()
          : fetch(`${routes.cart_url}.json`).then((response) => response.json());

        pendingCartDataPromise
          .then((cart) => {
            if (!cart?.currency) return deferred.reject(new Error('Missing currency in cart response'));
            deferred.resolve({ cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart) });
          })
          .catch((e) => deferred.reject(e));
      }

      dispatchCartErrorEvent(message, code) {
        const { CartErrorEvent } = window.StandardEvents || {};
        if (!CartErrorEvent) return;
        this.dispatchEvent(new CartErrorEvent({ error: message, code }));
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
