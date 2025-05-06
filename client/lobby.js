import { getGamePlayers, joinGame } from "./client.js";

  document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("usernameInput");
    const submitButton = document.getElementById("submitBtn");
    dynamicTable();

    submitButton.addEventListener("click", async () => {
        console.log("Submitting username:", usernameInput.value);
        if (!usernameInput.value) {
            alert("Please enter a username.");
            return;
        }
        // Send a POST request to the server to join the game
        await joinGame(usernameInput.value);
        await dynamicTable();
        // Optionally, you can redirect the user to another page or update the UI   
        //redirect
    });
  });

  async function dynamicTable() {
    try {
        let data = await getGamePlayers();

        let table = document.querySelector('#lobbytable');

        data.features.forEach(user => {
            let row = document.createElement('tr');

            row.innerHTML = 
            `
                <td>${user.properties.name}</td>
            `;
            table.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
