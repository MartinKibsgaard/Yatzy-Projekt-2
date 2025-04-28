// server/gameState.mjs

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
  yatzyPoints
} from './yatzy.mjs';

// In-memory state
const state = {
  players: [],
  started: false,
};

export function addPlayer(name, sessionId) {
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
  return { started: true };
}

function findPlayer(id) {
  return state.players.find(p => p.id === id);
}

export function rollDiceForPlayer(id) {
  const p = findPlayer(id);
  if (!p) return { error: 'Player not found' };
  if (p.throwCount >= 3) return { error: 'No rolls left' };
  p.dice = rollDice(p.dice, p.held);
  p.throwCount++;
  return { dice: p.dice, throwCount: p.throwCount };
}

export function holdDiceForPlayer(id, idx, hold) {
  const p = findPlayer(id);
  if (!p) return { error: 'Player not found' };
  p.held[idx] = hold;
  return { held: p.held };
}

export function scoreForPlayer(id, section, idx) {
  const p = findPlayer(id);
  if (!p) return { error: 'Player not found' };
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
  // Reset turn
  p.dice = [0, 0, 0, 0, 0];
  p.held = [false, false, false, false, false];
  p.throwCount = 0;
  return { score, scores: p.scores };
}

function calculateTotal(player) {
  const u = player.scores.upper.reduce((a, v) => a + (v || 0), 0);
  const l = player.scores.lower.reduce((a, v) => a + (v || 0), 0);
  return u + l;
}

// Giver fuld gameState for klienten
export function getGameState(requestingId) {
  const players = state.players.map(p => ({
    id: p.id,
    name: p.name,
    progress: p.throwCount,
    total: calculateTotal(p)
  }));

  const me = findPlayer(requestingId);
  let dice, held, throwCount, scores, sum, bonus, total;
  if (me) {
    dice = me.dice;
    held = me.held;
    throwCount = me.throwCount;
    scores = me.scores;
    sum = me.scores.upper.reduce((a, v) => a + (v || 0), 0);
    bonus = sum >= 63 ? 50 : 0;
    total = calculateTotal(me);
  } else {
    dice = [0, 0, 0, 0, 0];
    held = [false, false, false, false, false];
    throwCount = 0;
    scores = { upper: Array(6).fill(null), lower: Array(9).fill(null) };
    sum = 0;
    bonus = 0;
    total = 0;
  }

  return {
    youId: requestingId,
    started: state.started,
    players,
    dice,
    held,
    throwCount,
    scores,
    sum,
    bonus,
    total
  };
}