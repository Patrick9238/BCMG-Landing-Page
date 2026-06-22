/* =============================================================
   MERCH — product grid with direct "Buy" buttons.
   Each product links straight to its own Stripe Payment Link
   (a one-time purchase), set in js/config.js under checkoutLinks.
   Until a link is set, the button shows a friendly "coming soon".
   ============================================================= */

const BUY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

/* ---------- Render products grid (merch page) ---------- */
function renderProducts() {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const link = getCheckoutLink(p.linkKey);
    const btnAttrs = link ? `href="${link}"` : `href="#" data-buy="${p.name}"`;
    return `
    <div class="product">
      <div class="ph"><img src="${p.image}" alt="${p.name}"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="row">
          <span class="pp">$${p.price.toFixed(2)}</span>
          <a class="btn btn-gold" ${btnAttrs}>${BUY_ICON} Buy Now</a>
        </div>
      </div>
    </div>`;
  }).join("");

  // Products without a configured link: gentle "coming soon" notice
  grid.querySelectorAll("a[data-buy]").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      showToast(`Checkout for the ${a.dataset.buy} is opening soon — email us to order today.`);
    })
  );
}

document.addEventListener("DOMContentLoaded", renderProducts);
