import { getGamePlayers, joinGame, startGame } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("usernameInput");
  const submitButton = document.getElementById("submitBtn");
  const startButton = document.getElementById("startGameButton");

  submitButton.addEventListener("click", async () => {
    let username = usernameInput.value;
  
    console.log("Submitted username: " + username)
    await joinGame(username);
    await dynamicTable();
    console.log("Game joined with username: " + username)
  });

  startButton.addEventListener("click", async () => {
    window.location.replace("http://127.0.0.1:5500/client/index.html");
    startGame();
    console.log("Game started")
  });

  dynamicTable(); // initialt kald når DOM'en er klar


  async function dynamicTable() {
    try {
        let players = await getGamePlayers();

        let tableBody = document.querySelector('#lobbytable');
        tableBody.innerHTML = ''; // Tøm tabellen først

        players.forEach(player => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${player.name}</td>`;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
});
