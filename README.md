# Who's Hot Right Now Backend

NBA analytics backend built with FastAPI.

## What it does

- Rolling 5/10/15-game player dashboard
- Hot/cold divergence engine
- Player aging curves by archetype
- Schedule difficulty rater
- Chart-ready analytics:
  - Volatility score
  - Consistency index
  - Trend momentum
  - Clutch score

## Setup

```bash
cd whos-hot-backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

python -m scripts.seed

uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

## API examples

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/players
curl "http://127.0.0.1:8000/analytics/hot?window=10&limit=5"
curl "http://127.0.0.1:8000/analytics/player/1/rolling?windows=5&windows=10&windows=15"
curl "http://127.0.0.1:8000/analytics/aging-curves?archetype=shot_creating_guard"
curl "http://127.0.0.1:8000/analytics/schedule-difficulty/1?games=10"
curl "http://127.0.0.1:8000/analytics/misc/trend-momentum?limit=5"
curl "http://127.0.0.1:8000/analytics/misc/clutch?limit=5"
```

## Hackathon pitch

Who's Hot Right Now turns raw NBA-style game logs into useful player and team insights. It identifies players whose recent form is meaningfully different from their season baseline, compares players against age/archetype expectations, and rates upcoming schedule difficulty using opponent strength, rest, travel, and home/away context.

## Data note

This project ships with seeded demo data so it runs immediately. Later, live ingestion can be added from nba_api, Basketball Reference-compatible CSVs, Kaggle datasets, SportsData.io, or Balldontlie.
# HotHand-Analytics
