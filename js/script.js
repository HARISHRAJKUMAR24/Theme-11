
// ========== CART STATE ==========
let cart = [];
let activeCategory = "all";
let searchQuery = "";

// ========== VARIANT MODAL STATE ==========
let currentVariantProduct = null;
let selectedSize = "M";
let selectedColor = "Black";

const aboutImages = [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
];

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function (m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }

// ========== FILTER PRODUCTS ==========
function filterProducts() {
    const productCards = document.querySelectorAll('#productsGrid .product-card, #productsGrid .variant-product-card');
    let visibleCount = 0;
    productCards.forEach(card => {
        const category = card.getAttribute('data-category') || (card.querySelector('.text-xs.text-\\[#b48c5c\\]')?.innerText.trim() || 'gear');
        const name = (card.querySelector('.font-bold.text-base')?.innerText || '').toLowerCase();
        const matchesCategory = activeCategory === "all" || category === activeCategory;
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        if (matchesCategory && matchesSearch) { card.style.display = ''; visibleCount++; }
        else { card.style.display = 'none'; }
    });
}

function setActiveCategory(category) {
    activeCategory = category;
    document.querySelectorAll('.chip').forEach(chip => {
        const chipCat = chip.getAttribute('data-category');
        if (chipCat === category) { chip.classList.remove('bg-[#f3efea]', 'text-[#4b3621]'); chip.classList.add('bg-[#bc6c25]', 'text-white'); }
        else { chip.classList.remove('bg-[#bc6c25]', 'text-white'); chip.classList.add('bg-[#f3efea]', 'text-[#4b3621]'); }
    });
    filterProducts();
}

// ========== CART FUNCTIONS ==========
function addToCart(id, name, price, variant = null) {
    const existing = cart.find(i => i.id === id && i.variant?.size === variant?.size && i.variant?.color === variant?.color);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ id, name, price, quantity: 1, variant }); }
    updateCartUI();
    animateCartBar();
}

function updateCartUI() {
    renderCartDrawer();
    const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    document.getElementById("cartTotalPrice").innerText = `$${totalPrice.toFixed(2)}`;
    updateStickyCartBar();
}

function updateStickyCartBar() {
    const stickyBar = document.getElementById('stickyCartBar');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        stickyBar.style.display = 'flex';
        document.getElementById('stickyCartCount').innerText = totalItems;
        document.getElementById('stickyCartTotal').innerText = `$${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}`;
    } else {
        stickyBar.style.display = 'none';
    }
}

function animateCartBar() {
    const bar = document.getElementById('stickyCartBar');
    if (bar && bar.style.display === 'flex') { bar.style.transform = 'translateX(-50%) scale(1.06)'; setTimeout(() => { if (bar) bar.style.transform = 'translateX(-50%) scale(1)'; }, 150); }
}

function renderCartDrawer() {
    const container = document.getElementById("cartItemsContainer");
    if (!container) return;
    if (cart.length === 0) { container.innerHTML = `<div class="text-center text-[#af9a82] py-8">✨ Your cart is empty ✨</div>`; return; }
    container.innerHTML = cart.map(item => `
                <div class="flex justify-between items-center py-3 border-b border-[#f8f1ea]" data-cart-id="${item.id}${item.variant ? `-${item.variant.size}-${item.variant.color}` : ''}">
                    <div><p class="font-medium">${escapeHtml(item.name)}${item.variant ? `<br><small class="text-[10px] text-[#b48c5c]">${item.variant.size} / ${item.variant.color}</small>` : ''}</p><small class="text-[#b48c5c]">$${item.price.toFixed(2)} each</small></div>
                    <div class="flex items-center gap-2"><button class="cart-decr bg-[#f3efea] border-none w-7 h-7 rounded-full font-bold">−</button><span>${item.quantity}</span><button class="cart-incr bg-[#f3efea] border-none w-7 h-7 rounded-full font-bold">+</button><button class="cart-remove bg-none border-none text-xl">🗑️</button></div>
                </div>
            `).join('');

    document.querySelectorAll('.cart-incr').forEach(btn => { btn.addEventListener('click', () => { const id = btn.closest('[data-cart-id]').getAttribute('data-cart-id'); const item = cart.find(i => `${i.id}${i.variant ? `-${i.variant.size}-${i.variant.color}` : ''}` === id); if (item) { item.quantity += 1; updateCartUI(); } }); });
    document.querySelectorAll('.cart-decr').forEach(btn => { btn.addEventListener('click', () => { const id = btn.closest('[data-cart-id]').getAttribute('data-cart-id'); const idx = cart.findIndex(i => `${i.id}${i.variant ? `-${i.variant.size}-${i.variant.color}` : ''}` === id); if (idx !== -1) { if (cart[idx].quantity > 1) cart[idx].quantity -= 1; else cart.splice(idx, 1); updateCartUI(); } }); });
    document.querySelectorAll('.cart-remove').forEach(btn => { btn.addEventListener('click', () => { const id = btn.closest('[data-cart-id]').getAttribute('data-cart-id'); cart = cart.filter(i => `${i.id}${i.variant ? `-${i.variant.size}-${i.variant.color}` : ''}` !== id); updateCartUI(); }); });
}

