(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Game2048Core = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function emptyBoard() { return Array.from({ length: 4 }, function () { return [0, 0, 0, 0]; }); }
  function addTile(board, random) {
    var cells = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (!board[r][c]) cells.push([r, c]);
    if (!cells.length) return false;
    var rng = random || Math.random;
    var spot = cells[Math.floor(rng() * cells.length)];
    board[spot[0]][spot[1]] = rng() < 0.9 ? 2 : 4;
    return true;
  }
  function initial(random) { var board = emptyBoard(); addTile(board, random); addTile(board, random); return board; }
  function move(board, direction) {
    if (!["left", "right", "up", "down"].includes(direction)) throw new Error("Invalid direction");
    var next = board.map(function (row) { return row.slice(); });
    var gained = 0, moved = false;
    for (var lane = 0; lane < 4; lane++) {
      var positions = [];
      for (var i = 0; i < 4; i++) {
        if (direction === "left") positions.push([lane, i]);
        if (direction === "right") positions.push([lane, 3 - i]);
        if (direction === "up") positions.push([i, lane]);
        if (direction === "down") positions.push([3 - i, lane]);
      }
      var values = positions.map(function (p) { return board[p[0]][p[1]]; }).filter(Boolean);
      var merged = [];
      for (var j = 0; j < values.length; j++) {
        if (values[j] === values[j + 1]) {
          var sum = values[j] * 2;
          merged.push(sum); gained += sum; j++;
        } else merged.push(values[j]);
      }
      while (merged.length < 4) merged.push(0);
      positions.forEach(function (p, k) {
        if (board[p[0]][p[1]] !== merged[k]) moved = true;
        next[p[0]][p[1]] = merged[k];
      });
    }
    return { board: next, score: gained, moved: moved };
  }
  function canMove(board) {
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      if (!board[r][c]) return true;
      if (r < 3 && board[r][c] === board[r + 1][c]) return true;
      if (c < 3 && board[r][c] === board[r][c + 1]) return true;
    }
    return false;
  }
  return { emptyBoard: emptyBoard, addTile: addTile, initial: initial, move: move, canMove: canMove };
});

