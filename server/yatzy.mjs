export function rollDice(dice, held) {
  const newDice = dice.slice();
  for (let i = 0; i < newDice.length; i++) {
    if (!held[i]) newDice[i] = Math.floor(Math.random() * 6) + 1;
  }
  return newDice;
}

// Frequency helper
function frequency(arr) {
  const freq = Array(7).fill(0);
  arr.forEach(v => freq[v]++);
  return freq;
}

// Pointberegninger

export function sameValuePoints(value, dice) {
  const freq = frequency(dice);
  return freq[value] * value;
}

export function onePairPoints(dice) {
  const freq = frequency(dice);
  for (let i = 6; i > 0; i--) {
    if (freq[i] >= 2) return i * 2;
  }
  return 0;
}

export function twoPairPoints(dice) {
  const freq = frequency(dice);
  const pairs = [];
  for (let i = 6; i > 0; i--) {
    if (freq[i] >= 2) pairs.push(i);
  }
  if (pairs.length >= 2) return pairs[0] * 2 + pairs[1] * 2;
  return 0;
}

export function threeSamePoints(dice) {
  const freq = frequency(dice);
  for (let i = 6; i > 0; i--) {
    if (freq[i] >= 3) return i * 3;
  }
  return 0;
}

export function fourSamePoints(dice) {
  const freq = frequency(dice);
  for (let i = 6; i > 0; i--) {
    if (freq[i] >= 4) return i * 4;
  }
  return 0;
}

export function fullHousePoints(dice) {
  const freq = frequency(dice);
  let pair = 0, three = 0;
  for (let i = 1; i <= 6; i++) {
    if (freq[i] === 2) pair = i;
    if (freq[i] === 3) three = i;
  }
  return pair && three ? pair * 2 + three * 3 : 0;
}

export function smallStraightPoints(dice) {
  const freq = frequency(dice);
  return (freq[1] && freq[2] && freq[3] && freq[4] && freq[5]) ? 15 : 0;
}

export function largeStraightPoints(dice) {
  const freq = frequency(dice);
  return (freq[2] && freq[3] && freq[4] && freq[5] && freq[6]) ? 20 : 0;
}

export function chancePoints(dice) {
  return dice.reduce((a, v) => a + v, 0);
}

export function yatzyPoints(dice) {
  const freq = frequency(dice);
  for (let i = 1; i <= 6; i++) {
    if (freq[i] === 5) return 50;
  }
  return 0;
}

export function sumPoints(dice) {
  let total = 0;
  for (let i = 1; i <= 6; i++) {
    total += sameValuePoints(i, dice);
  }
  return total;
}

export function calculatePoints(dice) {
  return {
    "1s": sameValuePoints(1, dice),
    "2s": sameValuePoints(2, dice),
    "3s": sameValuePoints(3, dice),
    "4s": sameValuePoints(4, dice),
    "5s": sameValuePoints(5, dice),
    "6s": sameValuePoints(6, dice),
    "onePair": onePairPoints(dice),
    "twoPairs": twoPairPoints(dice),
    "threeSame": threeSamePoints(dice),
    "fourSame": fourSamePoints(dice),
    "fullHouse": fullHousePoints(dice),
    "smallStraight": smallStraightPoints(dice),
    "largeStraight": largeStraightPoints(dice),
    "chance": chancePoints(dice),
    "yatzy": yatzyPoints(dice),
    "sum": sumPoints(dice)
  };
}