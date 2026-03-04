const roleButtons = document.querySelectorAll(".roleBtn");

roleButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedRole = button.dataset.role;

        // Get existing save
        let saveData = JSON.parse(localStorage.getItem("goldRushSave"));

        // Add role to save
        saveData.role = selectedRole;

        // Save it back
        localStorage.setItem("goldRushSave", JSON.stringify(saveData));

        console.log("Role selected:", selectedRole);

        // Go to main game
        window.location.href = "game.html"; // change if needed
    });
});