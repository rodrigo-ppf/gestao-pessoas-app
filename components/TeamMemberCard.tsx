import { DesignSystem, getProfileColor } from '@/constants/design-system';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, IconButton, Menu, Surface, Text } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

interface TeamMember {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  perfil: string;
  avatar?: string;
  status?: 'ativo' | 'inativo';
  dataAdmissao?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (member: TeamMember) => void;
  onRefresh?: () => void;
}

export default function TeamMemberCard({ 
  member, 
  onEdit, 
  onDelete, 
  onRefresh 
}: TeamMemberCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    if (member.perfil === 'lider') {
      router.push(`/editar-lider?id=${member.id}` as any);
    } else {
      router.push(`/editar-funcionario?id=${member.id}` as any);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${member.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (member.perfil === 'lider') {
                await MockDataService.deleteLider(member.id);
              } else {
                await MockDataService.deleteColaborador(member.id);
              }
              onRefresh?.();
              Alert.alert('Sucesso', 'Membro da equipe excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir membro da equipe');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo':
        return DesignSystem.colors.success;
      case 'inativo':
        return DesignSystem.colors.error;
      default:
        return DesignSystem.colors.info;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ativo':
        return 'check-circle';
      case 'inativo':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.cardContent}>
        {/* Avatar e Informações Básicas */}
        <View style={styles.mainInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {member.avatar || member.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.memberInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName}>{member.nome}</Text>
              <Chip 
                mode="outlined"
                compact
                style={[styles.profileChip, { borderColor: getProfileColor(member.perfil) }]}
                textStyle={[styles.profileChipText, { color: getProfileColor(member.perfil) }]}
              >
                {member.perfil === 'lider' ? 'Líder' : 'Colaborador'}
              </Chip>
            </View>
            
            <Text style={styles.memberEmail}>{member.email}</Text>
            <Text style={styles.memberPosition}>{member.cargo}</Text>
            <Text style={styles.memberDepartment}>{member.departamento}</Text>
            
            {member.status && (
              <View style={styles.statusContainer}>
                <UniversalIcon 
                  name={getStatusIcon(member.status)} 
                  size={16} 
                  color={getStatusColor(member.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu de Ações */}
        <View style={styles.actionsContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon={() => <UniversalIcon name="dots-vertical" size={20} color={DesignSystem.colors.text.secondary} />}
                onPress={() => setMenuVisible(true)}
                style={styles.menuButton}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={handleEdit}
              title="Editar"
              leadingIcon={() => <UniversalIcon name="edit" size={16} color={DesignSystem.colors.primary} />}
            />
            <Menu.Item
              onPress={handleDelete}
              title="Excluir"
              leadingIcon={() => <UniversalIcon name="delete" size={16} color={DesignSystem.colors.error} />}
              titleStyle={{ color: DesignSystem.colors.error }}
            />
          </Menu>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleEdit}
        >
          <UniversalIcon name="edit" size={16} color={DesignSystem.colors.primary} />
          <Text style={styles.quickActionText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push(`/tarefas?user=${member.id}` as any)}
        >
          <UniversalIcon name="clipboard-list" size={16} color={DesignSystem.colors.info} />
          <Text style={styles.quickActionText}>Tarefas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push(`/registrar-ponto?user=${member.id}` as any)}
        >
          <UniversalIcon name="clock" size={16} color={DesignSystem.colors.warning} />
          <Text style={styles.quickActionText}>Ponto</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: DesignSystem.spacing.lg,
  },
  mainInfo: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: DesignSystem.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.primary,
  },
  memberInfo: {
    flex: 1,
    gap: DesignSystem.spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  profileChip: {
    height: 24,
  },
  profileChipText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  memberEmail: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
  },
  memberPosition: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.primary,
  },
  memberDepartment: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    marginTop: DesignSystem.spacing.xs,
  },
  statusText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  actionsContainer: {
    position: 'absolute',
    top: DesignSystem.spacing.md,
    right: DesignSystem.spacing.md,
  },
  menuButton: {
    margin: 0,
  },
  menuContent: {
    backgroundColor: DesignSystem.colors.surface,
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.surfaceVariant,
    padding: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.sm,
    backgroundColor: DesignSystem.colors.surface,
  },
  quickActionText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
});
