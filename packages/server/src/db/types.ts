import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

/**
 * Representa uma congregação no sistema.
 * Tabela: `_meta.congregacoes`
 */
export interface CongregacoesTable {
  id: Generated<number>;
  nome: string;
}

/**
 * Representa um usuário administrador do sistema.
 * Tabela: `_meta.usuarios_admin`
 */
export interface UsuariosAdminTable {
  id: Generated<number>;
  nome: string;
  login: string;
  senha_hash: string;
  funcao: string;                   // 'lider', 'tesoureiro', 'admin'
  ativo: Generated<boolean>;
  senha_inicial: Generated<boolean>;
  criado_em: Generated<Date>;
  congregacao_id: number | null;
  criado_por: number | null;
}

/**
 * Representa um evento (retiro) gerenciado pelo sistema.
 * Tabela: `_meta.eventos`
 */
export interface EventosTable {
  id: Generated<number>;
  slug: string;                           // retiro_AAAA
  nome: string;
  ativo: Generated<boolean>;
  padrao: Generated<boolean>;
  inscricoes_abertas: Generated<boolean>;
  inscricoes_abertas_de: Date | null;
  inscricoes_abertas_ate: Date | null;
  criado_em: Generated<Date>;
  criado_por: number | null;
}

/**
 * Define o schema dinâmico de colunas de um evento (formulário de inscrição).
 * Cada registro representa um campo configurável do formulário.
 * Tabela: `_meta.colunas_schema`
 */
export interface ColunasSchemaTable {
  id: Generated<number>;
  evento_id: number;
  nome: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  visibilidade: string;
  visivel_para: string[] | null;
  ordem: number;
}

/**
 * Registro de auditoria das ações realizadas no sistema.
 * Tabela: `_meta.audit_log`
 */
export interface AuditLogTable {
  id: Generated<number>;
  evento_slug: string | null;
  usuario_id: number | null;
  acao: string;
  entidade: string | null;
  entidade_id: string | null;
  payload: unknown | null;
  ip: string | null;
  criado_em: Generated<Date>;
}

/**
 * Representa uma sessão autenticada de um jovem inscrito.
 * Tabela: `_sistema.sessoes_jovens`
 */
export interface SessoesJovensTable {
  id: Generated<number>;
  evento_slug: string;
  token: string;
  expira_em: Date;
  criado_em: Generated<Date>;
  inscricao_codigo: string; // UUID
}

/**
 * Representa um documento enviado por um inscrito ou líder.
 * Tabela: `_sistema.documentos`
 */
export interface DocumentosTable {
  id: Generated<number>;
  nome: string;
  caminho: string;
  enviado_por: string;
  evento_slug: string;
  inscricao_codigo: string; // UUID
  lider_id: number | null;
  enviado_em: Generated<Date>;
}

/**
 * Mapa central do banco de dados utilizado pelo Kysely.
 * Cada chave corresponde ao nome completo da tabela (schema.tabela),
 * e o valor é a interface que descreve sua estrutura.
 */
export interface Database {
  '_meta.congregacoes': CongregacoesTable;
  '_meta.usuarios_admin': UsuariosAdminTable;
  '_meta.eventos': EventosTable;
  '_meta.colunas_schema': ColunasSchemaTable;
  '_meta.audit_log': AuditLogTable;
  '_sistema.sessoes_jovens': SessoesJovensTable;
  '_sistema.documentos': DocumentosTable;
}

// Congregações
/** Tipo de leitura: registro retornado por SELECT. */
export type Congregacao    = Selectable<CongregacoesTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewCongregacao = Insertable<CongregacoesTable>;

// Usuários administradores
/** Tipo de leitura: registro retornado por SELECT. */
export type UsuarioAdmin    = Selectable<UsuariosAdminTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewUsuarioAdmin = Insertable<UsuariosAdminTable>;
/** Tipo de atualização: payload parcial para UPDATE. */
export type UsuarioAdminUpdate = Updateable<UsuariosAdminTable>;

// Eventos
/** Tipo de leitura: registro retornado por SELECT. */
export type Evento    = Selectable<EventosTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewEvento = Insertable<EventosTable>;

// Audit log
/** Tipo de leitura: registro retornado por SELECT. */
export type AuditLog    = Selectable<AuditLogTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewAuditLog = Insertable<AuditLogTable>;

// Sessões de jovens
/** Tipo de leitura: registro retornado por SELECT. */
export type SessaoJovem    = Selectable<SessoesJovensTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewSessaoJovem = Insertable<SessoesJovensTable>;

// Documentos
/** Tipo de leitura: registro retornado por SELECT. */
export type Documento    = Selectable<DocumentosTable>;
/** Tipo de escrita: payload para INSERT. */
export type NewDocumento = Insertable<DocumentosTable>;