import { error, log, warn } from "node:console";

export function serverLog(message: string | unknown, level: "INFO" | "WARNING" | "ERROR" = "INFO") {
    const timestamp = new Date().toISOString();
    const displayMessage = `${timestamp} | ${level} | ${message}`;

    switch (level) {
        case "INFO": log(displayMessage)
        break;
    
        case "WARNING": warn(displayMessage);
        break;

        case "ERROR": error(displayMessage);
        break;
    }
}