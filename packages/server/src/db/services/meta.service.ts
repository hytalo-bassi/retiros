import { Funcoes } from "@app/shared";
import { MetaRepository } from "./repository/meta.repo";

export class MetaService {
  private metaRepository: MetaRepository
  constructor({ metaRepo }: { metaRepo: MetaRepository }) {
    this.metaRepository = metaRepo;
  }

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

  // método para criar usuário admin, recebe nome da congregacao ou null, recebe senha, funcao, login, nome e delega para o repositório sql
  async criarUsuarioAdm(
    nome: string,
    senha: string,
    funcao: Funcoes,
    login: string,
    nome_congregacao?: string
  ) {
    let id_congregacao: number | undefined = undefined;
    if (nome_congregacao) {
      id_congregacao = await this.metaRepository.pegarIdCongregacao(nome_congregacao);
    }

    return this.metaRepository.criarUsuarioAdm(nome, senha, funcao, login, undefined, id_congregacao);
  }
}