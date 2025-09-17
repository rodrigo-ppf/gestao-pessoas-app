import MainLayout from '@/components/MainLayout';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import UniversalIcon from '@/components/UniversalIcon';
import { DesignSystem } from '@/constants/design-system';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Surface,
  Text
} from 'react-native-paper';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    funcionarios: 0,
    gestores: 0,
    tarefas: 0,
    empresas: 0,
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const funcionarios = await MockDataService.getColaboradores();
      const gestores = await MockDataService.getGestores();
      const tarefas = await MockDataService.getTarefas();
      const empresas = await MockDataService.getEmpresas();
      
      setStats({
        funcionarios: funcionarios.length,
        gestores: gestores.length,
        tarefas: tarefas.length,
        empresas: empresas.length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return 'Admin Sistema';
      case 'dono_empresa':
        return 'Dono da Empresa';
      case 'gestor':
        return 'Gestor';
      case 'colaborador':
        return 'Colaborador';
      default:
        return perfil;
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const quickActions = [
    {
      title: 'Tarefas',
      description: 'Gerenciar tarefas',
      icon: 'clipboard-list',
      onPress: () => router.push('/tarefas'),
      show: true,
      color: DesignSystem.colors.primary,
    },
    {
      title: 'Equipe',
      description: 'Gerenciar equipe',
      icon: 'account-group',
      onPress: () => router.push('/gerenciar-equipe'),
      show: user?.perfil === 'dono_empresa' || user?.perfil === 'admin_sistema',
      color: DesignSystem.colors.secondary,
    },
    {
      title: 'Ponto',
      description: 'Registrar ponto',
      icon: 'clock',
      onPress: () => router.push('/registrar-ponto'),
      show: true,
      color: DesignSystem.colors.info,
    },
    {
      title: 'Empresas',
      description: 'Gerenciar empresas',
      icon: 'domain',
      onPress: () => router.push('/company-list'),
      show: user?.perfil === 'admin_sistema',
      color: DesignSystem.colors.warning,
      },
  ].filter(item => item.show);

  return (
    <MainLayout title="Dashboard">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Surface style={styles.welcomeCard} elevation={2}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
            <Text style={styles.userName}>{user?.nome}</Text>
            <Text style={styles.userRole}>{getPerfilLabel(user?.perfil || '')}</Text>
                  </View>
        </Surface>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="account-group" size={24} color={DesignSystem.colors.primary} />
            <Text style={styles.statNumber}>{stats.funcionarios}</Text>
            <Text style={styles.statLabel}>Colaboradores</Text>
          </Surface>
          
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="account-tie" size={24} color={DesignSystem.colors.secondary} />
            <Text style={styles.statNumber}>{stats.gestores}</Text>
            <Text style={styles.statLabel}>Gestores</Text>
          </Surface>
          
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="clipboard-list" size={24} color={DesignSystem.colors.info} />
            <Text style={styles.statNumber}>{stats.tarefas}</Text>
            <Text style={styles.statLabel}>Tarefas</Text>
          </Surface>
        </View>

        {/* Checklist de Onboarding - só mostra se o usuário não ocultou */}
        {user?.preferencias?.mostrarDashboard !== false && <OnboardingChecklist />}

        {/* Ações Rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionContent}>
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <UniversalIcon name={action.icon} size={24} color={action.color} />
                  </View>
                  <View style={styles.quickActionText}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionDescription}>{action.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
                
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  content: {
    flex: 1,
  },
  
  // Welcome Card
  welcomeCard: {
    backgroundColor: DesignSystem.colors.surface,
    margin: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  userName: {
    color: DesignSystem.colors.text.primary,
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    marginTop: DesignSystem.spacing.xs,
  },
  userRole: {
    color: DesignSystem.colors.text.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
    marginTop: DesignSystem.spacing.xs,
  },
  
  // Estatísticas
  statsContainer: {
    flexDirection: 'row',
    padding: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  statNumber: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.text.primary,
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Ações Rápidas
  quickActionsContainer: {
    padding: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  quickActionsGrid: {
    gap: DesignSystem.spacing.sm,
  },
  quickActionCard: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    borderLeftWidth: 4,
    padding: DesignSystem.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  quickActionDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  
});
