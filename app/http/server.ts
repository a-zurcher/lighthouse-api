import { handleRequest } from "./router.ts";
import { serverLog } from "../logging.ts";
import * as http from "node:http";
import { getConfigDisplay } from "../envs.ts";

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
    serverLog({ 
      message: `Server is now listening on http://0.0.0.0:${port} with the following options : ${getConfigDisplay()}`
    });
  });
}
