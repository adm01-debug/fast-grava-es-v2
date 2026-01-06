/**
 * Micro-copy System
 * Centralized UX writing for consistent, friendly, and accessible messaging
 */

// Time-based greetings
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Boa madrugada';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 10) return 'agora mesmo';
  if (diffSec < 60) return 'há alguns segundos';
  if (diffMin < 2) return 'há 1 minuto';
  if (diffMin < 60) return `há ${diffMin} minutos`;
  if (diffHour < 2) return 'há 1 hora';
  if (diffHour < 24) return `há ${diffHour} horas`;
  if (diffDay < 2) return 'ontem';
  if (diffDay < 7) return `há ${diffDay} dias`;
  if (diffWeek < 2) return 'há 1 semana';
  if (diffWeek < 4) return `há ${diffWeek} semanas`;
  if (diffMonth < 2) return 'há 1 mês';
  if (diffMonth < 12) return `há ${diffMonth} meses`;
  return target.toLocaleDateString('pt-BR');
}

// Pluralization helper
export function pluralize(count: number, singular: string, plural?: string): string {
  const p = plural || `${singular}s`;
  return count === 1 ? singular : p;
}

// Count with noun
export function countWithNoun(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

// Micro-copy collections by context
export const microcopy = {
  // Empty states
  empty: {
    jobs: {
      title: 'Nenhum job encontrado',
      description: 'Comece criando seu primeiro job de produção',
      action: 'Criar Job',
    },
    operators: {
      title: 'Nenhum operador cadastrado',
      description: 'Adicione operadores para começar a gerenciar sua equipe',
      action: 'Adicionar Operador',
    },
    machines: {
      title: 'Nenhuma máquina registrada',
      description: 'Cadastre suas máquinas para monitorar a produção',
      action: 'Cadastrar Máquina',
    },
    notifications: {
      title: 'Tudo em dia!',
      description: 'Você não tem notificações pendentes',
      action: null,
    },
    search: {
      title: 'Nenhum resultado',
      description: 'Tente ajustar os filtros ou termos de busca',
      action: 'Limpar Filtros',
    },
    calendar: {
      title: 'Agenda livre',
      description: 'Nenhum evento programado para este período',
      action: 'Agendar Job',
    },
    documents: {
      title: 'Nenhum documento',
      description: 'Faça upload de documentos técnicos para começar',
      action: 'Fazer Upload',
    },
  },

  // Error states
  errors: {
    generic: {
      title: 'Algo deu errado',
      description: 'Ocorreu um erro inesperado. Tente novamente.',
      action: 'Tentar Novamente',
    },
    network: {
      title: 'Problema de conexão',
      description: 'Verifique sua conexão com a internet e tente novamente.',
      action: 'Reconectar',
    },
    notFound: {
      title: 'Página não encontrada',
      description: 'O conteúdo que você procura não existe ou foi movido.',
      action: 'Voltar ao Início',
    },
    forbidden: {
      title: 'Acesso negado',
      description: 'Você não tem permissão para acessar este recurso.',
      action: 'Voltar',
    },
    sessionExpired: {
      title: 'Sessão expirada',
      description: 'Por segurança, sua sessão expirou. Faça login novamente.',
      action: 'Fazer Login',
    },
    validation: {
      title: 'Dados inválidos',
      description: 'Verifique os campos destacados e corrija os erros.',
      action: 'Revisar',
    },
  },

  // Loading states
  loading: {
    default: 'Carregando...',
    data: 'Buscando dados...',
    saving: 'Salvando...',
    processing: 'Processando...',
    uploading: 'Enviando arquivo...',
    generating: 'Gerando relatório...',
    syncing: 'Sincronizando...',
  },

  // Success messages
  success: {
    saved: 'Salvo com sucesso!',
    created: 'Criado com sucesso!',
    updated: 'Atualizado com sucesso!',
    deleted: 'Removido com sucesso!',
    copied: 'Copiado!',
    sent: 'Enviado com sucesso!',
    uploaded: 'Upload concluído!',
    imported: 'Importado com sucesso!',
    exported: 'Exportado com sucesso!',
  },

  // Form labels and placeholders
  form: {
    required: 'Obrigatório',
    optional: 'Opcional',
    search: 'Buscar...',
    searchPlaceholder: 'Digite para buscar...',
    selectPlaceholder: 'Selecione uma opção',
    noOptions: 'Nenhuma opção disponível',
    loading: 'Carregando opções...',
    minChars: (min: number) => `Digite pelo menos ${min} caracteres`,
    maxChars: (max: number) => `Máximo de ${max} caracteres`,
    passwordHint: 'Mínimo 8 caracteres, incluindo número e letra',
  },

  // Confirmation dialogs
  confirm: {
    delete: {
      title: 'Confirmar exclusão',
      description: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirm: 'Excluir',
      cancel: 'Cancelar',
    },
    unsavedChanges: {
      title: 'Alterações não salvas',
      description: 'Você tem alterações não salvas. Deseja sair mesmo assim?',
      confirm: 'Sair sem salvar',
      cancel: 'Continuar editando',
    },
    logout: {
      title: 'Sair do sistema',
      description: 'Você será desconectado. Deseja continuar?',
      confirm: 'Sair',
      cancel: 'Cancelar',
    },
  },

  // Action buttons
  actions: {
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Visualizar',
    create: 'Criar',
    add: 'Adicionar',
    remove: 'Remover',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    submit: 'Enviar',
    retry: 'Tentar novamente',
    refresh: 'Atualizar',
    export: 'Exportar',
    import: 'Importar',
    download: 'Baixar',
    upload: 'Enviar',
    share: 'Compartilhar',
    copy: 'Copiar',
    print: 'Imprimir',
    filter: 'Filtrar',
    clear: 'Limpar',
    search: 'Buscar',
    apply: 'Aplicar',
    reset: 'Redefinir',
    expand: 'Expandir',
    collapse: 'Recolher',
    more: 'Ver mais',
    less: 'Ver menos',
  },

  // Status labels
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    completed: 'Concluído',
    inProgress: 'Em andamento',
    cancelled: 'Cancelado',
    paused: 'Pausado',
    scheduled: 'Agendado',
    delayed: 'Atrasado',
    ready: 'Pronto',
    online: 'Online',
    offline: 'Offline',
    maintenance: 'Em manutenção',
  },

  // Tooltips
  tooltips: {
    moreOptions: 'Mais opções',
    notifications: 'Notificações',
    settings: 'Configurações',
    help: 'Ajuda',
    profile: 'Perfil',
    logout: 'Sair',
    darkMode: 'Modo escuro',
    lightMode: 'Modo claro',
    fullscreen: 'Tela cheia',
    exitFullscreen: 'Sair da tela cheia',
    refresh: 'Atualizar dados',
    export: 'Exportar dados',
    filter: 'Filtrar resultados',
    sort: 'Ordenar',
    columns: 'Colunas visíveis',
  },

  // Gamification
  gamification: {
    levelUp: (level: number) => `Parabéns! Você alcançou o nível ${level}!`,
    achievement: (name: string) => `Conquista desbloqueada: ${name}`,
    streak: (days: number) => `${days} ${pluralize(days, 'dia', 'dias')} consecutivo${days === 1 ? '' : 's'}!`,
    points: (points: number) => `+${points} ${pluralize(points, 'ponto', 'pontos')}`,
    ranking: (position: number) => `Você está em ${position}º lugar`,
  },

  // Time-sensitive messages
  timeSensitive: {
    justNow: 'Agora mesmo',
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',
    thisWeek: 'Esta semana',
    nextWeek: 'Próxima semana',
    thisMonth: 'Este mês',
  },
};

