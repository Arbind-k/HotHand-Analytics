from datetime import date, timedelta
import random

from app.database import Base, SessionLocal, create_tables, engine
from app.models import GameLog, Player, Team, TeamSchedule

random.seed(42)


def reset_database():
    Base.metadata.drop_all(bind=engine)
    create_tables()


def create_teams(db):
    teams = [
        {"id": 1, "abbreviation": "LAL", "name": "Los Angeles Lakers", "strength_rating": 78, "latitude": 34.0522, "longitude": -118.2437},
        {"id": 2, "abbreviation": "GSW", "name": "Golden State Warriors", "strength_rating": 74, "latitude": 37.7749, "longitude": -122.4194},
        {"id": 3, "abbreviation": "BOS", "name": "Boston Celtics", "strength_rating": 91, "latitude": 42.3601, "longitude": -71.0589},
        {"id": 4, "abbreviation": "DEN", "name": "Denver Nuggets", "strength_rating": 88, "latitude": 39.7392, "longitude": -104.9903},
        {"id": 5, "abbreviation": "DAL", "name": "Dallas Mavericks", "strength_rating": 84, "latitude": 32.7767, "longitude": -96.7970},
        {"id": 6, "abbreviation": "MIA", "name": "Miami Heat", "strength_rating": 73, "latitude": 25.7617, "longitude": -80.1918},
    ]
    for team in teams:
        db.add(Team(**team))
    db.commit()


def create_players(db):
    players = [
        {"id": 1, "full_name": "Jaylen Storm", "age": 27, "position": "G", "archetype": "shot_creating_guard", "team_id": 1},
        {"id": 2, "full_name": "Marcus Vale", "age": 34, "position": "F", "archetype": "balanced_wing", "team_id": 1},
        {"id": 3, "full_name": "Theo Banks", "age": 24, "position": "G", "archetype": "shot_creating_guard", "team_id": 2},
        {"id": 4, "full_name": "Evan Cross", "age": 30, "position": "C", "archetype": "rim_running_big", "team_id": 3},
        {"id": 5, "full_name": "Niko Hart", "age": 29, "position": "F", "archetype": "two_way_wing", "team_id": 4},
        {"id": 6, "full_name": "Dante Rivers", "age": 22, "position": "G", "archetype": "playmaking_guard", "team_id": 5},
        {"id": 7, "full_name": "Miles Stone", "age": 32, "position": "C", "archetype": "rim_running_big", "team_id": 6},
        {"id": 8, "full_name": "Cole Archer", "age": 26, "position": "F", "archetype": "three_and_d_wing", "team_id": 2},
    ]
    for player in players:
        db.add(Player(**player))
    db.commit()


def generate_player_game_logs(db):
    players = db.query(Player).all()
    teams = db.query(Team).all()
    start = date.today() - timedelta(days=60)

    player_profiles = {
        1: {"pts": 24, "reb": 5, "ast": 7, "min": 35, "hot_boost": 6},
        2: {"pts": 18, "reb": 7, "ast": 5, "min": 33, "hot_boost": -2},
        3: {"pts": 20, "reb": 4, "ast": 6, "min": 32, "hot_boost": 4},
        4: {"pts": 15, "reb": 11, "ast": 3, "min": 30, "hot_boost": 1},
        5: {"pts": 22, "reb": 8, "ast": 4, "min": 34, "hot_boost": 3},
        6: {"pts": 17, "reb": 3, "ast": 9, "min": 31, "hot_boost": 5},
        7: {"pts": 12, "reb": 10, "ast": 2, "min": 27, "hot_boost": -4},
        8: {"pts": 14, "reb": 6, "ast": 3, "min": 29, "hot_boost": 2},
    }

    for player in players:
        profile = player_profiles[player.id]
        game_date = start
        for game_number in range(20):
            opponent = random.choice([t for t in teams if t.id != player.team_id])
            recent_boost = profile["hot_boost"] if game_number >= 12 else 0
            points = max(2, int(random.gauss(profile["pts"] + recent_boost, 5)))
            rebounds = max(0, int(random.gauss(profile["reb"], 2)))
            assists = max(0, int(random.gauss(profile["ast"], 2)))
            minutes = max(12, random.gauss(profile["min"], 4))
            fga = max(4, int(points / random.uniform(1.1, 1.7)))
            fta = max(0, int(random.gauss(5, 2)))
            turnovers = max(0, int(random.gauss(3, 1.5)))

            db.add(
                GameLog(
                    player_id=player.id,
                    team_id=player.team_id,
                    opponent_id=opponent.id,
                    game_date=game_date,
                    is_home=random.choice([True, False]),
                    minutes=round(minutes, 1),
                    points=points,
                    rebounds=rebounds,
                    assists=assists,
                    steals=random.randint(0, 3),
                    blocks=random.randint(0, 3),
                    turnovers=turnovers,
                    fga=fga,
                    fta=fta,
                    plus_minus=random.randint(-15, 18),
                    clutch_points=max(0, int(random.gauss(points * 0.12, 2))),
                )
            )
            game_date += timedelta(days=random.choice([1, 2, 2, 3]))
    db.commit()


def create_schedule(db):
    teams = db.query(Team).all()
    today = date.today()
    for team in teams:
        game_date = today + timedelta(days=1)
        for _ in range(12):
            opponent = random.choice([t for t in teams if t.id != team.id])
            db.add(
                TeamSchedule(
                    team_id=team.id,
                    opponent_id=opponent.id,
                    game_date=game_date,
                    is_home=random.choice([True, False, False]),
                )
            )
            game_date += timedelta(days=random.choice([1, 2, 2, 3]))
    db.commit()


def seed():
    reset_database()
    db = SessionLocal()
    try:
        create_teams(db)
        create_players(db)
        generate_player_game_logs(db)
        create_schedule(db)
        print("Database seeded successfully.")
        print("Run: uvicorn app.main:app --reload")
        print("Open: http://127.0.0.1:8000/docs")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
