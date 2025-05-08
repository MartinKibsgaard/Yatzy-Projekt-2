import {
  rollDice,
  sameValuePoints,
  onePairPoints,
  twoPairPoints,
  threeSamePoints,
  fourSamePoints,
  fullHousePoints,
  smallStraightPoints,
  largeStraightPoints,
  chancePoints,
  yatzyPoints,
  calculatePoints
} from './yatzy.mjs';

const state = {
  players: [],
  started: false,
  currentPlayerIndex: 0,
};

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function nextPlayer() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
}

function findPlayer(id) {
  return state.players.find(p => p.id === id);
}

function calculateTotal(player) {
  const u = player.scores.upper.reduce((a, v) => a + (v || 0), 0);
  const l = player.scores.lower.reduce((a, v) => a + (v || 0), 0);
  return u + l;
}

export function addPlayer(name, sessionId) {
  console.log(`🔵 AddPlayer: ${name}, session: ${sessionId}`);
  if (state.started) return;
  if (!state.players.find(p => p.id === sessionId)) {
    state.players.push({
      name,
      id: sessionId,
      dice: [0, 0, 0, 0, 0],
      held: [false, false, false, false, false],
      throwCount: 0,
      scores: { upper: Array(6).fill(null), lower: Array(9).fill(null) },
    });
  }
}

export function getPlayers() {
  return state.players.map(p => ({
    id: p.id,
    name: p.name,
    progress: p.throwCount,
    total: calculateTotal(p)
  }));
}

export function startGame() {
  state.started = true;
  state.currentPlayerIndex = 0;
  return { started: true };
}

export function rollDiceForPlayer(id) {
  const current = getCurrentPlayer();
  if (current.id !== id) return { error: 'Not your turn' };

  if (current.throwCount >= 3) return { error: 'No rolls left' };

  current.dice = rollDice(current.dice, current.held);
  current.throwCount++;
  return { dice: current.dice, throwCount: current.throwCount };
}

export function holdDiceForPlayer(id, idx, hold) {
  const current = getCurrentPlayer();
  if (current.id !== id) return { error: 'Not your turn' };

  current.held[idx] = hold;
  return { held: current.held };
}

export function scoreForPlayer(id, section, idx) {
  const p = getCurrentPlayer();
  if (p.id !== id) return { error: 'Not your turn' };

  if (section === 'upper' && p.scores.upper[idx] !== null) {
    return { error: 'Field already scored' };
  }
  if (section === 'lower' && p.scores.lower[idx] !== null) {
    return { error: 'Field already scored' };
  }

  const vals = p.dice;
  let score = 0;

  if (section === 'upper') {
    score = sameValuePoints(idx + 1, vals);
    p.scores.upper[idx] = score;
  } else {
    switch (idx) {
      case 0: score = onePairPoints(vals); break;
      case 1: score = twoPairPoints(vals); break;
      case 2: score = threeSamePoints(vals); break;
      case 3: score = fourSamePoints(vals); break;
      case 4: score = fullHousePoints(vals); break;
      case 5: score = smallStraightPoints(vals); break;
      case 6: score = largeStraightPoints(vals); break;
      case 7: score = chancePoints(vals); break;
      case 8: score = yatzyPoints(vals); break;
      default: break;
    }
    p.scores.lower[idx] = score;
  }

  // Reset spillerens tur
  p.dice = [0, 0, 0, 0, 0];
  p.held = [false, false, false, false, false];
  p.throwCount = 0;

  // Skift tur
  nextPlayer();

  return { score, scores: p.scores };
}

export function getGameState(requestingId) {
  const players = state.players.map(p => ({
    id: p.id,
    name: p.name,
    progress: p.throwCount,
    total: calculateTotal(p)
  }));

  const me = findPlayer(requestingId);
  let dice, held, throwCount, scores, sum, bonus, total, dynamicScores;
  if (me) {
    dice = me.dice;
    held = me.held;
    throwCount = me.throwCount;
    scores = me.scores;
    sum = me.scores.upper.reduce((a, v) => a + (v || 0), 0);
    bonus = sum >= 63 ? 50 : 0;
    total = calculateTotal(me);
    dynamicScores = calculatePoints(dice);
  } else {
    dice = [0, 0, 0, 0, 0];
    held = [false, false, false, false, false];
    throwCount = 0;
    scores = { upper: Array(6).fill(null), lower: Array(9).fill(null) };
    sum = 0;
    bonus = 0;
    total = 0;
    dynamicScores = calculatePoints(dice);
  }

  return {
    youId: requestingId,
    currentPlayerId: getCurrentPlayer()?.id, // 🔥 ny info til klienten
    started: state.started,
    players,
    dice,
    held,
    throwCount,
    scores,
    sum,
    bonus,
    total,
    dynamicScores
  };
}