import lighthouse, { type Flags } from "lighthouse";
import { launch } from "chrome-launcher";
import type { LighthouseResults } from "./types.ts";
import { serverLog } from "../logging.ts";

export async function runLighthouse(options: { url: string, job: string }): Promise<LighthouseResults | null> {
  const { url, job } = options;

  const chrome = await launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    ],
    chromePath: "/usr/bin/chromium",
    logLevel: "warn"
  });

  const lighthouseOptions: Flags = {
    port: chrome.port,
    logLevel: "warn",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  try {
    const runnerResult = await lighthouse(url, lighthouseOptions);

    if (runnerResult === undefined) {
      serverLog({
        message: `The lighthouse runner returned 'undefined' when trying to analyse url '${url}'`,
        level: "ERROR", job
      });

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

    serverLog({ message: `results for ${url} - ` + JSON.stringify(results), job });

    return results;
    
  } finally {
    chrome.kill();
  }
}
