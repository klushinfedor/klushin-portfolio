(function () {
  "use strict";
  var core = window.Game2048Core;
  var boardNode = document.getElementById("game-board");
  if (!core || !boardNode) return;
  var scoreNode = document.getElementById("score");
  var bestNode = document.getElementById("best");
  var globalNode = document.getElementById("global-best");
  var status = document.getElementById("game-status");
  var board = core.initial(), score = 0, best = 0, celebrated = false, ended = false;
  var api = (window.PORTFOLIO_GAME_API || "").replace(/\/$/, "");
  var globalBest = null, session = null, random = null, remoteTurn = 0;
  var pendingMoves = [], sending = false, startingRemote = false, remoteReady = !api, retryTimer = 0;
  var moving = false, motionTimer = 0, motionToken = 0, pendingDirection = null;
  var motionDuration = 190;
  var statusKey = "← ↑ ↓ → или свайп на телефоне";
  function translate(value) { return window.PortfolioI18n ? window.PortfolioI18n.t(value) : value; }
  function setStatus(value) { statusKey = value; status.textContent = translate(value); }
  try { best = Math.max(0, Number(localStorage.getItem("fedor-2048-best")) || 0); } catch (e) {}
  function render(spawn) {
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
          if (value > 2048) cell.classList.add("game-cell--super");
          if (value >= 1024) cell.dataset.large = "true";
          if (spawn && spawn[0] === r && spawn[1] === c) cell.classList.add("is-spawned");
        }
        boardNode.appendChild(cell);
      });
    });
    scoreNode.textContent = score;
    bestNode.textContent = best;
    globalNode.textContent = globalBest === null ? "—" : globalBest;
  }
  function cancelMotion() {
    motionToken++;
    clearTimeout(motionTimer);
    moving = false;
    pendingDirection = null;
    boardNode.classList.remove("is-moving");
  }
  function animateMove(transitions, oldRects, spawn) {
    if (!oldRects || !transitions.length || !Element.prototype.animate) {
      render(spawn);
      return;
    }
    var boardRect = boardNode.getBoundingClientRect();
    var overlay = document.createElement("div");
    overlay.className = "game-tiles-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText = "position:absolute;inset:0;pointer-events:none";
    boardNode.classList.add("is-moving");
    boardNode.appendChild(overlay);
    moving = true;
    var token = ++motionToken;
    transitions.forEach(function (step) {
      var from = oldRects[step.from[0] * 4 + step.from[1]];
      var to = oldRects[step.to[0] * 4 + step.to[1]];
      var tile = document.createElement("div");
      tile.className = "game-cell game-tile-flight";
      tile.dataset.value = step.value;
      if (step.value > 2048) tile.classList.add("game-cell--super");
      if (step.value >= 1024) tile.dataset.large = "true";
      tile.textContent = step.value;
      tile.style.left = (from.left - boardRect.left) + "px";
      tile.style.top = (from.top - boardRect.top) + "px";
      tile.style.width = from.width + "px";
      tile.style.height = from.height + "px";
      overlay.appendChild(tile);
      tile.animate([
        { transform: "translate(0, 0)" },
        { transform: "translate(" + (to.left - from.left) + "px, " + (to.top - from.top) + "px)" }
      ], { duration: motionDuration, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" });
    });
    motionTimer = setTimeout(function () {
      if (token !== motionToken) return;
      moving = false;
      boardNode.classList.remove("is-moving");
      overlay.remove();
      var spawnedCell = spawn && boardNode.children[spawn[0] * 4 + spawn[1]];
      if (spawnedCell) spawnedCell.classList.add("is-spawned");
      var next = pendingDirection;
      pendingDirection = null;
      if (next) play(next);
    }, motionDuration);
  }
  function play(direction) {
    if (!remoteReady) return;
    if (moving) { pendingDirection = direction; return; }
    if (ended) return;
    var result = core.move(board, direction);
    if (!result.moved) return;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var oldRects = reducedMotion ? null : Array.prototype.map.call(boardNode.children, function (cell) { return cell.getBoundingClientRect(); });
    board = result.board;
    score += result.score;
    if (score > best) {
      best = score;
      try { localStorage.setItem("fedor-2048-best", String(best)); } catch (e) {}
    }
    var reached = !celebrated && board.some(function (row) { return row.some(function (v) { return v >= 2048; }); });
    if (reached) celebrated = true;
    var beforeSpawn = board.map(function (row) { return row.slice(); });
    core.addTile(board, random || Math.random);
    var spawn = null;
    board.forEach(function (row, r) { row.forEach(function (value, c) {
      if (!beforeSpawn[r][c] && value) spawn = [r, c];
    }); });
    if (!core.canMove(board)) {
      ended = true;
      setStatus("Ходов больше нет. Начните новую игру.");
    } else if (reached) {
      setStatus("2048! Можно играть дальше сколько угодно.");
    } else {
      setStatus("← ↑ ↓ → или свайп на телефоне");
    }
    render();
    animateMove(result.transitions, oldRects, spawn);
    if (session) {
      pendingMoves.push({ left: "L", right: "R", up: "U", down: "D" }[direction]);
      // The server replays these moves from its own stored board; no score is sent.
      if (!sending) { clearTimeout(retryTimer); retryTimer = setTimeout(flushMoves, 220); }
    }
  }
  async function request(path, options) {
    var response = await fetch(api + path, Object.assign({ cache: "no-store", headers: { "Content-Type": "application/json" } }, options || {}));
    var data = await response.json();
    if (!response.ok) { var error = new Error(data.error || "Network error"); error.data = data; error.code = response.status; throw error; }
    return data;
  }
  function updateGlobal(value) {
    if (Number.isSafeInteger(value) && value >= 0) {
      globalBest = Math.max(globalBest || 0, value);
      globalNode.textContent = globalBest;
    }
  }
  async function fetchGlobal() {
    if (!api) return;
    try { updateGlobal((await request("/record")).record); } catch (e) { /* Keep the last known record. */ }
  }
  async function startRemoteGame() {
    if (!api || startingRemote) return;
    startingRemote = true;
    clearTimeout(retryTimer);
    try {
      if (session && pendingMoves.length) {
        await flushMoves();
        if (pendingMoves.length) {
          setStatus("Связь с рекордом прервалась. Ходы сохраняются до повторной отправки.");
          return;
        }
      }
      remoteReady = false;
      var data = await request("/session", { method: "POST", body: "{}" });
      cancelMotion();
      session = data.id; random = core.seededRandom(data.seed);
      board = core.initial(random); score = 0; ended = false; celebrated = false;
      remoteTurn = 0; pendingMoves = [];
      updateGlobal(data.record); remoteReady = true;
      setStatus("Новая игра. ← ↑ ↓ → или свайп на телефоне");
      render(); boardNode.focus();
    } catch (e) {
      remoteReady = false;
      setStatus("Не удалось подключиться к игре. Нажмите «Новая игра», чтобы повторить.");
    } finally {
      startingRemote = false;
    }
  }
  async function flushMoves() {
    if (!api || !session || sending || !pendingMoves.length) return;
    sending = true;
    var id = session;
    var from = remoteTurn;
    var moves = pendingMoves.slice(0, 64).join("");
    try {
      var data = await request("/moves", { method: "POST", body: JSON.stringify({ id: id, from: from, moves: moves }) });
      if (id !== session) return;
      if (data.turn !== from + moves.length || data.score > score) throw new Error("Server state mismatch");
      remoteTurn = data.turn;
      pendingMoves.splice(0, moves.length);
      updateGlobal(data.record);
    } catch (e) {
      if (id !== session) return;
      if (e.code === 409 && e.data && e.data.turn > from && e.data.turn <= from + moves.length) {
        var accepted = e.data.turn - from;
        pendingMoves.splice(0, accepted);
        remoteTurn = e.data.turn;
        updateGlobal(e.data.record);
      } else if (e.code === 404 || e.code === 400) {
        remoteReady = false;
        session = null;
        pendingMoves = [];
        setStatus("Проверка ходов не прошла. Нажмите «Новая игра», чтобы начать заново.");
      } else {
        setStatus("Связь с рекордом прервалась. Ходы сохраняются до повторной отправки.");
      }
    } finally {
      sending = false;
      if (id === session && remoteReady && pendingMoves.length) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(flushMoves, 1800);
      }
    }
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
    if (api) { startRemoteGame(); return; }
    cancelMotion();
    board = core.initial(); score = 0; celebrated = false; ended = false;
    setStatus("Новая игра. ← ↑ ↓ → или свайп на телефоне");
    render(); boardNode.focus();
  });
  document.addEventListener("portfolio:language", function () { cancelMotion(); setStatus(statusKey); render(); });
  window.addEventListener("storage", function (event) {
    if (event.key !== "fedor-2048-best") return;
    best = Math.max(best, Number(event.newValue) || 0);
    bestNode.textContent = best;
  });
  render();
  if (api) {
    startRemoteGame();
    fetchGlobal();
    setInterval(fetchGlobal, 30000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { fetchGlobal(); flushMoves(); } });
  }
})();
