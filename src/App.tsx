/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Users, Layers, Search, ArrowLeftRight, Plus, X, 
  ChevronRight, Filter, LogOut, Shield, Check, AlertCircle, 
  TrendingUp, BarChart2, Menu, Activity, ShieldCheck, Star, 
  MapPin, CheckCircle, Clock, Ban, Send, Heart, Play
} from 'lucide-react';
import { Sticker, User, Trade } from './types';
import { 
  INITIAL_STICKERS, INITIAL_USERS, INITIAL_TRADES, INITIAL_CLIENT_STICKERS,
  loadFromLocalStorage, saveToLocalStorage 
} from './data';

export default function App() {
  // --- Estados do Sistema ---
  const [users, setUsers] = useState<User[]>(() => loadFromLocalStorage('copa_users', INITIAL_USERS));
  const [stickers, setStickers] = useState<Sticker[]>(() => loadFromLocalStorage('copa_stickers', INITIAL_STICKERS));
  const [trades, setTrades] = useState<Trade[]>(() => loadFromLocalStorage('copa_trades', INITIAL_TRADES));
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  // Associar as figurinhas que o cliente logado possui no álbum pessoal
  // Formato: { [stickerId]: { status: 'Tenho repetida' | 'Preciso' | 'Tenho única', qty: number } }
  const [userInventory, setUserInventory] = useState<Record<string, { status: 'Tenho repetida' | 'Preciso' | 'Tenho única'; qty: number }>>(() => {
    const saved = localStorage.getItem('copa_user_inventory');
    if (saved) return JSON.parse(saved);
    // Caso não exista, inicializar com a relação de exemplo do João Silva (cliente demo)
    const initialInv: Record<string, { status: 'Tenho repetida' | 'Preciso' | 'Tenho única'; qty: number }> = {};
    INITIAL_CLIENT_STICKERS.forEach(item => {
      initialInv[item.stickerId] = { status: item.status, qty: item.qty };
    });
    return initialInv;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('copa_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard' | 'admin'>(() => {
    const savedView = localStorage.getItem('copa_current_view');
    if (savedView) return savedView as any;
    const savedUserObj = localStorage.getItem('copa_current_user');
    if (savedUserObj) {
      const user: User = JSON.parse(savedUserObj);
      return user.role === 'admin' ? 'admin' : 'dashboard';
    }
    return 'landing';
  });

  // Navegação Interna
  const [activeCustomerTab, setActiveCustomerTab] = useState<'inicio' | 'minhas' | 'buscar' | 'trocas'>('inicio');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'usuarios' | 'figurinhas' | 'trocas' | 'relatorios'>('dashboard');

  // Controle de Menus responsivos
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Formulário de Login
  const [emailInput, setEmailInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modais
  const [isAddStickerOpen, setIsAddStickerOpen] = useState(false);
  const [isProposeTradeOpen, setIsProposeTradeOpen] = useState(false);

  // Form de adicionar figurinha
  const [newStickerIdSelected, setNewStickerIdSelected] = useState('');
  const [newStickerStatus, setNewStickerStatus] = useState<'Tenho repetida' | 'Preciso' | 'Tenho única'>('Tenho repetida');
  const [newStickerQty, setNewStickerQty] = useState(1);
  const [manualStickerNumber, setManualStickerNumber] = useState('');
  const [manualStickerName, setManualStickerName] = useState('');
  const [manualStickerCountry, setManualStickerCountry] = useState('Brasil');
  const [manualStickerRarity, setManualStickerRarity] = useState<'COMUM' | 'RARO' | 'ESPECIAL'>('COMUM');
  const [isManualSticker, setIsManualSticker] = useState(false);

  // Form de propor troca
  const [targetStickerToTrade, setTargetStickerToTrade] = useState<Sticker | null>(null);
  const [myOfferedStickerId, setMyOfferedStickerId] = useState('');

  // Filtros de Figurinhas no Dashboard do Cliente
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<'TODAS' | 'COMUM' | 'RARO' | 'ESPECIAL'>('TODAS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'REPETIDAS' | 'PROCURO' | 'TENHO_UNICA' | 'COLECIONADAS'>('TODOS');
  const [filterSelection, setFilterSelection] = useState('TODAS');

  // Filtros de Admin
  const [searchUserAdmin, setSearchUserAdmin] = useState('');
  const [searchStickerAdmin, setSearchStickerAdmin] = useState('');
  const [sortStickerAdmin, setSortStickerAdmin] = useState<'PADRAO' | 'MAIS_PROCURADAS' | 'MAIS_REPETIDAS'>('PADRAO');

  // Sincronizar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    saveToLocalStorage('copa_users', users);
  }, [users]);

  useEffect(() => {
    saveToLocalStorage('copa_stickers', stickers);
  }, [stickers]);

  useEffect(() => {
    saveToLocalStorage('copa_trades', trades);
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('copa_user_inventory', JSON.stringify(userInventory));
  }, [userInventory]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('copa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('copa_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('copa_current_view', currentView);
  }, [currentView]);

  // Lista única de países para filtros
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    stickers.forEach(s => set.add(s.country));
    return Array.from(set).sort();
  }, [stickers]);

  // --- Lógica de Negócios e Ações ---

  // Fazer Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Busca usuário simulado
    const userDefaultList = [
      { email: "cliente@copa.com", senha: "123456", role: "cliente", nome: "João Silva" },
      { email: "admin@copa.com", senha: "123456", role: "admin", nome: "Admin Copa" }
    ];

    // Checa na lista persistida primeiro ou na padrão se não existir nela
    const foundUserInState = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    
    let authenticatedUser: any = null;

    if (foundUserInState) {
      if (emailInput.toLowerCase() === 'admin@copa.com' && senhaInput === '123456') {
        authenticatedUser = foundUserInState;
      } else if (emailInput.toLowerCase() === 'cliente@copa.com' && senhaInput === '123456') {
        authenticatedUser = foundUserInState;
      } else {
        // Se for outro usuário cadastrado simulado, aceitar qualquer senha de 6 digitos para facilitar testes
        if (senhaInput.length >= 4) {
          authenticatedUser = foundUserInState;
        } else {
          setErrorMsg('A senha para contas novas simuladas deve ter no mínimo 4 caracteres.');
          return;
        }
      }
    } else {
      // Checa lista padrão
      const foundDefault = userDefaultList.find(
        u => u.email.toLowerCase() === emailInput.toLowerCase() && u.senha === senhaInput
      );
      if (foundDefault) {
        // Cria usuário no estado
        const newU: User = {
          id: foundDefault.role === 'admin' ? 'u2' : 'u1',
          nome: foundDefault.nome,
          email: foundDefault.email,
          role: foundDefault.role as any,
          dataCadastro: '2026-05-15',
          figurinhasCount: foundDefault.role === 'admin' ? 0 : 18,
          trocasCount: foundDefault.role === 'admin' ? 0 : 12,
          status: 'Ativo',
          progressoAlbum: foundDefault.role === 'admin' ? 100 : 36
        };
        setUsers(prev => [...prev, newU]);
        authenticatedUser = newU;
      }
    }

    if (authenticatedUser) {
      if (authenticatedUser.status === 'Inativo') {
        setErrorMsg('Esta conta foi desativada pelo administrador.');
        return;
      }
      setCurrentUser(authenticatedUser);
      if (authenticatedUser.role === 'admin') {
        setCurrentView('admin');
        setActiveAdminTab('dashboard');
      } else {
        setCurrentView('dashboard');
        setActiveCustomerTab('inicio');
      }
      setEmailInput('');
      setSenhaInput('');
    } else {
      setErrorMsg('Credenciais inválidas! Tente usar os atalhos de demonstração abaixo.');
    }
  };

  // Preenchimento de contas demonstrafivas
  const fillDemoAndLogin = (email: string) => {
    setEmailInput(email);
    setSenhaInput('123456');
    setErrorMsg('');
  };

  // Cadastrar nova conta simulada diretamente na tela de login
  const handleRegisterSimulated = () => {
    if (!emailInput || !senhaInput) {
      setErrorMsg('Preencha o e-mail e senha acima para simular o cadastro.');
      return;
    }
    const emailExist = users.some(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (emailExist) {
      setErrorMsg('Este e-mail já está em uso.');
      return;
    }

    const newU: User = {
      id: 'u_' + Date.now(),
      nome: emailInput.split('@')[0].toUpperCase(),
      email: emailInput,
      role: 'cliente',
      dataCadastro: new Date().toISOString().split('T')[0],
      figurinhasCount: 0,
      trocasCount: 0,
      status: 'Ativo',
      progressoAlbum: 5
    };

    setUsers(prev => [...prev, newU]);
    setCurrentUser(newU);
    setCurrentView('dashboard');
    setActiveCustomerTab('inicio');
    setEmailInput('');
    setSenhaInput('');
    alert('Conta simulada criada com sucesso! Boas-vindas à plataforma Crie sua Copa.');
  };

  // Fazer Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setMobileMenuOpen(false);
  };

  // Adicionar Figurinha ao álbum do usuário
  const handleAddStickerToInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    let stickerIdToAssign = '';

    if (isManualSticker) {
      // Cria uma nova figurinha geral no catálogo se for manual
      if (!manualStickerNumber || !manualStickerName) {
        alert('Por favor, preencha o número e nome do jogador.');
        return;
      }

      // Evita duplicados no catálogo
      const existingInCatalog = stickers.find(
        s => s.number.toLowerCase() === manualStickerNumber.toLowerCase()
      );

      if (existingInCatalog) {
        stickerIdToAssign = existingInCatalog.id;
      } else {
        const flagEmojis: Record<string, string> = {
          'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'Portugal': '🇵🇹', 'França': '🇫🇷',
          'Alemanha': '🇩🇪', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Espanha': '🇪🇸', 'Uruguai': '🇺🇾',
          'Croácia': '🇭🇷', 'Bélgica': '🇧🇪', 'México': '🇲🇽', 'Senegal': '🇸🇳',
          'Itália': '🇮🇹', 'Japão': '🇯🇵', 'Marrocos': '🇲🇦'
        };

        const newStickerObj: Sticker = {
          id: 's_' + Date.now(),
          number: manualStickerNumber.toUpperCase(),
          country: manualStickerCountry,
          emoji: flagEmojis[manualStickerCountry] || '⚽',
          name: manualStickerName,
          rarity: manualStickerRarity,
          countRepeated: newStickerStatus === 'Tenho repetida' ? newStickerQty : 0,
          countNeeded: newStickerStatus === 'Preciso' ? 1 : 0
        };

        setStickers(prev => [...prev, newStickerObj]);
        stickerIdToAssign = newStickerObj.id;
      }
    } else {
      stickerIdToAssign = newStickerIdSelected;
    }

    if (!stickerIdToAssign) {
      alert('Selecione uma figurinha para adicionar.');
      return;
    }

    // Adiciona ao inventário do usuário logado
    setUserInventory(prev => {
      const updated = { ...prev };
      updated[stickerIdToAssign] = {
        status: newStickerStatus,
        qty: newStickerStatus === 'Preciso' ? 0 : Math.max(1, newStickerQty)
      };
      return updated;
    });

    // Atualiza estatísticas globais da figurinha no catálogo
    setStickers(prev => {
      return prev.map(s => {
        if (s.id === stickerIdToAssign) {
          const isRepeated = newStickerStatus === 'Tenho repetida';
          const isNeeded = newStickerStatus === 'Preciso';
          return {
            ...s,
            countRepeated: isRepeated ? s.countRepeated + newStickerQty : s.countRepeated,
            countNeeded: isNeeded ? s.countNeeded + 1 : s.countNeeded
          };
        }
        return s;
      });
    });

    // Atualiza as estatísticas do Usuário
    setUsers(prev => {
      return prev.map(u => {
        if (u.id === currentUser.id) {
          const updatedCount = u.figurinhasCount + 1;
          // Calcular novo percentual para progressbar do album (máximo 670 figurinhas)
          const newProgress = Math.min(100, Math.round((updatedCount / 50) * 100)); // Usando 50 para fins demonstrativos agradáveis
          return {
            ...u,
            figurinhasCount: updatedCount,
            progressoAlbum: Math.max(u.progressoAlbum, newProgress)
          };
        }
        return u;
      });
    });

    // Reset formulários
    setNewStickerIdSelected('');
    setManualStickerNumber('');
    setManualStickerName('');
    setIsAddStickerOpen(false);

    // Feedback visual amigável
    alert('Figurinha registrada no seu álbum com sucesso!');
  };

  // Remover figurinha do seu próprio inventário
  const handleRemoveFromInventory = (stickerId: string) => {
    if (!confirm('Deseja realmente remover esta figurinha do seu álbum?')) return;
    
    const originalItem = userInventory[stickerId];
    if (!originalItem) return;

    setUserInventory(prev => {
      const copy = { ...prev };
      delete copy[stickerId];
      return copy;
    });

    // Deduzir dos contadores globais do catálogo
    setStickers(prev => {
      return prev.map(s => {
        if (s.id === stickerId) {
          return {
            ...s,
            countRepeated: originalItem.status === 'Tenho repetida' ? Math.max(0, s.countRepeated - originalItem.qty) : s.countRepeated,
            countNeeded: originalItem.status === 'Preciso' ? Math.max(0, s.countNeeded - 1) : s.countNeeded
          };
        }
        return s;
      });
    });

    if (currentUser) {
      setUsers(prev => {
        return prev.map(u => {
          if (u.id === currentUser.id) {
            const newCount = Math.max(0, u.figurinhasCount - 1);
            return {
              ...u,
              figurinhasCount: newCount
            };
          }
          return u;
        });
      });
    }
  };

  // Preparar proposta de troca
  const handleOpenProposeTrade = (sticker: Sticker) => {
    setTargetStickerToTrade(sticker);
    // Procurar quais repetidas eu possuo para sugerir em troca
    const myRepeatedStickers = Object.entries(userInventory)
      .filter(([_, inv]: [string, any]) => inv.status === 'Tenho repetida')
      .map(([id, _]) => stickers.find(s => s.id === id))
      .filter((s): s is Sticker => !!s);
    
    if (myRepeatedStickers.length === 0) {
      alert('Você precisa ter alguma figurinha registrada como "Tenho repetida" para oferecer em troca!');
      return;
    }

    setMyOfferedStickerId(myRepeatedStickers[0].id);
    setIsProposeTradeOpen(true);
  };

  // Criar proposta de troca
  const handleCreateTradeProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetStickerToTrade || !myOfferedStickerId) return;

    const offeredStickerObj = stickers.find(s => s.id === myOfferedStickerId);
    if (!offeredStickerObj) return;

    // Achar um usuário fictício que precise da minha oferecida e tenha a que eu quero
    // Ou simplesmente relacionar com um parceiro aleatório que simule a transação
    const possiblePartners = users.filter(u => u.email !== currentUser.email && u.status === 'Ativo');
    const randomPartner = possiblePartners[Math.floor(Math.random() * possiblePartners.length)] || users[2];

    const newTrade: Trade = {
      id: 't_' + Date.now(),
      usuarioParceiroNome: randomPartner.nome,
      usuarioParceiroEmail: randomPartner.email,
      usuarioSolicitanteNome: currentUser.nome,
      usuarioSolicitanteEmail: currentUser.email,
      figurinhaOferecida: `${offeredStickerObj.number} (${offeredStickerObj.name})`,
      figurinhaDesejada: `${targetStickerToTrade.number} (${targetStickerToTrade.name})`,
      status: 'Aguardando',
      data: new Date().toISOString().split('T')[0]
    };

    setTrades(prev => [newTrade, ...prev]);
    setIsProposeTradeOpen(false);
    alert(`Proposta de troca enviada para ${randomPartner.nome}! Aguardando resposta.`);
  };

  // Aceitar / Recusar / Concluir trocas (Ação do cliente)
  const handleUpdateTradeStatus = (tradeId: string, nextStatus: 'Aceita' | 'Concluída' | 'Cancelada') => {
    setTrades(prev => {
      return prev.map(t => {
        if (t.id === tradeId) {
          // Se fechar como concluída, incrementa trocas dos envolvidos
          if (nextStatus === 'Concluída') {
            setUsers(uPrev => {
              return uPrev.map(u => {
                if (u.email === t.usuarioSolicitanteEmail || u.email === t.usuarioParceiroEmail) {
                  return { ...u, trocasCount: u.trocasCount + 1 };
                }
                return u;
              });
            });
          }
          return { ...t, status: nextStatus };
        }
        return t;
      });
    });
  };

  // --- LÓGICA DO ADMIN ---

  // Ativar/Desativar Usuário
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => {
      return prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
          if (currentUser && u.id === currentUser.id && nextStatus === 'Inativo') {
            alert('Você não pode desativar o seu próprio usuário admin logado.');
            return u;
          }
          return { ...u, status: nextStatus };
        }
        return u;
      });
    });
  };

  // Intervir/Cancelar troca como Admin
  const handleAdminInterveneTrade = (tradeId: string) => {
    if (confirm('Deseja realmente intervir e CANCELAR esta troca permanentemente?')) {
      setTrades(prev => {
        return prev.map(t => {
          if (t.id === tradeId) {
            return { ...t, status: 'Cancelada' };
          }
          return t;
        });
      });
      alert('Troca cancelada com sucesso.');
    }
  };

  // --- FILTRAGENS E CÁLCULOS ---

  // Cálculo das figurinhas no Dashboard do cliente
  const filteredStickersForClient = useMemo(() => {
    return stickers.filter(s => {
      // 1. Termo de Busca
      const matchesSearch = s.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.country.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Raridade
      if (filterRarity !== 'TODAS' && s.rarity !== filterRarity) return false;

      // 3. Seleção / País
      if (filterSelection !== 'TODAS' && s.country !== filterSelection) return false;

      // 4. Status do inventário pessoal
      const personalItem = userInventory[s.id];
      if (filterStatus === 'REPETIDAS') {
        return personalItem && personalItem.status === 'Tenho repetida';
      }
      if (filterStatus === 'PROCURO') {
        return personalItem && personalItem.status === 'Preciso';
      }
      if (filterStatus === 'TENHO_UNICA') {
        return personalItem && personalItem.status === 'Tenho única';
      }
      if (filterStatus === 'COLECIONADAS') {
        return !!personalItem; // Qualquer uma que eu tenha ou queira
      }

      return true;
    });
  }, [stickers, searchQuery, filterRarity, filterStatus, filterSelection, userInventory]);

  // Lista de minhas figurinhas no inventário específico
  const myInventoryStickersDetailed = useMemo(() => {
    return Object.entries(userInventory).map(([stickerId, inv]: [string, any]) => {
      const parentSticker = stickers.find(s => s.id === stickerId);
      return {
        ...parentSticker,
        id: stickerId,
        number: parentSticker?.number || 'N/A',
        country: parentSticker?.country || 'Desconhecido',
        emoji: parentSticker?.emoji || '⚽',
        name: parentSticker?.name || 'Jogador',
        rarity: parentSticker?.rarity || 'COMUM',
        personalStatus: inv.status,
        personalQty: inv.qty
      };
    });
  }, [userInventory, stickers]);

  // Estatísticas e Rankings para o dashboard ADMIN
  const topWantedStickers = useMemo(() => {
    return [...stickers].sort((a, b) => b.countNeeded - a.countNeeded).slice(0, 5);
  }, [stickers]);

  const topRepeatedStickers = useMemo(() => {
    return [...stickers].sort((a, b) => b.countRepeated - a.countRepeated).slice(0, 5);
  }, [stickers]);

  // Filtro de Figurinhas Admin
  const filteredStickersForAdmin = useMemo(() => {
    let list = stickers.filter(s => {
      return s.number.toLowerCase().includes(searchStickerAdmin.toLowerCase()) ||
             s.name.toLowerCase().includes(searchStickerAdmin.toLowerCase()) ||
             s.country.toLowerCase().includes(searchStickerAdmin.toLowerCase());
    });

    if (sortStickerAdmin === 'MAIS_PROCURADAS') {
      list.sort((a, b) => b.countNeeded - a.countNeeded);
    } else if (sortStickerAdmin === 'MAIS_REPETIDAS') {
      list.sort((a, b) => b.countRepeated - a.countRepeated);
    }
    return list;
  }, [stickers, searchStickerAdmin, sortStickerAdmin]);

  // Filtro de Usuários Admin
  const filteredUsersForAdmin = useMemo(() => {
    return users.filter(u => {
      return u.nome.toLowerCase().includes(searchUserAdmin.toLowerCase()) ||
             u.email.toLowerCase().includes(searchUserAdmin.toLowerCase());
    });
  }, [users, searchUserAdmin]);

  // Progresso Geral do Álbum do Usuário Logado
  const albumPercentage = useMemo(() => {
    if (!currentUser) return 0;
    // Pega o progresso do usuário armazenado no state ou calcula dinamicamente baseado no total do album (670 figurinhas)
    const totalCount = Object.keys(userInventory).filter(id => userInventory[id]?.status !== 'Preciso').length;
    return Math.min(100, Math.round((totalCount / 22) * 100)); // 22 figurinhas no catálogo original
  }, [userInventory, currentUser]);

  return (
    <div className="min-h-screen relative font-sans flex flex-col justify-between selection:bg-brand-yellow/30 selection:text-brand-yellow">
      
      {/* Círculos Elípticos de Neon no Background para estética Glassmorphism */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-10000"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-green-950/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* --- RENDERIZAÇÃO DE TELAS --- */}

      {/* 1. LANDING PAGE */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col relative w-full overflow-hidden">
          
          {/* Partículas flutuantes em CSS animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute w-4 h-4 bg-yellow-400 rounded-full blur-xs animate-bubble-1 opacity-20"></div>
            <div className="absolute w-3 h-3 bg-yellow-500 rounded-full blur-xs animate-bubble-2 opacity-15"></div>
            <div className="absolute w-5 h-5 bg-yellow-300 rounded-full blur-sm animate-bubble-3 opacity-25"></div>
            <div className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-xs animate-bubble-4 opacity-10"></div>
            <div className="absolute w-4 h-4 bg-amber-400 rounded-full blur-xs animate-bubble-5 opacity-30"></div>
          </div>

          {/* Header Fixo */}
          <header className="sticky top-0 w-full backdrop-blur-md bg-bg-dark/60 border-b border-white/5 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-3xl sm:text-4xl text-brand-yellow font-title tracking-wider drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">🏆 CRIE SUA COPA</span>
              </div>
              <div className="flex space-x-3 items-center">
                <button 
                  onClick={() => { setCurrentView('login'); setIsAdminLogin(true); }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition duration-300 border border-transparent hover:border-white/10 rounded-full bg-white/2"
                >
                  Admin
                </button>
                <button 
                  onClick={() => { setCurrentView('login'); setIsAdminLogin(false); }}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-green to-emerald-600 border border-brand-yellow/30 text-white hover:text-brand-yellow rounded-full shadow-lg shadow-emerald-950/50 hover:shadow-brand-yellow/20 hover:scale-105 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  Entrar
                </button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 flex flex-col items-center justify-center text-center relative z-10">
            
            {/* Badge Promocional */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel-yellow text-brand-yellow font-medium text-xs sm:text-sm animate-fade-in-up mb-6">
              <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow animate-spin duration-3000" />
              <span>Plataforma Oficial de Colecionadores Brasileiros</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-title text-white tracking-wide max-w-4xl leading-none animate-fade-in-up">
              TROQUE FIGURINHAS. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-amber-400 to-emerald-400 drop-shadow-[0_2px_30px_rgba(255,215,0,0.25)]">COMPLETE SEU ÁLBUM.</span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-100">
              Conectamos colecionadores que têm figurinhas repetidas com quem precisa faturar as últimas da Copa. Tudo simples, transparente e em glassmorphism moderno.
            </p>

            {/* Botões CTA */}
            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-200">
              <button 
                onClick={() => { setCurrentView('login'); }}
                className="px-8 py-4 bg-gradient-to-r from-brand-yellow to-amber-500 text-bg-dark font-extrabold text-base rounded-full shadow-xl shadow-brand-yellow/20 hover:scale-105 hover:shadow-brand-yellow/40 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20"
              >
                <span>COMEÇAR A TROCAR AGORA</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <a 
                href="#como-funciona"
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                Como funciona
              </a>
            </div>

            {/* Estatísticas Animadas */}
            <section className="mt-20 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl animate-fade-in-up delay-300">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center hover-glow relative group">
                <div className="p-3 rounded-full bg-emerald-950/80 border border-brand-green text-brand-green mb-3 group-hover:scale-110 transition duration-300">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-brand-yellow font-title tracking-wider">2.400+</span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Figurinhas Cadastradas</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center hover-glow relative group">
                <div className="p-3 rounded-full bg-yellow-950/80 border border-brand-yellow text-brand-yellow mb-3 group-hover:scale-110 transition duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-brand-yellow font-title tracking-wider">1.800+</span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Usuários Ativos</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center hover-glow relative group">
                <div className="p-3 rounded-full bg-emerald-950/80 border border-brand-green text-brand-green mb-3 group-hover:scale-110 transition duration-300">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <span className="text-3xl lg:text-4xl font-extrabold text-brand-yellow font-title tracking-wider">950+</span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Trocas Realizadas</span>
              </div>
            </section>

            {/* Seção Como Funciona */}
            <section id="como-funciona" className="mt-24 pt-12 border-t border-white/5 w-full">
              <h2 className="text-3xl sm:text-5xl font-title text-brand-yellow mb-12 tracking-wide">COMO FUNCIONA A PLATAFORMA</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                
                <div className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-green">
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/5 font-title">01</div>
                  <h3 className="text-xl font-bold text-white mb-3">Cadastre seu Álbum</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Marque as figurinhas que você possui repetidas para trocar e as que você ainda precisa para completar o álbum da Copa.
                  </p>
                </div>

                <div className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-yellow">
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/5 font-title">02</div>
                  <h3 className="text-xl font-bold text-white mb-3">Anuncie ou Procure</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Navegue por seleções, filtre por raridade ou busque por jogadores específicos. Nosso sistema aponta quem quer sua figurinha.
                  </p>
                </div>

                <div className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-green">
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/5 font-title">03</div>
                  <h3 className="text-xl font-bold text-white mb-3">Troque e Divirta-se</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Proponha a troca instantaneamente pelo app, combine o encontro ou envio online e complete sua coleção de Copa rapidamente!
                  </p>
                </div>

              </div>
            </section>

            {/* Seção de Figurinhas mais procuradas na landing */}
            <section className="mt-24 w-full">
              <div className="flex justify-between items-end mb-10 text-left">
                <div>
                  <h2 className="text-3xl sm:text-5xl font-title text-brand-yellow tracking-wide">ESTRELAS MAIS PROCURADAS</h2>
                  <p className="text-sm text-gray-400 mt-1">Os craques que todo colecionador quer faturar em seu álbum.</p>
                </div>
                <button onClick={() => setCurrentView('login')} className="text-xs sm:text-sm text-brand-yellow hover:underline flex items-center space-x-1">
                  <span>Ver todas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stickers.slice(0, 4).map((stk) => (
                  <div key={stk.id} className="glass-panel p-4 rounded-xl flex flex-col items-center hover-glow relative group">
                    <span className="absolute top-3 left-3 text-lg">{stk.emoji}</span>
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-red-600/20 text-red-500 border border-red-500/30">
                      RARO
                    </span>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl border-2 border-brand-yellow/30 mt-4 group-hover:scale-110 transition duration-300">
                      👤
                    </div>
                    <span className="font-title text-lg text-white mt-3 tracking-wider">{stk.name}</span>
                    <span className="text-xs text-brand-yellow font-bold mt-0.5">{stk.number}</span>
                    <span className="text-[10px] text-gray-500 mt-1">{stk.country}</span>
                    
                    <div className="w-full mt-4 flex items-center justify-between text-[11px] border-t border-white/5 pt-2">
                      <span className="text-green-500">{stk.countRepeated} repetidas</span>
                      <span className="text-amber-500">{stk.countNeeded} procuram</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* Footer */}
          <footer className="w-full py-8 border-t border-white/5 bg-bg-dark mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-xs sm:text-sm">
              <span className="mb-4 sm:mb-0">© 2026 Crie sua Copa S.A. Complete seu álbum com a gente.</span>
              <div className="flex space-x-4">
                <span className="hover:text-white transition duration-300 cursor-pointer">Termos</span>
                <span className="hover:text-white transition duration-300 cursor-pointer">Privacidade</span>
                <span className="hover:text-white transition duration-300 cursor-pointer">Contato</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* 2. TELA DE LOGIN / REGISTRO */}
      {currentView === 'login' && (
        <div className="flex-1 flex items-center justify-center p-4 relative">
          
          <button 
            onClick={() => setCurrentView('landing')}
            className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center space-x-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Voltar</span>
          </button>

          <div className="w-full max-w-md glass-panel-heavy p-8 rounded-3xl border border-white/10 shadow-3xl text-center relative animate-fade-in-up">
            
            <div className="text-4xl text-brand-yellow font-title tracking-wider mb-2">🏆 CRIE SUA COPA</div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">Central de Trocas Globais</p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Endereço de E-mail</label>
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@copa.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-brand-yellow/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Senha de Acesso</label>
                <input 
                  type="password" 
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  placeholder="******"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-brand-yellow/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition duration-300"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center space-x-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col space-y-2">
                <button 
                  type="submit"
                  className="w-full py-4 text-sm font-extrabold bg-gradient-to-r from-brand-yellow to-amber-500 text-bg-dark rounded-xl shadow-lg hover:shadow-brand-yellow/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  ACESSAR PLATAFORMA
                </button>
                
                <button 
                  type="button"
                  onClick={handleRegisterSimulated}
                  className="w-full py-3 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-brand-yellow rounded-xl transition duration-300"
                >
                  Criar conta com este e-mail (Simulado)
                </button>
              </div>
            </form>

            {/* Card de Atalhos para Demonstração */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <span className="block text-[11px] font-extrabold text-brand-yellow uppercase tracking-widest mb-4">Acesso rápido para demonstração</span>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => fillDemoAndLogin('cliente@copa.com')}
                  className="p-3 bg-emerald-950/40 border border-brand-green/30 hover:border-brand-green/60 rounded-2xl flex flex-col items-center group cursor-pointer transition text-left"
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition">👤</span>
                  <span className="text-xs font-bold text-white">Cliente Demo</span>
                  <span className="text-[9px] text-gray-500 mt-0.5">cliente@copa.com</span>
                </button>

                <button 
                  onClick={() => fillDemoAndLogin('admin@copa.com')}
                  className="p-3 bg-yellow-950/40 border border-brand-yellow/30 hover:border-brand-yellow/60 rounded-2xl flex flex-col items-center group cursor-pointer transition text-left"
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition">🔧</span>
                  <span className="text-xs font-bold text-white">Admin Demo</span>
                  <span className="text-[9px] text-gray-500 mt-0.5">admin@copa.com</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. DASHBOARD DO CLIENTE */}
      {currentView === 'dashboard' && currentUser && (
        <div className="flex-1 flex flex-col">
          
          {/* Header Dashboard */}
          <header className="sticky top-0 w-full backdrop-blur-md bg-bg-dark/80 border-b border-white/10 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-title tracking-wider text-brand-yellow">🏆 CRIE SUA COPA</span>
                <span className="hidden sm:inline px-2.5 py-0.5 rounded-full text-[10px] bg-brand-green/30 text-emerald-300 font-bold border border-brand-green">CONECTADO</span>
              </div>

              {/* Navegação Desktop */}
              <nav className="hidden md:flex space-x-1">
                <button 
                  onClick={() => setActiveCustomerTab('inicio')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition duration-300 ${activeCustomerTab === 'inicio' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Início
                </button>
                <button 
                  onClick={() => setActiveCustomerTab('minhas')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition duration-300 ${activeCustomerTab === 'minhas' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Minhas Figurinhas
                </button>
                <button 
                  onClick={() => setActiveCustomerTab('buscar')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition duration-300 ${activeCustomerTab === 'buscar' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Buscar Figurinhas
                </button>
                <button 
                  onClick={() => setActiveCustomerTab('trocas')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition duration-300 ${activeCustomerTab === 'trocas' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  Trocas
                </button>
              </nav>

              {/* Perfil e Logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-white leading-none">{currentUser.nome}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Colecionador</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-green to-brand-yellow/40 flex items-center justify-center text-sm font-bold border border-white/10">
                    J
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-full transition duration-300"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Hamburguer Mobile */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 bg-white/5 border border-white/5 md:hidden rounded-full font-bold active:bg-white/10"
                >
                  <Menu className="w-4 h-4 text-white" />
                </button>
              </div>

            </div>

            {/* Menu Dropdown Mobile */}
            {mobileMenuOpen && (
              <div className="md:hidden w-full px-4 pt-2 pb-4 space-y-1 border-t border-white/5 bg-bg-dark/95 animate-fade-in-up">
                <button 
                  onClick={() => { setActiveCustomerTab('inicio'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${activeCustomerTab === 'inicio' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Início (Home)
                </button>
                <button 
                  onClick={() => { setActiveCustomerTab('minhas'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${activeCustomerTab === 'minhas' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Minhas Figurinhas
                </button>
                <button 
                  onClick={() => { setActiveCustomerTab('buscar'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${activeCustomerTab === 'buscar' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Buscar Figurinhas
                </button>
                <button 
                  onClick={() => { setActiveCustomerTab('trocas'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${activeCustomerTab === 'trocas' ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Minhas Trocas
                </button>
              </div>
            )}
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            
            {/* 3.1 ABA INÍCIO */}
            {activeCustomerTab === 'inicio' && (
              <div className="space-y-8 animate-fade-in-up">
                
                {/* Card de Boas-vindas + Progresso */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-green/20 relative overflow-hidden bg-gradient-to-r from-brand-green/10 to-emerald-950/20">
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-brand-green/20 rounded-full blur-2xl"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Excelente ver você de volta, {currentUser.nome}!</h2>
                      <p className="text-sm text-gray-400 mt-1">Seu progresso de colecionador avançou. Vamos fechar o álbum?</p>
                    </div>
                    
                    {/* Progresso do Álbum */}
                    <div className="mt-6 md:mt-0 w-full md:w-72 bg-bg-dark/60 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-gray-300">
                        <span>Progresso do Álbum</span>
                        <span className="text-brand-yellow text-sm">{albumPercentage}%</span>
                      </div>
                      {/* Barra de Progresso Animada */}
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-brand-green via-emerald-500 to-brand-yellow h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${albumPercentage}%` }}
                        ></div>
                      </div>
                      <span className="block text-[10px] text-gray-500 text-right mt-1.5">
                        {Object.keys(userInventory).filter(id => userInventory[id]?.status !== 'Preciso').length} de 22 figurinhas cadastradas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grids de Figurinhas Recomendadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Seção 1: Necessárias em Destaque */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-950 border border-brand-green text-brand-green rounded-lg">
                        <Star className="w-4 h-4 fill-brand-green" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Figurinhas Mais Procuradas no Momento</h3>
                    </div>

                    <div className="space-y-3">
                      {stickers.slice(0, 4).map(stk => (
                        <div key={stk.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 transition">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{stk.emoji}</span>
                            <div>
                              <div className="text-sm font-bold text-white leading-none">{stk.name}</div>
                              <div className="text-xs text-gray-400 mt-1">{stk.country} • Rarity <span className="text-brand-yellow">{stk.rarity}</span></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-red-600/10 text-red-400 px-2 rounded-full border border-red-500/20 font-bold">RARO</span>
                            <div className="text-[10px] text-gray-500 mt-1">{stk.countNeeded} pessoas querem</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seção 2: Oferta Abundante */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-yellow-950 border border-brand-yellow text-brand-yellow rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Com Mais Oferta (Fáceis de Conseguir)</h3>
                    </div>

                    <div className="space-y-3">
                      {stickers.slice(4, 8).map(stk => (
                        <div key={stk.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 transition">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{stk.emoji}</span>
                            <div>
                              <div className="text-sm font-bold text-white leading-none">{stk.name}</div>
                              <div className="text-xs text-gray-400 mt-1">{stk.country} • Série <span className="text-gray-400">{stk.number}</span></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-emerald-600/10 text-emerald-400 px-2 rounded-full border border-brand-green/20 font-bold">FÁCIL</span>
                            <div className="text-[10px] text-gray-500 mt-1">{stk.countRepeated} em estoque para troca</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Feed de Trocas Recentes */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-brand-yellow" />
                    <span>Últimas Movimentações na Rede de Trocas</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trades.slice(0, 4).map(tr => (
                      <div key={tr.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="p-2 bg-white/5 rounded-full text-base">↔️</div>
                          <div>
                            <div className="font-bold text-gray-200">{tr.usuarioSolicitanteNome} ofereceu</div>
                            <div className="text-brand-yellow mt-0.5">{tr.figurinhaOferecida}</div>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tr.status === 'Aceita' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            tr.status === 'Concluída' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            tr.status === 'Cancelada' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {tr.status}
                          </span>
                          <span className="block text-[9px] text-gray-500 mt-1">{tr.data}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 3.2 ABA MINHAS FIGURINHAS */}
            {activeCustomerTab === 'minhas' && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header Aba e Botão de Adição */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-title text-brand-yellow">MINHA COLEÇÃO PESSOAL</h2>
                    <p className="text-sm text-gray-400">Gerencie as suas figurinhas: indique quais tem e quais precisa conseguir.</p>
                  </div>
                  
                  <button 
                    onClick={() => { setIsManualSticker(false); setIsAddStickerOpen(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-brand-green to-emerald-600 border border-brand-yellow/30 text-white hover:text-brand-yellow font-extrabold text-sm rounded-full flex items-center space-x-2 shadow-lg shadow-emerald-950/20"
                  >
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    <span>Adicionar figurinha</span>
                  </button>
                </div>

                {/* Filtros da Minha Lista */}
                <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wide">Filtros:</span>
                  <button 
                    onClick={() => setFilterStatus('TODOS')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === 'TODOS' ? 'bg-brand-yellow text-bg-dark' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    Todas ({myInventoryStickersDetailed.length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('REPETIDAS')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === 'REPETIDAS' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    Repetidas ({myInventoryStickersDetailed.filter(s => s.personalStatus === 'Tenho repetida').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('PROCURO')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === 'PROCURO' ? 'bg-amber-500 text-bg-dark' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    Procuro ({myInventoryStickersDetailed.filter(s => s.personalStatus === 'Preciso').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('TENHO_UNICA')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${filterStatus === 'TENHO_UNICA' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    Tenho Única ({myInventoryStickersDetailed.filter(s => s.personalStatus === 'Tenho única').length})
                  </button>
                </div>

                {/* Grid do Meu Inventário */}
                {myInventoryStickersDetailed.length === 0 ? (
                  <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-4">
                    <span className="text-5xl">📦</span>
                    <h3 className="text-xl font-bold text-gray-300">Coleção Vazia</h3>
                    <p className="text-sm text-gray-500 max-w-sm">Você ainda não registrou figurinhas em sua coleção. Clique no botão acima para adicionar a sua primeira figurinha!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myInventoryStickersDetailed
                      .filter(s => {
                        if (filterStatus === 'REPETIDAS') return s.personalStatus === 'Tenho repetida';
                        if (filterStatus === 'PROCURO') return s.personalStatus === 'Preciso';
                        if (filterStatus === 'TENHO_UNICA') return s.personalStatus === 'Tenho única';
                        return true;
                      })
                      .map(stk => (
                        <div key={stk.id} className="glass-panel p-5 rounded-2xl hover-glow relative group">
                          
                          {/* Emblema RARO / ESPECIAL */}
                          <div className="absolute top-3 left-3 text-lg">{stk.emoji}</div>
                          
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              stk.personalStatus === 'Tenho repetida' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              stk.personalStatus === 'Preciso' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {stk.personalStatus}
                            </span>
                          </div>

                          <div className="flex flex-col items-center text-center mt-6">
                            
                            {/* Avatar Simulado figurinha */}
                            <div className="w-16 h-16 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-3xl font-bold font-title text-brand-yellow">
                              {stk.number.split(' ')[1]}
                            </div>

                            <span className="font-title text-xl text-white mt-4 tracking-wider">{stk.name}</span>
                            <span className="text-xs text-brand-yellow font-black mt-0.5">{stk.number}</span>
                            <span className="text-xs text-gray-500 mt-1">{stk.country}</span>

                            <div className="mt-4 px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-300">
                              Quantidade: <span className="text-brand-yellow">{stk.personalQty}</span>
                            </div>

                            <div className="w-full mt-5 border-t border-white/5 pt-3 flex justify-center">
                              <button 
                                onClick={() => handleRemoveFromInventory(stk.id)}
                                className="px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-full text-xs font-extrabold border border-red-500/20 hover:border-red-500/40 transition duration-300"
                              >
                                REMOVER
                              </button>
                            </div>

                          </div>

                        </div>
                      ))}
                  </div>
                )}

              </div>
            )}

            {/* 3.3 ABA BUSCAR FIGURINHAS */}
            {activeCustomerTab === 'buscar' && (
              <div className="space-y-6 animate-fade-in-up">
                
                <div>
                  <h2 className="text-3xl font-title text-brand-yellow">BUSCAR E PROPOR TROCAS</h2>
                  <p className="text-sm text-gray-400">Conecte-se com outros colecionadores. Encontre quem tem o craque faltante no seu álbum!</p>
                </div>

                {/* Filtros e Campos de Busca */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/2 p-4 rounded-3xl border border-white/5">
                  
                  {/* Busca textual */}
                  <div className="relative md:col-span-2">
                    <Search className="w-4 h-4 text-gray-500 absolute top-3.5 left-3.5" />
                    <input 
                      type="text" 
                      placeholder="Pesquise por jogador, número ou seleção..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-yellow/50"
                    />
                  </div>

                  {/* Filtro Raridade */}
                  <div>
                    <select 
                      value={filterRarity} 
                      onChange={(e) => setFilterRarity(e.target.value as any)}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-yellow/50"
                    >
                      <option className="bg-[#0a1a0f]" value="TODAS">Qualquer Raridade</option>
                      <option className="bg-[#0a1a0f]" value="COMUM">COMUM</option>
                      <option className="bg-[#0a1a0f]" value="RARO">RARO</option>
                      <option className="bg-[#0a1a0f]" value="ESPECIAL">ESPECIAL</option>
                    </select>
                  </div>

                  {/* Filtro Seleção */}
                  <div>
                    <select 
                      value={filterSelection} 
                      onChange={(e) => setFilterSelection(e.target.value)}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-yellow/50"
                    >
                      <option className="bg-[#0a1a0f]" value="TODAS">Qualquer Seleção</option>
                      {availableCountries.map(country => (
                        <option className="bg-[#0a1a0f]" key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Grid Geral de Resultados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredStickersForClient.map(stk => {
                    const isMineInInventory = userInventory[stk.id];
                    return (
                      <div key={stk.id} className="glass-panel p-5 rounded-2xl hover-glow relative group flex flex-col justify-between">
                        
                        <div>
                          {/* Informações básicas */}
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-2xl">{stk.emoji}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              stk.rarity === 'ESPECIAL' ? 'bg-yellow-500/20 text-brand-yellow border border-brand-yellow/30' :
                              stk.rarity === 'RARO' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-slate-500/20 text-gray-400 border border-slate-500/30'
                            }`}>
                              {stk.rarity}
                            </span>
                          </div>

                          <div className="flex flex-col items-center text-center">
                            <span className="font-title text-xl text-white tracking-wider">{stk.name}</span>
                            <span className="text-xs text-brand-yellow font-black mt-0.5">{stk.number}</span>
                            <span className="text-xs text-gray-500 mt-1">{stk.country}</span>
                          </div>
                        </div>

                        {/* Estatísticas de rede */}
                        <div className="mt-6 border-t border-b border-white/5 py-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Ofertado:</span>
                            <span className="text-emerald-400 font-bold">{stk.countRepeated} repetidas</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Procuram esta:</span>
                            <span className="text-amber-400 font-bold">{stk.countNeeded} colecionadores</span>
                          </div>
                        </div>

                        {/* Botão de ação inteligente */}
                        <div className="mt-4">
                          {isMineInInventory && isMineInInventory.status === 'Tenho repetida' ? (
                            <div className="w-full py-2.5 bg-brand-green/20 text-emerald-400 text-xs font-bold text-center rounded-xl border border-brand-green/30">
                              Você tem repetida em estoque
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleOpenProposeTrade(stk)}
                              className="w-full py-2.5 bg-gradient-to-r from-brand-yellow to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-bg-dark text-xs font-extrabold rounded-xl hover:scale-[1.02] shadow-md transition-all duration-300"
                            >
                              PROPOR TROCA
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* 3.4 ABA MINHAS TROCAS */}
            {activeCustomerTab === 'trocas' && (
              <div className="space-y-6 animate-fade-in-up">
                
                <div>
                  <h2 className="text-3xl font-title text-brand-yellow">MINHAS TRANSAÇÕES</h2>
                  <p className="text-sm text-gray-400">Acompanhe as suas negociações em andamento com parceiros colecionadores na plataforma.</p>
                </div>

                {/* Lista de Trocas Ativas */}
                <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                  <div className="px-6 py-4 bg-white/2 border-b border-white/5 font-extrabold text-xs uppercase text-gray-400 tracking-wider">
                    Suas Negociações Ativas ou Recentes
                  </div>

                  <div className="divide-y divide-white/5">
                    {trades
                      .filter(t => t.usuarioSolicitanteEmail === currentUser.email || t.usuarioParceiroEmail === currentUser.email)
                      .map(t => {
                        const isRequester = t.usuarioSolicitanteEmail === currentUser.email;
                        return (
                          <div key={t.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              {/* Ícone Troca */}
                              <div className="p-3 bg-brand-green/20 text-brand-yellow rounded-2xl border border-brand-green/35 text-xl font-bold shrink-0">
                                🔄
                              </div>

                              <div>
                                <div className="text-sm font-black text-white flex items-center gap-2">
                                  <span>{isRequester ? `Para: ${t.usuarioParceiroNome}` : `De: ${t.usuarioSolicitanteNome}`}</span>
                                  <span className="text-[10px] text-gray-500">({t.data})</span>
                                </div>
                                
                                <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
                                  <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                    Oferece: {t.figurinhaOferecida}
                                  </span>
                                  <span className="text-gray-400">↔️</span>
                                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-brand-green/20">
                                    Deseja: {t.figurinhaDesejada}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status e Ações */}
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  t.status === 'Aceita' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  t.status === 'Concluída' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                  t.status === 'Cancelada' ? 'bg-red-500/20 text-red-500 border border-red-500/25' :
                                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/25'
                                }`}>
                                  {t.status}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                {t.status === 'Aguardando' && !isRequester && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateTradeStatus(t.id, 'Aceita')}
                                      className="px-3 py-1.5 bg-brand-green border border-brand-yellow/30 hover:scale-105 transition rounded-lg text-xs font-bold text-white uppercase"
                                    >
                                      ACEITAR
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateTradeStatus(t.id, 'Cancelada')}
                                      className="px-3 py-1.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 rounded-lg text-xs font-bold text-red-400 uppercase transition"
                                    >
                                      RECUSAR
                                    </button>
                                  </>
                                )}

                                {t.status === 'Aceita' && (
                                  <button 
                                    onClick={() => handleUpdateTradeStatus(t.id, 'Concluída')}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 hover:scale-105 transition rounded-lg text-xs font-bold text-white uppercase"
                                  >
                                    CONCLUIR TROCA
                                  </button>
                                )}

                                {t.status === 'Aguardando' && isRequester && (
                                  <button 
                                    onClick={() => handleUpdateTradeStatus(t.id, 'Cancelada')}
                                    className="px-3 py-1.5 bg-red-600/5 border border-red-500/20 hover:bg-red-500/10 rounded-lg text-xs font-bold text-red-400 uppercase transition"
                                  >
                                    Cancelar Proposta
                                  </button>
                                )}
                              </div>

                            </div>

                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* 4. PAINEL ADMINISTRATIVO */}
      {currentView === 'admin' && currentUser && (
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* Sidebar Lateral Admin */}
          <aside className="w-full lg:w-64 bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
            
            <div className="space-y-8">
              {/* Logo / Título */}
              <div>
                <div className="text-2xl font-title tracking-wider text-brand-yellow">🏆 CRIE SUA COPA</div>
                <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-red-400 tracking-widest mt-1">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>Painel Administrativo</span>
                </div>
              </div>

              {/* Botões do Menu Lateral */}
              <nav className="space-y-1.5">
                <button 
                  onClick={() => setActiveAdminTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center space-x-2.5 ${activeAdminTab === 'dashboard' ? 'bg-gradient-to-r from-brand-green to-emerald-800 text-brand-yellow border-l-4 border-l-brand-yellow shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0 text-brand-yellow" />
                  <span>Painel Estatístico</span>
                </button>
                
                <button 
                  onClick={() => setActiveAdminTab('usuarios')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center space-x-2.5 ${activeAdminTab === 'usuarios' ? 'bg-gradient-to-r from-brand-green to-emerald-800 text-brand-yellow border-l-4 border-l-brand-yellow shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Users className="w-4 h-4 shrink-0 text-brand-yellow" />
                  <span>Gerenciar Usuários</span>
                </button>

                <button 
                  onClick={() => setActiveAdminTab('figurinhas')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center space-x-2.5 ${activeAdminTab === 'figurinhas' ? 'bg-gradient-to-r from-brand-green to-emerald-800 text-brand-yellow border-l-4 border-l-brand-yellow shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Layers className="w-4 h-4 shrink-0 text-brand-yellow" />
                  <span>Catálogo Figurinhas</span>
                </button>

                <button 
                  onClick={() => setActiveAdminTab('trocas')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center space-x-2.5 ${activeAdminTab === 'trocas' ? 'bg-gradient-to-r from-brand-green to-emerald-800 text-brand-yellow border-l-4 border-l-brand-yellow shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ArrowLeftRight className="w-4 h-4 shrink-0 text-brand-yellow" />
                  <span>Mediar Trocas</span>
                </button>
              </nav>
            </div>

            {/* Sair do Admin */}
            <div className="pt-8 border-t border-white/5 mt-8 lg:mt-0">
              <div className="flex items-center space-x-3 text-left mb-4">
                <div className="p-2.5 bg-yellow-950 rounded-xl text-xs font-bold text-brand-yellow border border-brand-yellow/30">
                  ADM
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.nome}</div>
                  <div className="text-[10px] text-gray-500">Super Admin</div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/20 text-red-400 hover:text-white text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>SAIR PAINEL</span>
              </button>
            </div>

          </aside>

          {/* Área de Conteúdo Admin */}
          <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-x-hidden">
            
            {/* 4.1 DASHBOARD ADMIN (Painel estatístico) */}
            {activeAdminTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in-up">
                
                <div>
                  <h2 className="text-3xl font-title text-brand-yellow">DASHBOARD DE CONTROLE DA REDE</h2>
                  <p className="text-sm text-gray-400">Acompanhe as métricas de troca, controle de figurinhas e integridade da plataforma.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Total Usuários</span>
                    <span className="block text-3xl font-extrabold text-brand-yellow font-title tracking-wider mt-1.5">{users.length}</span>
                    <span className="block text-[10px] text-emerald-400 mt-1">● 100% ativos ou sob mediação</span>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Figuradas em Giro</span>
                    <span className="block text-3xl font-extrabold text-brand-yellow font-title tracking-wider mt-1.5">{stickers.length * 34}</span>
                    <span className="block text-[10px] text-emerald-400 mt-1">● Registros no banco simulado</span>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Negociações Concluídas</span>
                    <span className="block text-3xl font-extrabold text-brand-yellow font-title tracking-wider mt-1.5">{trades.filter(t => t.status === 'Concluída').length}</span>
                    <span className="block text-[10px] text-brand-yellow mt-1">★ 95% taxa de satisfação</span>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl">
                    <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">Aguardando Resposta</span>
                    <span className="block text-3xl font-extrabold text-brand-yellow font-title tracking-wider mt-1.5">{trades.filter(t => t.status === 'Aguardando').length}</span>
                    <span className="block text-[10px] text-amber-400 mt-1">⏱️ Necessitam mediação</span>
                  </div>
                </div>

                {/* Gráfico de Barras CSS Puro e Listas Admin */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Gráfico Barras CSS Puro */}
                  <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-6">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <BarChart2 className="w-5 h-5 text-brand-yellow" />
                      <span>Volume de Trocas Semanais</span>
                    </h3>
                    
                    {/* Barras do Gráfico */}
                    <div className="h-64 flex justify-between items-end gap-2 pt-6 border-b border-white/10 px-4 relative">
                      
                      {/* Grid Lines fictícias */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-white/5 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-1/2 border-t border-white/5 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-3/4 border-t border-white/5 pointer-events-none"></div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '35%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Seg</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '55%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Ter</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-brand-green border border-brand-yellow/20 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '80%' }}></div>
                        <span className="text-[10px] text-gray-200 mt-2 font-bold">Qua</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '42%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Qui</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '60%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Sex</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '90%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Sáb</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center group cursor-help">
                        <div className="w-full bg-slate-800 rounded-t-lg group-hover:bg-brand-yellow transition-all duration-500 ease-out" style={{ height: '75%' }}></div>
                        <span className="text-[10px] text-gray-400 mt-2">Dom</span>
                      </div>

                    </div>
                    <span className="block text-[11px] text-gray-500">Exibição de transações do calendário corrente (Maio/Junho)</span>
                  </div>

                  {/* Listas Top Procuradas */}
                  <div className="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top 5 Mais Desejadas</h3>
                    
                    <div className="space-y-3">
                      {topWantedStickers.map((s, idx) => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 font-bold font-title">#{idx + 1}</span>
                            <span>{s.emoji}</span>
                            <span className="text-gray-200 mt-0.5">{s.name} ({s.number})</span>
                          </div>
                          <span className="text-amber-400 font-bold">{s.countNeeded} pedidos</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 4.2 GERENCIAR USUÁRIOS ADMIN */}
            {activeAdminTab === 'usuarios' && (
              <div className="space-y-6 animate-fade-in-up">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-title text-brand-yellow">GERENCIAR CONTAS DE COLECIONADOR</h2>
                    <p className="text-sm text-gray-400">Ative ou bloqueie acessos, monitore o progresso do álbum pessoal e quantifique trocas.</p>
                  </div>

                  {/* Busca Admin Usuários */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute top-3 left-3" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchUserAdmin}
                      onChange={(e) => setSearchUserAdmin(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-yellow/50"
                    />
                  </div>
                </div>

                <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 uppercase text-gray-400 border-b border-white/5">
                          <th className="p-4 font-bold">Nome / E-mail</th>
                          <th className="p-4 font-bold">Data de Cadastro</th>
                          <th className="p-4 font-bold">Figurinhas</th>
                          <th className="p-4 font-bold">Progresso Álbum</th>
                          <th className="p-4 font-bold">Trocas</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsersForAdmin.map(u => (
                          <tr key={u.id} className="hover:bg-white/2 transition">
                            <td className="p-4">
                              <div className="font-bold text-white leading-none">{u.nome}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{u.email}</div>
                            </td>
                            <td className="p-4 text-gray-300">{u.dataCadastro}</td>
                            <td className="p-4 font-bold text-brand-yellow">{u.figurinhasCount} cards</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full bg-brand-green/20 text-emerald-400 font-bold border border-brand-green/20">
                                {u.progressoAlbum}%
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">{u.trocasCount} completas</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-tight text-[10px] ${u.status === 'Ativo' ? 'bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/20' : 'bg-brand-green/20 hover:bg-brand-green/40 text-emerald-300 border border-brand-green/20'}`}
                              >
                                {u.status === 'Ativo' ? 'Desativar' : 'Reativar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 4.3 GERENCIAR FIGURINHAS CATALOGO */}
            {activeAdminTab === 'figurinhas' && (
              <div className="space-y-6 animate-fade-in-up">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-title text-brand-yellow">CATÁLOGO GERAL DE FIGURINHAS</h2>
                    <p className="text-sm text-gray-400">Verifique os quantitativos em estoque, ordem de raridade e demanda dos colecionadores.</p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                    {/* Ordenabilidade */}
                    <select 
                      value={sortStickerAdmin}
                      onChange={(e) => setSortStickerAdmin(e.target.value as any)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option className="bg-[#0a1a0f]" value="PADRAO">Ordenação Padrão</option>
                      <option className="bg-[#0a1a0f]" value="MAIS_PROCURADAS">Mais procuradas</option>
                      <option className="bg-[#0a1a0f]" value="MAIS_REPETIDAS">Mais ofertadas</option>
                    </select>

                    {/* Busca */}
                    <div className="relative w-full sm:w-56">
                      <Search className="w-4 h-4 text-gray-400 absolute top-2.5 left-3" />
                      <input 
                        type="text" 
                        placeholder="Filtrar por jogador..."
                        value={searchStickerAdmin}
                        onChange={(e) => setSearchStickerAdmin(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 uppercase text-gray-400 border-b border-white/5">
                          <th className="p-4 font-bold">Número</th>
                          <th className="p-4 font-bold">Nome Jogador</th>
                          <th className="p-4 font-bold">Seleção</th>
                          <th className="p-4 font-bold">Raridade</th>
                          <th className="p-4 font-bold">Disponível Troca (Repetidas)</th>
                          <th className="p-4 font-bold">Requisitado (Preciso)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredStickersForAdmin.map(s => (
                          <tr key={s.id} className="hover:bg-white/2 transition">
                            <td className="p-4 font-bold text-brand-yellow font-mono">{s.number}</td>
                            <td className="p-4 font-bold text-white">{s.name}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1.5">
                                <span>{s.emoji}</span>
                                <span>{s.country}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${s.rarity === 'ESPECIAL' ? 'bg-yellow-500/10 text-brand-yellow' : s.rarity === 'RARO' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                {s.rarity}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-emerald-400">{s.countRepeated} registradas</td>
                            <td className="p-4 font-bold text-amber-500">{s.countNeeded} necessitam</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 4.4 GERENCIAR INTERVENSÃO DE TROCAS */}
            {activeAdminTab === 'trocas' && (
              <div className="space-y-6 animate-fade-in-up">
                
                <div>
                  <h2 className="text-3xl font-title text-brand-yellow">MEDIAR E INTERVIR EM TROCAS</h2>
                  <p className="text-sm text-gray-400">Verifique e resolva litígios, cancele trocas inadequadas nas movimentações de rede.</p>
                </div>

                <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 uppercase text-gray-400 border-b border-white/5">
                          <th className="p-4 font-bold">ID Transição</th>
                          <th className="p-4 font-bold">Envolvidos (Solicitante / Parceiro)</th>
                          <th className="p-4 font-bold">Figurinhas Troca</th>
                          <th className="p-4 font-bold">Status Atual</th>
                          <th className="p-4 font-bold">Data</th>
                          <th className="p-4 font-bold text-center">Mediação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {trades.map(t => (
                          <tr key={t.id} className="hover:bg-white/2 transition">
                            <td className="p-4 font-mono text-gray-500">{t.id}</td>
                            <td className="p-4">
                              <div className="font-bold text-white">{t.usuarioSolicitanteNome}</div>
                              <div className="text-brand-yellow font-bold mt-1">↔️ {t.usuarioParceiroNome}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-red-400 font-bold">Oferece: {t.figurinhaOferecida}</div>
                              <div className="text-emerald-400 font-bold mt-1">Deseja: {t.figurinhaDesejada}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'Aceita' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                t.status === 'Concluída' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                t.status === 'Cancelada' ? 'bg-red-500/20 text-red-500 border border-red-500/25' :
                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/25'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">{t.data}</td>
                            <td className="p-4 text-center">
                              {t.status !== 'Cancelada' && t.status !== 'Concluída' ? (
                                <button 
                                  onClick={() => handleAdminInterveneTrade(t.id)}
                                  className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/20 font-bold uppercase text-[9px]"
                                >
                                  Intervir (Cancelar)
                                </button>
                              ) : (
                                <span className="text-gray-600">Encerrado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* --- MODAIS DE CADASTRO E PROPOSTAS --- */}

      {/* MODAL ADICIONAR FIGURINHA AO ÁLBUM */}
      {isAddStickerOpen && (
        <div className="fixed inset-0 bg-[#0a1a0f]/80 backdrop-blur-md flex items-center justify-center p-4 z-100 animate-fade-in-up">
          <div className="w-full max-w-lg glass-panel-heavy p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative text-left">
            
            <button 
              onClick={() => setIsAddStickerOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-title text-brand-yellow mb-2">ADICIONAR NOVA FIGURINHA</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-extrabold mb-6">Insira no seu Álbum de Trocas</p>

            <form onSubmit={handleAddStickerToInventory} className="space-y-4">
              
              {/* Opção Clássica ou Manual */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-bg-dark/80 rounded-xl border border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsManualSticker(false)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition ${!isManualSticker ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Selecionar da Lista
                </button>
                <button 
                  type="button"
                  onClick={() => setIsManualSticker(true)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition ${isManualSticker ? 'bg-brand-green text-brand-yellow' : 'text-gray-400'}`}
                >
                  Digitação Manual
                </button>
              </div>

              {/* LISTA GERAL PRÉ-CADASTRADA */}
              {!isManualSticker ? (
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Selecione o Craque</label>
                  <select 
                    value={newStickerIdSelected}
                    onChange={(e) => setNewStickerIdSelected(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-yellow/50 focus:bg-emerald-950/20"
                    required
                  >
                    <option value="" className="bg-[#0a1a0f]">-- Escolha a figurinha desejada --</option>
                    {stickers.map(s => (
                      <option className="bg-[#0a1a0f]" key={s.id} value={s.id}>
                        {s.number} - {s.name} ({s.country})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                // CAMPOS DE DIGITAÇÃO MANUAL
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Nº / Série</label>
                      <input 
                        type="text" 
                        placeholder="Ex: BRA 11"
                        value={manualStickerNumber}
                        onChange={(e) => setManualStickerNumber(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-brand-yellow/50 rounded-xl text-xs text-white placeholder-gray-500Focus focus:outline-none"
                        required={isManualSticker}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Jogador</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Richarlison"
                        value={manualStickerName}
                        onChange={(e) => setManualStickerName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 focus:border-brand-yellow/50 rounded-xl text-xs text-white placeholder-gray-500Focus focus:outline-none"
                        required={isManualSticker}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Seleção</label>
                      <select
                        value={manualStickerCountry}
                        onChange={(e) => setManualStickerCountry(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white uppercase focus:outline-none"
                      >
                        <option className="bg-[#0a1a0f]" value="Brasil">Brasil</option>
                        <option className="bg-[#0a1a0f]" value="Argentina">Argentina</option>
                        <option className="bg-[#0a1a0f]" value="Portugal">Portugal</option>
                        <option className="bg-[#0a1a0f]" value="França">França</option>
                        <option className="bg-[#0a1a0f]" value="Alemanha">Alemanha</option>
                        <option className="bg-[#0a1a0f]" value="Inglaterra">Inglaterra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Raridade</label>
                      <select
                        value={manualStickerRarity}
                        onChange={(e) => setManualStickerRarity(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option className="bg-[#0a1a0f]" value="COMUM">COMUM</option>
                        <option className="bg-[#0a1a0f]" value="RARO">RARO</option>
                        <option className="bg-[#0a1a0f]" value="ESPECIAL">ESPECIAL</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status e Quantitativo */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Status Pessoal</label>
                  <select 
                    value={newStickerStatus}
                    onChange={(e) => setNewStickerStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    required
                  >
                    <option className="bg-[#0a1a0f]" value="Tenho repetida">Tenho repetida</option>
                    <option className="bg-[#0a1a0f]" value="Preciso">Preciso</option>
                    <option className="bg-[#0a1a0f]" value="Tenho única">Tenho única</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Quantidade</label>
                  <input 
                    type="number" 
                    min={1}
                    max={50}
                    disabled={newStickerStatus === 'Preciso'}
                    value={newStickerStatus === 'Preciso' ? 0 : newStickerQty}
                    onChange={(e) => setNewStickerQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 disabled:opacity-40 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 text-sm font-extrabold bg-gradient-to-r from-brand-yellow to-amber-500 text-bg-dark rounded-xl shadow-lg hover:scale-[1.01] transition duration-300"
                >
                  REGISTRAR NA COLEÇÃO
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL PROPOR TROCA */}
      {isProposeTradeOpen && targetStickerToTrade && (
        <div className="fixed inset-0 bg-[#0a1a0f]/80 backdrop-blur-md flex items-center justify-center p-4 z-100 animate-fade-in-up">
          <div className="w-full max-w-lg glass-panel-heavy p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative text-left">
            
            <button 
              onClick={() => setIsProposeTradeOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-title text-brand-yellow mb-2">PROPOR TROCA INTERATIVA</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-extrabold mb-6">Ofereça uma de suas repetidas</p>

            <form onSubmit={handleCreateTradeProposal} className="space-y-6">
              
              {/* O que você quer conseguir */}
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-brand-green/25">
                <span className="block text-[10px] text-brand-yellow font-extrabold uppercase tracking-wider mb-2">Você vai Receber</span>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>{targetStickerToTrade.emoji} {targetStickerToTrade.name}</span>
                  <span className="text-brand-yellow">{targetStickerToTrade.number}</span>
                </div>
              </div>

              {/* O que você vai dar em troca (suas repetidas) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">O que você deseja Oferecer em Troca?</label>
                <select 
                  value={myOfferedStickerId}
                  onChange={(e) => setMyOfferedStickerId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-yellow/50"
                  required
                >
                  {Object.entries(userInventory)
                    .filter(([_, inv]: [string, any]) => inv.status === 'Tenho repetida')
                    .map(([id, _]) => stickers.find(s => s.id === id))
                    .filter((s): s is Sticker => !!s)
                    .map(s => (
                      <option className="bg-[#0a1a0f]" key={s.id} value={s.id}>
                        {s.number} - {s.name} ({s.country})
                      </option>
                    ))}
                </select>
                <span className="block text-[10px] text-gray-500 mt-2">Apenas as figurinhas que você marcou como <strong>Repetidas</strong> na aba "Minhas Figurinhas" serão listadas aqui.</span>
              </div>

              <div>
                <button 
                  type="submit"
                  className="w-full py-4 text-sm font-extrabold bg-gradient-to-r from-brand-yellow to-amber-500 text-bg-dark rounded-xl shadow-lg hover:scale-[1.01] transition-all duration-300"
                >
                  CONFIRMAR E ENVIAR SOLICITAÇÃO
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
