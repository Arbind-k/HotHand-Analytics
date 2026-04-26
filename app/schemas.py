from pydantic import BaseModel


class TeamOut(BaseModel):
    id: int
    abbreviation: str
    name: str
    strength_rating: float

    model_config = {"from_attributes": True}


class PlayerOut(BaseModel):
    id: int
    full_name: str
    age: int
    position: str
    archetype: str
    team_id: int

    model_config = {"from_attributes": True}


class RollingWindowOut(BaseModel):
    window: int
    games_counted: int
    points: float
    rebounds: float
    assists: float
    minutes: float
    true_shooting_pct: float
    assist_rate: float
    usage_rate: float


class HotPlayerOut(BaseModel):
    player_id: int
    player_name: str
    team: str
    archetype: str
    window: int
    hot_score: float
    direction: str
    recent_points: float
    season_points: float
    recent_ts_pct: float
    season_ts_pct: float
    recent_usage_rate: float
    season_usage_rate: float


class ScheduleDifficultyOut(BaseModel):
    team_id: int
    team: str
    games_analyzed: int
    difficulty_score: float
    opponent_strength_component: float
    travel_component: float
    rest_component: float
    home_away_component: float
    back_to_back_count: int


class MiscMetricOut(BaseModel):
    player_id: int
    player_name: str
    team: str
    metric: str
    value: float
    explanation: str