// Dynamic message generators
export const messages = {
  welcome: (name: string) => `${getGreeting()}, ${name}!`,
  itemCount: (count: number, item: string) => 
    count === 0 ? `Nenhum ${item}` : countWithNoun(count, item),
  remainingTime: (minutes: number) => 
    minutes < 1 ? 'Menos de 1 minuto restante' : `${minutes} ${pluralize(minutes, 'minuto')} restante${minutes === 1 ? '' : 's'}`,
  progress: (current: number, total: number) => 
    `${current} de ${total} (${Math.round((current / total) * 100)}%)`,
  lastUpdated: (date: Date | string) => 
    `Última atualização: ${formatRelativeTime(date)}`,
  searchResults: (count: number, query: string) =>
    count === 0 
      ? `Nenhum resultado para "${query}"` 
      : `${countWithNoun(count, 'resultado')} para "${query}"`,
  confirmDelete: (item: string) =>
    `Tem certeza que deseja excluir "${item}"? Esta ação não pode ser desfeita.`,
  savingChanges: () => 'Salvando suas alterações...',
  changesLost: () => 'Tem certeza? Você perderá as alterações não salvas.',
};

// Hook for using micro-copy with context
export function useMicrocopy() {
  return {
    getGreeting,
    formatRelativeTime,
    pluralize,
    countWithNoun,
    microcopy,
    messages,
  };
}
