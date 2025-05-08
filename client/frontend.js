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
    const isMyTurn = state.youId === state.currentPlayerId;

    updateDice(state.dice, state.held);
    held = [...state.held];

    document.getElementById("turnDisplay").textContent = isMyTurn
      ? `Din tur (Slag: ${state.throwCount})`
      : `Vent på tur...`;

    rollButton.disabled = !isMyTurn;

    // Dynamiske scores
    const dynamicScores = state.dynamicScores;

    const scoreKeys = [
      "1s", "2s", "3s", "4s", "5s", "6s",
      "onePair", "twoPairs", "threeSame", "fourSame",
      "fullHouse", "smallStraight", "largeStraight", "chance", "yatzy"
    ];

    const upper = state.scores.upper;
    const lower = state.scores.lower;

    scoreKeys.forEach((key, i) => {
      const input = document.getElementById("input" + key.charAt(0).toUpperCase() + key.slice(1));
      const val = i < 6 ? upper[i] : lower[i - 6];

      if (input) {
        input.value = val ?? dynamicScores[key] ?? "";
        input.classList.toggle("locked-input", val !== null);
        input.classList.toggle("active-score", val === null && isMyTurn);
        input.onclick = null;

        if (val === null && isMyTurn) {
          input.onclick = async () => {
            await scoreField(i < 6 ? "upper" : "lower", i < 6 ? i : i - 6);
            await refresh();
          };
        }
      }
    });

    // Sum og bonus
    document.getElementById("inputSum").value = state.sum;
    document.getElementById("inputBonus").value = state.bonus;
    document.getElementById("inputTotal").value = state.total;

    // ✅ Spil slut: alle felter er låst
    const filledCount = [...upper, ...lower].filter(v => v !== null).length;
    if (filledCount === 15) {
      rollButton.disabled = true;
      rollButton.textContent = "🎉 Spillet er slut!";
      rollButton.classList.add("game-over");

      alert(`🎉 Spillet er færdigt! Din score blev: ${state.total} point`);
      window.location.href = "lobby.html";
    }
  }

  // Roll-knap med ternings-animation
  rollButton.addEventListener("click", async () => {
    diceImgs.forEach(img => {
      img.classList.add("dice-rolling");
    });

    setTimeout(() => {
      diceImgs.forEach(img => {
        img.classList.remove("dice-rolling");
      });
    }, 600);

    await rollDice();
    await refresh();
  });

  // Klik på terning for at holde – kun hvis det er ens tur
  diceImgs.forEach((img, i) => {
    img.addEventListener("click", async () => {
      const state = await getGameState();
      const isFirstLoad = state.throwCount === 0 && state.dice.every(val => val === 0);
      const isMyTurn = state.youId === state.currentPlayerId;

      if (!isMyTurn || isFirstLoad) return;

      const newHold = !held[i];
      await holdDice(i, newHold);
      await refresh();
    });
  });

  // Første visning
  refresh();
});