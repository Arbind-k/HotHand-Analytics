import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Calendar, Wifi, WifiOff } from "lucide-react";
import { apiGet, DashboardData } from "../lib/api";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const hottest = data?.hottest_players ?? [];
  const trendData = data?.trend_momentum ?? [];
  const scheduleData = data?.schedule_difficulty ?? [];

  const topPlayer = hottest[0];
  const statCards = [
    {
      title: "Backend Status",
      value: error ? "Offline" : loading ? "Loading" : "Connected",
      subtitle: data?.source ?? "FastAPI + NBA API",
      icon: error ? WifiOff : Wifi,
      gradient: error ? "from-red-400 via-red-500 to-rose-600" : "from-emerald-400 via-green-500 to-teal-600",
      glowColor: error ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)",
    },
    {
      title: "Hottest Player",
      value: topPlayer?.name ?? "Loading...",
      subtitle: topPlayer ? `${topPlayer.score} Hot Score` : "NBA API data",
      icon: TrendingUp,
      gradient: "from-orange-400 via-orange-500 to-red-600",
      glowColor: "rgba(249, 115, 22, 0.4)",
    },
    {
      title: "Players Loaded",
      value: String(hottest.length || "--"),
      subtitle: "From backend endpoint",
      icon: Activity,
      gradient: "from-blue-400 via-blue-500 to-cyan-600",
      glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      title: "Hardest Schedule",
      value: scheduleData[0]?.team ?? "LAL",
      subtitle: scheduleData[0] ? `${scheduleData[0].difficulty} Difficulty` : "Schedule model",
      icon: Calendar,
      gradient: "from-purple-400 via-purple-500 to-pink-600",
      glowColor: "rgba(139, 92, 246, 0.4)",
    },
  ];

  return (
    <div className="p-12 space-y-12">
      <div className="mb-12">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-xl font-medium">Connected to your FastAPI backend</p>
        {error && <p className="mt-3 text-red-400 font-semibold">Backend error: {error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="group relative p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl hover:border-slate-700 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(400px circle at 50% 50%, ${card.glowColor}, transparent 70%)` }}></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{card.title}</div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`} style={{ boxShadow: `0 0 30px ${card.glowColor}` }}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className={`text-3xl font-black mb-3 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent tracking-tight`}>{card.value}</div>
                <div className="text-base text-slate-400 font-semibold">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl shadow-2xl">
          <h3 className="text-3xl font-black mb-8 text-white tracking-tight">Hot Score Leaders</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={hottest}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 13, fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(249, 115, 22, 0.3)", borderRadius: "16px" }} />
              <Bar dataKey="score" fill="url(#barGradient)" radius={[14, 14, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl shadow-2xl">
          <h3 className="text-3xl font-black mb-8 text-white tracking-tight">Trend Momentum</h3>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
              <XAxis dataKey="game" stroke="#94A3B8" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 13, fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "2px solid rgba(16, 185, 129, 0.3)", borderRadius: "16px" }} />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={4} dot={{ fill: "#10B981", r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-12 py-8 border-b-2 border-slate-800 bg-slate-900/80">
          <h3 className="text-4xl font-black text-white tracking-tight">Live Backend Players</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="px-8 py-5">Player</th>
                <th className="px-8 py-5">Team</th>
                <th className="px-8 py-5">Hot Score</th>
                <th className="px-8 py-5">PPG</th>
                <th className="px-8 py-5">APG</th>
                <th className="px-8 py-5">RPG</th>
              </tr>
            </thead>
            <tbody>
              {hottest.map((p) => (
                <tr key={p.name} className="border-b border-slate-900 hover:bg-slate-900/60">
                  <td className="px-8 py-5 text-white font-bold">{p.name}</td>
                  <td className="px-8 py-5 text-slate-300">{p.team}</td>
                  <td className="px-8 py-5 text-orange-400 font-black">{p.score}</td>
                  <td className="px-8 py-5 text-slate-300">{p.ppg ?? "--"}</td>
                  <td className="px-8 py-5 text-slate-300">{p.apg ?? "--"}</td>
                  <td className="px-8 py-5 text-slate-300">{p.rpg ?? "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
