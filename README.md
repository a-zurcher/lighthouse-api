# lighthouse-api

![CI status](https://github.com/a-zurcher/lighthouse-api/actions/workflows/main.yml/badge.svg)


lighthouse-api is a lightweight HTTP API for running Google Lighthouse audits asynchronously. Submitted URLs return a job ID immediately, while a background worker runs the analysis and stores job state and results in memory. Results can be fetched later via a dedicated endpoint, keeping the API responsive and simple.

## Running it

You can run it with npm directly, this will start the server on port 8080 :

```bash
cd app
npm i
npm run start
```

Use Docker/podman :

```bash
podman run -d \
    --name lighthouse-api\
    -p 8080:8080 \
    ghcr.io/a-zurcher/lighthouse-api:latest
```

Or use Docker compose, which uses hot reload and builds the image. This is mostly meant to be used for development.

```bash
docker compose up
```

## Usage

Request a URL to be analyzed :

```bash
curl --request POST \
  --url 'http://localhost:8080/run-lighthouse' \
  --header 'Content-Type: application/json' \
  --data '{
	"url": "https://zurcher.digital/en/"
  }'
```

This will immediately return a JSON response like this :

```json
{
	"jobId": "3577aa3c-2364-46ce-b331-a2d59af12698",
	"resultUrl": "/results/3577aa3c-2364-46ce-b331-a2d59af12698"
}
```

The `resultUrl` can then be queried :

```bash
curl --url 'http://localhost:8080/results/3577aa3c-2364-46ce-b331-a2d59af12698'
```

If the analysis job is not finished, the reponse will look like this :

```json
{
  "status": "pending"
}
```

When the job is finished, the server will answer with a JSON object containing the following results :

```json
{
  "status": "done",
  "result": {
    "performance": {
      "score": 0.75,
      "metrics": {
        "fcp": 0,
      	"lcp": 0.01,
      	"cls": 1,
      	"tbt": 1,
      	"si": 0.18
      }
    },
    "accessibility": {
      "score": 0.95
    },
    "best_practices": {
      "score": 1
    },
    "seo": {
      "score": 0.93
    }
  }
}
```