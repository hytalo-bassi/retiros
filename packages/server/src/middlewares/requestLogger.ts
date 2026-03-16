import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  req.id = randomUUID();

  const requestLogger = logger.child({ 
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  req.log = requestLogger;

  req.log.info("Request recebida");

  res.on("finish", () => {
    req.log.info({ statusCode: res.statusCode }, "Request completa");
  });

  next();
}