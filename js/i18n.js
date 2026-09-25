(function () {
  "use strict";
  var dictionaries = window.PortfolioTranslations || { sr: {}, en: {} };
  var allowed = { ru: true, sr: true, en: true };
  var query = new URLSearchParams(window.location.search).get("lang");
  var stored = "";
  try { stored = localStorage.getItem("fedor-portfolio-language") || ""; } catch (e) {}
  var current = allowed[query] ? query : (allowed[stored] ? stored : "ru");
  var originalTitle = document.title;
  var originalNodes = [];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim() || /^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)) continue;
    originalNodes.push([node, node.nodeValue]);
  }
  var attributes = [];
  document.querySelectorAll("[aria-label],[title],[placeholder]").forEach(function (el) {
    ["aria-label", "title", "placeholder"].forEach(function (name) {
      if (el.hasAttribute(name)) attributes.push([el, name, el.getAttribute(name)]);
    });
  });
  function t(source) {
    if (current === "ru") return source;
    var dict = dictionaries[current] || {};
    return dict[source] || source;
  }
  function translatedTitle() {
    if (current === "ru") return originalTitle;
    var direct = t(originalTitle);
    if (direct !== originalTitle) return direct;
    var author = current === "sr" ? "Fjodor Klušin" : "Fedor Klushin";
    return originalTitle.replace("Дарья Т.", t("Дарья Т.")).replace("— кейс Фёдора Клушина", current === "sr" ? "— projekat Fjodora Klušina" : "— case study by Fedor Klushin").replace("· Фёдор Клушин", "· " + author);
  }
  function translatedAttribute(value) {
    if (current === "ru") return value;
    if (dictionaries[current][value]) return dictionaries[current][value];
    if (value.indexOf("Скачать кейс ") === 0) {
      var name = value.replace(/^Скачать кейс /, "").replace(/ в PDF$/, "");
      return current === "sr" ? "Preuzmi projekat " + name + " kao PDF" : "Download " + name + " as PDF";
    }
    if (value.indexOf("Открыть изображение: ") === 0) {
      return (current === "sr" ? "Otvori sliku: " : "Open image: ") + value.replace(/^Открыть изображение: /, "");
    }
    return value;
  }
  function localizedLinks() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var raw = a.getAttribute("href");
      if (!raw || raw[0] === "#" || a.hasAttribute("download")) return;
      var url = new URL(raw, window.location.href);
      if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
      if (!/\.html$/.test(url.pathname) && !url.pathname.endsWith("/")) return;
      if (current === "ru") url.searchParams.delete("lang");
      else url.searchParams.set("lang", current);
      a.href = url.href;
    });
  }
  var switcher = document.createElement("div");
  switcher.className = "lang-switcher";
  switcher.innerHTML = '<button class="lang-switcher__trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Выбор языка"><span class="lang-switcher__current">RU</span>⌄</button><div class="lang-switcher__menu" role="group" aria-label="Выбор языка"><button type="button" data-lang="ru">RU</button><button type="button" data-lang="sr">SR</button><button type="button" data-lang="en">EN</button></div>';
  var header = document.querySelector(".site-header");
  if (header) {
    var toggle = header.querySelector(".nav-toggle");
    header.insertBefore(switcher, toggle);
  }
  var trigger = switcher.querySelector(".lang-switcher__trigger");
  function close() {
    switcher.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }
  trigger.addEventListener("click", function () {
    var open = !switcher.classList.contains("is-open");
    switcher.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
  });
  switcher.querySelectorAll("[data-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(button.dataset.lang);
      close();
    });
  });
  document.addEventListener("click", function (e) { if (!switcher.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && switcher.classList.contains("is-open")) { close(); trigger.focus(); }
  });
  function setLanguage(lang) {
    if (!allowed[lang]) return;
    current = lang;
    document.documentElement.lang = lang === "sr" ? "sr-Latn" : lang;
    originalNodes.forEach(function (entry) {
      var raw = entry[1], normalized = raw.replace(/\s+/g, " ").trim();
      if (!normalized) return;
      var leading = raw.match(/^\s*/)[0], trailing = raw.match(/\s*$/)[0];
      entry[0].nodeValue = leading + t(normalized) + trailing;
    });
    attributes.forEach(function (entry) { entry[0].setAttribute(entry[1], translatedAttribute(entry[2])); });
    document.title = translatedTitle();
    switcher.querySelector(".lang-switcher__current").textContent = lang.toUpperCase();
    switcher.querySelectorAll("[data-lang]").forEach(function (button) { button.setAttribute("aria-current", String(button.dataset.lang === lang)); });
    trigger.setAttribute("aria-label", translatedAttribute("Выбор языка"));
    switcher.querySelector(".lang-switcher__menu").setAttribute("aria-label", translatedAttribute("Выбор языка"));
    localizedLinks();
    try { localStorage.setItem("fedor-portfolio-language", lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent("portfolio:language", { detail: { language: lang } }));
  }
  window.PortfolioI18n = { t: t, getLanguage: function () { return current; }, setLanguage: setLanguage };
  setLanguage(current);
})();
