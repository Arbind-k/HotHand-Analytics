from datetime import date
from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    abbreviation: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    strength_rating: Mapped[float] = mapped_column(Float, default=0.0)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    players = relationship("Player", back_populates="team")


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String, index=True)
    age: Mapped[int] = mapped_column(Integer)
    position: Mapped[str] = mapped_column(String)
    archetype: Mapped[str] = mapped_column(String, index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))

    team = relationship("Team", back_populates="players")
    game_logs = relationship("GameLog", back_populates="player")


class GameLog(Base):
    __tablename__ = "game_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    opponent_id: Mapped[int] = mapped_column(ForeignKey("teams.id"))
    game_date: Mapped[date] = mapped_column(Date, index=True)
    is_home: Mapped[bool] = mapped_column(Boolean, default=True)
    minutes: Mapped[float] = mapped_column(Float)
    points: Mapped[int] = mapped_column(Integer)
    rebounds: Mapped[int] = mapped_column(Integer)
    assists: Mapped[int] = mapped_column(Integer)
    steals: Mapped[int] = mapped_column(Integer, default=0)
    blocks: Mapped[int] = mapped_column(Integer, default=0)
    turnovers: Mapped[int] = mapped_column(Integer, default=0)
    fga: Mapped[int] = mapped_column(Integer)
    fta: Mapped[int] = mapped_column(Integer)
    plus_minus: Mapped[int] = mapped_column(Integer, default=0)
    clutch_points: Mapped[int] = mapped_column(Integer, default=0)

    player = relationship("Player", back_populates="game_logs")


class TeamSchedule(Base):
    __tablename__ = "team_schedule"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), index=True)
    opponent_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), index=True)
    game_date: Mapped[date] = mapped_column(Date, index=True)
    is_home: Mapped[bool] = mapped_column(Boolean, default=True)
