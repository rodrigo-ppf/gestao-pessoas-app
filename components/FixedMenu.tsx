import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  section: string;
  requiresAuth?: boolean;
  allowedProfiles?: string[];
}

interface FixedMenuProps {
  onClose?: () => void;
}

export default function FixedMenu({ onClose }: FixedMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Gestão': true,
    'Tarefas': false,
    'Ponto': false,
    'Férias': false,
    'Documentos': false,
    'Configurações': false,
  });

  const menuItems: MenuItem[] = [
    // Gestão
    { title: 'Dashboard', icon: 'view-dashboard', route: '/home', section: 'Gestão' },
    { title: 'Gerenciar Equipe', icon: 'account-group', route: '/gerenciar-equipe', section: 'Gestão' },
    { title: 'Cadastrar Gestor', icon: 'account-tie', route: '/cadastro-lider', section: 'Gestão' },
    { title: 'Cadastrar Colaborador', icon: 'account-plus', route: '/cadastro-funcionario', section: 'Gestão' },
    
    // Tarefas
    { title: 'Criar Tarefa', icon: 'plus-circle', route: '/criar-tarefa', section: 'Tarefas' },
    { title: 'Listar Tarefas', icon: 'clipboard-list', route: '/tarefas', section: 'Tarefas' },
    { title: 'Atribuir em Lote', icon: 'account-multiple-plus', route: '/atribuir-tarefas-lote', section: 'Tarefas', requiresAuth: true, allowedProfiles: ['gestor', 'dono_empresa'] },
    
    // Ponto
    { title: 'Registrar Ponto', icon: 'clock-in', route: '/registrar-ponto', section: 'Ponto' },
    { title: 'Histórico de Ponto', icon: 'history', route: '/historico-ponto', section: 'Ponto' },
    { title: 'Aprovar Pontos', icon: 'check-circle', route: '/aprovar-pontos', section: 'Ponto', requiresAuth: true, allowedProfiles: ['gestor', 'dono_empresa'] },
    
    // Férias
    { title: 'Solicitar Férias', icon: 'calendar-heart', route: '/solicitar-ferias', section: 'Férias' },
    { title: 'Histórico de Férias', icon: 'calendar-clock', route: '/historico-ferias', section: 'Férias' },
    { title: 'Aprovar Férias', icon: 'calendar-check', route: '/aprovar-ferias', section: 'Férias', requiresAuth: true, allowedProfiles: ['gestor', 'dono_empresa'] },
    
    // Documentos
    { title: 'Upload de Documentos', icon: 'file-upload', route: '/upload-documentos', section: 'Documentos' },
    { title: 'Aprovar Documentos', icon: 'file-check', route: '/aprovar-documentos', section: 'Documentos', requiresAuth: true, allowedProfiles: ['gestor', 'dono_empresa'] },
    { title: 'Justificativas', icon: 'file-document-edit', route: '/justificativas', section: 'Documentos' },
    
    // Configurações
    { title: 'Reativar Dashboard', icon: 'eye', route: 'show-dashboard', section: 'Configurações', requiresAuth: true },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (route: string) => {
    // Fechar o menu antes de navegar
    if (onClose) {
      onClose();
    }
    
    if (route === 'show-dashboard') {
      handleShowDashboard();
    } else {
      router.push(route);
    }
  };

  const handleShowDashboard = async () => {
    if (!user) return;

    Alert.alert(
      'Reativar Dashboard',
      'Deseja reativar o dashboard de onboarding?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reativar',
          onPress: async () => {
            try {
              await MockDataService.updateUsuarioPreferencias(user.id, {
                mostrarDashboard: true
              });
              Alert.alert('Sucesso', 'Dashboard reativado com sucesso!');
              router.push('/home');
            } catch (error) {
              console.error('Erro ao reativar dashboard:', error);
              Alert.alert('Erro', 'Não foi possível reativar o dashboard.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    console.log('=== INICIANDO LOGOUT ===');
    console.log('Usuário atual:', user);
    console.log('Função logout disponível:', typeof logout);
    
    console.log('=== EXIBINDO ALERTA DE CONFIRMAÇÃO ===');
    
    // Verificar se estamos no ambiente web
    if (typeof window !== 'undefined') {
      console.log('=== USANDO CONFIRMAÇÃO NATIVA DO BROWSER ===');
      const confirmar = window.confirm('Deseja realmente sair do sistema?');
      
      if (confirmar) {
        console.log('=== CONFIRMANDO LOGOUT ===');
        executarLogout();
      } else {
        console.log('=== LOGOUT CANCELADO ===');
      }
    } else {
      console.log('=== USANDO ALERT NATIVO ===');
      Alert.alert(
        'Sair do Sistema',
        'Deseja realmente sair do sistema?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('=== LOGOUT CANCELADO ===');
            }
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: executarLogout,
          },
        ]
      );
    }
  };

  const executarLogout = async () => {
    try {
      console.log('=== CONFIRMANDO LOGOUT ===');
      
      // Fechar o menu antes do logout
      if (onClose) {
        console.log('Fechando menu...');
        onClose();
      }
      
      console.log('Chamando função logout...');
      await logout();
      console.log('Logout concluído com sucesso');
      
      // Forçar navegação para login
      console.log('Navegando para login...');
      try {
        router.replace('/login');
        console.log('Navegação para login executada');
      } catch (navError) {
        console.error('Erro na navegação:', navError);
        // Tentar navegação alternativa
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível sair do sistema.');
    }
  };

  const isItemVisible = (item: MenuItem) => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated || !user) return false;
    if (!item.allowedProfiles) {
      // Para itens sem allowedProfiles, verificar se é o "Reativar Dashboard"
      if (item.route === 'show-dashboard') {
        return user.preferencias?.mostrarDashboard === false;
      }
      return true;
    }
    return item.allowedProfiles.includes(user.perfil);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!isItemVisible(item)) return acc;
    
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.primary }]}>
          Menu
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <UniversalIcon 
              name="close" 
              size={24} 
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedItems).map(([section, items]) => (
        <View key={section} style={styles.section}>
          <List.Accordion
            title={section}
            titleStyle={[styles.sectionTitle, { color: theme.colors.primary }]}
            expanded={expandedSections[section]}
            onPress={() => toggleSection(section)}
            left={(props) => (
              <UniversalIcon 
                name={expandedSections[section] ? "chevron-down" : "chevron-right"} 
                size={20} 
                color={theme.colors.primary} 
              />
            )}
            style={styles.accordion}
          >
            {items.map((item, index) => (
              <List.Item
                key={index}
                title={item.title}
                left={(props) => <UniversalIcon name={item.icon} size={20} color={theme.colors.onSurface} />}
                onPress={() => handleNavigation(item.route)}
                style={styles.listItem}
                titleStyle={styles.itemTitle}
              />
            ))}
          </List.Accordion>
        </View>
        ))}
        
        {/* Seção de Logout */}
        {isAuthenticated && (
          <View style={styles.logoutSection}>
            <Divider style={styles.logoutDivider} />
            <List.Item
              title="Sair do Sistema"
              left={(props) => <UniversalIcon name="logout" size={20} color="#f44336" />}
              onPress={() => {
                console.log('=== BOTÃO SAIR CLICADO ===');
                console.log('isAuthenticated:', isAuthenticated);
                console.log('user:', user);
                handleLogout();
              }}
              style={styles.logoutItem}
              titleStyle={[styles.logoutTitle, { color: '#f44336' }]}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: isSmallScreen ? 280 : 320,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  divider: {
    marginVertical: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 4,
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  listItem: {
    paddingLeft: 32,
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 14,
  },
  logoutSection: {
    marginTop: 16,
  },
  logoutDivider: {
    marginVertical: 8,
  },
  logoutItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
