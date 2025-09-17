import { DesignSystem } from '@/constants/design-system';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Surface, Text } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  completed: boolean;
  required: boolean;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

export default function OnboardingChecklist() {
  const { user, updateUser } = useAuth();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    loadChecklistStatus();
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = () => {
    if (user?.preferencias?.mostrarDashboard !== undefined) {
      setShowDashboard(user.preferencias.mostrarDashboard);
    }
  };

  const loadChecklistStatus = async () => {
    try {
      // Verificar se empresa foi cadastrada
      const empresas = await MockDataService.getEmpresas();
      const hasEmpresa = empresas.length > 0;

      // Verificar se há gestores
      const gestores = await MockDataService.getGestores();
      const hasGestores = gestores.length > 0;

      // Verificar se há colaboradores
      const colaboradores = await MockDataService.getColaboradores();
      const hasColaboradores = colaboradores.length > 0;

      const items: ChecklistItem[] = [
        {
          id: 'empresa',
          title: '1. Cadastrar Empresa',
          description: 'Primeiro passo: configure os dados da sua empresa',
          icon: 'domain-plus',
          route: '/cadastro-empresa',
          completed: hasEmpresa,
          required: true,
        },
        {
          id: 'gestor',
          title: '2. Cadastrar Primeiro Gestor',
          description: 'Segundo passo: crie o perfil do primeiro gestor da equipe',
          icon: 'account-tie',
          route: '/cadastro-lider',
          completed: hasGestores,
          required: true,
        },
        {
          id: 'colaborador',
          title: '3. Cadastrar Colaboradores',
          description: 'Terceiro passo: adicione membros da sua equipe',
          icon: 'account-group',
          route: '/cadastro-funcionario',
          completed: hasColaboradores,
          required: false,
        },
      ];

      setChecklistItems(items);
      
      // Verificar se está 100% completo e ocultar automaticamente
      const completedItems = items.filter(item => item.completed).length;
      const isComplete = completedItems === items.length && items.length > 0;
      
      if (isComplete && user && user.preferencias?.mostrarDashboard !== false) {
        // Ocultar automaticamente se 100% completo
        await MockDataService.updateUsuarioPreferencias(user.id, {
          mostrarDashboard: false
        });
        setShowDashboard(false);
        console.log('Dashboard ocultado automaticamente - 100% completo');
      }
    } catch (error) {
      console.error('Erro ao carregar status do checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: ChecklistItem) => {
    router.push(item.route as any);
  };

  const getProgressPercentage = () => {
    const completedItems = checklistItems.filter(item => item.completed).length;
    return checklistItems.length > 0 ? (completedItems / checklistItems.length) * 100 : 0;
  };

  const getNextAction = () => {
    const nextItem = checklistItems.find(item => !item.completed && item.required);
    return nextItem || checklistItems.find(item => !item.completed);
  };

  const handleHideDashboard = async () => {
    if (!user) return;

    Alert.alert(
      'Ocultar Dashboard',
      'Tem certeza que deseja ocultar o dashboard? Você pode reativá-lo a qualquer momento nas configurações.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Ocultar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedUser = await MockDataService.updateUsuarioPreferencias(user.id, {
                mostrarDashboard: false
              });
              if (updatedUser) {
                updateUser(updatedUser);
                setShowDashboard(false);
                Alert.alert('Sucesso', 'Dashboard ocultado com sucesso!');
              }
            } catch (error) {
              console.error('Erro ao ocultar dashboard:', error);
              Alert.alert('Erro', 'Não foi possível ocultar o dashboard.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Surface style={styles.container} elevation={2}>
        <Text style={styles.loadingText}>Carregando checklist...</Text>
      </Surface>
    );
  }

  const progress = getProgressPercentage();
  const nextAction = getNextAction();

  return (
    <Surface style={styles.container} elevation={2}>
      {/* Instruções */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>🚀 Bem-vindo ao Sistema!</Text>
        <Text style={styles.instructionsText}>
          Para começar a usar o sistema, siga os passos abaixo na ordem indicada:
        </Text>
      </View>

      {/* Header com Progresso */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% Concluído
          </Text>
        </View>
        
        {nextAction && (
          <View style={styles.nextActionContainer}>
            <Text style={styles.nextActionLabel}>Próximo passo:</Text>
            <Text style={styles.nextActionText}>{nextAction.title}</Text>
          </View>
        )}
      </View>

      {/* Lista de Itens */}
      <View style={styles.itemsContainer}>
        {checklistItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemCard,
              item.completed && styles.itemCompleted,
              item.required && !item.completed && styles.itemRequired
            ]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemIconContainer}>
                <UniversalIcon 
                  name={item.icon} 
                  size={24} 
                  color={item.completed ? DesignSystem.colors.success : DesignSystem.colors.primary} 
                />
                {item.completed && (
                  <View style={styles.checkmarkContainer}>
                    <UniversalIcon name="check" size={16} color="white" />
                  </View>
                )}
              </View>
              
              <View style={styles.itemTextContainer}>
                <View style={styles.itemTitleContainer}>
                  <Text style={[
                    styles.itemTitle,
                    item.completed && styles.itemTitleCompleted
                  ]}>
                    {item.title}
                  </Text>
                  {item.required && (
                    <Chip 
                      mode="outlined" 
                      compact 
                      style={styles.requiredChip}
                      textStyle={styles.requiredChipText}
                    >
                      Obrigatório
                    </Chip>
                  )}
                </View>
                <Text style={[
                  styles.itemDescription,
                  item.completed && styles.itemDescriptionCompleted
                ]}>
                  {item.description}
                </Text>
              </View>
              
              <View style={styles.itemAction}>
                <UniversalIcon 
                  name={item.completed ? "check-circle" : "arrow-right"} 
                  size={20} 
                  color={item.completed ? DesignSystem.colors.success : DesignSystem.colors.text.secondary} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ação Principal */}
      {nextAction && (
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => handleItemPress(nextAction)}
          activeOpacity={0.8}
        >
          <UniversalIcon name={nextAction.icon} size={24} color="white" />
          <Text style={styles.primaryActionText}>
            {nextAction.completed ? 'Gerenciar' : 'Começar'} {nextAction.title}
          </Text>
        </TouchableOpacity>
      )}

      {/* Botão para Ocultar Dashboard */}
      <Button
        mode="outlined"
        onPress={handleHideDashboard}
        style={styles.hideDashboardButton}
        icon={() => <UniversalIcon name="eye-off" size={16} color={DesignSystem.colors.text.secondary} />}
      >
        Não exibir mais este dashboard
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    margin: DesignSystem.spacing.md,
  },
  
  // Instructions
  instructionsContainer: {
    backgroundColor: DesignSystem.colors.primaryLight + '10',
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary,
  },
  instructionsTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  instructionsText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
  },
  
  // Header
  header: {
    marginBottom: DesignSystem.spacing.lg,
  },
  progressContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignSystem.colors.surfaceVariant,
    borderRadius: DesignSystem.borderRadius.full,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.success,
    borderRadius: DesignSystem.borderRadius.full,
  },
  progressText: {
    textAlign: 'center',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  nextActionContainer: {
    backgroundColor: DesignSystem.colors.primaryLight + '20',
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary,
  },
  nextActionLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  nextActionText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginTop: DesignSystem.spacing.xs,
  },
  
  // Items
  itemsContainer: {
    gap: DesignSystem.spacing.md,
  },
  itemCard: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.surfaceVariant,
    padding: DesignSystem.spacing.md,
  },
  itemCompleted: {
    backgroundColor: DesignSystem.colors.success + '10',
    borderColor: DesignSystem.colors.success + '30',
  },
  itemRequired: {
    borderColor: DesignSystem.colors.warning + '50',
    backgroundColor: DesignSystem.colors.warning + '05',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  itemIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
    gap: DesignSystem.spacing.xs,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  itemTitleCompleted: {
    color: DesignSystem.colors.success,
    textDecorationLine: 'line-through',
  },
  requiredChip: {
    height: 20,
    backgroundColor: DesignSystem.colors.warning + '20',
    borderColor: DesignSystem.colors.warning,
  },
  requiredChipText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.warning,
  },
  itemDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
  },
  itemDescriptionCompleted: {
    color: DesignSystem.colors.text.disabled,
  },
  itemAction: {
    padding: DesignSystem.spacing.sm,
  },
  
  // Primary Action
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    color: 'white',
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  
  // Hide Dashboard Button
  hideDashboardButton: {
    marginTop: DesignSystem.spacing.md,
    borderColor: DesignSystem.colors.text.secondary,
  },
  
  // Loading
  loadingText: {
    textAlign: 'center',
    color: DesignSystem.colors.text.secondary,
    padding: DesignSystem.spacing.xl,
  },
});
