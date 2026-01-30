export type HttpResponse = {
  status: number;
  headers?: Record<string, string>;
  body?: string;
};
