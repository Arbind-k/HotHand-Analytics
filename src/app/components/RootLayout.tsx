import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Flame, User, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { apiGet, HealthResponse } from "../lib/api";

export function RootLayout() {
  const location = useLocation();
  const [season, setSeason] = useState("Loading season...");
  const [status, setStatus] = useState("Checking backend");

  useEffect(() => {
    apiGet<HealthResponse>("/api/health")
      .then((data) => {
        setSeason(`NBA Season ${data.season}`);
        setStatus(data.ok ? "Live" : "Offline");
      })
      .catch(() => {
        setSeason("Backend offline");
        setStatus("Offline");
      });
  }, []);

  const navItems = [
    { path: "/app", label: "Dashboard", icon: LayoutDashboard },
    { path: "/app/hot-players", label: "Hot Players", icon: Flame },
    { path: "/app/player-details", label: "Player Details", icon: User },
    { path: "/app/aging-curves", label: "Aging Curves", icon: TrendingUp },
    { path: "/app/schedule-difficulty", label: "Schedule Difficulty", icon: Calendar },
    { path: "/app/misc-analytics", label: "Misc Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 border-r-2 border-slate-900 bg-black flex flex-col">
        <div className="p-8 border-b-2 border-slate-900">
          <Link to="/" className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/40 blur-2xl rounded-2xl"></div>
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/50 ring-4 ring-orange-500/20">
                <Flame className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">HotHand</h2>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Analytics</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/40"
                    : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-2xl"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full"></div>
                  </>
                )}
                <Icon className="w-6 h-6 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10 font-bold text-base tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t-2 border-slate-900">
          <div className="relative px-6 py-5 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${status === "Live" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"} animate-pulse shadow-lg`}></div>
                <p className={`text-xs font-bold tracking-wider uppercase ${status === "Live" ? "text-emerald-500" : "text-red-400"}`}>{status}</p>
              </div>
              <p className="text-sm font-bold text-white">{season}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gradient-to-br from-black via-slate-950 to-black">
        <Outlet />
      </main>
    </div>
  );
}
