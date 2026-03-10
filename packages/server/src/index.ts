import { iniciarBd } from "./db/database";
import { health } from "./health";
import { logger } from "./logger";

iniciarBd()
    .then(() => health.setBd('healthy'))
    .catch((err) => health.setBd('error', err));

health.quandoSaudavel(() => {
    logger.info('Sistema saudável');
});

health.quandoDegradado(() => {
    logger.error('Sistema degradado. Parando sistema...');
    process.exit(1);
})

process.on('exit', () => {
  console.log('Sistema encerrado em ', new Date().toISOString());
});