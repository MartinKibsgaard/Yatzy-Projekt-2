// Pure game logic for server-side scoring and dice rolling

// Roll dice: keep previous values array, update only unheld
function rollDice(dice, held) {
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
  
  function sameValuePoints(value, dice) {
    const freq = frequency(dice);
    return freq[value] * value;
  }
  
  function onePairPoints(dice) {
    const freq = frequency(dice);
    for (let i = 6; i > 0; i--) {
      if (freq[i] >= 2) return i * 2;
    }
    return 0;
  }
  
  function twoPairPoints(dice) {
    const freq = frequency(dice);
    const pairs = [];
    for (let i = 6; i > 0; i--) {
      if (freq[i] >= 2) pairs.push(i);
    }
    if (pairs.length >= 2) return pairs[0] * 2 + pairs[1] * 2;
    return 0;
  }
  
  function threeSamePoints(dice) {
    const freq = frequency(dice);
    for (let i = 6; i > 0; i--) {
      if (freq[i] >= 3) return i * 3;
    }
    return 0;
  }
  
  function fourSamePoints(dice) {
    const freq = frequency(dice);
    for (let i = 6; i > 0; i--) {
      if (freq[i] >= 4) return i * 4;
    }
    return 0;
  }
  
  function fullHousePoints(dice) {
    const freq = frequency(dice);
    let pair = 0, three = 0;
    for (let i = 1; i <= 6; i++) {
      if (freq[i] === 2) pair = i;
      if (freq[i] === 3) three = i;
    }
    return pair && three ? pair * 2 + three * 3 : 0;
  }
  
  function smallStraightPoints(dice) {
    const freq = frequency(dice);
    return (freq[1] && freq[2] && freq[3] && freq[4] && freq[5]) ? 15 : 0;
  }
  
  function largeStraightPoints(dice) {
    const freq = frequency(dice);
    return (freq[2] && freq[3] && freq[4] && freq[5] && freq[6]) ? 20 : 0;
  }
  
  function chancePoints(dice) {
    return dice.reduce((a, v) => a + v, 0);
  }
  
  function yatzyPoints(dice) {
    const freq = frequency(dice);
    for (let i = 1; i <= 6; i++) {
      if (freq[i] === 5) return 50;
    }
    return 0;
  }
  
  function sumPoints(dice) {
    let total = 0;
    for (let i = 1; i <= 6; i++) total += sameValuePoints(i, dice);
    return total;
  }
  
  module.exports = {
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
    sumPoints
  };