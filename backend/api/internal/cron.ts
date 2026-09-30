import type { IncomingMessage, ServerResponse } from "node:http";
import { connectDatabase } from "../../dist/config/database.js";
import { expireAssignments, processDispatchQueue } from "../../dist/services/dispatch-manager.service.js";
import { detectStuckOrders } from "../../dist/services/ops-31-47.service.js";
import { autoCloseExpiredCaptainAttendance } from "../../dist/services/requirements-11-29-runtime.service.js";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const authorization = String(req.headers.authorization ?? "");
  const expected = process.env.CRON_SECRET;

  if (!expected || authorization !== `Bearer ${expected}`) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, message: "Unauthorized" }));
    return;
  }

  try {
    await connectDatabase();

    const assignments = await expireAssignments();
    const queue = await processDispatchQueue();
    const attendance = await autoCloseExpiredCaptainAttendance();
    const stuck = await detectStuckOrders();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      success: true,
      jobs: {
        assignments,
        queue,
        attendance,
        stuck,
      },
    }));
  } catch (error) {
    console.error("Vercel cron error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ success: false, message: "Cron execution failed." }));
  }
}
