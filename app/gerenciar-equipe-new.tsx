import FloatingMenu from '@/components/FloatingMenu';
import TeamFilters from '@/components/TeamFilters';
import TeamMemberCard from '@/components/TeamMemberCard';
import UniversalIcon from '@/components/UniversalIcon';
import { DesignSystem } from '@/constants/design-system';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Surface, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

export default function GerenciarEquipeScreen() {
  const { user } = useAuth();
  const { t, getCurrentLanguage, changeLanguage } = useTranslation();
  
  // Estados principais
  const [lideres, setLideres] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  
  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Estados de modais
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [liderToDelete, setLiderToDelete] = useState<any>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [funcionarioToAssign, setFuncionarioToAssign] = useState<any>(null);
  const [bulkAssignModalVisible, setBulkAssignModalVisible] = useState(false);
  const [selectedFuncionarios, setSelectedFuncionarios] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [funcionarioMenuVisible, setFuncionarioMenuVisible] = useState<string | null>(null);
  const [deleteFuncionarioModalVisible, setDeleteFuncionarioModalVisible] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<any>(null);

  const carregarDados = useCallback(async () => {
    try {
      // Usar os métodos corretos do MockDataService
      const usuarios = MockDataService.getUsuariosByEmpresa(user?.empresaId || '');
      const lideresList = usuarios.filter(u => u.perfil === 'lider');
      const funcionariosList = usuarios.filter(u => u.perfil === 'funcionario');
      
      // Combinar todos os membros da equipe
      const members = [
        ...lideresList.map((l: any) => ({ ...l, perfil: 'lider', status: 'ativo' })),
        ...funcionariosList.map((f: any) => ({ ...f, perfil: 'colaborador', status: 'ativo' }))
      ];
      
      setLideres(lideresList);
      setFuncionarios(funcionariosList);
      setAllMembers(members);
      setFilteredMembers(members);
    } catch (error) {
      console.error('Erro ao carregar dados da equipe:', error);
    }
  }, [user?.empresaId]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...allMembers];

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.nome.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.cargo.toLowerCase().includes(query) ||
        member.departamento.toLowerCase().includes(query)
      );
    }

    // Filtro por perfil
    if (selectedProfile !== 'all') {
      filtered = filtered.filter(member => member.perfil === selectedProfile);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }

    setFilteredMembers(filtered);
  }, [allMembers, searchQuery, selectedProfile, selectedStatus]);

  // Aplicar filtros quando os critérios mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#f44336';
      case 'dono_empresa':
        return '#9c27b0';
      case 'lider':
        return '#ff9800';
      case 'colaborador':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return 'Admin Sistema';
      case 'dono_empresa':
        return 'Dono da Empresa';
      case 'lider':
        return 'Líder';
      case 'colaborador':
        return 'Colaborador';
      default:
        return perfil;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Gerenciar Equipe</Text>
              <Text style={styles.subtitle}>
                Gerencie líderes e colaboradores da sua empresa
              </Text>
        </View>
            <TouchableOpacity 
              style={styles.addButton}
                onPress={() => router.push('/cadastro-lider')}
            >
              <UniversalIcon name="account-plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Filtros */}
        <TeamFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedProfile={selectedProfile}
          onProfileChange={setSelectedProfile}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="account-tie" size={24} color={DesignSystem.colors.secondary} />
            <Text style={styles.statNumber}>{lideres.length}</Text>
            <Text style={styles.statLabel}>Líderes</Text>
          </Surface>
          
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="account-group" size={24} color={DesignSystem.colors.primary} />
            <Text style={styles.statNumber}>{funcionarios.length}</Text>
            <Text style={styles.statLabel}>Colaboradores</Text>
          </Surface>
          
          <Surface style={styles.statCard} elevation={1}>
            <UniversalIcon name="account-group" size={24} color={DesignSystem.colors.info} />
            <Text style={styles.statNumber}>{filteredMembers.length}</Text>
            <Text style={styles.statLabel}>Filtrados</Text>
          </Surface>
        </View>

        {/* Lista de Membros */}
        <View style={styles.membersContainer}>
          {filteredMembers.length === 0 ? (
            <Surface style={styles.emptyCard} elevation={1}>
              <View style={styles.emptyContent}>
                <UniversalIcon name="account-group" size={48} color={DesignSystem.colors.text.disabled} />
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedProfile !== 'all' || selectedStatus !== 'all' 
                    ? 'Nenhum membro encontrado' 
                    : 'Nenhum membro da equipe'
                  }
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedProfile !== 'all' || selectedStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece adicionando líderes e colaboradores'
                  }
                </Text>
                {!searchQuery && selectedProfile === 'all' && selectedStatus === 'all' && (
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => router.push('/cadastro-lider')}
                  >
                    <UniversalIcon name="account-plus" size={20} color="white" />
                    <Text style={styles.emptyButtonText}>Cadastrar Primeiro Líder</Text>
                  </TouchableOpacity>
                    )}
                  </View>
            </Surface>
          ) : (
            filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onRefresh={carregarDados}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB para adicionar */}
      <FAB
        icon={() => <UniversalIcon name="plus" size={24} color="white" />}
        style={styles.fab}
        onPress={() => router.push('/cadastro-lider')}
        label="Adicionar"
      />

      <FloatingMenu />
    </View>
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
  
  // Header
  header: {
    backgroundColor: DesignSystem.colors.primary,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: DesignSystem.colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: DesignSystem.colors.surface,
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: DesignSystem.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Estatísticas
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DesignSystem.colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Lista de Membros
  membersContainer: {
    padding: 16,
    paddingTop: 0,
  },
  
  // Estado Vazio
  emptyCard: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: 12,
    margin: 16,
  },
  emptyContent: {
    padding: 48,
    alignItems: 'center',
    gap: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: DesignSystem.colors.primary,
  },
});
