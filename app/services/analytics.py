from __future__ import annotations

from datetime import date
from math import atan2, cos, radians, sin, sqrt
from statistics import mean, pstdev

import numpy as np
from sqlalchemy.orm import Session

from app.models import GameLog, Player, Team, TeamSchedule


def safe_div(numerator: float, denominator: float) -> float:
    return 0.0 if denominator == 0 else numerator / denominator


def round_metric(value: float) -> float:
    return round(float(value), 3)


def calculate_true_shooting(points: float, fga: float, fta: float) -> float:
    denominator = 2 * (fga + 0.44 * fta)
    return safe_div(points, denominator)


def calculate_assist_rate(assists: float, minutes: float) -> float:
    # Demo proxy: assists normalized to 36 minutes.
    return safe_div(assists, minutes) * 36


def calculate_usage_rate(fga: float, fta: float, turnovers: float, minutes: float) -> float:
    # Demo proxy: offensive actions normalized to 36 minutes.
    possessions_used = fga + 0.44 * fta + turnovers
    return safe_div(possessions_used, minutes) * 36


def summarize_logs(logs: list[GameLog]) -> dict:
    if not logs:
        return {
            "games_counted": 0,
            "points": 0,
            "rebounds": 0,
            "assists": 0,
            "minutes": 0,
            "true_shooting_pct": 0,
            "assist_rate": 0,
            "usage_rate": 0,
        }

    total_points = sum(g.points for g in logs)
    total_rebounds = sum(g.rebounds for g in logs)
    total_assists = sum(g.assists for g in logs)
    total_minutes = sum(g.minutes for g in logs)
    total_fga = sum(g.fga for g in logs)
    total_fta = sum(g.fta for g in logs)
    total_turnovers = sum(g.turnovers for g in logs)
    games = len(logs)

    return {
        "games_counted": games,
        "points": round_metric(total_points / games),
        "rebounds": round_metric(total_rebounds / games),
        "assists": round_metric(total_assists / games),
        "minutes": round_metric(total_minutes / games),
        "true_shooting_pct": round_metric(calculate_true_shooting(total_points, total_fga, total_fta)),
        "assist_rate": round_metric(calculate_assist_rate(total_assists, total_minutes)),
        "usage_rate": round_metric(calculate_usage_rate(total_fga, total_fta, total_turnovers, total_minutes)),
    }


def get_player_logs(db: Session, player_id: int) -> list[GameLog]:
    return (
        db.query(GameLog)
        .filter(GameLog.player_id == player_id)
        .order_by(GameLog.game_date.desc())
        .all()
    )


def rolling_player_dashboard(db: Session, player_id: int, windows: list[int]) -> list[dict]:
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise ValueError("Player not found")

    logs = get_player_logs(db, player_id)
    results = []

    for window in windows:
        summary = summarize_logs(logs[:window])
        summary["window"] = window
        results.append(summary)

    return results


def calculate_hot_score(recent: dict, season: dict) -> float:
    points_delta = recent["points"] - season["points"]
    ts_delta = (recent["true_shooting_pct"] - season["true_shooting_pct"]) * 100
    usage_delta = recent["usage_rate"] - season["usage_rate"]
    minutes_delta = recent["minutes"] - season["minutes"]

    score = points_delta * 1.8 + ts_delta * 1.2 + usage_delta * 0.8 + minutes_delta * 0.4
    return round_metric(score)


