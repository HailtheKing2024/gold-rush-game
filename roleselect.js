// Base stats for each role
const roles = {
  miner: { gold: 50, food: 50, trading: 1, difficulty: "medium" },
  hunter: { gold: 50, food: 50, trading: 1, difficulty: "hard" },
  merchant: { gold: 50, food: 50, trading: 1, difficulty: "easy" }
};

// Difficulty multipliers
const difficulties = {
  easy: { gold: 1.2, food: 1.2, trading: 1.1 },
  medium: { gold: 1, food: 1, trading: 1 },
  hard: { gold: 0.8, food: 0.8, trading: 0.9 }
};

// Show stats for all roles
document.querySelectorAll(".roles > div").forEach(div => {
  const roleKey = div.querySelector(".roleBtn").dataset.role;
  const role = roles[roleKey];
  const diff = difficulties[role.difficulty];

  const finalStats = {
    gold: Math.floor(role.gold * diff.gold),
    food: Math.floor(role.food * diff.food),
    trading: parseFloat((role.trading * diff.trading).toFixed(1))
  };

  div.querySelector(".role-stats").innerText =
    `Difficulty: ${role.difficulty.toUpperCase()} | Gold: ${finalStats.gold} | Food: ${finalStats.food} | Trading: ${finalStats.trading}`;

  // Optional: color code difficulty
  const statsEl = div.querySelector(".role-stats");
  if (role.difficulty === "easy") statsEl.style.color = "green";
  if (role.difficulty === "medium") statsEl.style.color = "orange";
  if (role.difficulty === "hard") statsEl.style.color = "red";
});

// Handle clicking a role
document.querySelectorAll(".roleBtn").forEach(button => {
  button.addEventListener("click", () => {
    const roleKey = button.dataset.role;
    const role = roles[roleKey];
    const diff = difficulties[role.difficulty];

    const finalStats = {
      gold: Math.floor(role.gold * diff.gold),
      food: Math.floor(role.food * diff.food),
      trading: parseFloat((role.trading * diff.trading).toFixed(1))
    };

    console.log(`Selected Role: ${roleKey}`);
    console.log(`Assigned Difficulty: ${role.difficulty}`);
    console.log("Final Stats:", finalStats);

    // Save stats in localStorage to use in startinggame.html
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));

    // Redirect to startinggame.html
    window.location.href = "startinggame.html";
  });
});