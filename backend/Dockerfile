FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/backend

COPY requirements.txt /app/backend/requirements.txt

RUN python -m pip install --upgrade pip \
    && python -m pip install -r /app/backend/requirements.txt

ARG DATASET_URL=https://raw.githubusercontent.com/sadkxx/SkillSync/master/data/fake_job_postings.csv

RUN mkdir -p /app/data \
    && python -c "import os, urllib.request; urllib.request.urlretrieve(os.environ.get('DATASET_URL', '${DATASET_URL}'), '/app/data/fake_job_postings.csv')"

COPY . /app/backend

CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
