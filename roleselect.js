// Handle clicking a role
document.querySelectorAll(".roleBtn").forEach(button => {
  button.addEventListener("click", async () => { // Added 'async'
    const roleKey = button.dataset.role;
    const role = roles[roleKey];
    const diff = difficulties[role.difficulty];

    const finalStats = {
      gold: Math.floor(role.gold * diff.gold),
      food: Math.floor(role.food * diff.food),
      trading: parseFloat((role.trading * diff.trading).toFixed(1)),
      difficulty: role.difficulty // Added this so it saves to DB
    };

    // Get player name (fallback to a random one if not set)
    const playerName = localStorage.getItem("playerName") || "Explorer_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("playerName", playerName);

    // 1. Save to localStorage as a quick backup
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));

    console.log(`Saving ${roleKey} for ${playerName}...`);

    try {
      // 2. SEND TO AIVEN POSTGRESQL (via your /api/save-game endpoint)
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

    // 3. Redirect to startinggame.html
    window.location.href = "startinggame.html";
  });
});
