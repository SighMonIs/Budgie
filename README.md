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

## How it works

Budgie assumes you're paid fortnightly. Every bill is converted to an amount per fortnight, so you can see what to set aside each payday and what's left over. Click a row to edit it, or the pay amount and next payday at the top to change them in place.

Savings goals are credited automatically each payday, and **next payday rolls forward by itself**. Dates follow the container's timezone, so if paydays tick over at the wrong time add `TZ=Your/Timezone` (e.g. `Australia/Sydney`) under `environment:` in the compose file.

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
