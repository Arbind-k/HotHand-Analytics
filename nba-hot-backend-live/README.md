# HotHand Analytics - Live NBA Backend

FastAPI backend using `nba_api` for live/current NBA stats.

## Run

```bash
cd nba-hot-backend-live
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Open:

```txt
http://127.0.0.1:8000/docs
```

## Frontend endpoints

- `GET /api/dashboard`
- `GET /api/hot-players`
- `GET /api/players`
- `GET /api/players/{player_id}`
- `GET /api/players/{player_id}/rolling`
- `GET /api/aging-curves`
- `GET /api/schedule-difficulty`
- `GET /api/misc-analytics`

## Notes

This is Option B: live NBA API mode. If NBA.com blocks or rate-limits requests, endpoints may return a 502. The backend caches responses for 10 minutes to reduce API calls.
