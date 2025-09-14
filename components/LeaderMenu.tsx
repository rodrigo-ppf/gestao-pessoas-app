import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

interface LeaderMenuProps {
  onClose?: () => void;
}

export default function LeaderMenu({ onClose }: LeaderMenuProps) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Gestão': true,
    'Tarefas': false,
    'Ponto': false,
  });

  const menuItems = [
    // Gestão
    { title: 'Dashboard', icon: 'view-dashboard', route: '/home', section: 'Gestão' },
    { title: 'Gerenciar Equipe', icon: 'account-group', route: '/gerenciar-equipe', section: 'Gestão' },
    { title: 'Cadastrar Líder', icon: 'account-tie', route: '/cadastro-lider', section: 'Gestão' },
    { title: 'Cadastrar Colaborador', icon: 'account-plus', route: '/cadastro-funcionario', section: 'Gestão' },
    
    // Tarefas
    { title: 'Criar Tarefa', icon: 'plus-circle', route: '/criar-tarefa', section: 'Tarefas' },
    { title: 'Listar Tarefas', icon: 'clipboard-list', route: '/tarefas', section: 'Tarefas' },
    
    // Ponto
    { title: 'Registrar Ponto', icon: 'clock-in', route: '/ponto', section: 'Ponto' },
    { title: 'Histórico de Ponto', icon: 'history', route: '/historico-ponto', section: 'Ponto' },
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
    router.push(route);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

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
      
      <View style={styles.scrollContainer}>
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
      </View>
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
});
