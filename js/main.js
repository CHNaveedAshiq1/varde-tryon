// VARDE try-on sequence carousel.
// The full 11 piece sequence from the film, in the order the demo walks it.
// Four pieces are card only in the film (Nylon Bomber, Waxed Field Jacket,
// Knit Polo, Canvas Chore Jacket) and are never worn; the other seven are
// worn by the model and stepping moves through those.
const CIRCLE = [
  { id: 'bomber',  name: 'Nylon Bomber',         price: 158.00, prod: 'img/prod-bomber.webp',  model: null,                  colors: [['Black', '#1c1c1e'], ['Olive', '#5c6046']], worn: false, cat: 'outer' },
  { id: 'waxed',   name: 'Waxed Field Jacket',   price: 185.00, prod: 'img/prod-waxed.webp',   model: null,                  colors: [['Tan', '#b98a52'], ['Olive', '#6b6a4a']], worn: false, cat: 'outer' },
  { id: 'jacket',  name: 'Quilted Liner Jacket', price: 135.00, prod: 'img/prod-jacket.webp',  model: 'img/model-jacket.webp', colors: [['Black', '#1c1c1e'], ['Navy', '#2c3550']], worn: true, cat: 'outer' },
  { id: 'tee',     name: 'Everyday Tee',         price: 38.00,  prod: 'img/prod-tee.webp',     model: 'img/model-tee.webp',    colors: [['White', '#f4f1ea'], ['Oat', '#d9c6a5'], ['Navy', '#2c3550']], worn: true, cat: 'tops' },
  { id: 'ringer',  name: 'Ringer Tee',           price: 45.00,  prod: 'img/prod-ringer.webp',  model: 'img/model-ringer.webp', colors: [['Cream / Navy', '#efe6d2'], ['White / Red', '#f2ede2']], worn: true, cat: 'tops' },
  { id: 'sweater', name: 'Oat Rib Sweater',      price: 96.00,  prod: 'img/prod-sweater.webp', model: 'img/model-sweater.webp', colors: [['Oat', '#d9c6a5'], ['Grey', '#9a9a97']], worn: true, cat: 'tops' },
  { id: 'linen',   name: 'Linen Shirt',          price: 78.00,  prod: 'img/prod-linen.webp',   model: 'img/model-linen.webp',  colors: [['Sky', '#a9c6dd'], ['White', '#f4f1ea'], ['Sage', '#a8b39a']], worn: true, cat: 'tops' },
  { id: 'hoodie',  name: 'Loop Hoodie',          price: 88.00,  prod: 'img/prod-hoodie.webp',  model: 'img/model-hoodie.webp', colors: [['Grey', '#a7a7a3'], ['Navy', '#2c3550']], worn: true, cat: 'tops' },
  { id: 'breton',  name: 'Breton Long Sleeve',   price: 58.00,  prod: 'img/prod-breton.webp',  model: 'img/model-breton.webp', colors: [['White', '#f4f1ea'], ['Navy', '#2c3550']], worn: true, cat: 'tops', variantLabel: 'Ecru / Navy' },
  { id: 'polo',    name: 'Knit Polo',            price: 72.00,  prod: 'img/prod-polo.webp',    model: null,                  colors: [['Rust', '#a5502f']], worn: false, cat: 'tops' },
  { id: 'chore',   name: 'Canvas Chore Jacket',  price: 148.00, prod: 'img/prod-chore.webp',   model: null,                  colors: [['Olive', '#5c6046'], ['Khaki', '#b3a284']], worn: false, cat: 'outer' },
];
const SIZES = ['S', 'M', 'L', 'XL'];
const FREE_OVER = 250;
const money = n => '$' + n.toFixed(2);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined';

let currentId = 'jacket';      // the film opens on the Quilted Liner Jacket
let filter = 'all';            // 'all' | 'tops' | 'outer'
let size = 'M';
let colorIdx = 0;
let bag = [];                  // {id, name, size, color, price, prod, qty}
let saved = new Set();
let frontIsA = true;
let busy = false;
let crossIdx = 0;

