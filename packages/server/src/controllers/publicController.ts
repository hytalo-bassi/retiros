import { pegarBd } from "../db/database";
import { EventoService } from "../db/services/evento.service";
import { EventoRepository } from "../db/services/repository/evento.repo";
import { MetaRepository } from "../db/services/repository/meta.repo";
import { RetiroRepository } from "../db/services/repository/retiro.repo";
import { SchemaRepository } from "../db/services/repository/schema.repo";
import { SchemaService } from "../db/services/schema.service";
import { logger } from "../logger";
import { Errors } from "../utils/AppErrors";
import { asyncHandler } from "../utils/asyncHandler";

const eventoRepo = new EventoRepository(pegarBd());
const schemaRepo = new SchemaRepository(pegarBd());
const schemaService = new SchemaService(schemaRepo);
const metaRepo = new MetaRepository(pegarBd());
const retiroRepository = new RetiroRepository(pegarBd(), metaRepo);
const eventoService = new EventoService(eventoRepo, schemaService);

export const pegarEvento = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  let evento;
  if (!slug) {
    evento = await eventoService.pegarPadrao();
    if (!evento) {
      throw Errors.notFound(
        "Nenhum evento padrão ativo com inscrições abertas",
      );
    }
  } else {
    logger.info(
      "TODO: Remover cast explícito quando houver tratamento de body",
    );
    // TODO: Remover cast explícito quando houver tratamento de body
    evento = await eventoService.acharPorSlug(slug as string);
    if (!evento) {
      throw Errors.notFound("Evento não encontrado");
    }
  }

  const campos = await schemaService.pegarCampos(evento.id);
  res.json({
    evento: {
      id: evento.id,
      slug: evento.slug,
      nome: evento.nome,
    },
    campos,
  });
});

export const inscreverSe = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    logger.info("TODO: Falta testar a requisição")
    logger.info(
      "TODO: Remover cast explícito quando houver tratamento de body",
    );
    // TODO: Remover cast explícito quando houver tratamento de body
    const evento = await eventoService.acharPorSlug(slug as string);
    if (!evento) {
      throw Errors.notFound("Evento não encontrado");
    }

    const campos = await schemaService.pegarCampos(evento.id);
    let erro = null;
    campos.forEach((val) => {
        if (val.obrigatorio && !req.body[val.nome]) {
            erro = `Campo ${val.label} é obrigatório`;
            return;
        }
    });

    const resposta = await retiroRepository.inscrever(slug as string, req.body as any)

    if (erro){
        throw Errors.badRequest(erro);
    }

    if (!resposta.ok) {
        switch (resposta.motivo) {
          case 'congregacao_not_found': {
            throw Errors.badRequest("Congregação não encontrada");
          }
          case 'schema_not_found': {
            throw Errors.badRequest("Evento não encontrado");
          }
          case 'server_error': logger.error(resposta.error); throw Errors.internalServerError();
        }
    }

    res
      .status(201)
      .cookie("sessao_jovem", resposta.dados!.codigo, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      })
      .json({
        codigo: resposta.dados!.codigo,
        evento_slug: slug
    });

});