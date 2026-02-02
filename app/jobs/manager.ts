import { randomUUID } from "node:crypto";
import { jobs, jobsRunning, decreaseJobCount, increaseJobCount } from "./store.ts";
import { runLighthouse } from "../lighthouse/runner.ts";
import { type CreateJobResponse } from "./types.ts";
import { MAX_JOBS } from "../envs.ts";

export function createJob(url: string): CreateJobResponse {
  const jobId = randomUUID();

  if (jobsRunning >= MAX_JOBS) {
    return {
      accepted: false,
      message: `Job adding request rejected - ${jobsRunning} job(s) out of the maximum allowed ${MAX_JOBS} job(s) are running.`,
      jobId
    };
  }  
  
  jobs.set(jobId, { status: "pending" });

  // run asynchronously, detached from request lifecycle
  (async () => {
    try {
      const result = await runLighthouse({ url, job: jobId });
      jobs.set(jobId, { status: "done", result });
    } catch (err) {
      jobs.set(jobId, {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      decreaseJobCount();
    }
  })();

  increaseJobCount();
  return {
      accepted: true,
      message: `Added new job successfully - ${jobs} job(s) out of the maximum ${MAX_JOBS} job(s) are running.`,
      jobId
  };
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}
