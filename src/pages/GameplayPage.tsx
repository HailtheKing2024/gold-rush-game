import { useNavigate } from "react-router-dom";
import "../styles/game-styles.css";
import "../styles/gameplay.css";

export function GameplayPage() {
  const navigate = useNavigate();

  return (
    <div className="game-container gameplay-wrap">
      <h1 className="title gameplay-title">The trail awaits</h1>
      <p className="subtitle gameplay-lead">
        Full gameplay is still under construction. Thanks for saving your
        explorer — check back soon for the next leg of the journey.
      </p>
      <p className="subtitle gameplay-hint">
        You can return to the menu or view the leaderboard while you wait.
      </p>
      <div className="gameplay-actions">
        <button type="button" onClick={() => navigate("/")}>
          Back to menu
        </button>
        <button type="button" onClick={() => navigate("/leaderboard")}>
          Leaderboard
        </button>
      </div>
    </div>
  );
}
