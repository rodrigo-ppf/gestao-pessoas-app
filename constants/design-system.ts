// Sistema de Design - Gestão de Pessoas
export const DesignSystem = {
  // Cores
  colors: {
    primary: '#1976d2',      // Azul principal
    primaryLight: '#42a5f5', // Azul claro
    primaryDark: '#1565c0',  // Azul escuro
    
    secondary: '#26a69a',    // Verde água
    secondaryLight: '#4db6ac',
    secondaryDark: '#00695c',
    
    success: '#4caf50',      // Verde sucesso
    warning: '#ff9800',      // Laranja aviso
    error: '#f44336',        // Vermelho erro
    info: '#2196f3',         // Azul informação
    
    // Neutros
    background: '#fafafa',   // Fundo claro
    surface: '#ffffff',      // Superfície
    surfaceVariant: '#f5f5f5', // Superfície variante
    
    text: {
      primary: '#212121',    // Texto principal
      secondary: '#757575',  // Texto secundário
      disabled: '#bdbdbd',   // Texto desabilitado
      hint: '#9e9e9e',       // Texto de dica
    },
    
    // Status
    status: {
      pending: '#ff9800',    // Pendente
      inProgress: '#2196f3', // Em andamento
      completed: '#4caf50',  // Concluído
      cancelled: '#f44336',  // Cancelado
    },
    
    // Perfis
    profiles: {
      admin_sistema: '#f44336',    // Admin sistema - vermelho
      dono_empresa: '#9c27b0',     // Dono empresa - roxo
      lider: '#ff9800',            // Líder - laranja
      colaborador: '#4caf50',      // Colaborador - verde
    }
  },
  
  // Tipografia
  typography: {
    fontFamily: {
      primary: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      secondary: 'Roboto, sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Espaçamento
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  // Bordas
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  // Sombras
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '320px',
    mobileLg: '425px',
    tablet: '768px',
    desktop: '1024px',
    desktopLg: '1440px',
  }
};

// Componentes reutilizáveis
export const ComponentStyles = {
  card: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
    boxShadow: DesignSystem.shadows.sm,
    border: `1px solid ${DesignSystem.colors.surfaceVariant}`,
  },
  
  button: {
    primary: {
      backgroundColor: DesignSystem.colors.primary,
      color: DesignSystem.colors.surface,
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing.sm} ${DesignSystem.spacing.lg}`,
      minHeight: '48px',
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.medium,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: DesignSystem.colors.primary,
      border: `2px solid ${DesignSystem.colors.primary}`,
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing.sm} ${DesignSystem.spacing.lg}`,
      minHeight: '48px',
    }
  },
  
  input: {
    backgroundColor: DesignSystem.colors.surface,
    border: `1px solid ${DesignSystem.colors.text.disabled}`,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    fontSize: DesignSystem.typography.fontSize.base,
    minHeight: '48px',
  },
  
  badge: {
    padding: `${DesignSystem.spacing.xs} ${DesignSystem.spacing.sm}`,
    borderRadius: DesignSystem.borderRadius.full,
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    textTransform: 'uppercase' as const,
  }
};

// Utilitários
export const getProfileColor = (profile: string) => {
  return DesignSystem.colors.profiles[profile as keyof typeof DesignSystem.colors.profiles] || DesignSystem.colors.text.secondary;
};

export const getStatusColor = (status: string) => {
  return DesignSystem.colors.status[status as keyof typeof DesignSystem.colors.status] || DesignSystem.colors.text.secondary;
};
