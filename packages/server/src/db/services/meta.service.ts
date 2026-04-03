import { MetaRepository } from "./repository/meta.repo";

export class MetaService {
  constructor(private metaRepository: MetaRepository) {}

  async listarCongregacoes() {
    return this.metaRepository.listarCongregacoes();
  }

  async criarCongregacao(nome: string) {
    return this.metaRepository.criarCongregacao(nome);
  }

  async atualizarCongregacao(nome: string, novo_nome: string) {
    const id = await this.metaRepository.pegarIdCongregacao(nome);
    return this.metaRepository.atualizarCongregacao(id, novo_nome);
  }

  async pegarIdCongregacao(nome: string) {
    return this.metaRepository.pegarIdCongregacao(nome);
  }

  async deletarCongregacao(nome: string) {
    const id = await this.metaRepository.pegarIdCongregacao(nome);
    return this.metaRepository.deletarCongregacao(id);
  }
}