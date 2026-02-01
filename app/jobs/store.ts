import type { Job } from "./types.ts";

export const jobs = new Map<string, Job>();

export const MAX_JOBS: number = parseInt(process.env.MAX_JOBS) || 1;
export let jobsRunning: number = 0;

export function increaseJobCount(): void {
    jobsRunning++;
}

export function decreaseJobCount(): void {
    jobsRunning--;
}