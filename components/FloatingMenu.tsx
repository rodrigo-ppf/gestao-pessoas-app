import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, FAB, List, Modal, Portal, Text, useTheme } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  section?: string;
  profiles?: string[];
}

const getMenuItems = (t: any): MenuItem[] => [
  // Seção Principal
  { title: t('navigation.home'), icon: 'home', route: '/home', section: t('navigation.main'), profiles: ['admin_sistema', 'admin_empresa', 'colaborador'] },
  
  // Seção Empresas (apenas admin_sistema)
  { title: t('navigation.companies'), icon: 'domain', route: '/company-list', section: t('navigation.companies'), profiles: ['admin_sistema'] },
  { title: t('company.registerCompany'), icon: 'plus-circle', route: '/cadastro-empresa', section: t('navigation.companies'), profiles: ['admin_sistema'] },
  
  // Seção Colaboradores
  { title: t('navigation.collaborators'), icon: 'account-group', route: '/colaboradores', section: t('navigation.collaborators'), profiles: ['admin_sistema', 'dono_empresa'] },
  { title: 'Gerenciar Equipe', icon: 'account-group', route: '/gerenciar-equipe', section: t('navigation.collaborators'), profiles: ['dono_empresa'] },
  { title: 'Cadastrar Líder', icon: 'account-plus', route: '/cadastro-lider', section: t('navigation.collaborators'), profiles: ['dono_empresa'] },
  { title: 'Cadastrar Funcionário', icon: 'account-plus', route: '/cadastro-funcionario', section: t('navigation.collaborators'), profiles: ['dono_empresa'] },
  { title: t('user.registerUser'), icon: 'account-plus', route: '/cadastro-usuario', section: t('navigation.collaborators'), profiles: ['admin_sistema'] },
  { title: t('navigation.profile'), icon: 'account', route: '/perfil', section: t('navigation.collaborators'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },
  
  // Seção Tarefas
  { title: t('navigation.tasks'), icon: 'clipboard-list', route: '/tarefas', section: t('navigation.tasks'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },
  { title: t('task.createTask'), icon: 'plus', route: '/criar-tarefa', section: t('navigation.tasks'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },
  { title: 'Agenda', icon: 'calendar', route: '/agenda', section: t('navigation.tasks'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },

  // Seção Ponto
  { title: t('timeTracking.title'), icon: 'clock', route: '/registrar-ponto', section: t('navigation.timeTracking'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },
  { title: 'Histórico Ponto', icon: 'history', route: '/historico-ponto', section: t('navigation.timeTracking'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },
  { title: 'Aprovar Ponto', icon: 'check-circle', route: '/aprovar-ponto', section: t('navigation.timeTracking'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },

  // Seção Férias
  { title: t('vacation.requestVacation'), icon: 'beach', route: '/solicitar-ferias', section: t('navigation.vacation'), profiles: ['funcionario'] },
  { title: 'Histórico Férias', icon: 'history', route: '/historico-ferias', section: t('navigation.vacation'), profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },
  { title: 'Aprovar Férias', icon: 'check-circle', route: '/aprovar-ferias', section: t('navigation.vacation'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },

  // Seção Documentos
  { title: 'Upload Documento', icon: 'upload', route: '/upload-documento', section: 'Documentos', profiles: ['funcionario'] },
  { title: 'Aprovar Documento', icon: 'check-circle', route: '/aprovar-documento', section: 'Documentos', profiles: ['admin_sistema', 'dono_empresa', 'lider'] },
  { title: 'Histórico Justificativas', icon: 'history', route: '/historico-justificativas', section: 'Documentos', profiles: ['admin_sistema', 'dono_empresa', 'lider', 'funcionario'] },

  // Seção Relatórios
  { title: 'Relatório Ponto', icon: 'chart-line', route: '/relatorio-ponto', section: t('navigation.reports'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },
  { title: 'Relatório Tarefas', icon: 'chart-bar', route: '/relatorio-tarefas', section: t('navigation.reports'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },
  { title: 'Relatório Solicitações', icon: 'chart-pie', route: '/relatorio-solicitacoes', section: t('navigation.reports'), profiles: ['admin_sistema', 'dono_empresa', 'lider'] },
];


export default function FloatingMenu() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Obter itens do menu traduzidos
  const menuItems = getMenuItems(t);
  
  // Filtrar itens baseado no perfil do usuário
  const filteredItems = menuItems.filter(item => {
    if (!item.profiles) return true; // Se não tem restrição de perfil, mostra para todos
    return item.profiles.includes(user?.perfil || '');
  });
  
  const groupedItems = filteredItems.reduce((acc, item) => {
    const section = item.section || 'Outros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleNavigation = (route: string) => {
    setVisible(false);
    router.push(route);
  };

  return (
    <>
      <FAB
        style={styles.fab}
        icon={() => <UniversalIcon name="menu" size={20} color="white" />}
        onPress={() => setVisible(true)}
        label="Menu"
      />
      
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Menu de Navegação
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Escolha uma opção para navegar
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {Object.entries(groupedItems).map(([section, items]) => (
            <View key={section} style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                {section}
              </Text>
              {items.map((item, index) => (
                <List.Item
                  key={index}
                  title={item.title}
                  left={(props) => <UniversalIcon name={item.icon} size={24} color={theme.colors.primary} />}
                  onPress={() => handleNavigation(item.route)}
                  style={styles.listItem}
                />
              ))}
              <Divider style={styles.sectionDivider} />
            </View>
          ))}
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    top: 0,
  },
  modal: {
    margin: 20,
    padding: 20,
    maxHeight: '80%',
    borderRadius: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  listItem: {
    paddingHorizontal: 8,
  },
  sectionDivider: {
    marginTop: 8,
  },
});
