export type JobStatus = "pending" | "done" | "error";

export type Job = {
  status: JobStatus;
  result?: any;
  error?: string;
};