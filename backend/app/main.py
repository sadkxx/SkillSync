from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="SkillSync API")

app.include_router(router)