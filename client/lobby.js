import { joinGame, getGamePlayers } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("usernameInput");
  const submitButton = document.getElementById("submitBtn");
  const startGameButton = document.getElementById("startGameButton");
  const lobbyTable = document.getElementById("lobbytable");

  let joined = false;

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

  // Hent spillere og vis i listen
  async function updateLobbyTable() {
    try {
      const players = await getGamePlayers();
      lobbyTable.innerHTML = "";

      players.forEach((player) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${player.name}</td>`;
        lobbyTable.appendChild(row);
      });
    } catch (error) {
      console.error("Kunne ikke hente spillere:", error);
    }
  }

  updateLobbyTable();
  setInterval(updateLobbyTable, 2000);
});