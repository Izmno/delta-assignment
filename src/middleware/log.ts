import { NextFunction } from "express";
import { IncomingMessage, ServerResponse } from "http";

export default class Logger {
  public handle(req: IncomingMessage, res: ServerResponse, next: NextFunction): void {
    const t0 = Date.now();
    const path = req.url;
    const method = req.method;

    res.on("finish", () => {
      const t1 = Date.now();
      console.log(`[${res.statusCode}] ${method} ${path} (${t1 - t0}ms)`);
    });

    next();
  }
}
