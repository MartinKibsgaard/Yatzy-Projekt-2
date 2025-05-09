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
  currentPlayerIndex: 0,
};

function getCurrentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function findPlayer(id) {
  return state.players.find(p => p.id === id);
}

function calculateTotal(player) {
  const u = player.scores.upper.reduce((a, v) => a + (v || 0), 0);
  const l = player.scores.lower.reduce((a, v) => a + (v || 0), 0);
  const bonus = u >= 63 ? 50 : 0;
  return u + l + bonus;
}

export function addPlayer(name, sessionId) {
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

export function rollDiceForPlayer(id) {
  const player = findPlayer(id);
  if (!player) return { error: 'Player not found' };

  if (player.id !== getCurrentPlayer().id) {
    return { error: 'Ikke din tur' };
  }

  if (player.throwCount >= 3) return { error: 'No rolls left' };

  player.dice = rollDice(player.dice, player.held);
  player.throwCount++;

  return { dice: player.dice, throwCount: player.throwCount };
}

export function holdDiceForPlayer(id, idx, hold) {
  const player = findPlayer(id);
  if (!player) return { error: 'Player not found' };

  player.held[idx] = hold;
  return { held: player.held };
}

export function scoreForPlayer(id, section, idx) {
  const p = findPlayer(id);
  if (!p) return { error: 'Player not found' };

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
    }
    p.scores.lower[idx] = score;
  }

  p.dice = [0, 0, 0, 0, 0];
  p.held = [false, false, false, false, false];
  p.throwCount = 0;
  
  // Skift tur
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return { score, scores: p.scores };
}

export function getGameState(id) {
  const p = findPlayer(id);
  const isMyTurn = getCurrentPlayer()?.id === id;

  if (!p) {
    return {
      dice: [0, 0, 0, 0, 0],
      held: [false, false, false, false, false],
      throwCount: 0,
      scores: { upper: Array(6).fill(null), lower: Array(9).fill(null) },
      sum: 0,
      bonus: 0,
      total: 0,
      dynamicScores: calculatePoints([0, 0, 0, 0, 0]),
      isMyTurn 
    };
    
  }

  const sum = p.scores.upper.reduce((a, v) => a + (v || 0), 0);
  const bonus = sum >= 63 ? 50 : 0;
  const total = calculateTotal(p);

  return {
    dice: p.dice,
    held: p.held,
    throwCount: p.throwCount,
    scores: p.scores,
    sum,
    bonus,
    total,
    dynamicScores: calculatePoints(p.dice),
    isMyTurn
  };
}

export function restartPlayerGame(id) {
  const player = findPlayer(id);
  if (!player) return { error: "Spiller ikke fundet" };

  player.scores = {
    upper: Array(6).fill(null),
    lower: Array(9).fill(null),
  };
  player.throwCount = 0;
  player.dice = [0, 0, 0, 0, 0];
  player.held = [false, false, false, false, false];

  return { message: "Spil nulstillet" };
}