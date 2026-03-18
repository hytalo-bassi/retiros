import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppErrors';
import { logger } from '../logger';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.error(err);
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method, requestId: req.id }, err.message);
    } else {
      logger.warn({ path: req.path, requestId: req.id }, err.message);
    }

    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(err.statusCode >= 500 ? { requestId: req.id } : {}),
    });
  }

  logger.error(
    { err, path: req.path, method: req.method, requestId: req.id },
    'Erro desconhecido'
  );

  return res.status(500).json({
    error: 'Erro interno do servidor',
    requestId: req.id,
  });
}