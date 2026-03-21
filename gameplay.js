(function () {
  var menu = document.getElementById("toMenuBtn");
  var board = document.getElementById("toLeaderboardBtn");
  if (menu) {
    menu.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }
  if (board) {
    board.addEventListener("click", function () {
      window.location.href = "leaderboard.html";
    });
  }
})();
