/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sticker {
  id: string;
  number: string;
  country: string;
  emoji: string;
  name: string;
  rarity: 'RARO' | 'COMUM' | 'ESPECIAL';
  countRepeated: number; // Quantos têm repetida na plataforma
  countNeeded: number;   // Quantos precisam na plataforma
  status?: 'Tenho repetida' | 'Preciso' | 'Tenho única'; // Status específico do usuário logado
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'cliente' | 'admin';
  dataCadastro: string;
  figurinhasCount: number; // Número de figurinhas registradas
  trocasCount: number;     // Número de trocas completadas
  status: 'Ativo' | 'Inativo';
  progressoAlbum: number;   // Ex: 36 (representando 36%)
}

export interface Trade {
  id: string;
  usuarioParceiroNome: string;
  usuarioParceiroEmail: string;
  usuarioSolicitanteNome: string;
  usuarioSolicitanteEmail: string;
  figurinhaOferecida: string; // Ex: "BRA 10 (Neymar Jr)"
  figurinhaDesejada: string;   // Ex: "ARG 10 (Lionel Messi)"
  status: 'Aguardando' | 'Aceita' | 'Concluída' | 'Cancelada';
  data: string;
}
