// 1. Define the roles and difficulties at the top of the file
const roles = {
  miner: { gold: 50, food: 50, trading: 1, difficulty: "medium" },
  hunter: { gold: 50, food: 50, trading: 1, difficulty: "hard" },
  merchant: { gold: 50, food: 50, trading: 1, difficulty: "easy" }
};

const difficulties = {
  easy: { gold: 1.2, food: 1.2, trading: 1.1 },
  medium: { gold: 1, food: 1, trading: 1 },
  hard: { gold: 0.8, food: 0.8, trading: 0.9 }
};

// 2. Initial Setup: Show stats for all roles on the screen
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
});

// 3. Handle clicking a role and saving to Aiven
document.querySelectorAll(".roleBtn").forEach(button => {
  button.addEventListener("click", async () => { 
    const roleKey = button.dataset.role;
    const role = roles[roleKey]; // This will now work because 'roles' is defined above
    const diff = difficulties[role.difficulty];

    const finalStats = {
      gold: Math.floor(role.gold * diff.gold),
      food: Math.floor(role.food * diff.food),
      trading: parseFloat((role.trading * diff.trading).toFixed(1)),
      difficulty: role.difficulty 
    };

    // Get player name (fallback to a random one if not set)
    const playerName = localStorage.getItem("playerName") || "Explorer_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("playerName", playerName);

    // Save to localStorage as a quick backup
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));

    console.log(`Saving ${roleKey} for ${playerName}...`);

    try {
      // SEND TO AIVEN POSTGRESQL via your /api/save-game endpoint
      const response = await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName,
          role: roleKey,
          stats: finalStats
        })
      });

      if (response.ok) {
        console.log("✅ Progress saved to Aiven!");
      }
    } catch (err) {
      console.error("❌ Database save failed:", err);
    }

    // Redirect to startinggame.html
    window.location.href = "startinggame.html";
  });
});
