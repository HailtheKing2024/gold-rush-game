import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { RoleStats } from "../game/roles";
import "../styles/startinggame.css";

type StatusKind = "idle" | "saving" | "success" | "error";

export function NameEntryPage() {
  const navigate = useNavigate();
  const saveGame = useMutation(api.games.saveGame);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<StatusKind>("idle");
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const roleLine = useMemo(() => {
    const role = localStorage.getItem("selectedRole");
    const raw = localStorage.getItem("roleStats");
    if (!role || !raw) return "";
    let stats: RoleStats;
    try {
      stats = JSON.parse(raw) as RoleStats;
    } catch {
      return "";
    }
    return `You picked: ${role.toUpperCase()} (Difficulty: ${stats.difficulty})`;
  }, []);

  async function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      window.alert("Please enter a name!");
      return;
    }

    const role = localStorage.getItem("selectedRole");
    const rawStats = localStorage.getItem("roleStats");
    if (!role || !rawStats) {
      window.alert("Missing role. Go back and select a role.");
      return;
    }

    let stats: RoleStats;
    try {
      stats = JSON.parse(rawStats) as RoleStats;
    } catch {
      window.alert("Invalid role data. Please select your role again.");
      return;
    }

    setStatus("saving");
    try {
      await saveGame({
        name: trimmed,
        role,
        stats: {
          gold: stats.gold,
          food: stats.food,
          trading: stats.trading,
          difficulty: stats.difficulty,
        },
      });
      setStatus("success");
      localStorage.setItem("playerName", trimmed);
      redirectTimerRef.current = window.setTimeout(() => navigate("/game"), 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const statusClass =
    status === "saving"
      ? "status-saving"
      : status === "success"
        ? "status-success"
        : status === "error"
          ? "status-error"
          : "";

  const statusText =
    status === "saving"
      ? "Saving to Convex..."
      : status === "success"
        ? `Game Saved for ${name.trim()}! Loading world...`
        : status === "error"
          ? "Error saving to Convex."
          : "";

  return (
    <div className="tutorial-container" aria-labelledby="starting-heading">
      <h1 id="starting-heading">Welcome, Explorer!</h1>
      <div id="role-display">{roleLine}</div>

      <p>Enter a name to begin your journey:</p>
      <input
        type="text"
        id="playerNameInput"
        placeholder="Enter name..."
        maxLength={40}
        autoComplete="nickname"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="button" id="startBtn" onClick={() => void handleStart()}>
        Start Game & Save
      </button>

      <p id="status" className={statusClass} role="status" aria-live="polite">
        {statusText}
      </p>
    </div>
  );
}
