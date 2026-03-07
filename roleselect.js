// 3. Handle clicking a role (Just save choice and move to next page)
document.querySelectorAll(".roleBtn").forEach(button => {
  button.addEventListener("click", () => { 
    const roleKey = button.dataset.role;
    const role = roles[roleKey];
    const diff = difficulties[role.difficulty];

    const finalStats = {
      gold: Math.floor(role.gold * diff.gold),
      food: Math.floor(role.food * diff.food),
      trading: parseFloat((role.trading * diff.trading).toFixed(1)),
      difficulty: role.difficulty 
    };

    // Save the choices to localStorage so the next page can use them
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));

    console.log(`Role ${roleKey} selected. Moving to name entry...`);

    // Redirect to startinggame.html where they will input their name
    window.location.href = "startinggame.html";
  });
});
