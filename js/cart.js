/* =============================================================
   CART — merch products, add to cart, drawer, checkout
   State is kept in localStorage so it survives page changes.
   ============================================================= */

const CART_KEY = "tpcs_cart";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
  updateCartCount();
}
function productById(id) { return PRODUCTS.find(p => p.id === id); }

function addToCart(id) {
  const cart = loadCart();
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  const p = productById(id);
  showToast(`${p ? p.name : "Item"} added to cart`);
  openDrawer();
}
function setQty(id, qty) {
  const cart = loadCart();
  if (qty <= 0) delete cart[id]; else cart[id] = qty;
  saveCart(cart);
}

function cartCount() {
  const cart = loadCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}
function cartTotal() {
  const cart = loadCart();
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = productById(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? "grid" : "none";
  });
}

/* ---------- Render products grid (merch page) ---------- */
function renderProducts() {
  const grid = document.getElementById("products");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product">
      <div class="ph"><img src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="row">
          <span class="pp">$${p.price.toFixed(2)}</span>
          <button class="btn btn-gold" data-add="${p.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>`).join("");

  grid.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", () => addToCart(btn.dataset.add))
  );
}

/* ---------- Drawer ---------- */
function openDrawer() {
  document.querySelector(".drawer")?.classList.add("open");
  document.querySelector(".drawer-overlay")?.classList.add("open");
}
function closeDrawer() {
  document.querySelector(".drawer")?.classList.remove("open");
  document.querySelector(".drawer-overlay")?.classList.remove("open");
}

function renderCart() {
  const items = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!items) return;
  const cart = loadCart();
  const ids = Object.keys(cart);

  if (!ids.length) {
    items.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Grab a hat and rep the Show.</div>`;
  } else {
    items.innerHTML = ids.map(id => {
      const p = productById(id); if (!p) return "";
      const qty = cart[id];
      return `
        <div class="cart-line">
          <img src="${p.image}" alt="${p.name}">
          <div class="cl-info">
            <div class="nm">${p.name}</div>
            <div class="pr">$${p.price.toFixed(2)}</div>
            <div class="qty">
              <button data-dec="${id}">−</button>
              <span>${qty}</span>
              <button data-inc="${id}">+</button>
            </div>
          </div>
          <button class="cl-remove" data-rm="${id}">Remove</button>
        </div>`;
    }).join("");
  }
  if (totalEl) totalEl.textContent = "$" + cartTotal().toFixed(2);

  items.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => setQty(b.dataset.inc, (loadCart()[b.dataset.inc] || 0) + 1));
  items.querySelectorAll("[data-dec]").forEach(b => b.onclick = () => setQty(b.dataset.dec, (loadCart()[b.dataset.dec] || 0) - 1));
  items.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => setQty(b.dataset.rm, 0));
}

function checkout() {
  if (cartCount() === 0) { showToast("Your cart is empty."); return; }
  const link = getCheckoutLink("cartCheckout");
  if (link) {
    window.location.href = link;   // Stripe / GHL checkout
  } else {
    showToast("Secure checkout is opening soon. Email us to order today!");
  }
}

/* ---------- Wire up shared cart UI on every page ---------- */
function initCart() {
  document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", openDrawer));
  document.querySelector(".drawer-close")?.addEventListener("click", closeDrawer);
  document.querySelector(".drawer-overlay")?.addEventListener("click", closeDrawer);
  document.getElementById("checkout-btn")?.addEventListener("click", checkout);
  renderProducts();
  renderCart();
  updateCartCount();
}

document.addEventListener("DOMContentLoaded", initCart);
