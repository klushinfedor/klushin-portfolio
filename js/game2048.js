(function () {
  "use strict";
  var core = window.Game2048Core;
  var boardNode = document.getElementById("game-board");
  if (!core || !boardNode) return;
  var scoreNode = document.getElementById("score");
  var bestNode = document.getElementById("best");
  var status = document.getElementById("game-status");
  var board = core.initial(), score = 0, best = 0, celebrated = false, ended = false;
  var statusKey = "← ↑ ↓ → или свайп на телефоне";
  function translate(value) { return window.PortfolioI18n ? window.PortfolioI18n.t(value) : value; }
  function setStatus(value) { statusKey = value; status.textContent = translate(value); }
  try { best = Math.max(0, Number(localStorage.getItem("fedor-2048-best")) || 0); } catch (e) {}
  function render() {
    boardNode.replaceChildren();
    board.forEach(function (row, r) {
      row.forEach(function (value, c) {
        var cell = document.createElement("div");
        cell.className = "game-cell";
        cell.setAttribute("role", "gridcell");
        var language = window.PortfolioI18n ? window.PortfolioI18n.getLanguage() : "ru";
        var label = language === "sr" ? "Red " + (r + 1) + ", kolona " + (c + 1) + ": " + (value || "prazno") : language === "en" ? "Row " + (r + 1) + ", column " + (c + 1) + ": " + (value || "empty") : "Строка " + (r + 1) + ", столбец " + (c + 1) + ": " + (value || "пусто");
        cell.setAttribute("aria-label", label);
        if (value) {
          cell.textContent = value;
          cell.dataset.value = value;
          if (value >= 1024) cell.dataset.large = "true";
        }
        boardNode.appendChild(cell);
      });
    });
    scoreNode.textContent = score;
    bestNode.textContent = best;
  }
  function play(direction) {
    if (ended) return;
    var result = core.move(board, direction);
    if (!result.moved) return;
    board = result.board;
    score += result.score;
    if (score > best) {
      best = score;
      try { localStorage.setItem("fedor-2048-best", String(best)); } catch (e) {}
    }
    var reached = !celebrated && board.some(function (row) { return row.some(function (v) { return v >= 2048; }); });
    if (reached) celebrated = true;
    core.addTile(board);
    if (!core.canMove(board)) {
      ended = true;
      setStatus("Ходов больше нет. Начните новую игру.");
    } else if (reached) {
      setStatus("2048! Можно играть дальше сколько угодно.");
    } else {
      setStatus("← ↑ ↓ → или свайп на телефоне");
    }
    render();
  }
  var directions = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  document.addEventListener("keydown", function (event) {
    var direction = directions[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    event.preventDefault();
    play(direction);
  });
  var startX = 0, startY = 0;
  boardNode.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  boardNode.addEventListener("touchend", function (e) {
    if (e.changedTouches.length !== 1) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });
  document.getElementById("new-game").addEventListener("click", function () {
    board = core.initial(); score = 0; celebrated = false; ended = false;
    setStatus("Новая игра. ← ↑ ↓ → или свайп на телефоне");
    render(); boardNode.focus();
  });
  document.addEventListener("portfolio:language", function () { setStatus(statusKey); render(); });
  window.addEventListener("storage", function (event) {
    if (event.key !== "fedor-2048-best") return;
    best = Math.max(best, Number(event.newValue) || 0);
    render();
  });
  render();
})();
