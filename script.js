// ===== Меню: поиск, категории и избранное =====
// Идея: у нас три «условия» (категория, текст поиска, избранное), но одна функция
// applyFilters() проверяет их все сразу и решает, какие карточки показать.

// Находим нужные элементы
const filterButtons = document.querySelectorAll(".filter");
const cards = document.querySelectorAll("#menu-cards .card"); // только карточки основного меню
const searchInput = document.querySelector("#menu-search");
const searchClear = document.querySelector("#search-clear");
const menuEmpty = document.querySelector("#menu-empty");
const menuEmptyText = document.querySelector("#menu-empty-text");
const favButtons = document.querySelectorAll(".fav-button");
const favCount = document.querySelector("#fav-count");

// Текущее состояние меню
let activeCategory = "all"; // all, sushi, rolls, ramen, desserts, drinks lub favorites
let searchQuery = "";       // то, что пользователь ввёл в поиск

// Избранное — это список id блюд. Он хранится в localStorage
const FAV_KEY = "sakuraFavorites";
let favorites = loadFavorites();

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAV_KEY));
    if (!Array.isArray(saved)) return [];
    // оставляем только те блюда, которые есть в меню (на случай, если меню изменилось)
    return saved.filter(function (id) {
      return document.querySelector('#menu-cards .card[data-id="' + id + '"]');
    });
  } catch (error) {
    return []; // если что-то пошло не так — начинаем с пустого избранного
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  } catch (error) {
    // если браузер не разрешает сохранять, избранное просто работает без сохранения
  }
}

// Приводим текст к единому виду: маленькие буквы, «ё» = «е», без пробелов по краям
function normalizeText(text) {
  return text.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Показываем подходящие карточки и скрываем остальные
function applyFilters() {
  const query = normalizeText(searchQuery);
  let visibleCount = 0;

  cards.forEach(function (card) {
    const name = normalizeText(card.querySelector("h3").textContent + " " + card.querySelector(".card__text").textContent);

    // 1) подходит ли карточка под выбранную категорию
    let inCategory;
    if (activeCategory === "all") {
      inCategory = true;
    } else if (activeCategory === "favorites") {
      inCategory = favorites.includes(card.dataset.id);
    } else {
      inCategory = card.dataset.category === activeCategory;
    }

    // 2) подходит ли название под текст поиска (пустой поиск подходит всем)
    const matchesSearch = name.includes(query);

    const show = inCategory && matchesSearch;
    const wasHidden = card.hidden;
    card.hidden = !show;

    if (show) {
      visibleCount += 1;
      // карточка только что появилась: показываем её сразу и плавно «вплываем»
      if (wasHidden) {
        card.classList.add("is-visible");
        card.classList.remove("card-enter");
        void card.offsetWidth; // перезапуск анимации
        card.classList.add("card-enter");
      }
    }
  });

  // Кнопка очистки видна только когда в поиске есть текст
  searchClear.hidden = searchInput.value === "";

  // Сообщение, если ничего не нашлось
  menuEmpty.hidden = visibleCount > 0;
  if (visibleCount === 0) {
    if (searchQuery.trim() !== "") {
      menuEmptyText.textContent =
        t("Brak wyników dla „") + searchQuery.trim() + t("”. Spróbuj innej nazwy") +
        (activeCategory === "all" ? "." : t(" lub wybierz kategorię Wszystko."));
    } else if (activeCategory === "favorites") {
      menuEmptyText.textContent =
        t("Brak ulubionych dań. Kliknij serduszko na karcie dania, aby je zapisać.");
    } else {
      menuEmptyText.textContent = t("W tej kategorii nie ma jeszcze dań.");
    }
  }
}

// Убираем класс анимации, когда она закончилась
cards.forEach(function (card) {
  card.addEventListener("animationend", function () {
    card.classList.remove("card-enter");
  });
});

// На телефоне категории прокручиваются по горизонтали:
// после нажатия плавно подводим выбранную кнопку к центру полосы
function centerFilter(button) {
  const bar = button.parentElement;
  if (bar.scrollWidth <= bar.clientWidth) return; // всё помещается — прокручивать нечего

  const barRect = bar.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const shift = buttonRect.left - barRect.left - (bar.clientWidth - buttonRect.width) / 2;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  bar.scrollBy({ left: shift, behavior: reduceMotion ? "auto" : "smooth" });
}

// Категории: запоминаем выбор и перерисовываем меню
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    activeCategory = button.dataset.filter;

    // Подсвечиваем только нажатую кнопку
    filterButtons.forEach(function (b) {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");

    centerFilter(button);
    applyFilters();
  });
});

