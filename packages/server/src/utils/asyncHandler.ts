import { NextFunction, Request, Response } from "express";

/**
 * Utilitário para lidar com erros em funções assíncronas de rotas Express sem precisar de blocos `try/catch` explícitos.
 *
 * Envolve a função assíncrona e encaminha quaisquer erros para o middleware de tratamento de erros do Express.
 * 
 * @example
 * ```ts
 * router.get("/admin/eventos", asyncHandler(async (req, res) => {
 *   const eventos = await eventoService.pegarEventos();
 *   res.status(200).json({ eventos });
 * }));
 *
 * // Se `eventoService.pegarEventos()` lançar um erro, ele será capturado e passado para o middleware de erros.
 * ```
 * 
 * @param fn - Função assíncrona que recebe `Request` e `Response` e retorna uma `Promise<void>`. Esta função será executada e seus erros serão capturados automaticamente.
 * 
 * @returns Retorna um middleware Express que recebe `Request`, `Response` e `NextFunction`. O middleware executa a função passada e encadeia qualquer erro para o próximo middleware de tratamento de erros através da função `next`.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);