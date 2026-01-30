import { error, log, warn } from "node:console";

export function serverLog(
    options: {
        message: string | unknown,
        level?: "INFO" | "WARNING" | "ERROR",
        job?: string
    }
) {
    const { message, level = "INFO", job } = options;

    const timestamp = new Date().toISOString();

    // Pad the level to 7 characters (the longest is "WARNING")
    let displayMessage = `${timestamp} | ${level.padEnd(7, " ")}`;
    if (job) displayMessage += ` | Job ${job}`;
    if (!job) displayMessage += " | Manager process"
    displayMessage += ` | ${message}`;

    switch (level) {
        case "INFO":
            log(displayMessage);
            break;

        case "WARNING":
            warn(displayMessage);
            break;

        case "ERROR":
            error(displayMessage);
            break;
    }
}
