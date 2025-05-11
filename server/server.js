import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  addPlayer,
  getPlayers,
  rollDiceForPlayer,
  holdDiceForPlayer,
  scoreForPlayer,
  getGameState,
  restartPlayerGame,
} from "./gameState.js";

const app = express();
const PORT = 8000;

app.use(
  cors({
    origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "yatzy-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "lax",
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/lobby.html"));
});

// API: join game
app.post("/api/join", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Manglende navn");

  if (req.session.hasJoined) {
    return res.status(400).json({ error: "Du er allerede tilmeldt." });
  }

  req.session.playerName = name;
  req.session.hasJoined = true;

  addPlayer(name, req.sessionID);

  res.status(200).json({ message: "Player joined successfully" });
});

// API: get players (kan bruges til scoreboard i fremtiden)
app.get("/api/players", (req, res) => {
  res.json(getPlayers());
});

// API: roll dice
app.post("/api/roll", (req, res) => {
  const id = req.sessionID;
  const result = rollDiceForPlayer(id);
  res.json(result);
});

// API: hold/unhold dice
app.post("/api/hold", (req, res) => {
  const { index, hold } = req.body;
  const id = req.sessionID;
  const result = holdDiceForPlayer(id, index, hold);
  res.json(result);
});

// API: score a field
app.post("/api/score", (req, res) => {
  const { section, index } = req.body;
  const id = req.sessionID;
  const result = scoreForPlayer(id, section, index);
  res.json(result);
});

// API: get full game state
app.get("/api/state", (req, res) => {
  const id = req.sessionID;
  res.json(getGameState(id));
});

app.get("/api/player/:id", (req, res) => {
  const { id } = req.params;
  const state = getGameState(id);
  res.json(state);
});

app.post("/api/restart", (req, res) => {
  const id = req.sessionID;
  const result = restartPlayerGame(id);
  res.json(result);
});

// Static files
app.use(express.static(path.join(__dirname, '../client')));

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