def divergence_engine(db: Session, window: int = 10, limit: int = 10, direction: str = "both") -> list[dict]:
    players = db.query(Player).all()
    output = []

    for player in players:
        logs = get_player_logs(db, player.id)
        if len(logs) < max(3, min(window, 5)):
            continue

        recent = summarize_logs(logs[:window])
        season = summarize_logs(logs)
        hot_score = calculate_hot_score(recent, season)

        if direction == "hot" and hot_score <= 0:
            continue
        if direction == "cold" and hot_score >= 0:
            continue

        output.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "team": player.team.abbreviation,
                "archetype": player.archetype,
                "window": window,
                "hot_score": hot_score,
                "direction": "overperforming" if hot_score >= 0 else "underperforming",
                "recent_points": recent["points"],
                "season_points": season["points"],
                "recent_ts_pct": recent["true_shooting_pct"],
                "season_ts_pct": season["true_shooting_pct"],
                "recent_usage_rate": recent["usage_rate"],
                "season_usage_rate": season["usage_rate"],
            }
        )

    output.sort(key=lambda x: abs(x["hot_score"]), reverse=True)
    return output[:limit]


def production_score(summary: dict) -> float:
    return round_metric(
        summary["points"] * 1.0
        + summary["rebounds"] * 0.7
        + summary["assists"] * 0.9
        + summary["true_shooting_pct"] * 12
        + summary["usage_rate"] * 0.25
    )


def expected_aging_score(age: int, archetype: str) -> float:
    archetype = archetype.lower()

    if "guard" in archetype:
        peak_age = 27
        peak_score = 38
        decline_rate = 1.25
    elif "big" in archetype or "rim" in archetype:
        peak_age = 28
        peak_score = 34
        decline_rate = 1.05
    else:
        peak_age = 28
        peak_score = 36
        decline_rate = 1.15

    age_gap = abs(age - peak_age)

    if age <= peak_age:
        expected = peak_score - age_gap * 0.75
    else:
        expected = peak_score - age_gap * decline_rate

    return round_metric(max(expected, 12))


def aging_curve(db: Session, archetype: str | None = None) -> dict:
    query = db.query(Player)
    if archetype:
        query = query.filter(Player.archetype == archetype)

    players = query.all()
    curve_archetype = archetype or "balanced_wing"

    curve_points = [
        {"age": age, "expected_score": expected_aging_score(age, curve_archetype)}
        for age in range(20, 40)
    ]

    player_results = []
    for player in players:
        logs = get_player_logs(db, player.id)
        if not logs:
            continue

        actual = production_score(summarize_logs(logs))
        expected = expected_aging_score(player.age, player.archetype)
        delta = round_metric(actual - expected)

        if delta >= 5:
            label = "aging better than expected"
        elif delta <= -5:
            label = "aging worse than expected"
        else:
            label = "near expected curve"

        player_results.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "age": player.age,
                "archetype": player.archetype,
                "actual_score": actual,
                "expected_score": expected,
                "aging_delta": delta,
                "label": label,
            }
        )

    player_results.sort(key=lambda x: x["aging_delta"], reverse=True)
    return {"curve": curve_points, "players": player_results}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return radius * c


