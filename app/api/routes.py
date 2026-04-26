from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Player, Team
from app.schemas import HotPlayerOut, MiscMetricOut, PlayerOut, RollingWindowOut, ScheduleDifficultyOut, TeamOut
from app.services.analytics import (
    aging_curve,
    clutch_players,
    consistency_index,
    divergence_engine,
    rolling_player_dashboard,
    schedule_difficulty,
    trend_momentum,
    volatility_score,
)

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Who's Hot Right Now backend is running"}


@router.get("/teams", response_model=list[TeamOut])
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).order_by(Team.abbreviation).all()


@router.get("/players", response_model=list[PlayerOut])
def get_players(archetype: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Player)
    if archetype:
        query = query.filter(Player.archetype == archetype)
    return query.order_by(Player.full_name).all()


@router.get("/analytics/player/{player_id}/rolling", response_model=list[RollingWindowOut])
def get_player_rolling_dashboard(
    player_id: int,
    windows: list[int] = Query(default=[5, 10, 15]),
    db: Session = Depends(get_db),
):
    try:
        return rolling_player_dashboard(db, player_id, windows)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/analytics/hot", response_model=list[HotPlayerOut])
def get_hot_players(
    window: int = Query(default=10, ge=3, le=25),
    limit: int = Query(default=10, ge=1, le=50),
    direction: str = Query(default="both", pattern="^(both|hot|cold)$"),
    db: Session = Depends(get_db),
):
    return divergence_engine(db, window=window, limit=limit, direction=direction)


@router.get("/analytics/aging-curves")
def get_aging_curves(archetype: str | None = None, db: Session = Depends(get_db)):
    return aging_curve(db, archetype=archetype)


@router.get("/analytics/schedule-difficulty/{team_id}", response_model=ScheduleDifficultyOut)
def get_schedule_difficulty(
    team_id: int,
    games: int = Query(default=10, ge=3, le=20),
    db: Session = Depends(get_db),
):
    try:
        return schedule_difficulty(db, team_id=team_id, games=games)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/analytics/misc/volatility", response_model=list[MiscMetricOut])
def get_volatility(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)):
    return volatility_score(db, limit=limit)


@router.get("/analytics/misc/consistency", response_model=list[MiscMetricOut])
def get_consistency(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)):
    return consistency_index(db, limit=limit)


@router.get("/analytics/misc/trend-momentum", response_model=list[MiscMetricOut])
def get_trend_momentum(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)):
    return trend_momentum(db, limit=limit)


@router.get("/analytics/misc/clutch", response_model=list[MiscMetricOut])
def get_clutch_players(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)):
    return clutch_players(db, limit=limit)