const $ = id => document.getElementById(id);
const slots = { lo: $('slotLO'), li: $('slotLI'), ri: $('slotRI'), ro: $('slotRO') };
const byId = id => CIRCLE.find(p => p.id === id);
const current = () => byId(currentId);
const seq = () => filter === 'all' ? CIRCLE : CIRCLE.filter(p => p.cat === filter);
const wornSeq = () => seq().filter(p => p.worn);
const seqIdx = () => seq().indexOf(current());
const at = offset => { const s = seq(); return s[(seqIdx() + offset + s.length) % s.length]; };

function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

function cardHTML(p, prominence) {
  const tag = p.worn ? '' : '<span class="card-tag">Card only</span>';
  return `<button type="button" class="p-card ${prominence}" data-id="${p.id}" aria-label="${p.name}, ${money(p.price)}">
    <span class="card-media"><img src="${p.prod}" alt="${p.name}"></span>
    <span class="card-body"><span class="card-name">${p.name}</span><p class="card-price">${money(p.price)}</p>${tag}</span>
  </button>`;
}

function renderCards(dir) {
  const plan = [
    [slots.lo, at(-2), 'is-outer'],
    [slots.li, at(-1), 'is-inner'],
    [slots.ri, at(1), 'is-inner'],
    [slots.ro, at(2), 'is-outer'],
  ];
  const placed = new Set([currentId]);
  for (const [slot, p, cls] of plan) {
    if (placed.has(p.id)) { slot.innerHTML = ''; slot.style.display = 'none'; continue; }
    placed.add(p.id);
    slot.style.display = '';
    slot.innerHTML = cardHTML(p, cls);
    const card = slot.firstElementChild;
    card.addEventListener('click', () => onCardClick(p));
    if (hasGsap && !reduced && dir !== 0) {
      gsap.fromTo(card,
        { x: dir * (cls === 'is-inner' ? 90 : 150), opacity: 0, rotateY: dir * 14, scale: .92 },
        { x: 0, opacity: cls === 'is-inner' ? 1 : .62, rotateY: 0, scale: 1, duration: .85, ease: 'expo.out', delay: cls === 'is-inner' ? 0 : .07 });
    }
  }
}

function renderBar(animate) {
  const p = current();
  $('barThumb').src = p.prod;
  $('barName').textContent = p.name;
  $('barPrice').textContent = money(p.price);
  $('barStep').textContent = `Piece ${seqIdx() + 1} of ${seq().length}`;
  colorIdx = 0;
  renderSizes(); renderColors();
  if (animate && hasGsap && !reduced) {
    gsap.fromTo('#purchaseBar .bar-id', { y: 10, opacity: .3 }, { y: 0, opacity: 1, duration: .55, ease: 'power3.out' });
  }
}

function renderSizes() {
  $('sizes').innerHTML = SIZES.map(s =>
    `<button type="button" class="size-btn ${s === size ? 'is-on' : ''}" data-size="${s}" aria-pressed="${s === size}">${s}</button>`).join('');
  $('sizeVal').textContent = size;
  $('sizes').querySelectorAll('.size-btn').forEach(b => b.addEventListener('click', () => {
    size = b.dataset.size; renderSizes();
    if (hasGsap && !reduced) gsap.fromTo(b, { scale: .82 }, { scale: 1, duration: .45, ease: 'elastic.out(1,.5)' });
  }));
}

function renderColors() {
  const p = current();
  $('colors').innerHTML = p.colors.map(([name, hex], i) =>
    `<button type="button" class="color-dot ${i === colorIdx ? 'is-on' : ''}" data-i="${i}" style="--dot:${hex}" aria-label="${name}" aria-pressed="${i === colorIdx}" title="${name}"></button>`).join('');
  $('colorVal').textContent = p.colors[colorIdx][0];
  $('colors').querySelectorAll('.color-dot').forEach(b => b.addEventListener('click', () => {
    colorIdx = +b.dataset.i; renderColors();
  }));
}

