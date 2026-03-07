// 1. DATA DEFINITIONS (Must be at the very top)
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

// 2. DISPLAY LOGIC (Show stats on page load)
document.querySelectorAll(".roles > div").forEach(div => {
  const roleBtn = div.querySelector(".roleBtn");
  if (!roleBtn) return; // Safety check

  const roleKey = roleBtn.dataset.role;
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

// 3. CLICK LOGIC (Save to localStorage and redirect)
document.querySelectorAll(".roleBtn").forEach(button => {
  button.addEventListener("click", () => { 
    const roleKey = button.dataset.role;
    const role = roles[roleKey]; // This works now because 'roles' is defined at the top
    const diff = difficulties[role.difficulty];

    const finalStats = {
      gold: Math.floor(role.gold * diff.gold),
      food: Math.floor(role.food * diff.food),
      trading: parseFloat((role.trading * diff.trading).toFixed(1)),
      difficulty: role.difficulty 
    };

    // Store in localStorage for startinggame.html to use
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));

    // Redirect to the name input page
    window.location.href = "startinggame.html";
  });
});

