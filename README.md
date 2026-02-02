# Lighthouse API

![CI status](https://github.com/a-zurcher/lighthouse-api/actions/workflows/main.yml/badge.svg)


Lighthouse API is a lightweight HTTP API for running [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) audits asynchronously.

Submitted URLs return a job ID immediately, while a background worker runs the analysis and stores job state and results in memory. Results can be fetched later via a dedicated endpoint, keeping the API responsive and simple.

The following endpoints are available :

| Method | Endpoint                                  | Description                                                            |
| ------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| POST   | [`/run-lighthouse`](#post-run-lighthouse) | Submit a URL to run Lighthouse analysis. Returns a job ID immediately. |
| GET    | [`/results/[jobId]`](#get-resultsjobid)   | Query the status of a job or fetch results once complete.              |

All methods return JSON.

## Running

### Using npm

Ensure you are using [Node.js v22.18.0](https://nodejs.org/en/learn/typescript/run-natively) or later, as the project runs TypeScript natively without a transpilation step.

Start the server on port 8080:

```bash
cd app
npm install
npm run start
```

### Using Docker / podman

Production

```bash
podman run -d \
  --name lighthouse-api \
  -p 8080:8080 \
  ghcr.io/a-zurcher/lighthouse-api:latest

```

Development (hot-reload with dev dependencies)

```bash
podman run \
  --name lighthouse-api \
  -p 8080:8080 \
  -e NODE_ENV=development \
  -v "$(pwd)/app:/app:Z" \
  --rm \
  ghcr.io/a-zurcher/lighthouse-api:latest \
  sh -c "npm ci && npm run dev" # install devDependencies
```


## Settings via environmental variables

You can configure the API behavior by setting the following environmental variables :

- `MAX_JOBS` (integer, defaults to `1`) - maximum number of concurrent jobs the API will process

## Usage – Endpoints

### POST `/run-lighthouse`

Submit a URL to analyze:

```bash
curl --request POST \
  --url 'http://localhost:8080/run-lighthouse' \
  --header 'Content-Type: application/json' \
  --data '{
    "url": "https://zurcher.digital/en/"
  }'
```

**Responses:**

- **`202 Accepted`** - The job was accepted and will be executed asynchronously:

  ```json
  {
    "jobId": "3577aa3c-2364-46ce-b331-a2d59af12698",
    "resultEndpoint": "/results/3577aa3c-2364-46ce-b331-a2d59af12698"
  }
  ```

> The `resultEndpoint` can be queried using the [GET `/results/[jobId]`](#get-resultsjobid) endpoint to track the job status or fetch results.

- **`503 Service Unavailable`** - The maximum number of concurrent jobs has been reached:

  ```json
  {
    "error": "Job request rejected – 1 job(s) out of the maximum allowed 1 job(s) are currently running."
  }
  ```

---

### GET `/results/[jobId]`

Query the status of a specific job by its ID:

```bash
curl --url 'http://localhost:8080/results/3577aa3c-2364-46ce-b331-a2d59af12698'
```

**Responses:**

- **`202 Accepted`** - The job is still processing:

  ```json
  {
    "status": "pending"
  }
  ```

- **`200 OK`** - The job has completed; results are included:

  ```json
  {
    "status": "done",
    "result": {
      "performance": {
        "score": 0.79,
        "metrics": {
          "fcp": 0.95,
          "lcp": 0.2,
          "cls": 1,
          "tbt": 0.97,
          "si": 1
        }
      },
      "accessibility": {
        "score": 0.92
      },
      "best_practices": {
        "score": 1
      },
      "seo": {
        "score": 1
      }
    }
  }
  ```

- **`500 Internal Server Error`** - An error occurred during processing:

  ```json
  {
    "status": "error",
    "error": "Error message explaining what happened"
  }
  ```