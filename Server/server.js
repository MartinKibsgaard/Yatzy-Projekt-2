import express from "express";
import session from "express-session";
import { rollDice, calculatePoints } from "./yatzy.mjs";

const app = express();
const PORT = 8000;

// Midlertidig spiltilstand i memory
const gameState = {
  players: {},
  started: false
};

app.use(express.static("../client"));
app.use(express.json());
app.use(session({ secret: "madshans", resave: false, saveUninitialized: true }));

// POST /join
app.post("/join", (req, res) => {
  const { name } = req.body;
  if (!gameState.started && name) {
    req.session.playerName = name;
    gameState.players[name] = { dice: [], held: [], points: {}, throwCount: 0 };
    return res.status(200).json({ joined: true });
  }
  res.status(400).json({ error: "Spillet er allerede startet eller mangler navn." });
});

// POST /newgame
app.post("/newgame", (req, res) => {
  const { player } = req.body;
  if (!player) return res.status(400).send("Navn mangler");

  req.session.playerName = player;
  gameState.players[player] = {
    dice: [0, 0, 0, 0, 0],
    held: [false, false, false, false, false],
    points: {},
    throwCount: 0
  };

  res.status(200).send("Spillet oprettet");
});

// POST /roll
app.post("/roll", (req, res) => {
  const playerName = req.session.playerName;
  const player = gameState.players[playerName];
  if (!player) return res.status(403).send("Ikke registreret");

  if (player.throwCount >= 3) return res.status(400).send("Du har kastet 3 gange");

  const { held } = req.body;
  player.held = held;
  player.dice = rollDice(player.dice, held);
  player.points = calculatePoints(player.dice);
  player.throwCount++;

  res.json({
    dice: player.dice,
    points: player.points,
    throwCount: player.throwCount
  });
});

// Server start
app.listen(PORT, () => console.log(`Server kører på http://localhost:${PORT}`));