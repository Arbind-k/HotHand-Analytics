import { useEffect, useMemo, useState } from "react";
import { Loader2, User, AlertCircle } from "lucide-react";
import { apiGet, Player, PlayerDetailsData, PlayersResponse, RollingWindow } from "../lib/api";

function StatCard({ title, stats, gradient }: { title: string; stats: RollingWindow; gradient: string }) {
  const rows = [["Points", stats.points], ["Rebounds", stats.rebounds], ["Assists", stats.assists], ["Minutes", stats.minutes], ["TS%", `${stats.ts}%`], ["Usage", `${stats.usage}%`]];
  return (
    <div className="p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl">
      <h3 className={`text-3xl font-black mb-8 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {rows.map(([label, value]) => (
          <div key={label} className="p-5 rounded-2xl border-2 border-slate-800 bg-slate-950/60 text-center">
            <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">{label}</div>
            <div className="text-3xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerDetails() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortMode, setSortMode] = useState<"alpha" | "team">("alpha");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<PlayerDetailsData | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingPlayers(true);
    apiGet<PlayersResponse>(`/api/players?limit=300&sort_by=${sortMode}`)
      .then((data) => {
        setPlayers(data.players);
        if (!selectedId && data.players.length > 0) setSelectedId(data.players[0].player_id ?? data.players[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPlayers(false));
  }, [sortMode]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetails(true);
    setError(null);
    apiGet<PlayerDetailsData>(`/api/players/${selectedId}`)
      .then(setDetails)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDetails(false));
  }, [selectedId]);

  const profile = details?.playerProfile;
  const recentGames = useMemo(() => details?.recentGames?.slice(0, 8) ?? [], [details]);
  const groupedByTeam = useMemo(() => {
    const groups: Record<string, Player[]> = {};
    players.forEach((p) => {
      const team = p.team || "NBA";
      groups[team] = groups[team] || [];
      groups[team].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [players]);

  return (
    <div className="p-12 space-y-12">
      <div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">Player Details</h1>
        <p className="text-slate-400 text-xl font-medium">Dropdown is live, organized, and loaded from FastAPI.</p>
        {error && <div className="mt-4 flex items-center gap-3 text-red-400 font-semibold"><AlertCircle className="w-5 h-5" /> {error}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 max-w-4xl">
        <div>
          <label className="block text-sm text-slate-500 font-black uppercase tracking-widest mb-3">Sort</label>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as "alpha" | "team")} className="w-full px-6 py-4 bg-slate-950 border-2 border-blue-500/40 rounded-2xl text-white text-lg font-bold outline-none focus:border-blue-400">
            <option value="alpha">Alphabetical A-Z</option>
            <option value="team">Grouped by Team</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-500 font-black uppercase tracking-widest mb-3">Select Live NBA Player ({players.length} loaded)</label>
          <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))} disabled={loadingPlayers || players.length === 0} className="w-full px-6 py-4 bg-slate-950 border-2 border-orange-500/50 rounded-2xl text-white text-lg font-bold outline-none focus:border-orange-400">
            {sortMode === "team" ? groupedByTeam.map(([team, teamPlayers]) => (
              <optgroup key={team} label={team}>{teamPlayers.map((player) => <option key={player.player_id ?? player.id} value={player.player_id ?? player.id}>{player.name}</option>)}</optgroup>
            )) : players.map((player) => (
              <option key={player.player_id ?? player.id} value={player.player_id ?? player.id}>{player.name} — {player.team}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingPlayers || loadingDetails || !profile || !details ? (
        <div className="flex items-center gap-3 text-slate-300 text-xl"><Loader2 className="animate-spin" /> Loading live player data...</div>
      ) : (
        <>
          <div className="relative p-10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-3xl rounded-full" />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-10">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/30"><User className="w-20 h-20 text-white" /></div>
              <div className="flex-1">
                <h2 className="text-5xl font-black text-white mb-3">{profile.name}</h2>
                <p className="text-slate-400 text-xl font-semibold">{profile.team} • {profile.position || "Position N/A"}</p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="px-6 py-3 rounded-2xl bg-slate-950/70 border-2 border-slate-800"><span className="text-slate-500 font-black uppercase text-xs">Age: </span><span className="text-white font-black text-xl">{profile.age || "--"}</span></div>
                  <div className="px-6 py-3 rounded-2xl bg-slate-950/70 border-2 border-slate-800"><span className="text-slate-500 font-black uppercase text-xs">Archetype: </span><span className="text-orange-400 font-black text-xl">{profile.archetype}</span></div>
                  <div className="px-6 py-3 rounded-2xl bg-slate-950/70 border-2 border-slate-800"><span className="text-slate-500 font-black uppercase text-xs">Games Loaded: </span><span className="text-white font-black text-xl">{profile.games_loaded ?? recentGames.length}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black mb-8 text-white">Rolling Statistics</h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <StatCard title="5-Game Window" stats={details.rollingStats.fiveGame} gradient="from-orange-400 to-red-500" />
              <StatCard title="10-Game Window" stats={details.rollingStats.tenGame} gradient="from-blue-400 to-cyan-500" />
              <StatCard title="15-Game Window" stats={details.rollingStats.fifteenGame} gradient="from-purple-400 to-pink-500" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-10 py-7 border-b-2 border-slate-800"><h3 className="text-3xl font-black text-white">Recent Games</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-left text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800"><th className="p-5">Date</th><th className="p-5">Matchup</th><th className="p-5">PTS</th><th className="p-5">REB</th><th className="p-5">AST</th><th className="p-5">MIN</th></tr></thead>
                <tbody>{recentGames.map((g, i) => <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/60"><td className="p-5 text-slate-300">{g.GAME_DATE ?? "--"}</td><td className="p-5 text-white font-bold">{g.MATCHUP ?? "--"}</td><td className="p-5 text-orange-400 font-black">{g.PTS ?? "--"}</td><td className="p-5 text-slate-300">{g.REB ?? "--"}</td><td className="p-5 text-slate-300">{g.AST ?? "--"}</td><td className="p-5 text-slate-300">{g.MIN ?? "--"}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
