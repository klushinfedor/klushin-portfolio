import core from "./game-core.js";

// The server chooses the seed. The browser receives it to animate locally;
// only the server's replayed board and score can update the public record.
export const seededRandom = core.seededRandom;

export function startGame(seed) {
  const random = seededRandom(seed);
  return { board: core.initial(random), rng: random.state(), score: 0, turn: 0 };
}

export function replay(game, moves) {
  if (typeof moves !== "string" || !/^[LRUD]{1,64}$/.test(moves)) throw new Error("Invalid moves");
  const directions = { L: "left", R: "right", U: "up", D: "down" };
  const random = seededRandom(game.rng);
  const board = game.board.map(row => row.slice());
  let score = game.score;
  for (const letter of moves) {
    if (!core.canMove(board)) throw new Error("Game ended");
    const result = core.move(board, directions[letter]);
    if (!result.moved) throw new Error("Impossible move");
    board.splice(0, 4, ...result.board);
    score += result.score;
    core.addTile(board, random);
  }
  return { board, rng: random.state(), score, turn: game.turn + moves.length };
}
