# lighthouse-api

## Running it

You can either run it with npm directly :

```bash
cd app
npm i
npm run start
```

Or use Docker/podman :

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

When the job is finished, the server will answer with a JSON object containing the results :

```json
{
	"status": "done",
	"result": {
		"performance": {
			"score": 0.57,
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