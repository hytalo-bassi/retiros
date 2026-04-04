import { createContainer, asClass, InjectionMode, asFunction } from "awilix";
import { MetaService } from "./db/services/meta.service";
import { MetaRepository } from "./db/services/repository/meta.repo";
import { pegarBd } from "./db/database";
import { EventoRepository } from "./db/services/repository/evento.repo";
import { SchemaRepository } from "./db/services/repository/schema.repo";
import { SchemaService } from "./db/services/schema.service";
import { EventoService } from "./db/services/evento.service";
import { RetiroRepository } from "./db/services/repository/retiro.repo";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  bd: asFunction(pegarBd).singleton(),
  eventoRepo: asClass(EventoRepository).singleton(),
  schemaRepo: asClass(SchemaRepository).singleton(),
  retiroRepository: asClass(RetiroRepository).singleton(),
  schemaService: asClass(SchemaService).singleton(),
  eventoService: asClass(EventoService).singleton(),
  metaRepo: asClass(MetaRepository).singleton(),
  metaService: asClass(MetaService).singleton(),
});

export default container;