// ========== VARIANT MODAL FUNCTIONS ==========
function openVariantModal(product) {
    currentVariantProduct = product;
    document.getElementById('modalProductTitle').innerText = product.name;
    document.getElementById('modalProductPrice').innerText = `$${product.price}`;
    document.getElementById('selectedVariantPrice').innerText = `$${product.price}`;
    document.getElementById('modalProductImage').src = product.image || "https://picsum.photos/id/29/400/300";
    document.getElementById('variantModal').classList.add('open');

    selectedSize = "M";
    selectedColor = "Black";
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('bg-[#bc6c25]', 'text-white', 'border-[#bc6c25]');
        btn.classList.add('bg-white', 'text-[#2c241a]', 'border-[#e8e2db]');
        if (btn.getAttribute('data-size') === 'M') {
            btn.classList.remove('bg-white', 'text-[#2c241a]', 'border-[#e8e2db]');
            btn.classList.add('bg-[#bc6c25]', 'text-white', 'border-[#bc6c25]');
        }
    });
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('border-[#bc6c25]', 'ring-2', 'ring-[#bc6c25]/50');
        if (btn.getAttribute('data-color') === 'Black') {
            btn.classList.add('border-[#bc6c25]', 'ring-2', 'ring-[#bc6c25]/50');
        }
    });
    document.getElementById('selectedColorText').innerText = 'Selected: Black';
}

function closeVariantModal() { document.getElementById('variantModal').classList.remove('open'); }

function addVariantToCart() {
    if (currentVariantProduct) {
        const variant = { size: selectedSize, color: selectedColor };
        const id = `${currentVariantProduct.name}_${selectedSize}_${selectedColor}`;
        addToCart(id, currentVariantProduct.name, currentVariantProduct.price, variant);
        closeVariantModal();
    }
}

// ========== SLIDER INITIALIZATION ==========
function initSliders() {
    const heroSlides = document.querySelectorAll('#slider .slide');
    if (heroSlides.length) {
        let idx = 0, interval;
        function showHero(i) { heroSlides.forEach((s, j) => { if (j === i) { s.classList.remove('opacity-0'); s.classList.add('opacity-100', 'z-10'); } else { s.classList.remove('opacity-100', 'z-10'); s.classList.add('opacity-0'); } }); idx = i; }
        function nextHero() { showHero((idx + 1) % heroSlides.length); }
        function startHero() { if (interval) clearInterval(interval); interval = setInterval(nextHero, 4000); }
        showHero(0); startHero();
        document.getElementById('slider')?.addEventListener('mouseenter', () => clearInterval(interval));
        document.getElementById('slider')?.addEventListener('mouseleave', startHero);
    }
    const offerSlides = document.querySelectorAll('#offerSlider .offer-slide');
    if (offerSlides.length) {
        let offIdx = 0, offInt;
        function showOffer(i) { offerSlides.forEach((s, j) => { if (j === i) { s.classList.remove('opacity-0'); s.classList.add('opacity-100', 'z-10'); } else { s.classList.remove('opacity-100', 'z-10'); s.classList.add('opacity-0'); } }); offIdx = i; }
        function nextOffer() { showOffer((offIdx + 1) % offerSlides.length); }
        function startOffer() { if (offInt) clearInterval(offInt); offInt = setInterval(nextOffer, 4000); }
        showOffer(0); startOffer();
        const prevBtn = document.getElementById('offerPrev'), nextBtn = document.getElementById('offerNext');
        if (prevBtn) prevBtn.onclick = () => { showOffer((offIdx - 1 + offerSlides.length) % offerSlides.length); startOffer(); };
        if (nextBtn) nextBtn.onclick = () => { nextOffer(); startOffer(); };
        document.getElementById('offerSlider')?.addEventListener('mouseenter', () => clearInterval(offInt));
        document.getElementById('offerSlider')?.addEventListener('mouseleave', startOffer);
    }
}

