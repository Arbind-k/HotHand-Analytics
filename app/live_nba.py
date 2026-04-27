from __future__ import annotations

import time
from datetime import datetime
from functools import wraps
from typing import Any, Callable

import numpy as np
import pandas as pd
from fastapi import HTTPException
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import (
    commonplayerinfo,
    leaguedashplayerstats,
    playercareerstats,
    playergamelog,
)
from nba_api.live.nba.endpoints import scoreboard

CACHE_SECONDS = 600
_cache: dict[str, tuple[float, Any]] = {}


def ttl_cache(key_fn: Callable[..., str]):
    def deco(fn: Callable[..., Any]):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            now = time.time()
            if key in _cache:
                ts, value = _cache[key]
                if now - ts < CACHE_SECONDS:
                    return value
            value = fn(*args, **kwargs)
            _cache[key] = (now, value)
            return value
        return wrapper
    return deco


def current_nba_season() -> str:
    """Returns NBA season format like 2025-26."""
    today = datetime.today()
    if today.month >= 10:
        start = today.year
    else:
        start = today.year - 1
    return f"{start}-{str(start + 1)[-2:]}"


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or pd.isna(value):
            return default
        return int(float(value))
    except Exception:
        return default


def pct(value: Any) -> float:
    v = safe_float(value)
    # NBA advanced endpoint usually returns decimals like .614
    return round(v * 100 if v <= 1 else v, 1)


def classify_archetype(row: dict[str, Any]) -> str:
    pts = safe_float(row.get("PTS"))
    ast = safe_float(row.get("AST"))
    reb = safe_float(row.get("REB"))
    usg = safe_float(row.get("USG_PCT"))
    ast_pct = safe_float(row.get("AST_PCT"))
    ts = safe_float(row.get("TS_PCT"))

    if ast_pct >= 0.34 or ast >= 7.0:
        return "Playmaker"
    if reb >= 10.0 and pts >= 18.0:
        return "All-Around Big"
    if usg >= 0.29 or pts >= 25.0:
        return "Elite Scorer"
    if ts >= 0.62 and pts >= 18.0:
        return "Efficiency Wing"
    if reb >= 8.0:
        return "Defensive Anchor"
    return "Role Contributor"


def production_score(row: dict[str, Any]) -> float:
    return round(
        safe_float(row.get("PTS"))
        + safe_float(row.get("REB")) * 0.7
        + safe_float(row.get("AST")) * 1.2
        + safe_float(row.get("STL")) * 1.5
        + safe_float(row.get("BLK")) * 1.5,
        2,
    )


@ttl_cache(lambda season=None, limit=80: f"league_advanced:{season or current_nba_season()}:{limit}")
def league_player_stats(season: str | None = None, limit: int = 80) -> list[dict[str, Any]]:
    season = season or current_nba_season()
    try:
        df = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            season_type_all_star="Regular Season",
            per_mode_detailed="PerGame",
            measure_type_detailed_defense="Advanced",
            timeout=25,
        ).get_data_frames()[0]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBA API league stats failed: {exc}")

    if df.empty:
        raise HTTPException(status_code=404, detail=f"No NBA player stats found for season {season}")

    # Keep players who actually played meaningful minutes.
    if "MIN" in df.columns:
        df = df[df["MIN"].fillna(0) >= 12]

    sort_col = "PTS" if "PTS" in df.columns else "MIN"
    df = df.sort_values(sort_col, ascending=False).head(limit)

    rows = []
    for _, r in df.iterrows():
        row = r.to_dict()
        name = row.get("PLAYER_NAME") or row.get("PLAYER") or "Unknown"
        player_id = safe_int(row.get("PLAYER_ID"))
        item = {
            "id": player_id,
            "player_id": player_id,
            "name": name,
            "team": row.get("TEAM_ABBREVIATION", "NBA"),
            "age": safe_int(row.get("AGE")),
            "position": "N/A",
            "archetype": classify_archetype(row),
            "gp": safe_int(row.get("GP")),
            "min": round(safe_float(row.get("MIN")), 1),
            "ppg": round(safe_float(row.get("PTS")), 1),
            "rpg": round(safe_float(row.get("REB")), 1),
            "apg": round(safe_float(row.get("AST")), 1),
            "ts_pct": pct(row.get("TS_PCT")),
            "usage": pct(row.get("USG_PCT")),
            "assist_rate": pct(row.get("AST_PCT")),
            "production_score": production_score(row),
        }
        rows.append(item)
    return rows


@ttl_cache(lambda name: f"search:{name.lower()}")
def search_players(name: str) -> list[dict[str, Any]]:
    return static_players.find_players_by_full_name(name)


@ttl_cache(lambda player_id: f"profile:{player_id}")
def player_profile(player_id: int) -> dict[str, Any]:
    try:
        df = commonplayerinfo.CommonPlayerInfo(player_id=player_id, timeout=25).get_data_frames()[0]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBA API player profile failed: {exc}")

    if df.empty:
        raise HTTPException(status_code=404, detail="Player profile not found")

    row = df.iloc[0].to_dict()
    return {
        "id": player_id,
        "player_id": player_id,
        "name": row.get("DISPLAY_FIRST_LAST") or row.get("DISPLAY_FI_LAST") or str(player_id),
        "team": row.get("TEAM_ABBREVIATION") or row.get("TEAM_NAME") or "NBA",
        "age": safe_int(row.get("AGE")),
        "position": row.get("POSITION") or "N/A",
        "height": row.get("HEIGHT") or "",
        "weight": row.get("WEIGHT") or "",
        "country": row.get("COUNTRY") or "",
        "experience": row.get("SEASON_EXP") or "",
    }