def schedule_difficulty(db: Session, team_id: int, games: int = 10) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise ValueError("Team not found")

    schedule = (
        db.query(TeamSchedule)
        .filter(TeamSchedule.team_id == team_id)
        .order_by(TeamSchedule.game_date.asc())
        .limit(games)
        .all()
    )

    if not schedule:
        raise ValueError("No upcoming schedule found for this team")

    opponent_strengths = []
    travel_distances = []
    rest_penalties = []
    home_away_penalties = []
    back_to_back_count = 0
    previous_game_date: date | None = None
    previous_location = (team.latitude, team.longitude)

    for game in schedule:
        opponent = db.query(Team).filter(Team.id == game.opponent_id).first()
        if not opponent:
            continue

        opponent_strengths.append(opponent.strength_rating)

        if game.is_home:
            current_location = (team.latitude, team.longitude)
            home_away_penalties.append(0)
        else:
            current_location = (opponent.latitude, opponent.longitude)
            home_away_penalties.append(6)

        travel_km = haversine_distance_km(
            previous_location[0], previous_location[1], current_location[0], current_location[1]
        )
        travel_distances.append(travel_km)

        if previous_game_date:
            rest_days = (game.game_date - previous_game_date).days - 1
            if rest_days <= 0:
                rest_penalties.append(10)
                back_to_back_count += 1
            elif rest_days == 1:
                rest_penalties.append(5)
            else:
                rest_penalties.append(0)

        previous_game_date = game.game_date
        previous_location = current_location

    opponent_component = mean(opponent_strengths) if opponent_strengths else 0
    travel_component = min(mean(travel_distances) / 150, 20) if travel_distances else 0
    rest_component = mean(rest_penalties) if rest_penalties else 0
    home_away_component = mean(home_away_penalties) if home_away_penalties else 0

    difficulty_score = (
        opponent_component * 0.55
        + travel_component * 0.15
        + rest_component * 0.2
        + home_away_component * 0.1
    )

    return {
        "team_id": team.id,
        "team": team.abbreviation,
        "games_analyzed": len(schedule),
        "difficulty_score": round_metric(difficulty_score),
        "opponent_strength_component": round_metric(opponent_component),
        "travel_component": round_metric(travel_component),
        "rest_component": round_metric(rest_component),
        "home_away_component": round_metric(home_away_component),
        "back_to_back_count": back_to_back_count,
    }


def volatility_score(db: Session, limit: int = 10) -> list[dict]:
    results = []
    for player in db.query(Player).all():
        logs = get_player_logs(db, player.id)
        if len(logs) < 5:
            continue
        points = [g.points for g in logs]
        results.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "team": player.team.abbreviation,
                "metric": "volatility_score",
                "value": round_metric(pstdev(points)),
                "explanation": "Standard deviation of points. Higher means more boom-or-bust scoring.",
            }
        )
    results.sort(key=lambda x: x["value"], reverse=True)
    return results[:limit]


def consistency_index(db: Session, limit: int = 10) -> list[dict]:
    results = []
    for player in db.query(Player).all():
        logs = get_player_logs(db, player.id)
        if len(logs) < 5:
            continue
        points = [g.points for g in logs]
        avg = mean(points)
        volatility = pstdev(points)
        value = max(0, 100 - safe_div(volatility, avg) * 100)
        results.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "team": player.team.abbreviation,
                "metric": "consistency_index",
                "value": round_metric(value),
                "explanation": "Higher means the player produces closer to their normal scoring level.",
            }
        )
    results.sort(key=lambda x: x["value"], reverse=True)
    return results[:limit]


def trend_momentum(db: Session, limit: int = 10) -> list[dict]:
    results = []
    for player in db.query(Player).all():
        logs = list(reversed(get_player_logs(db, player.id)))
        if len(logs) < 6:
            continue
        x = np.arange(len(logs))
        y = np.array([g.points + g.assists * 1.5 + g.rebounds * 1.2 for g in logs])
        slope = np.polyfit(x, y, 1)[0]
        results.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "team": player.team.abbreviation,
                "metric": "trend_momentum",
                "value": round_metric(slope),
                "explanation": "Linear trend of box-score impact over time. Positive means trending upward.",
            }
        )
    results.sort(key=lambda x: x["value"], reverse=True)
    return results[:limit]


def clutch_players(db: Session, limit: int = 10) -> list[dict]:
    results = []
    for player in db.query(Player).all():
        logs = get_player_logs(db, player.id)
        if not logs:
            continue
        clutch_ppg = mean([g.clutch_points for g in logs])
        plus_minus = mean([g.plus_minus for g in logs])
        value = clutch_ppg * 2 + plus_minus * 0.25
        results.append(
            {
                "player_id": player.id,
                "player_name": player.full_name,
                "team": player.team.abbreviation,
                "metric": "clutch_score",
                "value": round_metric(value),
                "explanation": "Combines clutch points and plus-minus to surface late-game impact.",
            }
        )
    results.sort(key=lambda x: x["value"], reverse=True)
    return results[:limit]
