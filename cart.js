// ===== Корзина SAKURA SUSHI =====

// 1. Находим нужные элементы на странице
const cartToggle = document.querySelector("#cart-toggle");
const cartCount = document.querySelector("#cart-count");
const cartPanel = document.querySelector("#cart");
const cartOverlay = document.querySelector("#cart-overlay");
const cartClose = document.querySelector("#cart-close");
const cartList = document.querySelector("#cart-list");
const cartEmpty = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const cartItemsTotal = document.querySelector("#cart-items-total");
const cartTotal = document.querySelector("#cart-total");
const checkoutButton = document.querySelector("#checkout");
const cartShip = document.querySelector("#cart-ship");
const cartContinue = document.querySelector("#cart-continue");
const FREE_SHIPPING = 100;
const toast = document.querySelector("#toast");

// 2. Корзина — это список (массив) товаров.
// Один товар выглядит так: { id, name, price, image, quantity }
const STORAGE_KEY = "sakuraCart";
let cart = loadCart();

// Достаём сохранённую корзину из localStorage (если она там есть)
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return []; // если что-то пошло не так — начинаем с пустой корзины
  }
}

// Сохраняем корзину в localStorage, чтобы она пережила обновление страницы
function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // если браузер не разрешает сохранять, корзина просто работает без сохранения
  }
}

// 3. Действия с корзиной

// Добавить товар (или увеличить количество, если он уже есть)
function addToCart(product) {
  const existing = cart.find(function (item) {
    return item.id === product.id;
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      box: product.box,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast(t("Dodano do koszyka: ") + (product.box ? boxName(product.box) : t(product.name)));
}

// Изменить количество на +1 или -1. Если стало 0 — удаляем товар
function changeQuantity(id, change) {
  const item = cart.find(function (item) {
    return item.id === id;
  });
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeItem(id);
    return;
  }

  saveCart();
  renderCart();
}

// Удалить товар полностью
function removeItem(id) {
  cart = cart.filter(function (item) {
    return item.id !== id;
  });
  saveCart();
  renderCart();
}

// 4. Показ корзины на странице: вызываем после любого изменения
function renderCart() {
  // Считаем общее количество и общую сумму
  const totalItems = cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
  const totalPrice = cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  // Кружок с числом на иконке корзины (скрыт, если товаров нет)
  cartCount.textContent = totalItems;
  cartCount.hidden = totalItems === 0;
  cartToggle.setAttribute("aria-label", t("Otwórz koszyk, liczba produktów: ") + totalItems);

  // Пустая корзина: показываем надпись, прячем итоги
  cartEmpty.hidden = cart.length > 0;
  cartFooter.hidden = cart.length === 0;

  // Для каждого товара собираем кусок HTML и вставляем в список
  cartList.innerHTML = cart
    .map(function (item) {
      const name = item.box ? boxName(item.box) : t(item.name);
      const lines = item.box
        ? '<ul class="cart-item__box">' + boxLines(item.box).map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>"
        : "";
      return `
        <li class="cart-item">
          <img class="cart-item__img" src="${item.image}" alt="${name}">
          <div>
            <h3 class="cart-item__name">${name}</h3>
            ${lines}
            <p class="cart-item__price">${fmt(item.price)} zł</p>
            <div class="qty">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="${t("Zmniejsz ilość")}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="${t("Zwiększ ilość")}">+</button>
            </div>
          </div>
          <button class="cart-item__remove" type="button" data-action="remove" data-id="${item.id}" aria-label="${t("Usuń ")}${name}">×</button>
        </li>`;
    })
    .join("");

  // Итоги внизу панели
  cartItemsTotal.textContent = totalItems;
  cartTotal.textContent = fmt(totalPrice) + " zł";

  // Pasek darmowej dostawy
  const left = FREE_SHIPPING - totalPrice;
  cartShip.textContent = left > 0
    ? tf("Do darmowej dostawy brakuje {n} zł", { n: fmt(left) })
    : t("Masz darmową dostawę!");
}

// 5. Открытие и закрытие панели
function openCart() {
  cartPanel.classList.add("is-open");
  cartOverlay.classList.add("is-open");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartPanel.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

// 6. Уведомление, которое само исчезает через 2 секунды
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2800);
}

// 7. Реакции на действия пользователя

// Кнопки «Add to Cart» на карточках блюд
document.querySelectorAll(".cart-button").forEach(function (button) {
  button.addEventListener("click", function () {
    const card = button.closest("[data-id]"); // карточка, в которой лежит кнопка

    addToCart({
      id: card.dataset.id,
      name: card.querySelector("h3").textContent,
      price: Number(card.dataset.price),
      image: card.querySelector("img").src
    });
  });
});

// Кнопки +, − и × внутри корзины.
// Товары создаются заново при каждом изменении, поэтому слушаем клик на всём списке.
cartList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "increase") changeQuantity(id, 1);
  if (action === "decrease") changeQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

// Открыть / закрыть корзину
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartContinue.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closeCart();
});

// Кнопка Checkout (оплаты пока нет)
checkoutButton.addEventListener("click", function () {
  showToast(t("Składanie zamówień online będzie dostępne wkrótce."));
});

// 8. При загрузке страницы сразу показываем сохранённую корзину
renderCart();