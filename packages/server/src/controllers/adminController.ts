import { pegarBd } from "../db/database";
import { EventoService } from "../db/services/evento.service";
import { EventoRepository } from "../db/services/repository/evento.repo";
import { SchemaRepository } from "../db/services/repository/schema.repo";
import { SchemaService } from "../db/services/schema.service";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Errors } from "../utils/AppErrors";

const eventoRepo = new EventoRepository(pegarBd());
const schemaRepo = new SchemaRepository(pegarBd());
const schemaService = new SchemaService(schemaRepo);
const eventoService = new EventoService(eventoRepo, schemaService);

/**
 * Lista todos os eventos cadastrados no sistema.
 *
 * @route  `GET /admin/eventos`
 * @access Admin
 *
 * @example
 * ```
 * GET /admin/eventos
 *
 * 200 OK
 * {
 *   "eventos": [
 *     { "id": 1, "slug": "retiro-2025", "nome": "Retiro de Jovens 2025", "padrao": true },
 *     { "id": 2, "slug": "retiro-2024", "nome": "Retiro de Jovens 2024", "padrao": false }
 *   ]
 * }
 * ```
 *
 * @example
 * ```
 * 500 Internal Server Error
 * { "error": "Erro ao listar eventos", "requestId": "abc-123" }
 * ```
 */
export const listarEventos = asyncHandler(async (req, res) => {
  const eventos = await eventoService.pegarEventos();
  res.status(200).json({ eventos });
});


/**
 * Cria um novo evento e provisiona toda a sua infraestrutura no banco de dados.
 *
 * Internamente orquestra a criação do registro em `_meta.eventos`, do schema
 * PostgreSQL isolado, das tabelas `equipes`, `inscricoes` e `pagamentos`, e
 * dos campos dinâmicos em `_meta.colunas_schema`.
 *
 * @route  `POST /admin/eventos`
 * @access Admin
 *
 * @example
 * ```
 * POST /admin/eventos
 * Content-Type: application/json
 *
 * {
 *   "slug": "retiro-2025",
 *   "nome": "Retiro de Jovens 2025",
 *   "criado_por": 1,
 *   "padrao": true,
 *   "inscricoes_abertas_de": "2025-01-01T00:00:00.000Z",
 *   "inscricoes_abertas_ate": "2025-03-01T00:00:00.000Z",
 *   "colunas": [
 *     {
 *       "nome": "tamanho_camiseta",
 *       "label": "tamanho_camiseta",
 *       "tipo": "string",
 *       "obrigatorio": true,
 *       "ordem": 0,
 *       "visibilidade": "public",
 *       "visivel_para": []
 *     },
 *     {
 *       "nome": "valor_pago",
 *       "label": "valor_pago",
 *       "tipo": "number",
 *       "obrigatorio": false,
 *       "ordem": 1,
 *       "visibilidade": "restricted",
 *       "visivel_para": ["admin", "tesoureiro"]
 *     }
 *   ]
 * }
 *
 * 201 Created
 * {
 *   "evento": { "id": 1, "slug": "retiro-2025", "nome": "Retiro de Jovens 2025", ... }
 * }
 * ```
 * @example
 * ```
 *  409 Conflict
 * { "error": "Slug já existe" }
 * ```
 * @example
 * ```
 * 500 Internal Server Error
 * { "error": "Erro ao criar evento", "requestId": "abc-123" }
 * ```
 *
 */
export const criarEvento = asyncHandler(async (req, res) => {
  const { slug, nome, criado_por, padrao, colunas,
          inscricoes_abertas_de, inscricoes_abertas_ate } = req.body;

  const slugExiste = await eventoService.slugExiste(slug);
  if (slugExiste) throw Errors.conflict('Slug já existe');

  const evento = await eventoService.criar(
    slug, nome, criado_por, padrao, colunas,
    inscricoes_abertas_de, inscricoes_abertas_ate
  );

  res.status(201).json({ evento });
});
