// ===== Konstruktor sushi boxa (korzysta z koszyka z cart.js) =====
const BOX_SIZES = [
  { id: "small", name: "Small Box", pieces: 12 },
  { id: "medium", name: "Medium Box", pieces: 24 },
  { id: "large", name: "Large Box", pieces: 36 }
];
const U = "https://images.unsplash.com/photo-";
const FALLBACK = U + "1611143669185-af224c5e3252?auto=format&fit=crop&w=700&q=80";
// pl = klucz opisu w słowniku EN; price = cena za 1 kawałek (zł)
const BOX_ITEMS = [
  { id: "california", name: "California Roll", desc: "Krab, awokado i ikra tobiko.", price: 3, img: "1617196034183-421b4917c92d" },
  { id: "salmon", name: "Salmon Roll", desc: "Łosoś i ryż nori — czysty, klasyczny smak.", price: 3.5, img: "1553621042-f6e147245754" },
  { id: "tuna", name: "Tuna Roll", desc: "Tuńczyk z odrobiną wasabi.", price: 3.5, img: "1579871494447-9811cf80d66c" },
  { id: "philadelphia", name: "Philadelphia Roll", desc: "Łosoś, serek śmietankowy i ogórek.", price: 4, img: "1611143669185-af224c5e3252" },
  { id: "dragon", name: "Dragon Roll", desc: "Krewetka tempura, awokado i sos unagi.", price: 4.5, img: "1579584425555-c3ce17fd4351" },
  { id: "avocado", name: "Avocado Roll", desc: "Kremowe awokado i sezam.", price: 2.5, img: "1617196034796-73dfa7b1fd56" },
  { id: "tempura", name: "Tempura Roll", desc: "Chrupiąca krewetka w złocistym cieście.", price: 3.5, img: "1534482421-64566f976cfa" },
  { id: "cucumber", name: "Cucumber Roll", desc: "Świeży ogórek — lekko i orzeźwiająco.", price: 2.5, img: "1583623025817-d180a2221d0a" }
];
const VEG = ["avocado", "cucumber"];

let boxSize = "medium";
let boxCounts = {};

function sizeById(id) { return BOX_SIZES.find(function (s) { return s.id === id; }); }
function itemById(id) { return BOX_ITEMS.find(function (i) { return i.id === id; }); }
function boxTotals() {
  let pieces = 0, price = 0;
  BOX_ITEMS.forEach(function (i) {
    const q = boxCounts[i.id] || 0;
    pieces += q; price += q * i.price;
  });
  return { pieces: pieces, price: price };
}
// Używane przez koszyk: nazwa i skład boxa w aktualnym języku
function boxName(box) {
  const s = sizeById(box.size);
  return t("Własny sushi box") + " " + s.name + " (" + s.pieces + " " + t("szt.") + ")";
}
function boxLines(box) {
  return box.items.map(function (e) { return e.qty + "× " + itemById(e.id).name; });
}

const boxEls = {
  sizes: document.querySelector("#box-sizes"),
  grid: document.querySelector("#box-grid"),
  count: document.querySelector("#box-count"),
  status: document.querySelector("#box-status"),
  bar: document.querySelector("#box-bar"),
  list: document.querySelector("#box-list"),
  price: document.querySelector("#box-price"),
  add: document.querySelector("#box-add"),
  reset: document.querySelector("#box-reset"),
  miniCount: document.querySelector("#mini-count"),
  miniPrice: document.querySelector("#mini-price")
};

function renderBuilder() {
  const cap = sizeById(boxSize).pieces;
  boxEls.sizes.innerHTML = BOX_SIZES.map(function (s) {
    return '<button type="button" class="box-size' + (s.id === boxSize ? " is-active" : "") + '" data-size="' + s.id + '" aria-pressed="' + (s.id === boxSize) + '">' +
      '<strong>' + s.pieces + '</strong><span class="box-size__name">' + s.name + '</span><span>' + t("kawałków") + '</span></button>';
  }).join("");
  boxEls.grid.innerHTML = BOX_ITEMS.map(function (i) {
    return '<article class="box-item" data-bid="' + i.id + '">' +
      '<div class="box-item__photo"><img loading="lazy" src="' + U + i.img + '?auto=format&fit=crop&w=700&q=80" alt="' + i.name + '" onerror="this.onerror=null;this.src=FALLBACK">' +
      (VEG.indexOf(i.id) > -1 ? '<span class="badge badge--new box-item__tag">' + t("Wegetariańskie") + '</span>' : "") +
      '<span class="box-item__count" data-count>0</span></div>' +
      '<div class="box-item__body"><h3>' + i.name + '</h3><p>' + t(i.desc) + '</p>' +
      '<div class="box-item__row"><p class="box-item__price">' + fmt(i.price) + ' zł <small>/ ' + t("szt.") + '</small></p>' +
      '<div class="qty box-qty"><button type="button" data-act="minus" aria-label="' + t("Zmniejsz: ") + i.name + '">−</button><span data-qty>0</span>' +
      '<button type="button" data-act="plus" aria-label="' + t("Zwiększ: ") + i.name + '">+</button></div></div></div></article>';
  }).join("");
  boxEls.reset.textContent = t("Wyczyść");
  updateBuilder();
}

