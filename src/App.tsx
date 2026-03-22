import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RoleSelectPage } from "./pages/RoleSelectPage";
import { NameEntryPage } from "./pages/NameEntryPage";
import { GameplayPage } from "./pages/GameplayPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { TutorialPage } from "./pages/TutorialPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/role-select" element={<RoleSelectPage />} />
      <Route path="/name" element={<NameEntryPage />} />
      <Route path="/game" element={<GameplayPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/tutorial" element={<TutorialPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
