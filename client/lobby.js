import { joinGame, getGamePlayers, startGame } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("usernameInput");
  const submitButton = document.getElementById("submitBtn");
  const startGameButton = document.getElementById("startGameButton");
  const lobbyTable = document.getElementById("lobbytable");
  const startButton = document.getElementById("startGameButton");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const username = usernameInput.value;

  if (!username) {
    alert("Indtast et navn");
    return;
  }

  try {
    await joinGame(username);
    usernameInput.disabled = true; // 🔒 Lås inputfeltet
    submitButton.disabled = true;  // 🔒 Lås submit-knappen
    submitButton.value = "✅ Navn oprettet";
  } catch (err) {
    console.error("Noget gik galt ved join:", err);
    alert("Kunne ikke oprette spiller – prøv igen.");
  }
});

startGameButton.addEventListener("click", async () => {
  await startGame();
  window.location.href = "index.html";
});


  async function updateLobby() {
    const players = await getGamePlayers();
    lobbyTable.innerHTML = "";
    players.forEach(player => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${player.name}</td>`;
      lobbyTable.appendChild(row);
    });
  }

  updateLobby();
  setInterval(updateLobby, 2000); 
});
