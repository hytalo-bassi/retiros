import clienteApi from '../cliente';
import type { CriarEventoPayload, Evento } from '../../types/eventos';

export async function getEventos(): Promise<Evento[]> {
  const response = await clienteApi.get('/admin/eventos');
  return response.data.eventos;
}

export async function adicionarEvento(payload: CriarEventoPayload): Promise<Evento> {
  const response = await clienteApi.post('/admin/eventos', payload);
  if (!response.data || !response.data.evento) {
    if (response.status === 409) {
        throw new Error('O slug do evento já existe. Por favor, escolha um slug diferente.');
    }
    throw new Error('Erro ao adicionar evento.');
  }
  
  return response.data.evento;
}