// Поиск: работает при каждом вводе буквы, страница не перезагружается
searchInput.addEventListener("input", function () {
  searchQuery = searchInput.value;
  applyFilters();
});

// Кнопка очистки поиска (и клавиша Escape внутри поля)
function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  applyFilters();
  searchInput.focus();
}

searchClear.addEventListener("click", clearSearch);

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && searchInput.value !== "") clearSearch();
});

// Избранное: сердечки на карточках (в меню и в блоке Popular Dishes)

// Закрашиваем сердечки у избранных блюд и обновляем счётчик на кнопке Favorites
function updateFavoriteButtons() {
  favButtons.forEach(function (button) {
    const card = button.closest(".card");
    const name = card.querySelector("h3").textContent;
    const isFavorite = favorites.includes(card.dataset.id);

    button.classList.toggle("is-active", isFavorite);
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute(
      "aria-label",
      (isFavorite ? t("Usuń z ulubionych: ") : t("Dodaj do ulubionych: ")) + name
    );
  });

  favCount.textContent = favorites.length;
  favCount.hidden = favorites.length === 0;
}

function toggleFavorite(card) {
  const id = card.dataset.id;
  const name = card.querySelector("h3").textContent;

  if (favorites.includes(id)) {
    favorites = favorites.filter(function (savedId) {
      return savedId !== id;
    });
    showToast(t("Usunięto z ulubionych: ") + name); // showToast jest w cart.js
  } else {
    favorites.push(id);
    showToast(t("Dodano do ulubionych: ") + name);
  }

  saveFavorites();
  updateFavoriteButtons();
  applyFilters(); // если открыт фильтр Favorites, карточка сразу исчезнет
}

favButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    toggleFavorite(button.closest(".card"));
  });
});

// При загрузке страницы показываем сохранённое избранное
updateFavoriteButtons();
applyFilters();

// ===== Плавное появление элементов при прокрутке =====

// Добавляем на страницу пометку, что JavaScript работает (её использует CSS)
document.documentElement.classList.add("js");

// Все элементы, которые должны появляться плавно
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  // «Наблюдатель» следит, когда элемент попадает в видимую часть экрана
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible"); // запускаем анимацию
          observer.unobserve(entry.target); // дальше следить не нужно
        }
      });
    },
    { threshold: 0.15 } // элемент считается видимым, когда виден хотя бы на 15%
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
} else {
  // Старый браузер без IntersectionObserver: просто показываем всё сразу
  revealItems.forEach(function (item) {
    item.classList.add("is-visible");
  });
}


// ===== Шапка: фон при прокрутке, активный раздел, мобильное меню =====

const header = document.querySelector("#header");
const nav = document.querySelector("#nav");
const burger = document.querySelector("#burger");
const navLinks = document.querySelectorAll(".nav a[href^='#']");

// Разделы, на которые ведут ссылки меню (в том же порядке, что и ссылки)
const navSections = Array.from(navLinks)
  .map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  })
  .filter(Boolean);

// Обновляем шапку: добавляем фон после прокрутки и подсвечиваем текущий раздел
function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  // Текущий раздел — последний, верх которого уже поднялся выше «линии чтения»
  const line = header.offsetHeight + window.innerHeight * 0.3;
  let currentId = navSections[0].id;

  navSections.forEach(function (section) {
    if (section.getBoundingClientRect().top <= line) {
      currentId = section.id;
    }
  });

  // В самом низу страницы всегда подсвечиваем последний раздел («Контакты»)
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) currentId = navSections[navSections.length - 1].id;

  navLinks.forEach(function (link) {
    const isCurrent = link.getAttribute("href") === "#" + currentId;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// Не пересчитываем чаще, чем браузер рисует кадры
let headerTicking = false;
function requestHeaderUpdate() {
  if (headerTicking) return;
  headerTicking = true;
  window.requestAnimationFrame(function () {
    updateHeader();
    headerTicking = false;
  });
}

window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
window.addEventListener("resize", requestHeaderUpdate);
updateHeader();

// Мобильное меню (бургер)
function setMenu(open) {
  nav.classList.toggle("is-open", open);
  header.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? t("Zamknij menu") : t("Otwórz menu"));
}

burger.addEventListener("click", function () {
  setMenu(!nav.classList.contains("is-open"));
});

// После выбора пункта меню закрываем
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    setMenu(false);
  });
});

// Меню закрывается по Escape, при открытии корзины и при расширении окна
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") setMenu(false);
});

document.querySelector("#cart-toggle").addEventListener("click", function () {
  setMenu(false);
});

window.addEventListener("resize", function () {
  if (window.innerWidth > 860) setMenu(false);
});