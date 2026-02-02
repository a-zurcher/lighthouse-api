import { serverLog } from "./logging.ts";

export const MAX_JOBS: number = parseInt(process.env.MAX_JOBS) || 1;

export function getConfigDisplay(): string {
    const envVars = [`MAX_JOBS=${MAX_JOBS}`];

    return envVars.join(", ");
}