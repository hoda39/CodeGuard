FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout=100 --prefer-binary -r requirements.txt


COPY deploy.py ./deploy.py
COPY statement_t5_model.py ./statement_t5_model.py
COPY models/ ./models/
COPY inference-common/ ./inference-common/

CMD ["uvicorn", "deploy:app", "--host", "0.0.0.0", "--port", "8000"]
