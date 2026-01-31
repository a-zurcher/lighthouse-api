import type { IncomingMessage } from "node:http";
import { createJob, getJob } from "../jobs/manager.ts";
import type { HttpResponse } from "./types.ts";
import { serverLog } from "../logging.ts";
import { jobIsRunning } from "../jobs/store.ts";

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
    if (jobIsRunning) return {
      status: 503, // service unavailable
      body: JSON.stringify({
        error: "A job is currently running, try again later"
      })
    }

    const body = await readJson(req);

    if (!body?.url) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Missing url" }),
      };
    }

    const jobId = createJob(body.url);

    serverLog({ message: `Created job ${jobId} to analyze url "${body.url}"` });

    return {
      status: 202,
      body: JSON.stringify({
        jobId,
        resultUrl: `/results/${jobId}`,
      }),
    };
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

    return {
      status: 200,
      body: JSON.stringify(job),
    };
  }

  return { status: 404, body: "Not found" };
}
