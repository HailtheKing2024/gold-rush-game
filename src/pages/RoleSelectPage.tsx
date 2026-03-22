import { useNavigate } from "react-router-dom";
import {
  computeFinalStats,
  formatRoleStatsLine,
  type RoleKey,
} from "../game/roles"; // Corrected path to go up into 'game' folder
import "../styles/roleselect.css";


const ROLE_ORDER: RoleKey[] = ["merchant", "miner", "hunter"];
const ROLE_LABELS: Record<RoleKey, string> = {
  merchant: "Butler",
  miner: "Miner",
  hunter: "Farmer",
};
const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  merchant: "Better trading prices.",
  miner:
    "He starts with knowledge about mining, so he will be able to extract more gold.",
  hunter: "Starts with extra food.",
};

export function RoleSelectPage() {
  const navigate = useNavigate();

  function selectRole(roleKey: RoleKey) {
    const finalStats = computeFinalStats(roleKey);
    localStorage.setItem("selectedRole", roleKey);
    localStorage.setItem("roleStats", JSON.stringify(finalStats));
    navigate("/name");
  }

  return (
    <div className="role-container">
      <h1>Select Your Role</h1>
      <div className="roles">
        {ROLE_ORDER.map((roleKey) => (
          <div key={roleKey}>
            <button
              type="button"
              className="roleBtn"
              onClick={() => selectRole(roleKey)}
            >
              {ROLE_LABELS[roleKey]}
            </button>
            <p className="role-description">{ROLE_DESCRIPTIONS[roleKey]}</p>
            <p className="role-stats">{formatRoleStatsLine(roleKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
