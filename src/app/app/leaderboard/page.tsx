"use client";

import { useAuth } from "@/lib/auth";
import { leaderboard } from "@/lib/store";

export default function Leaderboard() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = leaderboard(user.id, user.name);
  const you = rows.find((r) => r.isYou);

  return (
    <div>
      <h1 className="text-2xl font-bold text-burgundy-950">Leaderboard</h1>
      <p className="mt-1 text-sm text-burgundy-800/70">
        Ranked by best mock score among doctors preparing right now.
      </p>

      {you && (
        <div className="mt-6 rounded-2xl bg-burgundy-500 p-5 text-white">
          <p className="text-sm text-burgundy-100">Your rank</p>
          <p className="mt-1 text-3xl font-bold">#{you.rank}</p>
          <p className="mt-1 text-sm">
            Best mock: {you.score}% · Accuracy: {you.accuracy}% · Mocks sat:{" "}
            {you.mocks}
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-burgundy-100 bg-cream-50">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-burgundy-100 bg-burgundy-50/60 text-left text-xs font-semibold uppercase tracking-wider text-burgundy-700">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Best mock</th>
              <th className="px-4 py-3">Accuracy</th>
              <th className="px-4 py-3">Mocks sat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-burgundy-50">
            {rows.map((r) => (
              <tr
                key={r.name}
                className={r.isYou ? "bg-burgundy-50/70 font-semibold" : ""}
              >
                <td className="px-4 py-3 text-burgundy-600">#{r.rank}</td>
                <td className="px-4 py-3 text-burgundy-950">
                  {r.name}
                  {r.isYou && (
                    <span className="ml-2 rounded-full bg-burgundy-500 px-2 py-0.5 text-xs text-white">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{r.score}%</td>
                <td className="px-4 py-3">{r.accuracy}%</td>
                <td className="px-4 py-3">{r.mocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-burgundy-800/50">
        Sit more mocks and raise your best score to climb the board.
      </p>
    </div>
  );
}
