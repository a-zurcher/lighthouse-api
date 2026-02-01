export type JobStatus = "pending" | "done" | "error" | "rejected";

export type Job = {
  status: JobStatus;
  result?: any;
  error?: string;
};

export type CreateJobResponse = {
  accepted: boolean;
  message: string;
  jobId: string;
};