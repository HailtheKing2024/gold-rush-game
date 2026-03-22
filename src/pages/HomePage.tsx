import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/game-styles.css";

const LS_PLAYER = "playerName";

export function HomePage() {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement>(null);
  const bannerXRef = useRef(typeof window !== "undefined" ? window.innerWidth : 0);
  const rafRef = useRef<number>(0);

  const savedName = localStorage.getItem(LS_PLAYER);
  const saveExists = useQuery(
    api.games.checkSave,
    savedName ? { name: savedName } : "skip",
  );

  const canContinue = Boolean(savedName) && saveExists === true;

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    const speed = 1;
    const tick = () => {
      bannerXRef.current -= speed;
      if (bannerXRef.current < -banner.offsetWidth) {
        bannerXRef.current = window.innerWidth;
      }
      banner.style.transform = `translateX(${bannerXRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="game-container">
      <h1 className="title">The Gold Rush Game!</h1>
      <p className="subtitle">
        Presented by HailtheKing, pretha809, betgyf, and astroawe!
      </p>
      <p className="subtitle">A fan made game based on The Oregon Trail</p>

      <button
        type="button"
        disabled={!canContinue}
        style={{
          opacity: canContinue ? 1 : undefined,
          cursor: canContinue ? "pointer" : undefined,
        }}
        onClick={() => navigate("/game")}
      >
        Continue Journey
      </button>

      <button
        id="newSaveBtn"
        type="button"
        onClick={() => {
          const saveData = {
            gold: 0,
            day: 1,
            food: 100,
            morale: 100,
            location: "start",
            role: null,
          };
          localStorage.setItem("goldRushSave", JSON.stringify(saveData));
          navigate("/role-select");
        }}
      >
        New Game
      </button>

      <button type="button" onClick={() => navigate("/tutorial")}>
        How to Play
      </button>

      <button type="button" onClick={() => navigate("/leaderboard")}>
        Leaderboard
      </button>

      <div ref={bannerRef} className="banner">
        BETA VERSION 0.1.0 — EXPECT BUGS!Be sure to check out the GitHub at
        https://github.com/HailtheKing2024/gold-rush-game
      </div>
    </div>
  );
}
