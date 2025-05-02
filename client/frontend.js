// Example frontend code to interact with the game server
// client/client.js

// Join the game
joinGame('Player1')
  .then(() => console.log('Joined the game'))
  .catch(err => console.error(err));

// Roll dice
rollDice()
  .then(data => console.log('Rolled dice:', data))
  .catch(err => console.error(err));

// Get game state
getGameState()
  .then(state => console.log('Game state:', state))
  .catch(err => console.error(err));