import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Flame, TrendingUp, Calendar, Activity, Target, Github, FileText, ArrowRight, Zap } from "lucide-react";
import { apiGet, HealthResponse, PlayersResponse, MiscAnalyticsResponse } from "../lib/api";

export function LandingPage() {
  const [season, setSeason] = useState("Loading");
  const [playerCount, setPlayerCount] = useState("--");
  const [metricCount, setMetricCount] = useState("--");

  useEffect(() => {
    apiGet<HealthResponse>("/api/health").then((data) => setSeason(data.season)).catch(() => setSeason("Offline"));
    apiGet<PlayersResponse>("/api/players?limit=500").then((data) => setPlayerCount(String(data.players.length))).catch(() => setPlayerCount("--"));
    apiGet<MiscAnalyticsResponse>("/api/misc-analytics?limit=10").then((data) => {
      const first = data.players[0] ?? {};
      setMetricCount(String(Object.keys(first).filter((key) => !["player", "team"].includes(key)).length));
    }).catch(() => setMetricCount("--"));
  }, []);

  const features = [
    {
      icon: Flame,
      title: "Who's Hot Right Now",
      description: "Track players with momentum across 5, 10, and 15-game rolling windows",
      gradient: "from-orange-500 via-orange-600 to-red-600",
      glowColor: "rgba(249, 115, 22, 0.4)",
    },
    {
      icon: TrendingUp,
      title: "Player Aging Curves",
      description: "Compare actual performance vs. expected decline by archetype",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      icon: Calendar,
      title: "Schedule Difficulty",
      description: "Analyze opponent strength, travel, rest, and back-to-backs",
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      glowColor: "rgba(139, 92, 246, 0.4)",
    },
    {
      icon: Activity,
      title: "Trend Momentum",
      description: "Identify players accelerating or decelerating in production",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      glowColor: "rgba(16, 185, 129, 0.4)",
    },
    {
      icon: Target,
      title: "Clutch Players",
      description: "Performance analysis in high-pressure game situations",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      glowColor: "rgba(251, 191, 36, 0.4)",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-full mb-10 backdrop-blur-xl shadow-lg shadow-orange-500/10">
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-semibold text-orange-500 tracking-wide">PROFESSIONAL NBA ANALYTICS</span>
          </div>

          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full scale-150"></div>
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/50 ring-4 ring-orange-500/20">
                <Flame className="w-16 h-16 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-8xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent" style={{ lineHeight: '1.1' }}>
                HotHand
              </h1>
              <h1 className="text-8xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ lineHeight: '1.1' }}>
                Analytics
              </h1>
            </div>
          </div>

          <p className="text-2xl text-slate-400 max-w-4xl mx-auto mb-16 leading-relaxed font-medium">
            Real-time NBA player momentum, aging curves, schedule difficulty, and performance trends powered by advanced machine learning analytics.
          </p>

          <div className="flex items-center justify-center gap-6">
            <Link
              to="/app"
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-3">
                View Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="https://github.com"
              className="px-10 py-5 bg-slate-900/50 border-2 border-slate-800 text-white rounded-2xl font-bold text-lg backdrop-blur-xl hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-3 shadow-xl"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a
              href="http://127.0.0.1:8000/docs" target="_blank"
              className="px-10 py-5 bg-slate-900/50 border-2 border-slate-800 text-white rounded-2xl font-bold text-lg backdrop-blur-xl hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 flex items-center gap-3 shadow-xl"
            >
              <FileText className="w-5 h-5" />
              API Docs
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl hover:border-slate-700 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{
                  boxShadow: `0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 50px -12px rgba(0, 0, 0, 0.5)`,
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" style={{
                  background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.glowColor}, transparent 40%)`,
                }}></div>
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: `0 0 40px ${feature.glowColor}` }}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-base">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative p-16 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-emerald-500/5"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-orange-500/10 blur-[100px] rounded-full"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="space-y-4">
              <div className="text-7xl font-black bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent">{playerCount}</div>
              <div className="text-slate-400 text-xl font-semibold">Live Players Loaded</div>
            </div>
            <div className="space-y-4">
              <div className="text-7xl font-black bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">{season}</div>
              <div className="text-slate-400 text-xl font-semibold">Backend Season</div>
            </div>
            <div className="space-y-4">
              <div className="text-7xl font-black bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent">{metricCount}</div>
              <div className="text-slate-400 text-xl font-semibold">Live Metrics Per Player</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
