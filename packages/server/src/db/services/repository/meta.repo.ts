import { Kysely } from "kysely";
import { Database } from "../../types";
import type { Funcoes } from "@app/shared";
import { hashSenha } from "../../../utils/hashSenha";

export class MetaRepository {
  constructor(private db: Kysely<Database>) {}

  async listarCongregacoes() {
    return this.db.selectFrom("_meta.congregacoes").selectAll().execute();
  }

  async criarCongregacao(nome: string) {
    return this.db.insertInto("_meta.congregacoes").values({ nome }).execute();
  }

  async atualizarCongregacao(id: number, novo_nome: string) {
    return this.db
      .updateTable("_meta.congregacoes")
      .set({ nome: novo_nome })
      .where("id", "=", id)
      .execute();
  }

  async pegarIdCongregacao(nome: string) {
    const result = await this.db
      .selectFrom("_meta.congregacoes")
      .select("id")
      .where("nome", "=", nome)
      .executeTakeFirst();

    if (!result) {
      throw new Error("Congregação não encontrada");
    }
    return result.id;
  }

  async deletarCongregacao(id: number) {
    await this.db
      .deleteFrom("_meta.congregacoes")
      .where("id", "=", id)
      .execute();
  }

  //funcao assincrona para criarUsuarioAdm, deve receber um nome de usuario, uma senha, um email, um login que serve como identificador publico, criadoPor e idCongregacao, e deve inserir um novo registro na tabela _meta.usuarios_admin com esses dados, retornando o id do novo usuario criado, a senha deve ser armazenada de forma segura, utilizando bcrypt para hash e salt
  async criarUsuarioAdm(
    nome_usuario: string,
    senha: string,
    funcao: Funcoes,
    login: string,
    criadoPor?: number,
    idCongregacao?: number
  ) {
    const bcrypt = await hashSenha(senha);
    const [id] = await this.db
      .insertInto("_meta.usuarios_admin")
      .values({
        nome: nome_usuario,
        senha_hash: bcrypt,
        login,
        senha_inicial: true,
        funcao,
        criado_por: criadoPor,
        congregacao_id: idCongregacao,
      })
      .returning("id")
      .execute();

    return id;
  }

  // função async que troca a senha de um usuario admin, deve receber o id do usuario e a nova senha, atualizar o registro na tabela _meta.usuarios_admin com a nova senha, criptografando a senha, trocando senha_inicial para false, e retornando true se a atualização foi bem sucedida ou false se o usuario não foi encontrado
  async trocarSenhaUsuarioAdm(
    id: number,
    novaSenha: string
  ): Promise<boolean> {
    const bcrypt = await hashSenha(novaSenha);
    const result = await this.db
      .updateTable("_meta.usuarios_admin")
      .set({ senha_hash: bcrypt, senha_inicial: false })
      .where("id", "=", id)
      .execute();

    return result.length > 0;
  }
  
  // funcao async que recebe id de usuario admin, senha e confere se o hash da senha bate com a senha armazenada no banco de dados, retornando true se a senha estiver correta e false caso contrário
  async verificarSenhaUsuarioAdm(id: number, senha: string): Promise<boolean> {
    const usuario = await this.db
      .selectFrom("_meta.usuarios_admin")
      .select("senha_hash")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    
    return usuario?.senha_hash === await hashSenha(senha) || false;
  }
}
