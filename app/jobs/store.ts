import type { Job } from "./types.ts";

export const jobs = new Map<string, Job>();

export let jobsRunning: number = 0;

export function increaseJobCount(): void {
    jobsRunning++;
}

export function decreaseJobCount(): void {
    jobsRunning--;
}