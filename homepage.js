// homepage.js

document.addEventListener('DOMContentLoaded', async()  => {
    const convexSiteUrl = window.CONVEX_SITE_URL || "https://fastidious-heron-446.convex.site";
    // Elements
    const banner = document.querySelector(".banner");
    const newSaveBtn = document.getElementById("newSaveBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const continueBtn = document.getElementById('continueBtn');
    const savedName = localStorage.getItem("playerName");

    if (savedName) {
        try {
            // Ask the backend if this save exists in Convex
            const response = await fetch(`${convexSiteUrl}/api/check-save?name=${encodeURIComponent(savedName)}`);
            const data = await response.json();

            if (data.exists) {
                // Save found! Enable the button and set the link
                continueBtn.disabled = false;
                continueBtn.style.opacity = "1";
                continueBtn.style.cursor = "pointer";
                continueBtn.onclick = () => { window.location.href = "gameplay.html"; };
            }
        } catch (err) {
            console.error("Could not verify save:", err);
        }
    }

    // Banner animation
    let bannerX = window.innerWidth;
    const bannerSpeed = 1;

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