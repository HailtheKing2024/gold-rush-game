export type RoleKey = "miner" | "hunter" | "merchant";

export type RoleStats = {
  gold: number;
  food: number;
  trading: number;
  difficulty: string;
};

export const roles: Record<
  RoleKey,
  { gold: number; food: number; trading: number; difficulty: string }
> = {
  miner: { gold: 50, food: 50, trading: 1, difficulty: "medium" },
  hunter: { gold: 50, food: 50, trading: 1, difficulty: "hard" },
  merchant: { gold: 50, food: 50, trading: 1, difficulty: "easy" },
};

export const difficulties: Record<
  string,
  { gold: number; food: number; trading: number }
> = {
  easy: { gold: 1.2, food: 1.2, trading: 1.1 },
  medium: { gold: 1, food: 1, trading: 1 },
  hard: { gold: 0.8, food: 0.8, trading: 0.9 },
};

export function computeFinalStats(roleKey: RoleKey): RoleStats {
  const role = roles[roleKey];
  const diff = difficulties[role.difficulty];
  return {
    gold: Math.floor(role.gold * diff.gold),
    food: Math.floor(role.food * diff.food),
    trading: parseFloat((role.trading * diff.trading).toFixed(1)),
    difficulty: role.difficulty,
  };
}

export function formatRoleStatsLine(roleKey: RoleKey): string {
  const role = roles[roleKey];
  const diff = difficulties[role.difficulty];
  const finalStats = {
    gold: Math.floor(role.gold * diff.gold),
    food: Math.floor(role.food * diff.food),
    trading: parseFloat((role.trading * diff.trading).toFixed(1)),
  };
  return `Difficulty: ${role.difficulty.toUpperCase()} | Gold: ${finalStats.gold} | Food: ${finalStats.food} | Trading: ${finalStats.trading}`;
}
