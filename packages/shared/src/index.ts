export type TiposCampo = 'string' | 'number' | 'boolean' | 'date' | 'email';

export interface Campo {
    nome: string;
    label: string;
    tipo: TiposCampo;
    obrigatorio: boolean;
    ordem: number;
}