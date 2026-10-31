// ===== Języki: polski (domyślny) i angielski. Wybór zapisuje się w localStorage =====
const LANG_KEY = "sakuraLang";
let lang = "pl";
try { lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "pl"; } catch (e) {}

// Słownik: klucz = tekst polski, wartość = angielski
const EN = {
  "Strona główna":"Home","Menu":"Menu","Stwórz box":"Build a box","Oferty":"Offers","O nas":"About us","Kontakt":"Contact","Zadzwoń":"Call",
  "Codziennie 12:00–22:00 · Łódź":"Daily 12:00–22:00 · Łódź","Odkryj":"Discover","sztukę":"the art","Japonii":"of Japan",
  "Zobacz menu":"View menu","Nasza historia":"Our story","Najpopularniejsze dania":"Popular dishes","Nasze menu":"Our menu",
  "Wszystko":"All","Rolki":"Rolls","Desery":"Desserts","Napoje":"Drinks","Ulubione":"Favourites","Dodaj do koszyka":"Add to cart",
  "Oferty specjalne":"Special offers","Wybór szefa kuchni":"Chef's selection","Dania sygnaturalne":"Signature dishes","Galeria":"Gallery",
  "Opinie":"Reviews","Najczęstsze pytania":"FAQ","Adres":"Address","Godziny otwarcia":"Opening hours","Telefon":"Phone","Koszyk":"Cart",
  "Kontynuuj zakupy":"Continue shopping","Produkty":"Items","Razem":"Total","Przejdź do zamówienia":"Checkout",
  "Twój koszyk jest pusty.":"Your cart is empty.","Dodaj coś pysznego z menu.":"Add something delicious from the menu.",
  "Nowość":"New","Zamów sushi na dziś":"Order sushi today","Zadzwoń do nas":"Call us","Nawigacja":"Navigation","Znajdź nas w sieci":"Find us online",
  "Szukaj dania po nazwie…":"Search dishes by name…","Wyszukiwarka dań":"Dish search","Wyczyść wyszukiwanie":"Clear search",
  "Kategorie menu":"Menu categories","Otwórz koszyk":"Open cart","Zamknij koszyk":"Close cart","Nawigacja główna":"Main navigation",
  "Nigiri z łososiem":"Salmon nigiri","Nigiri z tuńczykiem":"Tuna nigiri","Roll „Philadelphia”":"Philadelphia roll","Roll „California”":"California roll",
  "Ramen tonkotsu":"Tonkotsu ramen","Ramen z kurczakiem":"Chicken ramen","Mochi z truskawką":"Strawberry mochi","Dorayaki":"Dorayaki",
  "Matcha latte":"Matcha latte","Zielona herbata sencha":"Sencha green tea","Lemoniada z yuzu":"Yuzu lemonade","Mrożona herbata hojicha":"Iced hojicha tea",
  // koszyk i komunikaty
  "Dodano do koszyka: ":"Added to cart: ","Otwórz koszyk, liczba produktów: ":"Open cart, items: ","Zmniejsz ilość":"Decrease quantity","Zwiększ ilość":"Increase quantity",
  "Usuń ":"Remove ","Składanie zamówień online będzie dostępne wkrótce.":"Online ordering will be available soon.",
  "Do darmowej dostawy brakuje {n} zł":"{n} zł left for free delivery","Masz darmową dostawę!":"You get free delivery!",
  "Brak wyników dla „":"No results for „","”. Spróbuj innej nazwy":"”. Try another name"," lub wybierz kategorię Wszystko.":" or choose the All category.",
  "Brak ulubionych dań. Kliknij serduszko na karcie dania, aby je zapisać.":"No favourites yet. Tap the heart on a dish card to save it.",
  "W tej kategorii nie ma jeszcze dań.":"No dishes in this category yet.","Usuń z ulubionych: ":"Remove from favourites: ","Dodaj do ulubionych: ":"Add to favourites: ",
  "Usunięto z ulubionych: ":"Removed from favourites: ","Dodano do ulubionych: ":"Added to favourites: ","Zamknij menu":"Close menu","Otwórz menu":"Open menu",
  // konstruktor boxa
  "Własny sushi box":"Custom sushi box","Stwórz własny sushi box":"Build your own sushi box","Wybierz rozmiar, skomponuj zestaw z ulubionych rolek i dodaj go do koszyka jako jedną pozycję.":"Pick a size, compose your box from your favourite rolls and add it to the cart as a single item.",
  "Wybierz rozmiar":"Choose a size","Skomponuj zestaw":"Compose your box","Twój box":"Your box","kawałków":"pieces","szt.":"pcs","za szt.":"each",
  "Wybrano {a} z {b}":"Selected {a} of {b}","Wolne miejsca: {n}":"Free slots: {n}","Box jest pełny":"Your box is full","Skład zestawu":"Box contents",
  "Wybierz pierwsze sztuki z listy.":"Pick your first pieces from the list.","Wyczyść":"Clear","Uzupełnij jeszcze {n} szt.":"Add {n} more pcs",
  "Dodaj box do koszyka":"Add box to cart","Box jest pełny — usuń coś lub wybierz większy rozmiar.":"The box is full — remove something or choose a larger size.",
  "Zestaw dopasowano do mniejszego rozmiaru.":"The box was adjusted to the smaller size.","Box został wyczyszczony.":"Box cleared.","Zobacz podsumowanie":"View summary",
  "Zwiększ: ":"Increase: ","Zmniejsz: ":"Decrease: ","Usuń z boxa: ":"Remove from box: ","Rozmiar boxa":"Box size","Produkty w boxie":"Box items",
  "Krab, awokado i ikra tobiko.":"Crab, avocado and tobiko roe.","Łosoś i ryż nori — czysty, klasyczny smak.":"Salmon and nori rice — a pure, classic taste.",
  "Tuńczyk z odrobiną wasabi.":"Tuna with a touch of wasabi.","Łosoś, serek śmietankowy i ogórek.":"Salmon, cream cheese and cucumber.",
  "Krewetka tempura, awokado i sos unagi.":"Tempura prawn, avocado and unagi sauce.","Kremowe awokado i sezam.":"Creamy avocado and sesame.",
  "Chrupiąca krewetka w złocistym cieście.":"Crispy prawn in a golden batter.","Świeży ogórek — lekko i orzeźwiająco.":"Fresh cucumber — light and refreshing.",
  "Wegetariańskie":"Vegetarian","Bestseller":"Bestseller","Autorski wybór":"Chef's pick"
};
function t(pl) { return lang === "en" && EN[pl] ? EN[pl] : pl; }
function tf(pl, vars) {
  let s = t(pl);
  for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
}
// Cena: 3,5 zamiast 3.5
function fmt(n) { return (Math.round(n * 100) / 100).toString().replace(".", ","); }

