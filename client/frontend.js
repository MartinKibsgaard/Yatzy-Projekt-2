import { rollDice, holdDice, scoreField, getGameState } from './client.js';

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

  // Vis terninger
  function updateDice(dice, heldArray) {
    for (let i = 0; i < diceImgs.length; i++) {
      if (dice[i] > 0) {
        diceImgs[i].src = `/images/${dice[i]}.png`;
      }
      diceImgs[i].classList.toggle("dice-rolling", !heldArray[i]);
      diceImgs[i].classList.toggle("held-dice", heldArray[i]);
    }
  }

  async function refresh() {
    const state = await getGameState();
    updateDice(state.dice, state.held);
    held = [...state.held];
  
    document.getElementById(
      "turnDisplay"
    ).textContent = `Turn: ${state.throwCount}`;
  
    // Dynamiske scores
    const dynamicScores = state.dynamicScores;
  
    const scoreKeys = [
      "1s",
      "2s",
      "3s",
      "4s",
      "5s",
      "6s",
      "onePair",
      "twoPairs",
      "threeSame",
      "fourSame",
      "fullHouse",
      "smallStraight",
      "largeStraight",
      "chance",
      "yatzy",
    ];
    const upper = state.scores.upper;
    const lower = state.scores.lower;
  
    scoreKeys.forEach((key, i) => {
      const input = document.getElementById(
        "input" + key.charAt(0).toUpperCase() + key.slice(1)
      );
      const val = i < 6 ? upper[i] : lower[i - 6];
      if (input) {
        input.value = val ?? dynamicScores[key] ?? ""; // Brug dynamiske scores
        input.classList.toggle("locked-input", val !== null);
        if (val === null) {
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
  }

  // Roll-knap
  rollButton.addEventListener("click", async () => {
    await rollDice();
    await refresh();
  });

  // Hold/unhold klik på terninger
  diceImgs.forEach((img, i) => {
    img.addEventListener("click", async () => {
      const newHold = !held[i];
      await holdDice(i, newHold);
      await refresh();
    });
  });

  // Initial visning
  refresh();
});