@ttl_cache(lambda player_id, season=None: f"gamelog:{player_id}:{season or current_nba_season()}")
def player_game_log(player_id: int, season: str | None = None) -> list[dict[str, Any]]:
    season = season or current_nba_season()
    try:
        df = playergamelog.PlayerGameLog(
            player_id=player_id,
            season=season,
            season_type_all_star="Regular Season",
            timeout=25,
        ).get_data_frames()[0]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBA API game log failed: {exc}")

    if df.empty:
        return []

    return df.to_dict(orient="records")


@ttl_cache(lambda player_id: f"career:{player_id}")
def player_career(player_id: int) -> list[dict[str, Any]]:
    try:
        df = playercareerstats.PlayerCareerStats(player_id=str(player_id), timeout=25).season_totals_regular_season.get_data_frame()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBA API career stats failed: {exc}")
    return df.to_dict(orient="records")


def true_shooting(points: float, fga: float, fta: float) -> float:
    denom = 2 * (fga + 0.44 * fta)
    return round((points / denom) * 100, 1) if denom else 0.0


def average_window(games: list[dict[str, Any]], window: int) -> dict[str, Any]:
    chunk = games[:window]
    if not chunk:
        return {
            "points": 0, "rebounds": 0, "assists": 0, "minutes": 0,
            "ts": 0, "usage": 0, "assistRate": 0,
        }

    points = [safe_float(g.get("PTS")) for g in chunk]
    rebounds = [safe_float(g.get("REB")) for g in chunk]
    assists = [safe_float(g.get("AST")) for g in chunk]
    minutes = [safe_float(g.get("MIN")) for g in chunk]
    fga = [safe_float(g.get("FGA")) for g in chunk]
    fta = [safe_float(g.get("FTA")) for g in chunk]

    pts = float(np.mean(points))
    return {
        "points": round(pts, 1),
        "rebounds": round(float(np.mean(rebounds)), 1),
        "assists": round(float(np.mean(assists)), 1),
        "minutes": round(float(np.mean(minutes)), 1),
        "ts": true_shooting(float(np.sum(points)), float(np.sum(fga)), float(np.sum(fta))),
        "usage": round(24 + pts * 0.25, 1),  # game log does not include usage; proxy from scoring load
        "assistRate": round(float(np.mean(assists)) * 4.2, 1),
    }


def hot_score_from_windows(player: dict[str, Any], games: list[dict[str, Any]]) -> dict[str, Any]:
    five = average_window(games, 5)
    fifteen = average_window(games, 15) if len(games) >= 10 else {
        "points": player["ppg"], "rebounds": player["rpg"], "assists": player["apg"],
        "minutes": player["min"], "ts": player["ts_pct"], "usage": player["usage"], "assistRate": player["assist_rate"],
    }

    momentum = (five["points"] - fifteen["points"]) + (five["ts"] - fifteen["ts"]) * 0.15
    score = player["production_score"] + momentum

    return {
        "name": player["name"],
        "team": player["team"],
        "score": round(score, 1),
        "ppg": five["points"] or player["ppg"],
        "apg": five["assists"] or player["apg"],
        "rpg": five["rebounds"] or player["rpg"],
        "label": "HOT" if momentum >= 1.5 else "STEADY" if momentum > -1.5 else "COOLING",
        "momentum": round(momentum, 1),
        "player_id": player["player_id"],
    }


def full_player_details(player_id: int, season: str | None = None) -> dict[str, Any]:
    season = season or current_nba_season()
    profile = player_profile(player_id)
    games = player_game_log(player_id, season)
    league = {p["player_id"]: p for p in league_player_stats(season=season, limit=500)}
    league_row = league.get(player_id, {})
    archetype = classify_archetype({
        "PTS": league_row.get("ppg", 0),
        "REB": league_row.get("rpg", 0),
        "AST": league_row.get("apg", 0),
        "USG_PCT": league_row.get("usage", 0) / 100,
        "AST_PCT": league_row.get("assist_rate", 0) / 100,
        "TS_PCT": league_row.get("ts_pct", 0) / 100,
    })

    rolling = {
        "fiveGame": average_window(games, 5),
        "tenGame": average_window(games, 10),
        "fifteenGame": average_window(games, 15),
    }

    profile["archetype"] = archetype
    profile["season"] = season
    profile["games_loaded"] = len(games)

    return {
        "playerProfile": profile,
        "rollingStats": rolling,
        "recentGames": games[:15],
        "source": "nba_api PlayerGameLog + CommonPlayerInfo + LeagueDashPlayerStats",
    }


@ttl_cache(lambda: "today_scoreboard")
def today_scoreboard() -> dict[str, Any]:
    try:
        return scoreboard.ScoreBoard(timeout=25).get_dict()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBA API live scoreboard failed: {exc}")
