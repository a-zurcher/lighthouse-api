import { randomUUID } from "node:crypto";
import { jobs, setJobIsRunning } from "./store.ts";
import { runLighthouse } from "../lighthouse/runner.ts";

export function createJob(url: string): string {
  const jobId = randomUUID();
  
  setJobIsRunning(true);

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
      setJobIsRunning(false);
    }
  })();

  return jobId;
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}
