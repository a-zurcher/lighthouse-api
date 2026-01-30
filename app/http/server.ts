import { handleRequest } from "./router.ts";
import { serverLog } from "../logging.ts";
import * as http from "node:http";

export function startServer(port = 8000) {
  const server = http.createServer(async (req, res) => {
    try {
      const response = await handleRequest(req);

      res.writeHead(response.status, {
        ...response.headers,
      });

      res.end(response.body ?? "");
    } catch (err) {
      serverLog({ message: err, level: "ERROR" });
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });

  server.listen(port, () => {
    serverLog({ message: `🚀 Lighthouse API listening on http://localhost:${port}` });
  });
}
