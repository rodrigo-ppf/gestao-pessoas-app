import { DesignSystem } from '@/constants/design-system';
import { StyleSheet, View } from 'react-native';
import { Chip, Surface, Text, TextInput } from 'react-native-paper';
import UniversalIcon from './UniversalIcon';

interface TeamFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProfile: string;
  onProfileChange: (profile: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export default function TeamFilters({
  searchQuery,
  onSearchChange,
  selectedProfile,
  onProfileChange,
  selectedStatus,
  onStatusChange,
}: TeamFiltersProps) {
  const profiles = [
    { key: 'all', label: 'Todos', icon: 'account-group' },
    { key: 'lider', label: 'Líderes', icon: 'account-tie' },
    { key: 'colaborador', label: 'Colaboradores', icon: 'account' },
  ];

  const statuses = [
    { key: 'all', label: 'Todos', icon: 'account-group' },
    { key: 'ativo', label: 'Ativos', icon: 'check-circle' },
    { key: 'inativo', label: 'Inativos', icon: 'close-circle' },
  ];

  return (
    <Surface style={styles.container} elevation={1}>
      {/* Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Buscar por nome, email ou cargo..."
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
          left={<TextInput.Icon icon={() => <UniversalIcon name="search" size={20} color="#666" />} />}
          right={
            searchQuery ? (
              <TextInput.Icon 
                icon={() => <UniversalIcon name="close" size={20} color="#666" />}
                onPress={() => onSearchChange('')}
              />
            ) : undefined
          }
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Perfil:</Text>
        <View style={styles.chipsContainer}>
          {profiles.map((profile) => (
            <Chip
              key={profile.key}
              mode={selectedProfile === profile.key ? 'flat' : 'outlined'}
              selected={selectedProfile === profile.key}
              onPress={() => onProfileChange(profile.key)}
              style={[
                styles.chip,
                selectedProfile === profile.key && styles.chipSelected
              ]}
              textStyle={[
                styles.chipText,
                selectedProfile === profile.key && styles.chipTextSelected
              ]}
              icon={() => (
                <UniversalIcon 
                  name={profile.icon} 
                  size={16} 
                  color={selectedProfile === profile.key ? 'white' : DesignSystem.colors.primary} 
                />
              )}
            >
              {profile.label}
            </Chip>
          ))}
        </View>

        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.chipsContainer}>
          {statuses.map((status) => (
            <Chip
              key={status.key}
              mode={selectedStatus === status.key ? 'flat' : 'outlined'}
              selected={selectedStatus === status.key}
              onPress={() => onStatusChange(status.key)}
              style={[
                styles.chip,
                selectedStatus === status.key && styles.chipSelected
              ]}
              textStyle={[
                styles.chipText,
                selectedStatus === status.key && styles.chipTextSelected
              ]}
              icon={() => (
                <UniversalIcon 
                  name={status.icon} 
                  size={16} 
                  color={selectedStatus === status.key ? 'white' : DesignSystem.colors.primary} 
                />
              )}
            >
              {status.label}
            </Chip>
          ))}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.surface,
    margin: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
  },
  searchContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  searchInput: {
    backgroundColor: DesignSystem.colors.surface,
  },
  filtersContainer: {
    gap: DesignSystem.spacing.md,
  },
  filterLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  chip: {
    marginRight: DesignSystem.spacing.xs,
    marginBottom: DesignSystem.spacing.xs,
  },
  chipSelected: {
    backgroundColor: DesignSystem.colors.primary,
  },
  chipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  chipTextSelected: {
    color: 'white',
  },
});
