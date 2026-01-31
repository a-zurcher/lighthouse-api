export type JobStatus = "pending" | "done" | "error" | "rejected";

export type Job = {
  status: JobStatus;
  result?: any;
  error?: string;
};