function updateBuilder() {
  const cap = sizeById(boxSize).pieces;
  const tot = boxTotals();
  const left = cap - tot.pieces;

  boxEls.grid.querySelectorAll(".box-item").forEach(function (card) {
    const q = boxCounts[card.dataset.bid] || 0;
    card.classList.toggle("is-selected", q > 0);
    card.querySelector("[data-qty]").textContent = q;
    card.querySelector("[data-count]").textContent = q;
    card.querySelector('[data-act="minus"]').disabled = q === 0;
    card.querySelector('[data-act="plus"]').disabled = left === 0;
  });

  boxEls.count.textContent = tf("Wybrano {a} z {b}", { a: tot.pieces, b: cap });
  boxEls.status.textContent = left === 0 ? t("Box jest pełny") : tf("Wolne miejsca: {n}", { n: left });
  boxEls.status.classList.toggle("is-full", left === 0);
  boxEls.bar.style.width = (tot.pieces / cap * 100) + "%";
  boxEls.price.textContent = fmt(tot.price) + " zł";
  boxEls.miniCount.textContent = tot.pieces + " / " + cap;
  boxEls.miniPrice.textContent = fmt(tot.price) + " zł";

  const chosen = BOX_ITEMS.filter(function (i) { return boxCounts[i.id] > 0; });
  boxEls.list.innerHTML = chosen.length === 0
    ? '<li class="box-sum__empty">' + t("Wybierz pierwsze sztuki z listy.") + '</li>'
    : chosen.map(function (i) {
        const q = boxCounts[i.id];
        return '<li><span>' + q + '× ' + i.name + '</span><span>' + fmt(q * i.price) + ' zł</span>' +
          '<button type="button" data-remove="' + i.id + '" aria-label="' + t("Usuń z boxa: ") + i.name + '">×</button></li>';
      }).join("");

  boxEls.add.disabled = left !== 0;
  boxEls.add.textContent = left === 0 ? t("Dodaj box do koszyka") : tf("Uzupełnij jeszcze {n} szt.", { n: left });
}

function setBoxSize(id) {
  boxSize = id;
  const cap = sizeById(id).pieces;
  let trimmed = false;
  // jeśli wybrano za dużo kawałków — zdejmujemy nadmiar od końca listy
  for (let k = BOX_ITEMS.length - 1; k >= 0 && boxTotals().pieces > cap; k--) {
    const itemId = BOX_ITEMS[k].id;
    const extra = boxTotals().pieces - cap;
    const cut = Math.min(boxCounts[itemId] || 0, extra);
    if (cut > 0) { boxCounts[itemId] -= cut; trimmed = true; }
  }
  boxEls.sizes.querySelectorAll(".box-size").forEach(function (b) {
    const on = b.dataset.size === id;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  updateBuilder();
  if (trimmed) showToast(t("Zestaw dopasowano do mniejszego rozmiaru."));
}

function changeBox(id, delta) {
  const cap = sizeById(boxSize).pieces;
  const cur = boxCounts[id] || 0;
  if (delta > 0 && boxTotals().pieces >= cap) {
    showToast(t("Box jest pełny — usuń coś lub wybierz większy rozmiar."));
    return;
  }
  boxCounts[id] = Math.max(0, cur + delta);
  updateBuilder();
}

boxEls.sizes.addEventListener("click", function (e) {
  const b = e.target.closest("[data-size]");
  if (b) setBoxSize(b.dataset.size);
});
boxEls.grid.addEventListener("click", function (e) {
  const b = e.target.closest("[data-act]");
  if (!b || b.disabled) return;
  changeBox(b.closest(".box-item").dataset.bid, b.dataset.act === "plus" ? 1 : -1);
});
boxEls.list.addEventListener("click", function (e) {
  const b = e.target.closest("[data-remove]");
  if (!b) return;
  boxCounts[b.dataset.remove] = 0;
  updateBuilder();
});
boxEls.reset.addEventListener("click", function () {
  boxCounts = {};
  updateBuilder();
  showToast(t("Box został wyczyszczony."));
});
boxEls.add.addEventListener("click", function () {
  const tot = boxTotals();
  if (tot.pieces !== sizeById(boxSize).pieces) return;
  const items = BOX_ITEMS.filter(function (i) { return boxCounts[i.id] > 0; })
    .map(function (i) { return { id: i.id, qty: boxCounts[i.id] }; });
  const box = { size: boxSize, items: items };
  // identyczny skład = identyczne id, więc zwiększa się ilość w koszyku
  addToCart({
    id: "box-" + boxSize + "-" + items.map(function (e) { return e.id + e.qty; }).join("-"),
    name: boxName(box),
    price: tot.price,
    image: U + BOX_ITEMS[0].img + "?auto=format&fit=crop&w=300&q=80",
    box: box
  });
  boxCounts = {};
  updateBuilder();
});

renderBuilder();
