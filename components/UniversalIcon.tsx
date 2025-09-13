import { StyleProp, Text, TextStyle } from 'react-native';

interface UniversalIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// Mapeamento completo de ícones para emojis
const getIconEmoji = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    // Navegação
    'arrow-left': '←',
    'arrow-right': '→',
    'arrow-up': '↑',
    'arrow-down': '↓',
    'chevron-left': '‹',
    'chevron-right': '›',
    'chevron-up': 'ˆ',
    'chevron-down': 'ˇ',
    
    // Segurança e autenticação
    'lock': '🔒',
    'unlock': '🔓',
    'shield': '🛡️',
    'key': '🔑',
    
    // Menu e navegação
    'menu': '☰',
    'home': '🏠',
    'back': '←',
    'close': '✕',
    'check': '✓',
    'check-circle': '✅',
    'close-circle': '❌',
    'help-circle': '❓',
    'dots-vertical': '⋮',
    'plus': '➕',
    'minus': '➖',
    'edit': '✏️',
    'delete': '🗑️',
    'save': '💾',
    'logout': '🚪',
    
    // Usuários e perfis
    'account': '👤',
    'account-group': '👥',
    'account-plus': '👤➕',
    'account-arrow-right': '👤→',
    'user': '👤',
    'users': '👥',
    
    // Empresas e organizações
    'domain': '🏢',
    'domain-plus': '🏢➕',
    'building': '🏢',
    'office-building': '🏢',
    'company': '🏢',
    
    // Tarefas e trabalho
    'clipboard-list': '📋',
    'clipboard': '📋',
    'task': '✅',
    'check-circle': '✅',
    'calendar': '📅',
    'calendar-today': '📅',
    'calendar-month': '📅',
    'calendar-range': '📅',
    'clock': '🕐',
    'time': '⏰',
    'schedule': '📅',
    
    // Férias e tempo livre
    'beach': '🏖️',
    'calendar-heart': '💕',
    'vacation': '🏖️',
    
    // Documentos e arquivos
    'upload': '📤',
    'download': '📥',
    'file': '📄',
    'document': '📄',
    'folder': '📁',
    
    // Relatórios e gráficos
    'chart-line': '📈',
    'chart-bar': '📊',
    'chart-pie': '🥧',
    'analytics': '📊',
    
    // Histórico e tempo
    'history': '📜',
    'clock-outline': '🕐',
    'timer': '⏱️',
    
    // Configurações e sistema
    'settings': '⚙️',
    'cog': '⚙️',
    'translate': '🌐',
    'language': '🌐',
    'flag': '🏳️',
    
    // Ações e botões
    'play': '▶️',
    'pause': '⏸️',
    'stop': '⏹️',
    'refresh': '🔄',
    'reload': '🔄',
    'search': '🔍',
    'filter': '🔍',
    'sort': '🔀',
    'eye': '👁️',
    'eye-off': '🙈',
    
    // Comunicação
    'email': '📧',
    'mail': '📧',
    'phone': '📞',
    'message': '💬',
    'chat': '💬',
    
    // Status e notificações
    'alert': '⚠️',
    'warning': '⚠️',
    'error': '❌',
    'success': '✅',
    'info': 'ℹ️',
    'notification': '🔔',
    
    // Outros
    'star': '⭐',
    'heart': '❤️',
    'like': '👍',
    'dislike': '👎',
    'share': '📤',
    'copy': '📋',
    'paste': '📋',
    'cut': '✂️',
    
    // Fallback
    'default': '📄',
  };
  
  return iconMap[iconName] || iconMap['default'];
};

export default function UniversalIcon({ name, size = 24, color = '#000', style }: UniversalIconProps) {
  const emoji = getIconEmoji(name);
  
  return (
    <Text 
      style={[
        {
          fontSize: size,
          color: color,
          textAlign: 'center',
          lineHeight: size,
        },
        style
      ]}
    >
      {emoji}
    </Text>
  );
}
