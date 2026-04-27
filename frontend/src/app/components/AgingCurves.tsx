import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Loader2, AlertCircle, TrendingUp, Users, Award } from "lucide-react";
import { apiGet, AgingCurveRow, AgingCurvesResponse, PlayersResponse } from "../lib/api";

export function AgingCurves() {
  const [archetype, setArchetype] = useState("All Archetypes");
  const [archetypes, setArchetypes] = useState<string[]>(["All Archetypes"]);
  const [rows, setRows] = useState<AgingCurveRow[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<PlayersResponse>("/api/players?limit=300&sort_by=alpha")
      .then((data) => {
        const unique = Array.from(new Set(data.players.map((p) => p.archetype).filter(Boolean))).sort();
        setArchetypes(["All Archetypes", ...unique]);
      })
      .catch(() => setArchetypes(["All Archetypes"]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet<AgingCurvesResponse>(`/api/aging-curves?archetype=${encodeURIComponent(archetype)}`)
      .then((data) => {
        setRows(data.players);
        setSource(data.source);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [archetype]);

  const topOutliers = useMemo(() => rows.filter((r) => r.actual > 0).slice(0, 12), [rows]);
  const chartRows = useMemo(() => rows.filter((r) => r.actual > 0 && r.age > 0), [rows]);
  const best = topOutliers[0];
  const avgDelta = rows.length ? (rows.reduce((s, r) => s + r.delta, 0) / rows.length).toFixed(1) : "--";

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Aging Curves</h1>
        <p className="text-slate-400 text-xl font-medium">Compares each player’s current production against an age-based expected curve.</p>
        {source && <p className="text-slate-500 mt-2">Source: {source}</p>}
        {error && <p className="mt-3 text-red-400 font-semibold flex gap-2"><AlertCircle /> {error}</p>}
      </div>

      <div className="max-w-xl">
        <label className="block text-sm text-slate-500 font-black uppercase tracking-widest mb-3">Archetype</label>
        <select value={archetype} onChange={(e) => setArchetype(e.target.value)} className="w-full px-6 py-4 bg-slate-950 border-2 border-blue-500/50 rounded-2xl text-white text-lg font-bold outline-none">
          {archetypes.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl"><Loader2 className="animate-spin" /> Loading live aging curve...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border-2 border-blue-500/30 bg-blue-500/10"><Users className="text-blue-400 mb-3" /><div className="text-xs text-blue-400 font-black uppercase tracking-widest">Players Compared</div><div className="text-5xl font-black text-blue-400">{rows.length}</div></div>
            <div className="p-8 rounded-3xl border-2 border-orange-500/30 bg-orange-500/10"><Award className="text-orange-400 mb-3" /><div className="text-xs text-orange-400 font-black uppercase tracking-widest">Top Outlier</div><div className="text-2xl font-black text-white truncate">{best?.player ?? "--"}</div><div className="text-orange-400 font-black">+{best?.delta ?? "--"}</div></div>
            <div className="p-8 rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/10"><TrendingUp className="text-emerald-400 mb-3" /><div className="text-xs text-emerald-400 font-black uppercase tracking-widest">Avg Delta</div><div className="text-5xl font-black text-emerald-400">{avgDelta}</div></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-2 text-white">Production by Age</h3>
              <p className="text-slate-500 mb-8">Higher dots = stronger current production.</p>
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="age" name="Age" stroke="#94A3B8" domain={[18, 42]} />
                  <YAxis dataKey="actual" name="Production" stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(59, 130, 246, 0.3)", borderRadius: "16px" }} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={chartRows} fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
              <h3 className="text-3xl font-black mb-2 text-white">Biggest Positive Outliers</h3>
              <p className="text-slate-500 mb-8">Players producing furthest above the expected age curve.</p>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={topOutliers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis type="number" stroke="#94A3B8" />
                  <YAxis dataKey="player" type="category" stroke="#94A3B8" width={145} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(249, 115, 22, 0.3)", borderRadius: "16px" }} />
                  <Bar dataKey="delta" fill="#F97316" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-10 py-7 border-b-2 border-slate-800"><h3 className="text-3xl font-black text-white">Aging Curve Table</h3></div>
            <table className="w-full"><thead><tr className="text-left text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800"><th className="p-5">Player</th><th className="p-5">Age</th><th className="p-5">Archetype</th><th className="p-5">Actual</th><th className="p-5">Expected</th><th className="p-5">Delta</th></tr></thead><tbody>{rows.slice(0, 25).map((r) => <tr key={r.player} className="border-b border-slate-900"><td className="p-5 text-white font-bold">{r.player}</td><td className="p-5 text-slate-300">{r.age}</td><td className="p-5 text-slate-300">{r.archetype}</td><td className="p-5 text-blue-400 font-black">{r.actual}</td><td className="p-5 text-slate-300">{r.expected}</td><td className="p-5 text-orange-400 font-black">{r.delta}</td></tr>)}</tbody></table>
          </div>
        </>
      )}
    </div>
  );
}
