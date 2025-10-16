from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
scoreboard = []  # [{avg: x, total: y}, ...]

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "scores": scoreboard})

@app.post("/save_score")
async def save_score(request: Request):
    global scoreboard
    data = await request.json()
    avg_time = data.get("avg_time")
    total_time = data.get("total_time")

    if avg_time is not None and total_time is not None:
        scoreboard.insert(0, {"avg": avg_time, "total": total_time})
        scoreboard = scoreboard[:5]

    return JSONResponse(content={"success": True, "scores": scoreboard})
