import lighthouse, { type Flags } from "lighthouse";
import { launch } from "chrome-launcher";
import type { LighthouseResults } from "./types.ts";
import { log } from "node:console";
import { serverLog } from "../logging.ts";

export async function runLighthouse(url: string): Promise<LighthouseResults | null> {
  const chrome = await launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    ],
    chromePath: "/usr/bin/chromium",
    logLevel: "warn"
  });

  const options: Flags = {
    port: chrome.port,
    logLevel: "warn",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  try {
    const runnerResult = await lighthouse(url, options);

    if (runnerResult === undefined) {
      serverLog(`The lighthouse runner returned 'undefined' when trying to analyse url '${url}'`, "ERROR");
      return null;
    }

    const lhr = runnerResult.lhr;

    const results: LighthouseResults = {
      performance: {
        score: lhr.categories.performance.score,
        metrics: {
          fcp: lhr.audits["first-contentful-paint"].score,
          lcp: lhr.audits["largest-contentful-paint"].score,
          cls: lhr.audits["cumulative-layout-shift"].score,
          tbt: lhr.audits["total-blocking-time"].score,
          si: lhr.audits["speed-index"].score,
        },
      },
      accessibility: { score: lhr.categories.accessibility.score },
      best_practices: { score: lhr.categories["best-practices"].score },
      seo: { score: lhr.categories.seo.score },
    };

    log(`results for ${url} - ` + JSON.stringify(results));

    return results;
    
  } finally {
    chrome.kill();
  }
}
