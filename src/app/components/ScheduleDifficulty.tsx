import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AlertCircle, Loader2 } from "lucide-react";
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

  const teams = data?.teams ?? [];
  const hardest = teams[0];
  const average = teams.length ? (teams.reduce((sum, t) => sum + t.difficulty, 0) / teams.length).toFixed(1) : "--";

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Schedule Difficulty</h1>
        <p className="text-slate-400 text-xl font-medium">Live-derived team difficulty from current NBA player production.</p>
        {data?.source && <p className="text-slate-500 mt-2">Source: {data.source}</p>}
        {error && <p className="mt-3 text-red-400 font-semibold flex gap-2"><AlertCircle /> {error}</p>}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl"><Loader2 className="animate-spin" /> Loading schedule difficulty...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-2 border-purple-500/30 rounded-3xl shadow-2xl">
              <div className="text-xs text-purple-400 mb-3 font-black uppercase tracking-widest">Hardest Team</div>
              <div className="text-6xl font-black text-purple-400 mb-3">{hardest?.team ?? "--"}</div>
              <div className="text-slate-400 font-semibold">{hardest ? `${hardest.difficulty} difficulty` : "Waiting for API"}</div>
            </div>
            <div className="p-10 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-2 border-blue-500/30 rounded-3xl shadow-2xl">
              <div className="text-xs text-blue-400 mb-3 font-black uppercase tracking-widest">Teams Loaded</div>
              <div className="text-6xl font-black text-blue-400 mb-3">{teams.length}</div>
              <div className="text-slate-400 font-semibold">From backend model</div>
            </div>
            <div className="p-10 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-2 border-orange-500/30 rounded-3xl shadow-2xl">
              <div className="text-xs text-orange-400 mb-3 font-black uppercase tracking-widest">Average Difficulty</div>
              <div className="text-6xl font-black text-orange-400 mb-3">{average}</div>
              <div className="text-slate-400 font-semibold">Across displayed teams</div>
            </div>
          </div>

          <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-white">Team Difficulty Ranking</h3>
            <ResponsiveContainer width="100%" height={460}>
              <BarChart data={teams} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="team" type="category" stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(139, 92, 246, 0.3)", borderRadius: "16px" }} />
                <Bar dataKey="difficulty" fill="#8B5CF6" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
