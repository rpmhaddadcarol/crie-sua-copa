/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sticker, User, Trade } from './types';

export const INITIAL_STICKERS: Sticker[] = [
  { id: '1', number: 'BRA 10', country: 'Brasil', emoji: '🇧🇷', name: 'Neymar Jr', rarity: 'ESPECIAL', countRepeated: 14, countNeeded: 45 },
  { id: '2', number: 'BRA 09', country: 'Brasil', emoji: '🇧🇷', name: 'Vinícius Jr', rarity: 'RARO', countRepeated: 8, countNeeded: 32 },
  { id: '3', number: 'BRA 01', country: 'Brasil', emoji: '🇧🇷', name: 'Alisson Becker', rarity: 'COMUM', countRepeated: 25, countNeeded: 12 },
  { id: '4', number: 'BRA 04', country: 'Brasil', emoji: '🇧🇷', name: 'Marquinhos', rarity: 'COMUM', countRepeated: 18, countNeeded: 15 },
  { id: '5', number: 'ARG 10', country: 'Argentina', emoji: '🇦🇷', name: 'Lionel Messi', rarity: 'ESPECIAL', countRepeated: 3, countNeeded: 89 },
  { id: '6', number: 'ARG 11', country: 'Argentina', emoji: '🇦🇷', name: 'Ángel Di María', rarity: 'RARO', countRepeated: 9, countNeeded: 21 },
  { id: '7', number: 'ARG 01', country: 'Argentina', emoji: '🇦🇷', name: 'Dibu Martínez', rarity: 'COMUM', countRepeated: 22, countNeeded: 9 },
  { id: '8', number: 'POR 07', country: 'Portugal', emoji: '🇵🇹', name: 'Cristiano Ronaldo', rarity: 'ESPECIAL', countRepeated: 5, countNeeded: 78 },
  { id: '9', number: 'POR 10', country: 'Portugal', emoji: '🇵🇹', name: 'Bruno Fernandes', rarity: 'RARO', countRepeated: 12, countNeeded: 19 },
  { id: '10', number: 'FRA 10', country: 'França', emoji: '🇫🇷', name: 'Kylian Mbappé', rarity: 'ESPECIAL', countRepeated: 6, countNeeded: 64 },
  { id: '11', number: 'FRA 07', country: 'França', emoji: '🇫🇷', name: 'Antoine Griezmann', rarity: 'RARO', countRepeated: 15, countNeeded: 14 },
  { id: '12', number: 'GER 10', country: 'Alemanha', emoji: '🇩🇪', name: 'Jamal Musiala', rarity: 'RARO', countRepeated: 11, countNeeded: 28 },
  { id: '13', number: 'GER 13', country: 'Alemanha', emoji: '🇩🇪', name: 'Thomas Müller', rarity: 'COMUM', countRepeated: 30, countNeeded: 5 },
  { id: '14', number: 'ENG 09', country: 'Inglaterra', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Harry Kane', rarity: 'RARO', countRepeated: 10, countNeeded: 18 },
  { id: '15', number: 'ENG 10', country: 'Inglaterra', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Jude Bellingham', rarity: 'ESPECIAL', countRepeated: 4, countNeeded: 55 },
  { id: '16', number: 'ESP 09', country: 'Espanha', emoji: '🇪🇸', name: 'Gavi', rarity: 'RARO', countRepeated: 14, countNeeded: 25 },
  { id: '17', number: 'ESP 10', country: 'Espanha', emoji: '🇪🇸', name: 'Pedri', rarity: 'RARO', countRepeated: 13, countNeeded: 30 },
  { id: '18', number: 'URU 09', country: 'Uruguai', emoji: '🇺🇾', name: 'Luis Suárez', rarity: 'COMUM', countRepeated: 24, countNeeded: 11 },
  { id: '19', number: 'CRO 10', country: 'Croácia', emoji: '🇭🇷', name: 'Luka Modric', rarity: 'ESPECIAL', countRepeated: 7, countNeeded: 42 },
  { id: '20', number: 'BEL 07', country: 'Bélgica', emoji: '🇧🇪', name: 'Kevin De Bruyne', rarity: 'ESPECIAL', countRepeated: 5, countNeeded: 49 },
  { id: '21', number: 'MEX 13', country: 'México', emoji: '🇲🇽', name: 'Memo Ochoa', rarity: 'RARO', countRepeated: 16, countNeeded: 8 },
  { id: '22', number: 'SEN 10', country: 'Senegal', emoji: '🇸🇳', name: 'Sadio Mané', rarity: 'RARO', countRepeated: 12, countNeeded: 15 }
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', nome: 'João Silva', email: 'cliente@copa.com', role: 'cliente', dataCadastro: '2026-05-15', figurinhasCount: 18, trocasCount: 12, status: 'Ativo', progressoAlbum: 36 },
  { id: 'u2', nome: 'Admin Copa', email: 'admin@copa.com', role: 'admin', dataCadastro: '2026-01-10', figurinhasCount: 0, trocasCount: 0, status: 'Ativo', progressoAlbum: 100 },
  { id: 'u3', nome: 'Lucas Oliveira', email: 'lucas@copa.com', role: 'cliente', dataCadastro: '2026-05-20', figurinhasCount: 42, trocasCount: 9, status: 'Ativo', progressoAlbum: 48 },
  { id: 'u4', nome: 'Mariana Santos', email: 'mariana@copa.com', role: 'cliente', dataCadastro: '2026-05-22', figurinhasCount: 31, trocasCount: 22, status: 'Ativo', progressoAlbum: 67 },
  { id: 'u5', nome: 'Pedro Fernandes', email: 'pedro@copa.com', role: 'cliente', dataCadastro: '2026-05-24', figurinhasCount: 14, trocasCount: 4, status: 'Ativo', progressoAlbum: 15 },
  { id: 'u6', nome: 'Fernanda Lima', email: 'fernanda@copa.com', role: 'cliente', dataCadastro: '2026-05-28', figurinhasCount: 28, trocasCount: 7, status: 'Inativo', progressoAlbum: 29 }
];

export const INITIAL_TRADES: Trade[] = [
  { id: 't1', usuarioParceiroNome: 'Lucas Oliveira', usuarioParceiroEmail: 'lucas@copa.com', usuarioSolicitanteNome: 'João Silva', usuarioSolicitanteEmail: 'cliente@copa.com', figurinhaOferecida: 'BRA 01 (Alisson Becker)', figurinhaDesejada: 'GER 13 (Thomas Müller)', status: 'Aceita', data: '2026-06-03' },
  { id: 't2', usuarioParceiroNome: 'Mariana Santos', usuarioParceiroEmail: 'mariana@copa.com', usuarioSolicitanteNome: 'João Silva', usuarioSolicitanteEmail: 'cliente@copa.com', figurinhaOferecida: 'POR 10 (Bruno Fernandes)', figurinhaDesejada: 'FRA 10 (Kylian Mbappé)', status: 'Aguardando', data: '2026-06-04' },
  { id: 't3', usuarioParceiroNome: 'Pedro Fernandes', usuarioParceiroEmail: 'pedro@copa.com', usuarioSolicitanteNome: 'Lucas Oliveira', usuarioSolicitanteEmail: 'lucas@copa.com', figurinhaOferecida: 'URU 09 (Luis Suárez)', figurinhaDesejada: 'ESP 10 (Pedri)', status: 'Concluída', data: '2026-06-01' },
  { id: 't4', usuarioParceiroNome: 'João Silva', usuarioParceiroEmail: 'cliente@copa.com', usuarioSolicitanteNome: 'Pedro Fernandes', usuarioSolicitanteEmail: 'pedro@copa.com', figurinhaOferecida: 'ESP 09 (Gavi)', figurinhaDesejada: 'BRA 10 (Neymar Jr)', status: 'Cancelada', data: '2026-05-30' },
  { id: 't5', usuarioParceiroNome: 'Lucas Oliveira', usuarioParceiroEmail: 'lucas@copa.com', usuarioSolicitanteNome: 'Mariana Santos', usuarioSolicitanteEmail: 'mariana@copa.com', figurinhaOferecida: 'FRA 07 (Antoine Griezmann)', figurinhaDesejada: 'ENG 10 (Jude Bellingham)', status: 'Aguardando', data: '2026-06-04' },
  { id: 't6', usuarioParceiroNome: 'Fernanda Lima', usuarioParceiroEmail: 'fernanda@copa.com', usuarioSolicitanteNome: 'João Silva', usuarioSolicitanteEmail: 'cliente@copa.com', figurinhaOferecida: 'MEX 13 (Memo Ochoa)', figurinhaDesejada: 'SEN 10 (Sadio Mané)', status: 'Concluída', data: '2026-05-29' },
  { id: 't7', usuarioParceiroNome: 'Pedro Fernandes', usuarioParceiroEmail: 'pedro@copa.com', usuarioSolicitanteNome: 'João Silva', usuarioSolicitanteEmail: 'cliente@copa.com', figurinhaOferecida: 'GER 10 (Jamal Musiala)', figurinhaDesejada: 'ARG 11 (Ángel Di María)', status: 'Concluída', data: '2026-05-28' },
  { id: 't8', usuarioParceiroNome: 'Mariana Santos', usuarioParceiroEmail: 'mariana@copa.com', usuarioSolicitanteNome: 'Lucas Oliveira', usuarioSolicitanteEmail: 'lucas@copa.com', figurinhaOferecida: 'BEL 07 (Kevin De Bruyne)', figurinhaDesejada: 'POR 07 (Cristiano Ronaldo)', status: 'Aguardando', data: '2026-06-04' },
  { id: 't9', usuarioParceiroNome: 'João Silva', usuarioParceiroEmail: 'cliente@copa.com', usuarioSolicitanteNome: 'Mariana Santos', usuarioSolicitanteEmail: 'mariana@copa.com', figurinhaOferecida: 'BRA 04 (Marquinhos)', figurinhaDesejada: 'ARG 01 (Dibu Martínez)', status: 'Aguardando', data: '2026-06-04' },
  { id: 't10', usuarioParceiroNome: 'Fernanda Lima', usuarioParceiroEmail: 'fernanda@copa.com', usuarioSolicitanteNome: 'Pedro Fernandes', usuarioSolicitanteEmail: 'pedro@copa.com', figurinhaOferecida: 'ENG 09 (Harry Kane)', figurinhaDesejada: 'BRA 09 (Vinícius Jr)', status: 'Concluída', data: '2026-05-25' }
];

// O usuário "cliente@copa.com" tem algumas específicas associadas para demonstrar no Dashboard dele:
export const INITIAL_CLIENT_STICKERS: { stickerId: string; status: 'Tenho repetida' | 'Preciso' | 'Tenho única'; qty: number }[] = [
  { stickerId: '1', status: 'Tenho repetida', qty: 2 },
  { stickerId: '3', status: 'Tenho única', qty: 1 },
  { stickerId: '4', status: 'Tenho repetida', qty: 3 },
  { stickerId: '5', status: 'Preciso', qty: 0 },
  { stickerId: '8', status: 'Preciso', qty: 0 },
  { stickerId: '10', status: 'Tenho única', qty: 1 },
  { stickerId: '13', status: 'Tenho repetida', qty: 4 },
  { stickerId: '15', status: 'Preciso', qty: 0 },
  { stickerId: '19', status: 'Tenho única', qty: 1 },
  { stickerId: '20', status: 'Preciso', qty: 0 }
];

// Lógica para carregar do LocalStorage
export function loadFromLocalStorage<T>(key: string, initial: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
  }
  return initial;
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar no localStorage', e);
  }
}
