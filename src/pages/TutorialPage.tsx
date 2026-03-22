import { useNavigate } from "react-router-dom";
import "../styles/tutorials.css";

export function TutorialPage() {
  const navigate = useNavigate();

  return (
    <div className="tutorial-container">
      <h1>How to Play</h1>

      <p>
        Welcome to The Gold Rush Game, a fan-made remake of The Oregon Trail!
      </p>

      <p>
        In this game, the goal is for you to get as much gold as possible by the
        end of the game without getting looted or dying. You will start by
        selecting a role, which will give you certain advantages and
        disadvantages. There are three difficulty levels, but more will be
        unlocked as you beat the game on the easier ones. They are easy, medium
        and hard, and each gamemode is specified by role.
      </p>
      <p>
        <strong>REST COMING SOON</strong>
      </p>
      <button type="button" className="back-btn" onClick={() => navigate("/")}>
        Back to Menu
      </button>
    </div>
  );
}
