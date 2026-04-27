import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Loader2, AlertCircle } from "lucide-react";
import { apiGet, AgingCurveRow, AgingCurvesResponse, PlayersResponse } from "../lib/api";

export function AgingCurves() {
  const [archetype, setArchetype] = useState("All Archetypes");
  const [archetypes, setArchetypes] = useState<string[]>(["All Archetypes"]);
  const [rows, setRows] = useState<AgingCurveRow[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<PlayersResponse>("/api/players?limit=250")
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

  const topOutliers = useMemo(() => rows.slice(0, 10), [rows]);

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Aging Curves</h1>
        <p className="text-slate-400 text-xl font-medium">Live-derived player production vs expected age curve.</p>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-white">Actual vs Expected Production</h3>
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="expected" name="Expected" stroke="#94A3B8" />
                <YAxis dataKey="actual" name="Actual" stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(59, 130, 246, 0.3)", borderRadius: "16px" }} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={rows} fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-white">Biggest Aging-Curve Outliers</h3>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={topOutliers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="player" type="category" stroke="#94A3B8" width={140} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(249, 115, 22, 0.3)", borderRadius: "16px" }} />
                <Bar dataKey="delta" fill="#F97316" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