function swapModel(dir) {
  const p = current();
  const front = frontIsA ? $('modelA') : $('modelB');
  const back = frontIsA ? $('modelB') : $('modelA');
  back.src = p.model;
  back.alt = `Model wearing the ${p.name}`;
  back.removeAttribute('aria-hidden');
  front.setAttribute('aria-hidden', 'true'); front.alt = '';
  if (hasGsap && !reduced) {
    gsap.set(back, { opacity: 0, scale: 1.045, x: dir * 16 });
    gsap.to(back, { opacity: 1, scale: 1, x: 0, duration: .8, ease: 'power3.out' });
    gsap.to(front, { opacity: 0, duration: .55, ease: 'power2.out', onComplete: () => front.classList.remove('is-on') });
    back.classList.add('is-on');
    gsap.fromTo('#modelWrap .model-shadow', { scaleX: .86, opacity: .5 }, { scaleX: 1, opacity: .8, duration: .8, ease: 'power3.out' });
  } else {
    front.classList.remove('is-on'); back.classList.add('is-on');
    back.style.opacity = 1; front.style.opacity = 0;
  }
  frontIsA = !frontIsA;
}

function goToId(id, dir) {
  if (busy) return;
  const p = byId(id);
  if (!p || !p.worn || id === currentId) return;
  busy = true;
  currentId = id;
  swapModel(dir);
  renderCards(dir);
  renderBar(true);
  setTimeout(() => { busy = false; }, reduced ? 60 : 420);
}

function step(d) {
  const w = wornSeq();
  const i = w.indexOf(current());
  const target = w[(i + d + w.length) % w.length];
  if (target && target.id !== currentId) goToId(target.id, d);
}
const next = () => step(1);
const prev = () => step(-1);

function onCardClick(p) {
  if (p.id === currentId) return;
  if (!p.worn) {
    toast(`${p.name} is a card only piece in this film, it is never worn.`);
    return;
  }
  const w = wornSeq();
  goToId(p.id, w.indexOf(p) > w.indexOf(current()) ? 1 : -1);
}

$('nextBtn').addEventListener('click', next);
$('prevBtn').addEventListener('click', prev);
document.addEventListener('keydown', e => {
  if (!$('bagDrawer').classList.contains('open') && $('sizeModal').hidden) {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }
  if (e.key === 'Escape') { closeBag(); $('sizeModal').hidden = true; $('searchPanel').hidden = true; $('accountPanel').hidden = true; }
});

// Filter pill: All / Tops / Outerwear. Filtering narrows the sequence the
// cards and the stepping walk through; card only pieces stay card only.
function setFilter(f, silent) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => {
    const on = b.dataset.filter === f;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
  });
  if (!seq().includes(current())) {
    const first = wornSeq()[0];
    if (first) { currentId = first.id; swapModel(1); }
  }
  renderCards(0);
  renderBar(false);
  if (!silent) toast(f === 'all' ? 'Showing the full sequence.' : `Showing ${f === 'tops' ? 'tops' : 'outerwear'} only.`);
}
document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));

// Bag
const bagTotal = () => bag.reduce((s, it) => s + it.price * it.qty, 0);
const bagQty = () => bag.reduce((s, it) => s + it.qty, 0);
function syncHeaderCount() { $('bagCount').textContent = bagQty(); }

function addToBag(p, sizeVal, colorName) {
  const line = bag.find(it => it.id === p.id && it.size === sizeVal && it.color === colorName);
  if (line) line.qty += 1;
  else bag.push({ id: p.id, name: p.name, size: sizeVal, color: colorName, price: p.price, prod: p.prod, qty: 1 });
}

const CROSS_ORDER = ['breton', 'tee', 'sweater', 'hoodie', 'ringer', 'linen'];
const crossSuggestions = () => CROSS_ORDER.map(byId).filter(p => p && !bag.some(it => it.id === p.id)).slice(0, 4);

