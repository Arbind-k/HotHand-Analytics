import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AlertCircle, Loader2, Shield, Users, Activity } from "lucide-react";
import { apiGet, ScheduleDifficultyResponse } from "../lib/api";

export function ScheduleDifficulty() {
  const [data, setData] = useState<ScheduleDifficultyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ScheduleDifficultyResponse>("/api/schedule-difficulty")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const teams = useMemo(() => [...(data?.teams ?? [])].sort((a, b) => b.difficulty - a.difficulty), [data]);
  const topTeams = teams.slice(0, 15);
  const hardest = teams[0];
  const easiest = teams[teams.length - 1];
  const average = teams.length ? (teams.reduce((sum, t) => sum + t.difficulty, 0) / teams.length).toFixed(1) : "--";

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Schedule Difficulty</h1>
        <p className="text-slate-400 text-xl font-medium">Ranks teams by live roster strength. Harder opponents = higher expected schedule stress.</p>
        {data?.source && <p className="text-slate-500 mt-2">Source: {data.source}</p>}
        {error && <p className="mt-3 text-red-400 font-semibold flex gap-2"><AlertCircle /> {error}</p>}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl"><Loader2 className="animate-spin" /> Loading schedule difficulty...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-2 border-purple-500/30 rounded-3xl shadow-2xl"><Shield className="text-purple-400 mb-3" /><div className="text-xs text-purple-400 mb-3 font-black uppercase tracking-widest">Hardest Opponent</div><div className="text-5xl font-black text-purple-400 mb-3">{hardest?.team ?? "--"}</div><div className="text-slate-400 font-semibold">{hardest ? `${hardest.difficulty} stress score` : "Waiting for API"}</div></div>
            <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-2 border-emerald-500/30 rounded-3xl shadow-2xl"><Shield className="text-emerald-400 mb-3" /><div className="text-xs text-emerald-400 mb-3 font-black uppercase tracking-widest">Easiest Opponent</div><div className="text-5xl font-black text-emerald-400 mb-3">{easiest?.team ?? "--"}</div><div className="text-slate-400 font-semibold">Lowest loaded score</div></div>
            <div className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-2 border-blue-500/30 rounded-3xl shadow-2xl"><Users className="text-blue-400 mb-3" /><div className="text-xs text-blue-400 mb-3 font-black uppercase tracking-widest">Teams Loaded</div><div className="text-5xl font-black text-blue-400 mb-3">{teams.length}</div><div className="text-slate-400 font-semibold">Should cover full NBA</div></div>
            <div className="p-8 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-2 border-orange-500/30 rounded-3xl shadow-2xl"><Activity className="text-orange-400 mb-3" /><div className="text-xs text-orange-400 mb-3 font-black uppercase tracking-widest">Average Stress</div><div className="text-5xl font-black text-orange-400 mb-3">{average}</div><div className="text-slate-400 font-semibold">Across loaded teams</div></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_.9fr] gap-8">
            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-2 text-white">Opponent Strength Ranking</h3>
              <p className="text-slate-500 mb-8">Top 15 hardest teams by current live player production.</p>
              <ResponsiveContainer width="100%" height={520}>
                <BarChart data={topTeams} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="team" type="category" stroke="#94A3B8" width={70} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(139, 92, 246, 0.3)", borderRadius: "16px" }} />
                  <Bar dataKey="difficulty" fill="#8B5CF6" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b-2 border-slate-800"><h3 className="text-2xl font-black text-white">Full Team Table</h3></div>
              <div className="max-h-[560px] overflow-auto">
                <table className="w-full"><thead><tr className="text-left text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800"><th className="p-4">Rank</th><th className="p-4">Team</th><th className="p-4">Stress</th></tr></thead><tbody>{teams.map((t, i) => <tr key={t.team} className="border-b border-slate-900 hover:bg-slate-900/60"><td className="p-4 text-slate-500 font-black">#{i + 1}</td><td className="p-4 text-white font-bold">{t.team}</td><td className="p-4 text-purple-400 font-black">{t.difficulty}</td></tr>)}</tbody></table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
