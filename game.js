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
    console.log("New save clicked – create a new save here");
    alert("New Save Created! (Placeholder)");
});

howToPlayBtn.addEventListener("click", () => {
    window.location.href = "tutorial.html";
});

// Start animation
animateBanner();