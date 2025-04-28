// Client-side script: binder UI til backend via fetch

document.addEventListener('DOMContentLoaded', () => {
    // Initial state
    updateState();
  
    // Roll-knap
    document.getElementById('rollButton')
      .addEventListener('click', async () => {
        await fetch('/api/roll', { method: 'POST' });
        await updateState();
      });
  
    // Terninge-click for hold
    const diceImgs = document.querySelectorAll('.dice');
    diceImgs.forEach((img, idx) => {
      img.addEventListener('click', async () => {
        await fetch('/api/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: idx, hold: img.classList.toggle('held') })
        });
        await updateState();
      });
    });
  
    // Score-felter
    const upperIDs = ['input1s','input2s','input3s','input4s','input5s','input6s'];
    const lowerIDs = [
      'inputOnePairs','inputTwoPairs','inputThreeSame','inputFourSame',
      'inputFullHouse','inputSmallStraight','inputLargeStraight',
      'inputChance','inputYatzy'
    ];
  
    upperIDs.forEach((id, i) => {
      document.getElementById(id)
        .addEventListener('click', async () => {
          await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: 'upper', index: i })
          });
          await updateState();
        });
    });
  
    lowerIDs.forEach((id, i) => {
      document.getElementById(id)
        .addEventListener('click', async () => {
          await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section: 'lower', index: i })
          });
          await updateState();
        });
    });
  });
  
  // Helper til at hente og opdatere UI
  async function updateState() {
    const res = await fetch('/api/state');
    const state = await res.json();
    const me = state.players.find(p => p.id === state.youId);
  
    // Opdater dice
    state.dice.forEach((val, i) => updateDiceImage(i+1, val));
    document.getElementById('turnDisplay').innerText = 'Turn: ' + state.throwCount;
  
    // Marker holdte terninger
    state.held.forEach((h, i) => {
      const img = document.getElementById('diceImg'+(i+1));
      img.classList.toggle('held', h);
    });
  
    // Opdater scores
    me.scores.upper.forEach((v, i) => {
      const input = document.getElementById('input'+(i+1)+'s');
      input.value = v !== null ? v : '';
      input.disabled = v !== null;
    });
    me.scores.lower.forEach((v, i) => {
      const input = document.getElementById(lowerIDs[i]);
      input.value = v !== null ? v : '';
      input.disabled = v !== null;
    });
  
    // Sum, bonus, total
    document.getElementById('inputSum').value = state.sum;
    document.getElementById('inputBonus').value = state.bonus;
    document.getElementById('inputTotal').value = state.total;

    const scoreboardList = document.getElementById('scoreboardList');
    scoreboardList.innerHTML = '';
    state.players.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name}: ${p.total} pts (Rolls: ${p.progress})`;
      if (p.id === state.youId) {
        li.style.fontWeight = 'bold';
        li.style.textDecoration = 'underline';
      }
      scoreboardList.appendChild(li);
    });
  }
  
  // Copy-paste fra gui.js
  function updateDiceImage(diceNumber, value) {
    const diceImg = document.getElementById(`diceImg${diceNumber}`);
    const imageName = value === 0 ? 'dice0.png' : `${value}.png`;
    diceImg.src = `/resources/images/${imageName}`;
    diceImg.alt = value === 0 ? 'Dice reset' : `Dice showing ${value}`;
  }