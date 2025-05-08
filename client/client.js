// Join game
export async function joinGame(name) {
  try {
    const response = await fetch('http://localhost:8000/api/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
      credentials: 'include' 
    });    

    if (!response.ok) {
      throw new Error(`Failed to join game: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in joinGame:', error);
    throw error;
  }
}

// Roll dice
export async function rollDice() {
  const response = await fetch('http://localhost:8000/api/roll', {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to roll dice');
  }
  return response.json();
}

// Hold or unhold a dice
export async function holdDice(index, hold) {
  const response = await fetch('http://localhost:8000/api/hold', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, hold }),
  });
  if (!response.ok) {
    throw new Error('Failed to hold/unhold dice');
  }
  return response.json();
}

// Score a field
export async function scoreField(section, index) {
  const response = await fetch('http://localhost:8000/api/score', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, index }),
  });
  if (!response.ok) {
    throw new Error('Failed to score field');
  }
  return response.json();
}

// Get the full game state
export async function getGameState() {
  const response = await fetch('http://localhost:8000/api/state', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch game state');
  }
  return response.json();
}

export async function getGamePlayers() {
  const response = await fetch('http://localhost:8000/api/players', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }
  return response.json();
}

export async function getPlayerDetails(playerId) {
  const response = await fetch(`http://localhost:8000/api/player/${playerId}`);
  if (!response.ok) throw new Error('Kunne ikke hente spillerdata');
  return response.json();
}

export async function restartGame() {
  const response = await fetch("/api/restart", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Restart failed");
  return await response.json();
}
