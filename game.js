const banner = document.querySelector(".banner");
const newSaveBtn = document.getElementById("newSaveBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");

let bannerX = window.innerWidth;
const bannerSpeed = 2;

function animateBanner() {
    bannerX -= bannerSpeed;

    if (bannerX < -banner.offsetWidth) {
        bannerX = window.innerWidth;
    }

    banner.style.transform = `translateX(${bannerX}px)`;

    requestAnimationFrame(animateBanner);
}

// Button click handlers
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

    // Go to role selection page
    window.location.href = "roleSelect.html";
});
howToPlayBtn.addEventListener("click", () => {
    window.location.href = "tutorial.html";
});

// Start animation
animateBanner();