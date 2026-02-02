import type { LighthouseResults } from "../lighthouse/types.ts";

export type JobStatus = "pending" | "done" | "error";

export type Job = 
  { status: "pending" } |
  { status: "done", result: LighthouseResults } |
  { status: "error", error: string };

export type CreateJobResponse = {
  accepted: boolean;
  message: string;
  jobId: string;
};