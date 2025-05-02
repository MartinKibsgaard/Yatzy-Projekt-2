// Join game
async function joinGame(name) {
  const response = await fetch('/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to join the game');
  }
  return true;
}

// Get the list of players
async function getPlayers() {
  const response = await fetch('/api/players');
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  return response.json();
}

// Start the game
async function startGame() {
  const response = await fetch('/api/start', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to start the game');
  }
  return response.json();
}

// Roll dice for the current player
async function rollDice() {
  const response = await fetch('/api/roll', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to roll dice');
  }
  return response.json();
}

// Hold or unhold a dice
async function holdDice(index, hold) {
  const response = await fetch('/api/hold', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, hold }),
  });
  if (!response.ok) {
    throw new Error('Failed to hold/unhold dice');
  }
  return response.json();
}

// Score a field
async function scoreField(section, index) {
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, index }),
  });
  if (!response.ok) {
    throw new Error('Failed to score field');
  }
  return response.json();
}

// Get the full game state
async function getGameState() {
  const response = await fetch('/api/state');
  if (!response.ok) {
    throw new Error('Failed to fetch game state');
  }
  return response.json();
}