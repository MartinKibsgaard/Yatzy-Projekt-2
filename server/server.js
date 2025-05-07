import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  addPlayer,
  getPlayers,
  startGame,
  rollDiceForPlayer,
  holdDiceForPlayer,
  scoreForPlayer,
  getGameState
} from './gameState.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));
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

// API: join game
app.post('/api/join', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Manglende navn');
  
  req.session.playerName = name;
  addPlayer(name, req.sessionID);
  
  res.status(200).json({ message: 'Player joined successfully' });
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
