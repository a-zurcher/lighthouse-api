export type LighthouseResults = {
  performance: {
    score: number | null;
    metrics: {
      fcp: number | null
      lcp: number | null
      cls: number | null
      tbt: number | null
      si: number | null
    };
  };
  accessibility: {
    score: number | null
  },
  best_practices: {
    score: number | null
  },
  seo: {
    score: number | null
  }
};
