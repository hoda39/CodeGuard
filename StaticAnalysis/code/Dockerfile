FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
 && rm -rf /var/lib/apt/lists/*

COPY remote-inference-py/requirements.txt .
RUN pip install --no-cache-dir --timeout=100 --prefer-binary -r requirements.txt

COPY remote-inference-py/deploy.py ./deploy.py
COPY remote-inference-py/statement_t5_model.py ./statement_t5_model.py
COPY remote-inference-py/inference-common/ ./inference-common/
COPY resources/local-inference/models/ ./models/

# Copy the analyzer script
COPY analyze.py ./analyze.py

# Make the script executable
RUN chmod +x analyze.py

# Change CMD to run the analyzer script
ENTRYPOINT ["python", "analyze.py"]
