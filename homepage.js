// homepage.js

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const banner = document.querySelector(".banner");
    const newSaveBtn = document.getElementById("newSaveBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");

    // Banner animation
    let bannerX = window.innerWidth;
    const bannerSpeed = 2;

    function animateBanner() {
        bannerX -= bannerSpeed;
        if (bannerX < -banner.offsetWidth) bannerX = window.innerWidth;
        banner.style.transform = `translateX(${bannerX}px)`;
        requestAnimationFrame(animateBanner);
    }

    // Start banner animation
    animateBanner();

    // Button click handlers
    if (newSaveBtn) {
        newSaveBtn.addEventListener("click", () => {
            const saveData = {
                gold: 0,
                day: 1,
                food: 100,
                morale: 100,
                location: "start",
                role: null
            };
            localStorage.setItem("goldRushSave", JSON.stringify(saveData));
            window.location.href = "roleselect.html";
        });
    }

    if (howToPlayBtn) {
        howToPlayBtn.addEventListener("click", () => {
            window.location.href = "tutorial.html";
        });
    }

    if (leaderboardBtn) {
        leaderboardBtn.addEventListener("click", () => {
            window.location.href = "leaderboard.html";
        });
    }
    
});