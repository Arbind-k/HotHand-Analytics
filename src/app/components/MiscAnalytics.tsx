import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, LineChart, Line } from "recharts";
import { AlertCircle, Loader2 } from "lucide-react";
import { apiGet, MiscAnalyticsResponse } from "../lib/api";

export function MiscAnalytics() {
  const [data, setData] = useState<MiscAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<MiscAnalyticsResponse>("/api/misc-analytics?limit=40")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const players = data?.players ?? [];
  const volatilityData = [...players].sort((a, b) => b.volatility - a.volatility).slice(0, 10);
  const consistencyData = [...players].sort((a, b) => b.consistency - a.consistency).slice(0, 10);
  const momentumData = [...players].sort((a, b) => b.momentum - a.momentum).slice(0, 12).map((p, i) => ({ ...p, rank: i + 1 }));
  const clutchData = [...players].sort((a, b) => b.clutchPPG - a.clutchPPG).slice(0, 20);

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Misc Analytics</h1>
        <p className="text-slate-400 text-xl font-medium">No static chart data: volatility, consistency, momentum, and clutch proxies all come from the live backend.</p>
        {data?.source && <p className="text-slate-500 mt-2">Source: {data.source}</p>}
        {error && <p className="mt-3 text-red-400 font-semibold flex gap-2"><AlertCircle /> {error}</p>}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl"><Loader2 className="animate-spin" /> Loading live advanced analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-2 border-orange-500/30 rounded-3xl"><div className="text-xs text-orange-400 font-black uppercase tracking-widest mb-3">Players Analyzed</div><div className="text-5xl font-black text-orange-400">{players.length}</div></div>
            <div className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-2 border-blue-500/30 rounded-3xl"><div className="text-xs text-blue-400 font-black uppercase tracking-widest mb-3">Top Consistency</div><div className="text-5xl font-black text-blue-400">{consistencyData[0]?.consistency ?? "--"}</div></div>
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-2 border-purple-500/30 rounded-3xl"><div className="text-xs text-purple-400 font-black uppercase tracking-widest mb-3">Top Clutch PPG</div><div className="text-5xl font-black text-purple-400">{clutchData[0]?.clutchPPG ?? "--"}</div></div>
            <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-2 border-emerald-500/30 rounded-3xl"><div className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-3">Top Momentum</div><div className="text-5xl font-black text-emerald-400">{momentumData[0]?.momentum ?? "--"}</div></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-8 text-white">Volatility Score</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={volatilityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="player" type="category" stroke="#94A3B8" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(249, 115, 22, 0.3)", borderRadius: "16px" }} />
                  <Bar dataKey="volatility" fill="#F97316" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-8 text-white">Consistency Index</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={consistencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="player" type="category" stroke="#94A3B8" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(59, 130, 246, 0.3)", borderRadius: "16px" }} />
                  <Bar dataKey="consistency" fill="#3B82F6" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-8 text-white">Trend Momentum</h3>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={momentumData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="rank" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(16, 185, 129, 0.3)", borderRadius: "16px" }} />
                  <Line type="monotone" dataKey="momentum" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-8 text-white">Clutch Performance Proxy</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="clutchFG" type="number" name="FG%" stroke="#94A3B8" />
                  <YAxis dataKey="clutchPPG" type="number" name="PPG" stroke="#94A3B8" />
                  <ZAxis dataKey="clutchGames" type="number" range={[120, 450]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(139, 92, 246, 0.3)", borderRadius: "16px" }} />
                  <Scatter data={clutchData} fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-10 py-7 border-b-2 border-slate-800"><h3 className="text-3xl font-black text-white">Live Misc Analytics Table</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-left text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800"><th className="p-5">Player</th><th className="p-5">Team</th><th className="p-5">Volatility</th><th className="p-5">Consistency</th><th className="p-5">Momentum</th><th className="p-5">Clutch PPG</th><th className="p-5">Clutch FG%</th></tr></thead>
                <tbody>{players.map((p) => <tr key={`${p.player}-${p.team}`} className="border-b border-slate-900 hover:bg-slate-900/60"><td className="p-5 text-white font-bold">{p.player}</td><td className="p-5 text-slate-300">{p.team}</td><td className="p-5 text-orange-400 font-black">{p.volatility}</td><td className="p-5 text-blue-400 font-black">{p.consistency}</td><td className="p-5 text-emerald-400 font-black">{p.momentum}</td><td className="p-5 text-purple-400 font-black">{p.clutchPPG}</td><td className="p-5 text-slate-300">{p.clutchFG}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
