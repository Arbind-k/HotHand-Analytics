import { useEffect, useMemo, useState } from "react";
import { Flame, Loader2, Trophy } from "lucide-react";
import { apiGet, HotPlayer } from "../lib/api";

export function HotPlayers() {
  const [players, setPlayers] = useState<HotPlayer[]>([]);
  const [source, setSource] = useState("loading");
  const [visibleCount, setVisibleCount] = useState(24);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ players: HotPlayer[]; source: string }>("/api/hot-players?limit=60")
      .then((data) => {
        setPlayers(data.players);
        setSource(data.source);
      })
      .catch((err) => setError(err.message));
  }, []);

  const visiblePlayers = useMemo(() => players.slice(0, visibleCount), [players, visibleCount]);

  return (
    <div className="p-12 space-y-10">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Hot Players</h1>
        <p className="text-slate-400 text-xl font-medium">Live hot list from FastAPI. Showing {visiblePlayers.length} of {players.length} loaded players.</p>
        <p className="text-slate-500 mt-2">Source: {source}</p>
        {error && <p className="mt-3 text-red-400 font-semibold">Backend error: {error}</p>}
      </div>

      {players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border-2 border-orange-500/30 bg-orange-500/10"><div className="text-orange-400 text-xs font-black uppercase tracking-widest">Players Loaded</div><div className="text-4xl font-black text-orange-400">{players.length}</div></div>
          <div className="p-6 rounded-3xl border-2 border-blue-500/30 bg-blue-500/10"><div className="text-blue-400 text-xs font-black uppercase tracking-widest">Top Player</div><div className="text-2xl font-black text-white truncate">{players[0]?.name}</div></div>
          <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-purple-500/10"><div className="text-purple-400 text-xs font-black uppercase tracking-widest">Top Score</div><div className="text-4xl font-black text-purple-400">{players[0]?.score}</div></div>
          <div className="p-6 rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/10"><div className="text-emerald-400 text-xs font-black uppercase tracking-widest">Mode</div><div className="text-2xl font-black text-white">Live NBA API</div></div>
        </div>
      )}

      {players.length === 0 && !error ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl">
          <Loader2 className="animate-spin" /> Loading players from backend...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {visiblePlayers.map((player, index) => (
              <div key={`${player.player_id}-${player.name}`} className="group relative p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border-2 border-slate-800 rounded-3xl hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                    {index < 3 ? <Trophy className="w-7 h-7 text-white" /> : <Flame className="w-7 h-7 text-white" />}
                  </div>
                  <div className="text-slate-500 font-black text-3xl">#{index + 1}</div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{player.name}</h2>
                <p className="text-slate-400 font-semibold mb-6">{player.team} • {player.label}</p>
                <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">{player.score}</div>
                <p className="text-slate-400 font-semibold mb-6">Hot Score</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800"><div className="text-white font-black text-xl">{player.ppg ?? "--"}</div><div className="text-slate-500 text-xs font-bold">PPG</div></div>
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800"><div className="text-white font-black text-xl">{player.apg ?? "--"}</div><div className="text-slate-500 text-xs font-bold">APG</div></div>
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800"><div className="text-white font-black text-xl">{player.rpg ?? "--"}</div><div className="text-slate-500 text-xs font-bold">RPG</div></div>
                  <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800"><div className="text-white font-black text-xl">{player.momentum ?? "--"}</div><div className="text-slate-500 text-xs font-bold">MOM</div></div>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < players.length && (
            <button onClick={() => setVisibleCount((n) => n + 18)} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black shadow-xl shadow-orange-500/20">
              Load More Players
            </button>
          )}
        </>
      )}
    </div>
  );
}
