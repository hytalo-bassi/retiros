// escreva uma funcao simples que recebe uma senha e cria um hash com bcrypt e salting e retorna a senha hasheada
import bcrypt from 'bcrypt';

export async function hashSenha(senha: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(senha, salt);
  return hash;
}