function renderCrossSell() {
  const list = crossSuggestions();
  const wrap = $('crossSell');
  if (!bag.length || !list.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  crossIdx = Math.min(crossIdx, list.length - 1);
  const p = list[crossIdx];
  $('crossImg').src = p.prod;
  $('crossImg').alt = p.name;
  $('crossName').textContent = p.name;
  $('crossPrice').textContent = money(p.price);
  const variantText = p.variantLabel || p.colors.map(c => c[0]).join(' / ');
  $('crossVariant').innerHTML = SIZES.map(s => `<option value="${s}">${s} / ${variantText}</option>`).join('');
  $('crossDots').innerHTML = list.map((_, i) =>
    `<button type="button" class="cross-dot ${i === crossIdx ? 'is-on' : ''}" data-i="${i}" aria-label="Suggestion ${i + 1}"></button>`).join('');
  $('crossDots').querySelectorAll('.cross-dot').forEach(d => d.addEventListener('click', () => { crossIdx = +d.dataset.i; renderCrossSell(); }));
  $('crossAdd').onclick = () => {
    addToBag(p, $('crossVariant').value, variantText);
    renderBag();
    toast(`${p.name} added to your bag.`);
  };
}

function renderBag() {
  const total = bagTotal();
  const has = bag.length > 0;
  $('shipProgress').hidden = !has;
  $('drawerCols').hidden = !has;
  if (has) {
    $('shipMsg').innerHTML = total >= FREE_OVER
      ? 'Your bag qualifies for <strong>free delivery</strong>.'
      : `<strong>${money(FREE_OVER - total)} CAD</strong> away from free delivery`;
    $('shipFill').style.width = Math.min(100, total / FREE_OVER * 100) + '%';
  }
  const box = $('drawerItems');
  box.innerHTML = bag.map((it, i) => `<div class="bag-item">
      <img src="${it.prod}" alt="">
      <div class="bag-item-body"><strong>${it.name}</strong>
      <span>${money(it.price)}</span>
      <span>Size: ${it.size}</span>
      <span>Color: ${it.color}</span>
      <span class="qty-stepper">
        <button type="button" data-act="dec" data-i="${i}" aria-label="One less ${it.name}">−</button>
        <span aria-label="Quantity">${it.qty}</span>
        <button type="button" data-act="inc" data-i="${i}" aria-label="One more ${it.name}">+</button>
      </span></div>
      <span class="bag-item-price">${money(it.price * it.qty)}</span>
      <button type="button" class="bag-remove" data-i="${i}" aria-label="Remove ${it.name}">×</button>
    </div>`).join('');
  box.querySelectorAll('.bag-remove').forEach(b => b.addEventListener('click', () => {
    bag.splice(+b.dataset.i, 1); renderBag();
  }));
  box.querySelectorAll('.qty-stepper button').forEach(b => b.addEventListener('click', () => {
    const it = bag[+b.dataset.i];
    if (b.dataset.act === 'inc') it.qty += 1;
    else { it.qty -= 1; if (it.qty < 1) bag.splice(+b.dataset.i, 1); }
    renderBag();
  }));
  $('drawerEmpty').style.display = has ? 'none' : '';
  renderCrossSell();
  $('drawerFoot').hidden = !has;
  $('drawerTotal').textContent = money(total) + ' CAD';
}

function openBag() {
  renderBag();
  $('scrim').hidden = false;
  $('bagDrawer').classList.add('open');
  $('bagDrawer').setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => $('scrim').classList.add('show'));
}
function closeBag() {
  if (!$('bagDrawer').classList.contains('open')) return;
  $('bagDrawer').classList.remove('open');
  $('bagDrawer').setAttribute('aria-hidden', 'true');
  $('scrim').classList.remove('show');
  setTimeout(() => { $('scrim').hidden = true; }, reduced ? 30 : 320);
  // As in the film, the header count only catches up once the drawer closes.
  syncHeaderCount();
}
$('bagBtn').addEventListener('click', openBag);
$('drawerClose').addEventListener('click', closeBag);
$('scrim').addEventListener('click', closeBag);
$('checkoutBtn').addEventListener('click', () => {
  $('checkoutMsg').textContent = 'Demo storefront, checkout is not connected. Your bag is saved on this page.';
});

