import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../dist/server.js";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await app.handle(req, res);
}
