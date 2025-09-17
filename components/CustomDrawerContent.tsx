import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Divider, Text, useTheme } from 'react-native-paper';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  section?: string;
}

const menuItems: MenuItem[] = [
  // Seção Principal
  { label: 'Home', icon: 'home', route: '/home', section: 'Principal' },
  
  // Seção Empresas
  { label: 'Empresas', icon: 'domain', route: '/company-list', section: 'Empresas' },
  { label: 'Cadastrar Empresa', icon: 'plus-circle', route: '/company-register', section: 'Empresas' },
  
  // Seção Colaboradores
  { label: 'Colaboradores', icon: 'account-group', route: '/colaboradores', section: 'Colaboradores' },
  { label: 'Cadastrar Colaborador', icon: 'account-plus', route: '/cadastro-colaborador', section: 'Colaboradores' },
  { label: 'Perfil', icon: 'account', route: '/perfil', section: 'Colaboradores' },
  
  // Seção Tarefas
  { label: 'Tarefas', icon: 'clipboard-list', route: '/tarefas', section: 'Tarefas' },
  { label: 'Criar Tarefa', icon: 'plus', route: '/criar-tarefa', section: 'Tarefas' },
  { label: 'Agenda', icon: 'calendar', route: '/agenda', section: 'Tarefas' },
  
  // Seção Ponto
  { label: 'Registrar Ponto', icon: 'clock', route: '/registrar-ponto', section: 'Ponto' },
  { label: 'Histórico Ponto', icon: 'history', route: '/historico-ponto', section: 'Ponto' },
  { label: 'Aprovar Ponto', icon: 'check-circle', route: '/aprovar-ponto', section: 'Ponto' },
  
  // Seção Férias
  { label: 'Solicitar Férias', icon: 'beach', route: '/solicitar-ferias', section: 'Férias' },
  { label: 'Histórico Férias', icon: 'history', route: '/historico-ferias', section: 'Férias' },
  { label: 'Aprovar Férias', icon: 'check-circle', route: '/aprovar-ferias', section: 'Férias' },
  
  // Seção Documentos
  { label: 'Upload Documento', icon: 'upload', route: '/upload-documento', section: 'Documentos' },
  { label: 'Aprovar Documento', icon: 'check-circle', route: '/aprovar-documento', section: 'Documentos' },
  { label: 'Histórico Justificativas', icon: 'history', route: '/historico-justificativas', section: 'Documentos' },
  
  // Seção Relatórios
  { label: 'Relatório Ponto', icon: 'chart-line', route: '/relatorio-ponto', section: 'Relatórios' },
  { label: 'Relatório Tarefas', icon: 'chart-bar', route: '/relatorio-tarefas', section: 'Relatórios' },
  { label: 'Relatório Solicitações', icon: 'chart-pie', route: '/relatorio-solicitacoes', section: 'Relatórios' },
];

export default function CustomDrawerContent(props: any) {
  const theme = useTheme();
  
  const groupedItems = menuItems.reduce((acc, item) => {
    const section = item.section || 'Outros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleNavigation = (route: string) => {
    router.push(route);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon 
          size={64} 
          icon="account" 
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
        <Text variant="titleMedium" style={styles.userName}>
          Usuário Logado
        </Text>
        <Text variant="bodySmall" style={styles.userRole}>
          Administrador
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      {Object.entries(groupedItems).map(([section, items]) => (
        <View key={section} style={styles.section}>
          <Text variant="labelMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {section}
          </Text>
          {items.map((item, index) => (
            <DrawerItem
              key={index}
              label={item.label}
              icon={({ color, size }) => (
                <Avatar.Icon 
                  size={size} 
                  icon={item.icon} 
                  style={{ backgroundColor: color }}
                />
              )}
              onPress={() => handleNavigation(item.route)}
              style={styles.drawerItem}
            />
          ))}
          <Divider style={styles.sectionDivider} />
        </View>
      ))}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    marginBottom: 10,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#666',
  },
  divider: {
    marginVertical: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
  },
  drawerItem: {
    marginHorizontal: 8,
  },
  sectionDivider: {
    marginTop: 8,
  },
});
