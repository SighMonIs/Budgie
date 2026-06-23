# Budgie 🐦

A personal budget tracker that sets aside money each payday for bills, subscriptions, and savings goals.

## Running with Docker

The easiest way to run Budgie is with Docker Compose. Create a `docker-compose.yml` file anywhere on your machine:

```yaml
services:
  budgie:
    image: ghcr.io/sighmonis/budgie:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

Your data is stored in a `./data` folder next to the compose file and persists across restarts and updates.

## Updating

```bash
docker compose pull && docker compose up -d
```

## Building from source

```bash
git clone https://github.com/SighMonIs/Budgie.git
cd Budgie/app
docker build -t budgie .
```
