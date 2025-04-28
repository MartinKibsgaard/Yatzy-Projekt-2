const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { addPlayer, getPlayers, startGame, rollDiceForPlayer, holdDiceForPlayer, scoreForPlayer, getGameState } = require('./gameState');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'yatzy-secret',
  resave: false,
  saveUninitialized: true,
}));


// Pug-templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static files
app.use(express.static(path.join(__dirname, '../client')));

// Lobby route
app.get('/', async (req, res, next) => {
  try {
    console.log('>>> Henter forside...');
    const id = req.sessionID;
    if (!req.session.playerName) {
      console.log('>>> Ingen spiller i session. Viser lobby.');
      res.render('lobby', { players: getPlayers(), gameStarted: getGameState(id).started });
    } else {
      console.log('>>> Spiller fundet i session. Sender index.html');
      res.sendFile(path.join(__dirname, '../client/index.html'));
    }
  } catch (error) {
    console.error('Fejl i / route:', error);
    next(error); // Giver fejlen videre til Express
  }
});




// API: join game
app.post('/api/join', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Manglende navn');
  req.session.playerName = name;
  addPlayer(name, req.sessionID);
  res.redirect('/');
});

// API: get players
app.get('/api/players', (req, res) => {
  res.json(getPlayers());
});

// API: start game
app.post('/api/start', (req, res) => {
  const result = startGame();
  res.json(result);
});

// API: roll dice for current player
app.post('/api/roll', (req, res) => {
  const id = req.sessionID;
  const result = rollDiceForPlayer(id);
  res.json(result);
});

// API: hold/unhold dice
app.post('/api/hold', (req, res) => {
  const { index, hold } = req.body;
  const id = req.sessionID;
  const result = holdDiceForPlayer(id, index, hold);
  res.json(result);
});

// API: score a field
app.post('/api/score', (req, res) => {
  const { section, index } = req.body;
  const id = req.sessionID;
  const result = scoreForPlayer(id, section, index);
  res.json(result);
});

// API: get full game state or for one player
app.get('/api/state', (req, res) => {
  const id = req.sessionID;
  res.json(getGameState(id));
});


// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));