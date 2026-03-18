export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  badRequest:     (msg: string) => new AppError(400, msg),
  unauthorized:   (msg: string) => new AppError(401, msg),
  forbidden:      (msg: string) => new AppError(403, msg),
  notFound:       (msg: string) => new AppError(404, msg),
  conflict:       (msg: string) => new AppError(409, msg),
  unprocessable:  (msg: string) => new AppError(422, msg),
};