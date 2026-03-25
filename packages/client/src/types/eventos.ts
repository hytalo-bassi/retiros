export interface Evento {
  id: number;
  slug: string;
  nome: string;
  ativo: boolean;
  padrao: boolean;
  inscricoes_abertas: boolean;
  inscricoes_abertas_de: string | null;
  inscricoes_abertas_ate: string | null;
  criado_em: string;
  criado_por: number | null;
}

export interface EventosResponse { eventos: Evento[] }

export interface CampoPersonalizado {
  nome: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  visibilidade: 'public' | 'restricted' | 'private';
  visivel_para: string[];
}

export interface CriarEventoPayload {
  slug: string;
  nome: string;
  criado_por: number;
  padrao: boolean;
  colunas: CampoPersonalizado[];
  inscricoes_abertas_de: string;
  inscricoes_abertas_ate: string;
}