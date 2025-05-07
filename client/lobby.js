import { joinGame } from "./client.js";

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("usernameInput");
  const submitButton = document.getElementById("submitBtn");

  submitButton.addEventListener("click", async () => {
    let username = usernameInput.value;
  
    console.log("Submitted username: " + username)
    await joinGame(username);
    
  });
});