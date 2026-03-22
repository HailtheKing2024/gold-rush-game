import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/game-styles.css";

function formatRowColor(rank: number): string {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "#cd7f32";
  return "#444";
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const scores = useQuery(api.leaderboard.getTopScores, {});
  const updateScore = useMutation(api.leaderboard.updateScore);
  const [name, setName] = useState("");
  const [scoreStr, setScoreStr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const score = parseInt(scoreStr, 10);
    if (!trimmed || Number.isNaN(score)) return;
    try {
      await updateScore({ name: trimmed, score });
      setName("");
      setScoreStr("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      window.alert(`Failed to send score: ${message}`);
    }
  }

  return (
    <div className="game-container">
      <h1 className="title">Leaderboard</h1>
      <div id="scores-container">
        {scores === undefined ? (
          <p>Loading scores...</p>
        ) : scores.length === 0 ? (
          <p>No scores yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, index) => {
                const rank = index + 1;
                const date = new Date(entry.timestamp);
                return (
                  <tr key={entry._id} style={{ color: formatRowColor(rank) }}>
                    <td>{rank}</td>
                    <td>{entry.name}</td>
                    <td>{entry.score}</td>
                    <td>{date.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <form id="scoreForm" onSubmit={(e) => void onSubmit(e)}>
        <h2>Submit Your Score</h2>
        <label htmlFor="nameInput">Name:</label>
        <input
          id="nameInput"
          type="text"
          required
          minLength={1}
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <label htmlFor="scoreInput">Score:</label>
        <input
          id="scoreInput"
          type="number"
          required
          min={0}
          value={scoreStr}
          onChange={(e) => setScoreStr(e.target.value)}
        />
        <br />
        <button type="submit">Send</button>
      </form>

      <button id="backBtn" type="button" onClick={() => navigate("/")}>
        Back to Game
      </button>
    </div>
  );
}
