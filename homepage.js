// homepage.js
import { ConvexClient } from "https://esm.sh/convex@1.34.0/browser";

document.addEventListener('DOMContentLoaded', async()  => {
    const convexUrl = window.CONVEX_URL || "https://fastidious-heron-446.convex.cloud";
    const client = new ConvexClient(convexUrl);
    // Elements
    const banner = document.querySelector(".banner");
    const newSaveBtn = document.getElementById("newSaveBtn");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const continueBtn = document.getElementById('continueBtn');
    const savedName = localStorage.getItem("playerName");
    let unsubscribe = null;

    function setContinueEnabled(enabled) {
        continueBtn.disabled = !enabled;
        continueBtn.style.opacity = enabled ? "1" : "";
        continueBtn.style.cursor = enabled ? "pointer" : "";
        continueBtn.onclick = enabled ? () => { window.location.href = "gameplay.html"; } : null;
    }

    if (savedName) {
        try {
            unsubscribe = client.onUpdate(
                "games:checkSave",
                { name: savedName },
                (exists) => setContinueEnabled(!!exists),
                (err) => console.error("Could not verify save:", err)
            );
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

    window.addEventListener("beforeunload", () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        client.close();
    });
});