$('addBtn').addEventListener('click', () => {
  const p = current();
  addToBag(p, size, p.colors[colorIdx][0]);
  if (hasGsap && !reduced) gsap.fromTo('#bagBtn', { scale: 1.25 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.5)' });
  openBag();
});

// Header tools: search, account, saved, collections
function jumpToProduct(p) {
  if (!p.worn) { toast(`${p.name} is a card only piece in this film.`); return; }
  if (!seq().includes(p)) setFilter('all', true);
  goToId(p.id, 1);
}
$('searchBtn').addEventListener('click', () => {
  const panel = $('searchPanel');
  panel.hidden = !panel.hidden; $('accountPanel').hidden = true;
  if (!panel.hidden) { $('searchInput').focus(); runSearch(''); }
});
function runSearch(q) {
  const hits = CIRCLE.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  $('searchResults').innerHTML = hits.length
    ? hits.map(p => `<button type="button" class="search-hit" data-id="${p.id}"><img src="${p.prod}" alt=""><span>${p.name}</span><em>${money(p.price)}</em></button>`).join('')
    : '<p class="search-none">No piece matches that search.</p>';
  $('searchResults').querySelectorAll('.search-hit').forEach(b => b.addEventListener('click', () => {
    $('searchPanel').hidden = true;
    jumpToProduct(byId(b.dataset.id));
  }));
}
$('searchInput').addEventListener('input', e => runSearch(e.target.value));

$('accountBtn').addEventListener('click', () => {
  $('accountPanel').hidden = !$('accountPanel').hidden; $('searchPanel').hidden = true;
});
$('accountForm').addEventListener('submit', e => {
  e.preventDefault();
  $('accountMsg').textContent = 'Signed in for this demo session. Your bag on this page is untouched.';
});

function renderSaved() { $('savedCount').textContent = saved.size; }
$('savedBtn').addEventListener('click', () => {
  toast(saved.size ? `Saved: ${[...saved].map(id => byId(id).name).join(', ')}` : 'Nothing saved yet. Use the heart tool on the stage to save a piece.');
});
$('toolSave').addEventListener('click', () => {
  const p = current();
  saved.has(p.id) ? saved.delete(p.id) : saved.add(p.id);
  renderSaved();
  toast(saved.has(p.id) ? `${p.name} saved.` : `${p.name} removed from saved.`);
});
$('toolSize').addEventListener('click', () => { $('sizeModal').hidden = false; });
$('sizeClose').addEventListener('click', () => { $('sizeModal').hidden = true; });
$('sizeModal').addEventListener('click', e => { if (e.target === $('sizeModal')) $('sizeModal').hidden = true; });
$('toolTry').addEventListener('click', () => toast('Try-on view: arrows move the sequence, the model changes with the cards.'));
$('toolShare').addEventListener('click', async () => {
  const text = `VARDE try-on: ${current().name}, size ${size}`;
  try { await navigator.clipboard.writeText(text); toast('Look copied: ' + text); }
  catch { toast(text); }
});

document.querySelectorAll('[data-shop]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const map = { all: 'jacket', low: 'linen', everyday: 'tee', knit: 'sweater' };
  jumpToProduct(byId(map[a.dataset.shop]));
}));

// Parallax on mouse, stage depth
if (hasGsap && !reduced && window.matchMedia('(pointer: fine)').matches) {
  const word = gsap.quickTo('#vardeWord', 'x', { duration: .9, ease: 'power3.out' });
  const model = gsap.quickTo('#modelFloat', 'x', { duration: .9, ease: 'power3.out' });
  const cards = gsap.quickTo('.slot-left-inner, .slot-right-inner', 'x', { duration: 1, ease: 'power3.out' });
  $('stage').addEventListener('mousemove', e => {
    const r = $('stage').getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - .5;
    word(dx * -22); model(dx * 10); cards(dx * -14);
  });
  gsap.to('#modelFloat', { y: -7, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

// Init
renderCards(0);
renderBar(false);
renderBag();
syncHeaderCount();
renderSaved();
if (hasGsap && !reduced) {
  gsap.from('.p-card', { y: 34, opacity: 0, duration: .9, stagger: .09, ease: 'expo.out', delay: .15 });
  gsap.from('#modelWrap', { y: 26, opacity: 0, duration: 1, ease: 'expo.out' });
  gsap.from('#purchaseBar', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', delay: .3 });
}
