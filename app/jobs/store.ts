import type { Job } from "./types.ts";

export const jobs = new Map<string, Job>();

export let jobIsRunning: boolean = false;

export function setJobIsRunning(value: boolean): void {
    jobIsRunning = value;
}