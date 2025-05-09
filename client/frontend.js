import { rollDice, holdDice, scoreField, getGameState, getGamePlayers } from './client.js';

document.addEventListener("DOMContentLoaded", () => {
  const rollButton = document.getElementById("rollButton");
  const diceImgs = [
    document.getElementById("diceImg1"),
    document.getElementById("diceImg2"),
    document.getElementById("diceImg3"),
    document.getElementById("diceImg4"),
    document.getElementById("diceImg5"),
  ];

  let held = [false, false, false, false, false];

  function updateDice(dice, heldArray) {
    const isFirstLoad = dice.every(val => val === 0);
    const introImages = ["y.png", "a.png", "t.png", "z.png", "y.png"];

    for (let i = 0; i < diceImgs.length; i++) {
      if (isFirstLoad) {
        diceImgs[i].src = `/images/${introImages[i]}`;
      } else if (dice[i] > 0) {
        diceImgs[i].src = `/images/${dice[i]}.png`;
      } else {
        diceImgs[i].src = `/images/0.png`;
      }

      diceImgs[i].classList.toggle("dice-rolling", !heldArray[i]);
      diceImgs[i].classList.toggle("held-dice", heldArray[i]);
    }
  }

  async function refresh() {
    const state = await getGameState();

    updateDice(state.dice, state.held);
    held = [...state.held];

    // Vis tur-info
    document.getElementById("turnDisplay").textContent =
      state.isMyTurn ? `🎲 Din tur – Slag: ${state.throwCount}` : `⌛ Modstanderens tur`;

    // Håndtering af roll-knappen
    if (!state.isMyTurn) {
      rollButton.disabled = true;
      rollButton.textContent = "⏳ Venter på modstander...";
      rollButton.classList.remove("game-over");
    } else if (state.throwCount >= 3) {
      rollButton.disabled = true;
      rollButton.textContent = "Ingen slag tilbage";
      rollButton.classList.remove("game-over");
    } else {
      rollButton.disabled = false;
      rollButton.textContent = "Roll";
      rollButton.classList.remove("game-over");
    }

    const dynamicScores = state.dynamicScores;
    const upper = state.scores.upper;
    const lower = state.scores.lower;

    const scoreKeys = [
      "1s", "2s", "3s", "4s", "5s", "6s",
      "onePair", "twoPairs", "threeSame", "fourSame",
      "fullHouse", "smallStraight", "largeStraight", "chance", "yatzy"
    ];

    scoreKeys.forEach((key, i) => {
      const input = document.getElementById("input" + key.charAt(0).toUpperCase() + key.slice(1));
      const val = i < 6 ? upper[i] : lower[i - 6];

      if (input) {
        input.value = val ?? dynamicScores[key] ?? "";
        input.classList.toggle("locked-input", val !== null);
        input.classList.toggle("active-score", val === null && state.throwCount > 0);
        input.onclick = null;

        if (val === null && state.throwCount > 0 && state.isMyTurn) {
          input.onclick = async () => {
            await scoreField(i < 6 ? "upper" : "lower", i < 6 ? i : i - 6);
            await refresh();
          };
        }
      }
    });

    document.getElementById("inputSum").value = state.sum;
    document.getElementById("inputBonus").value = state.bonus;
    document.getElementById("inputTotal").value = state.total;

    const filledCount = [...upper, ...lower].filter(v => v !== null).length;
    if (filledCount === 15) {
      rollButton.disabled = true;
      rollButton.textContent = "🎉 Spillet er slut!";
      rollButton.classList.add("game-over");
      if (confirm(`🎉 Spillet er færdigt! Din score blev: ${state.total} point. Vil du vende tilbage til lobbyen?`)) {
        window.location.href = "lobby.html";
      }
    }
  }

  async function scoreboardUpdater() {
    const players = await getGamePlayers();
    const scoreboardTable = document.getElementById("scoreboardTable");
    scoreboardTable.innerHTML = "";

    players.forEach((player) => {
      const row = document.createElement("li");
      row.textContent = `${player.name} | Points: ${player.total}`;
      scoreboardTable.appendChild(row);
    });
  }

  // Roll-knap med ternings-animation
  rollButton.addEventListener("click", async () => {
    diceImgs.forEach(img => img.classList.add("dice-rolling"));
    setTimeout(() => diceImgs.forEach(img => img.classList.remove("dice-rolling")), 600);

    await rollDice();
    await refresh();
  });

  // Klik på terninger for at holde dem – kun hvis det er din tur
  diceImgs.forEach((img, i) => {
    img.addEventListener("click", async () => {
      const state = await getGameState();
      const isFirstLoad = state.throwCount === 0 && state.dice.every(val => val === 0);
      if (isFirstLoad || !state.isMyTurn) return;

      const newHold = !held[i];
      await holdDice(i, newHold);
      await refresh();
    });
  });

  const backBtn = document.getElementById("backToLobbyBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "lobby.html";
    });
  }

  refresh();
  setInterval(refresh, 1000);        // Poll hvert sekund for at holde tur-status opdateret
  scoreboardUpdater();
  setInterval(scoreboardUpdater, 5000);
});
