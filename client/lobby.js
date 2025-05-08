import { joinGame, getGamePlayers, getPlayerDetails, restartGame } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("usernameInput");
  const submitButton = document.getElementById("submitBtn");
  const startGameButton = document.getElementById("startGameButton");
  const lobbyTable = document.getElementById("lobbytable");

  let joined = false;

  // 👇 TJEK om spilleren allerede har tilmeldt sig i sessionen
  if (sessionStorage.getItem("hasJoined") === "true") {
    const savedName = sessionStorage.getItem("playerName") || "";
    usernameInput.value = savedName;
    usernameInput.disabled = true;
    submitButton.disabled = true;
    submitButton.value = "✅ Allerede tilmeldt";
    startGameButton.disabled = false;
    joined = true;
  }

  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = usernameInput.value;

    if (!username) {
      alert("Indtast et navn");
      return;
    }

    try {
      const response = await joinGame(username);

      if (response?.error) {
        alert(response.error);
        return;
      }

      usernameInput.disabled = true;
      submitButton.disabled = true;
      submitButton.value = "✅ Navn oprettet";
      startGameButton.disabled = false;
      sessionStorage.setItem("hasJoined", "true");
      sessionStorage.setItem("playerName", username);
      joined = true;
    } catch (err) {
      console.error("Noget gik galt ved join:", err);
      alert("Kunne ikke oprette spiller – SessionID allerede i brug.");
    }
  });

  startGameButton.addEventListener("click", () => {
    if (joined) {
      window.location.href = "index.html";
    }
  });

  async function updateLobbyTable() {
    try {
      const players = await getGamePlayers();
      lobbyTable.innerHTML = "";

      players.forEach((player) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td class="hover-player" data-id="${player.id}">${player.name}</td>`;
        lobbyTable.appendChild(row);
      });
    } catch (error) {
      console.error("Kunne ikke hente spillere:", error);
    }
  }

  // Tooltip on hover
  let activeTooltip = null;
  let tooltipTimeout = null;

  lobbyTable.addEventListener("mouseover", async (e) => {
    if (!e.target.matches("td.hover-player")) return;

    clearTimeout(tooltipTimeout);

    const playerId = e.target.dataset.id;
    const details = await getPlayerDetails(playerId);

    if (activeTooltip) activeTooltip.remove();

    const tooltip = document.createElement("div");
    tooltip.className = "hover-tooltip fancy";
    tooltip.innerHTML = `
      <h4>${e.target.textContent}</h4>
      <div class="tooltip-scoreboard">
        <table class="tooltip-table">
          <tr><th colspan="2">Øvre Sektion</th></tr>
          ${details.scores.upper.map((val, i) => `<tr><td>${i + 1}s</td><td>${val ?? '-'}</td></tr>`).join('')}
          <tr><td><b>Sum</b></td><td>${details.sum}</td></tr>
          <tr><td><b>Bonus</b></td><td>${details.bonus}</td></tr>
        </table>
        <table class="tooltip-table">
          <tr><th colspan="2">Nedre Sektion</th></tr>
          ${[
            'One Pair', 'Two Pairs', 'Three of a Kind', 'Four of a Kind',
            'Full House', 'Small Straight', 'Large Straight', 'Chance', 'Yatzy'
          ].map((label, i) => `<tr><td>${label}</td><td>${details.scores.lower[i] ?? '-'}</td></tr>`).join('')}
          <tr><td><b>Total</b></td><td>${details.total}</td></tr>
        </table>
      </div>
    `;

    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    const rect = e.target.getBoundingClientRect();
    tooltip.style.top = `${rect.top + 5}px`;
    tooltip.style.left = `${rect.right + 30}px`;
  });

  lobbyTable.addEventListener("mouseout", (e) => {
    if (!e.target.matches("td.hover-player")) return;

    tooltipTimeout = setTimeout(() => {
      if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
      }
    }, 100);
  });

  document.getElementById("restartGameBtn").addEventListener("click", async () => {
  if (confirm("Er du sikker på, at du vil starte forfra?")) {
    try {
      await restartGame(); // Kalder ny API
      alert("Spillet er blevet nulstillet!");
    } catch (err) {
      console.error("Kunne ikke genstarte spillet:", err);
      alert("Noget gik galt under restart.");
    }
  }
});

  updateLobbyTable();
  setInterval(updateLobbyTable, 2000);
});