// ========== EVENT LISTENERS ==========
function initEventListeners() {
    // Variant product buttons
    document.querySelectorAll('.variant-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.variant-product-card');
            if (card) {
                const name = card.querySelector('.font-bold.text-base')?.innerText || card.getAttribute('data-name');
                const priceText = card.querySelector('.font-extrabold.text-xl')?.innerText || '$49.99';
                const price = parseFloat(priceText.replace('$', ''));
                const img = card.querySelector('img')?.src || "https://picsum.photos/id/29/400/300";
                openVariantModal({ name, price, image: img });
            }
        });
    });

    // Regular add buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            if (card) {
                const id = card.getAttribute('data-id') || Date.now().toString();
                const name = card.querySelector('.font-bold.text-base')?.innerText;
                const priceText = card.querySelector('.font-extrabold.text-xl')?.innerText;
                const price = parseFloat(priceText.replace('$', ''));
                addToCart(id, name, price);
                const original = btn.innerText;
                btn.innerText = '✓ added';
                setTimeout(() => { if (btn) btn.innerText = original; }, 700);
            }
        });
    });

    // New arrival buttons
    document.querySelectorAll('.new-arrival-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.bg-white.rounded-xl');
            if (card) {
                const name = card.querySelector('h4')?.innerText;
                const priceText = card.querySelector('.font-bold.text-\\[\\#bc6c25\\]')?.innerText;
                const price = parseFloat(priceText.replace('$', ''));
                const id = 'new_' + Date.now() + Math.random();
                addToCart(id, name, price);
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check text-xs"></i>';
                setTimeout(() => { if (btn) btn.innerHTML = originalIcon; }, 700);
            }
        });
    });

    // Size options
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-option').forEach(b => {
                b.classList.remove('bg-[#bc6c25]', 'text-white', 'border-[#bc6c25]');
                b.classList.add('bg-white', 'text-[#2c241a]', 'border-[#e8e2db]');
            });
            btn.classList.remove('bg-white', 'text-[#2c241a]', 'border-[#e8e2db]');
            btn.classList.add('bg-[#bc6c25]', 'text-white', 'border-[#bc6c25]');
            selectedSize = btn.getAttribute('data-size');
        });
    });

    // Color options
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => {
                b.classList.remove('border-[#bc6c25]', 'ring-2', 'ring-[#bc6c25]/50');
            });
            btn.classList.add('border-[#bc6c25]', 'ring-2', 'ring-[#bc6c25]/50');
            selectedColor = btn.getAttribute('data-color');
            document.getElementById('selectedColorText').innerText = `Selected: ${selectedColor}`;
        });
    });

    document.getElementById('confirmAddToCartBtn')?.addEventListener('click', addVariantToCart);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeVariantModal);
    document.getElementById('variantModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('variantModal')) closeVariantModal(); });
    document.getElementById('profileBtn')?.addEventListener('click', () => alert("👤 Profile: Track orders & eco-impact"));
    document.getElementById('checkoutBtn')?.addEventListener('click', () => { if (cart.length === 0) alert("Your cart is empty! Add some sustainable goods 🌎"); else { const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2); alert(`✨ Thank you for shopping at tract! ✨\nTotal: $${total}\n🌱 1% donated to rewilding projects`); } });
    document.getElementById('searchInput')?.addEventListener('input', (e) => { searchQuery = e.target.value; filterProducts(); });
    document.querySelectorAll('.chip').forEach(chip => { chip.addEventListener('click', () => setActiveCategory(chip.getAttribute('data-category'))); });
    document.getElementById('shopNowFeaturesBtn')?.addEventListener('click', () => { document.getElementById("productsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" }); });
}

function setRandomAboutImage() {
    const aboutImage = document.getElementById("aboutImage");
    if (aboutImage) { const randomIndex = Math.floor(Math.random() * aboutImages.length); aboutImage.src = aboutImages[randomIndex]; }
}

function initBurgerMenu() {
    const burger = document.getElementById('burgerMenuBtn');
    const nav = document.getElementById('horizontalNav');
    let navOpen = false;
    function toggleNav() { if (navOpen) { nav.classList.remove('open'); burger.classList.remove('open'); } else { nav.classList.add('open'); burger.classList.add('open'); } navOpen = !navOpen; }
    burger?.addEventListener('click', (e) => { e.stopPropagation(); toggleNav(); });
    document.addEventListener('click', (e) => { if (navOpen && !burger.contains(e.target) && !nav.contains(e.target)) { nav.classList.remove('open'); burger.classList.remove('open'); navOpen = false; } });
    // document.querySelectorAll('.nav-link-horizontal').forEach(link => { link.addEventListener('click', () => { alert(`✨ ${link.innerText.trim()} ✨`); if (window.innerWidth <= 768) { nav.classList.remove('open'); burger.classList.remove('open'); navOpen = false; } }); });
}

// ========== DOM CONTENT LOADED ==========
document.addEventListener('DOMContentLoaded', () => {
    setActiveCategory("all");
    initSliders();
    initEventListeners();
    initBurgerMenu();
    setRandomAboutImage();
    document.getElementById('stickyCartBar')?.addEventListener('click', () => { document.getElementById('cartOverlay').style.visibility = 'visible'; document.getElementById('cartOverlay').style.opacity = '1'; renderCartDrawer(); });
    document.getElementById('closeCartBtn')?.addEventListener('click', () => { document.getElementById('cartOverlay').style.visibility = 'hidden'; document.getElementById('cartOverlay').style.opacity = '0'; });
    document.getElementById('cartOverlay')?.addEventListener('click', (e) => { if (e.target === document.getElementById('cartOverlay')) { document.getElementById('cartOverlay').style.visibility = 'hidden'; document.getElementById('cartOverlay').style.opacity = '0'; } });
});