const ATTRS = ["placeholder", "aria-label", "alt", "title"];
function translateTree(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const tag = n.parentNode.nodeName;
    if (tag === "SCRIPT" || tag === "STYLE") continue;
    const tr = n.nodeValue.trim();
    if (n._pl === undefined) { if (!tr || !EN[tr]) continue; n._pl = n.nodeValue; }
    const base = n._pl.trim();
    n.nodeValue = lang === "en" && EN[base] ? n._pl.replace(base, EN[base]) : n._pl;
  }
  root.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(function (el) {
    el._o = el._o || {};
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      if (el._o[a] === undefined) { if (!EN[el.getAttribute(a)]) return; el._o[a] = el.getAttribute(a); }
      el.setAttribute(a, lang === "en" && EN[el._o[a]] ? EN[el._o[a]] : el._o[a]);
    });
  });
}
function applyLang() {
  document.documentElement.lang = lang;
  document.title = lang === "en" ? "SAKURA SUSHI — Japanese restaurant in Łódź" : "SAKURA SUSHI — japońska restauracja w Łodzi";
  translateTree(document.body);
  const toggle = document.querySelector("#lang-toggle");
  if (toggle) toggle.setAttribute("data-lang", lang);
  // odświeżamy treści tworzone przez JavaScript
  ["renderCart", "applyFilters", "updateFavoriteButtons", "renderBuilder"].forEach(function (name) {
    if (typeof window[name] === "function") window[name]();
  });
  if (typeof setMenu === "function") setMenu(document.querySelector("#nav").classList.contains("is-open"));
}
function setLang(l) {
  lang = l === "en" ? "en" : "pl";
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  applyLang();
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#lang-toggle").addEventListener("click", function () { setLang(lang === "pl" ? "en" : "pl"); });
  applyLang();
});
