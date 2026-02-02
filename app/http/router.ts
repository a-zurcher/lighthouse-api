import type { IncomingMessage } from "node:http";
import { createJob, getJob } from "../jobs/manager.ts";
import type { HttpResponse } from "./types.ts";
import { serverLog } from "../logging.ts";

async function readJson(req: IncomingMessage): Promise<any> {
  let data = "";

  for await (const chunk of req) data += chunk;

  return data ? JSON.parse(data) : null;
}


export async function handleRequest(req: IncomingMessage): Promise<HttpResponse> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  serverLog({ message: `${req.method} ${req.url}` });

  // POST /run-lighthouse
  if (req.method === "POST" && url.pathname === "/run-lighthouse") {
    // payload validation
    const body = await readJson(req);
    if (!body?.url) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Missing url" }),
      };
    }

    // tries to create job
    const createJobResponse = createJob(body.url);

    // manages response if job was accepted or not
    if (createJobResponse.accepted) {
      serverLog({ message: `Created job ${createJobResponse.jobId} to analyze url "${body.url}"` });
    
      return {
        status: 202,
        body: JSON.stringify({
          jobId: createJobResponse.jobId,
          resultEndpoint: `/results/${createJobResponse.jobId}`,
        }),
      };
    } else {
      serverLog({ message: `Rejecting request to analyze "${body.url}" - ${createJobResponse.message}` });

      return {
        status: 503, // service unavailable
        body: JSON.stringify({
          error: createJobResponse.message
        })
      };
    }
  }

  // GET /results/:jobId
  if (req.method === "GET" && url.pathname.startsWith("/results/")) {
    const jobId = url.pathname.split("/")[2];
    const job = getJob(jobId);

    if (!job) {
      return {
        status: 404,
        body: JSON.stringify({ error: "Job not found" }),
      };
    }

    let httpCode: number;

    switch (job.status) {
      case "done": httpCode = 200; break;
      case "error": httpCode = 500; break;
      case "pending": httpCode = 202; break;
    };

    return {
      status: httpCode,
      body: JSON.stringify(job)
    }
  }

  return { status: 404, body: "Not found" };
}
