/* =============================================================
   MERCH — product grid with direct "Buy" buttons.
   Each product links straight to its own Stripe Payment Link
   (a one-time purchase), set in js/config.js under checkoutLinks.
   Until a link is set, the button shows a friendly "coming soon".
   ============================================================= */

const BUY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

/* Normalize a product's photos to an array (supports old single "image"). */
function productImages(p) {
  if (Array.isArray(p.images) && p.images.length) return p.images;
  if (p.image) return [p.image];
  return [];
}

/* ---------- Render products grid (merch page) ---------- */
function renderProducts() {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const link = getCheckoutLink(p.linkKey);
    const btnAttrs = link ? `href="${link}"` : `href="#" data-buy="${p.name}"`;
    const imgs = productImages(p);
    const multi = imgs.length > 1;
    const slides = imgs.map(src => `<img src="${src}" alt="${p.name}" loading="lazy">`).join("");
    const arrows = multi
      ? `<button class="car-nav prev" data-dir="-1" aria-label="Previous photo">‹</button>
         <button class="car-nav next" data-dir="1" aria-label="Next photo">›</button>`
      : "";
    const dots = multi
      ? `<div class="dots">${imgs.map((_, i) => `<button class="dot${i === 0 ? " active" : ""}" data-go="${i}" aria-label="Photo ${i + 1}"></button>`).join("")}</div>`
      : "";
    return `
    <div class="product">
      <div class="ph">
        <div class="carousel" data-carousel>
          <div class="slides">${slides}</div>
          ${arrows}
          ${dots}
        </div>
      </div>
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

  initCarousels(grid);
}

/* ---------- Image carousels (loop: product → models → back) ---------- */
function initCarousels(scope) {
  scope.querySelectorAll("[data-carousel]").forEach(car => {
    const slides = car.querySelector(".slides");
    const total = slides.children.length;
    if (total <= 1) return;
    const dots = car.querySelectorAll(".dot");
    let idx = 0, timer = null;

    const go = i => {
      idx = (i + total) % total;
      slides.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === idx));
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { stop(); timer = setInterval(() => go(idx + 1), 4000); };

    car.querySelectorAll(".dot").forEach(d =>
      d.addEventListener("click", () => { go(+d.dataset.go); start(); }));
    car.querySelectorAll(".car-nav").forEach(b =>
      b.addEventListener("click", () => { go(idx + (+b.dataset.dir)); start(); }));
    car.addEventListener("mouseenter", stop);
    car.addEventListener("mouseleave", start);

    // swipe on touch
    let x0 = null;
    car.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    car.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null; start();
    });

    start();
  });
}

document.addEventListener("DOMContentLoaded", renderProducts);
