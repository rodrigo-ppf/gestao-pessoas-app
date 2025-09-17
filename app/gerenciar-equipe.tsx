import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Menu, Modal, Paragraph, Portal, Title } from 'react-native-paper';

const { width } = Dimensions.get('window');
const isSmallScreen = width <= 425;

export default function GerenciarEquipeScreen() {
  const { user } = useAuth();
  const { t, getCurrentLanguage, changeLanguage } = useTranslation();
  
  // Estados principais
  const [gestores, setGestores] = useState<any[]>([]);
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
  const [gestorToDelete, setGestorToDelete] = useState<any>(null);
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
      console.log('=== DEBUG Gerenciar Equipe ===');
      console.log('Usuário atual:', user);
      console.log('EmpresaId do usuário:', user?.empresaId);
      
      if (!user?.empresaId) {
        console.log('Usuário não tem empresaId definido');
        return;
      }

      console.log('Carregando dados para empresa:', user.empresaId);
      
      const gestoresList = MockDataService.getGestoresByEmpresa(user.empresaId);
      const funcionariosList = MockDataService.getColaboradoresByEmpresa(user.empresaId);
      
      console.log('Gestores encontrados:', gestoresList);
      console.log('Colaboradores encontrados:', funcionariosList);
      
      // Combinar todos os membros da equipe
      const members = [
        ...gestoresList.map(g => ({ ...g, perfil: 'gestor', status: 'ativo' })),
        ...funcionariosList.map(f => ({ ...f, perfil: 'colaborador', status: 'ativo' }))
      ];
      
      setGestores(gestoresList);
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
    console.log('useEffect carregarDados chamado');
    carregarDados();
  }, [carregarDados]);

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    console.log('useEffect user mudou:', user);
    if (user) {
      carregarDados();
    }
  }, [user]);

  // Atualizar dados quando a tela receber foco (voltar de outras telas)
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin_sistema':
        return '#e74c3c';
      case 'dono_empresa':
        return '#8e44ad';
      case 'gestor':
        return '#3498db';
      case 'funcionario':
        return '#27ae60';
      default:
        return '#95a5a6';
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
      case 'funcionario':
        return 'Colaborador';
      default:
        return perfil;
    }
  };

  const getFuncionariosDoGestor = (gestorId: string) => {
    return funcionarios.filter(f => f.gestorId === gestorId);
  };

  const handleEditarGestor = (gestor: any) => {
    setMenuVisible(null);
    router.push(`/editar-gestor?gestorId=${gestor.id}`);
  };

  const handleExcluirGestor = (gestor: any) => {
    console.log('=== ABRINDO MODAL DE EXCLUSÃO ===');
    console.log('Gestor recebido:', gestor);
    console.log('Idioma atual:', t('common.cancel')); // Teste de tradução
    console.log('Título deleteGestor:', t('gestor.deleteGestor'));
    
    setGestorToDelete(gestor);
    setDeleteModalVisible(true);
  };

  const confirmarExclusao = async () => {
    if (!gestorToDelete) return;
    
    console.log('=== CONFIRMANDO EXCLUSÃO ===');
    console.log('Gestor a ser excluído:', gestorToDelete);
    
    try {
      const funcionariosDoGestor = getFuncionariosDoGestor(gestorToDelete.id);
      
      // Desassociar funcionários do gestor
      if (funcionariosDoGestor.length > 0) {
        for (const funcionario of funcionariosDoGestor) {
          await MockDataService.updateUsuario(funcionario.id, { gestorId: undefined });
        }
      }
      
      // Excluir o gestor
      const sucesso = await MockDataService.deleteUsuario(gestorToDelete.id);
      
      if (sucesso) {
        // Recarregar dados
        carregarDados();
        setDeleteModalVisible(false);
        setGestorToDelete(null);
        
        // Mostrar sucesso usando Alert (que funciona para mensagens simples)
        Alert.alert(t('common.success'), t('leader.leaderDeleted'));
      } else {
        Alert.alert(t('common.error'), t('leader.leaderDeleteError'));
      }
    } catch (error) {
      console.error('Erro ao excluir gestor:', error);
      Alert.alert(t('common.error'), t('leader.leaderDeleteError'));
    }
  };

  const cancelarExclusao = () => {
    setDeleteModalVisible(false);
    setGestorToDelete(null);
  };

  const handleAssociarGestor = (funcionario: any) => {
    console.log('=== ASSOCIANDO FUNCIONÁRIO A GESTOR ===');
    console.log('Funcionário:', funcionario);
    
    setFuncionarioToAssign(funcionario);
    setAssignModalVisible(true);
  };

  const confirmarAssociacao = async (gestorId: string) => {
    if (!funcionarioToAssign) return;
    
    console.log('=== CONFIRMANDO ASSOCIAÇÃO ===');
    console.log('Funcionário:', funcionarioToAssign.nome);
    console.log('Gestor ID:', gestorId);
    
    try {
      const sucesso = await MockDataService.updateUsuario(funcionarioToAssign.id, { gestorId });
      
      if (sucesso) {
        carregarDados();
        setAssignModalVisible(false);
        setFuncionarioToAssign(null);
        
        const gestor = gestores.find(l => l.id === gestorId);
        Alert.alert(
          '✅ Sucesso!', 
          `Colaborador ${funcionarioToAssign.nome} associado ao gestor ${gestor?.nome} com sucesso!`
        );
      } else {
        Alert.alert('❌ Erro', 'Erro ao associar funcionário ao gestor');
      }
    } catch (error) {
      console.error('Erro ao associar funcionário:', error);
      Alert.alert('❌ Erro', 'Erro ao associar funcionário ao gestor');
    }
  };

  const cancelarAssociacao = () => {
    setAssignModalVisible(false);
    setFuncionarioToAssign(null);
  };

  // Funções para seleção múltipla
  const toggleFuncionarioSelection = (funcionarioId: string) => {
    setSelectedFuncionarios(prev => {
      if (prev.includes(funcionarioId)) {
        return prev.filter(id => id !== funcionarioId);
      } else {
        return [...prev, funcionarioId];
      }
    });
  };

  const iniciarSelecaoMultipla = () => {
    setIsSelectionMode(true);
    setSelectedFuncionarios([]);
  };

  const cancelarSelecaoMultipla = () => {
    setIsSelectionMode(false);
    setSelectedFuncionarios([]);
  };

  const abrirModalBulkAssign = () => {
    if (selectedFuncionarios.length === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um funcionário');
      return;
    }
    setBulkAssignModalVisible(true);
  };

  const confirmarBulkAssign = async (gestorId: string) => {
    try {
      for (const funcionarioId of selectedFuncionarios) {
        await MockDataService.updateUsuario(funcionarioId, { gestorId });
      }
      
      Alert.alert(
        'Sucesso',
        `${selectedFuncionarios.length} funcionário(s) associado(s) ao gestor com sucesso!`
      );
      
      setBulkAssignModalVisible(false);
      cancelarSelecaoMultipla();
      carregarDados();
    } catch (error) {
      console.error('Erro ao associar funcionários:', error);
      Alert.alert('Erro', 'Falha ao associar funcionários ao gestor');
    }
  };

  const cancelarBulkAssign = () => {
    setBulkAssignModalVisible(false);
  };

  // Funções para funcionários
  const handleEditarFuncionario = (funcionario: any) => {
    setFuncionarioMenuVisible(null);
    router.push(`/editar-funcionario?funcionarioId=${funcionario.id}`);
  };

  const handleExcluirFuncionario = (funcionario: any) => {
    console.log('=== ABRINDO MODAL DE EXCLUSÃO DE FUNCIONÁRIO ===');
    console.log('Funcionário recebido:', funcionario);
    
    setFuncionarioToDelete(funcionario);
    setDeleteFuncionarioModalVisible(true);
  };

  const confirmarExclusaoFuncionario = async () => {
    if (!funcionarioToDelete) return;
    
    console.log('=== CONFIRMANDO EXCLUSÃO DE FUNCIONÁRIO ===');
    console.log('Funcionário a ser excluído:', funcionarioToDelete);
    
    try {
      // Excluir o funcionário
      const sucesso = await MockDataService.deleteUsuario(funcionarioToDelete.id);
      
      if (sucesso) {
        // Recarregar dados
        carregarDados();
        setDeleteFuncionarioModalVisible(false);
        setFuncionarioToDelete(null);
        
        // Mostrar sucesso
        Alert.alert('✅ Sucesso', `Colaborador ${funcionarioToDelete.nome} excluído com sucesso!`);
      } else {
        Alert.alert('❌ Erro', 'Erro ao excluir funcionário');
      }
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      Alert.alert('❌ Erro', 'Erro ao excluir funcionário');
    }
  };

  const cancelarExclusaoFuncionario = () => {
    setDeleteFuncionarioModalVisible(false);
    setFuncionarioToDelete(null);
  };

  return (
    <MainLayout title="Gerenciar Equipe">
      <ScrollView style={styles.content}>
        <View style={styles.description}>
          <Paragraph>Gerencie gestores e funcionários da sua empresa</Paragraph>
        </View>

        <View style={styles.actionsContainer}>
          <Card style={styles.actionCard}>
            <Card.Content>
              <Title style={styles.actionTitle}>👥 Cadastrar Gestor</Title>
              <Paragraph style={styles.actionDescription}>
                Cadastre um novo gestor para gerenciar uma equipe
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => router.push('/cadastro-gestor')}
                style={styles.actionButton}
                icon="account-plus"
              >
                Cadastrar Gestor
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard}>
            <Card.Content>
              <Title style={styles.actionTitle}>👤 Cadastrar Colaborador</Title>
              <Paragraph style={styles.actionDescription}>
                Cadastre um novo colaborador e atribua a um gestor
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => router.push('/cadastro-funcionario')}
                style={styles.actionButton}
                icon="account-plus"
              >
                Cadastrar Colaborador
              </Button>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.teamContainer}>
          <Title style={styles.sectionTitle}>👥 Gestores da Empresa</Title>
          {gestores.length > 0 ? (
            gestores.map((gestor) => (
              <Card key={gestor.id} style={styles.teamCard}>
                <Card.Content>
                  <View style={styles.teamMemberInfo}>
                    <View style={styles.teamMemberDetails}>
                      <Title style={styles.teamMemberName}>
                        {gestor.avatar} {gestor.nome}
                      </Title>
                      <Paragraph style={styles.teamMemberEmail}>
                        {gestor.email}
                      </Paragraph>
                      <Paragraph style={styles.teamMemberRole}>
                        {gestor.cargo} - {gestor.departamento}
                      </Paragraph>
                    </View>
                    <View style={styles.teamMemberActions}>
                      <Chip
                        style={[styles.perfilChip, { backgroundColor: getPerfilColor(gestor.perfil) }]}
                        textStyle={styles.chipText}
                      >
                        {getPerfilLabel(gestor.perfil)}
                      </Chip>
                      <Menu
                        visible={menuVisible === gestor.id}
                        onDismiss={() => setMenuVisible(null)}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            size={20}
                            onPress={() => setMenuVisible(gestor.id)}
                            style={styles.menuButton}
                          />
                        }
                      >
                        <Menu.Item
                          onPress={() => handleEditarGestor(gestor)}
                          title={t('common.edit')}
                          leadingIcon="pencil"
                        />
                        <Menu.Item
                          onPress={() => {
                            console.log('=== MENU ITEM EXCLUIR CLICADO ===');
                            console.log('Gestor:', gestor);
                            // Fechar menu primeiro
                            setMenuVisible(null);
                            // Pequeno delay para garantir que o menu feche
                            setTimeout(() => {
                              handleExcluirGestor(gestor);
                            }, 100);
                          }}
                          title={t('common.delete')}
                          leadingIcon="delete"
                          titleStyle={{ color: '#f44336' }}
                        />
                      </Menu>
                    </View>
                  </View>
                  
                  <View style={styles.teamSection}>
                    <Paragraph style={styles.teamSectionTitle}>
                      Colaboradores sob gestão ({getFuncionariosDoGestor(gestor.id).length})
                    </Paragraph>
                    {getFuncionariosDoGestor(gestor.id).map((funcionario) => (
                      <View key={funcionario.id} style={styles.subordinateItem}>
                        <Paragraph style={styles.subordinateName}>
                          {funcionario.avatar} {funcionario.nome}
                        </Paragraph>
                        <Paragraph style={styles.subordinateRole}>
                          {funcionario.cargo}
                        </Paragraph>
                      </View>
                    ))}
                    {getFuncionariosDoGestor(gestor.id).length === 0 && (
                      <Paragraph style={styles.noSubordinates}>
                        Nenhum funcionário atribuído
                      </Paragraph>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhum gestor cadastrado</Title>
                <Paragraph style={styles.emptyDescription}>
                  Cadastre gestores para organizar sua equipe
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={styles.teamContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>👤 Colaboradores ({funcionarios.length})</Title>
            {!isSelectionMode ? (
              <Button
                mode="outlined"
                onPress={iniciarSelecaoMultipla}
                style={styles.bulkButton}
                icon="account-multiple-plus"
              >
                Selecionar Múltiplos
              </Button>
            ) : (
              <View style={styles.selectionActions}>
                <Button
                  mode="contained"
                  onPress={abrirModalBulkAssign}
                  style={styles.assignButton}
                  icon="account-arrow-right"
                  disabled={selectedFuncionarios.length === 0}
                >
                  Associar ({selectedFuncionarios.length})
                </Button>
                <Button
                  mode="outlined"
                  onPress={cancelarSelecaoMultipla}
                  style={styles.cancelButton}
                  icon="close"
                >
                  Cancelar
                </Button>
              </View>
            )}
          </View>
          {funcionarios.length > 0 ? (
            funcionarios.map((funcionario) => (
              <Card 
                key={funcionario.id} 
                style={[
                  styles.teamCard,
                  isSelectionMode && selectedFuncionarios.includes(funcionario.id) && styles.selectedCard
                ]}
                onPress={isSelectionMode ? () => toggleFuncionarioSelection(funcionario.id) : undefined}
              >
                <Card.Content>
                  <View style={styles.teamMemberInfo}>
                    {isSelectionMode && (
                      <View style={styles.selectionIndicator}>
                        <IconButton
                          icon={selectedFuncionarios.includes(funcionario.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                          iconColor={selectedFuncionarios.includes(funcionario.id) ? "#1976d2" : "#666"}
                          size={24}
                          onPress={() => toggleFuncionarioSelection(funcionario.id)}
                        />
                      </View>
                    )}
                    <View style={styles.teamMemberDetails}>
                      <Title style={styles.teamMemberName}>
                        {funcionario.avatar} {funcionario.nome}
                      </Title>
                      <Paragraph style={styles.teamMemberEmail}>
                        {funcionario.email}
                      </Paragraph>
                      <Paragraph style={styles.teamMemberRole}>
                        {funcionario.cargo} - {funcionario.departamento}
                      </Paragraph>
                    </View>
                    <View style={styles.teamMemberActions}>
                      <Chip
                        style={[styles.perfilChip, { backgroundColor: getPerfilColor(funcionario.perfil) }]}
                        textStyle={styles.chipText}
                      >
                        {getPerfilLabel(funcionario.perfil)}
                      </Chip>
                      {!isSelectionMode && (
                        <Menu
                          visible={funcionarioMenuVisible === funcionario.id}
                          onDismiss={() => setFuncionarioMenuVisible(null)}
                          anchor={
                            <IconButton
                              icon="dots-vertical"
                              size={20}
                              onPress={() => setFuncionarioMenuVisible(funcionario.id)}
                              style={styles.menuButton}
                            />
                          }
                        >
                          <Menu.Item
                            onPress={() => handleEditarFuncionario(funcionario)}
                            title="Editar"
                            leadingIcon="pencil"
                          />
                          <Menu.Item
                            onPress={() => {
                              console.log('=== MENU ITEM EXCLUIR FUNCIONÁRIO CLICADO ===');
                              console.log('Funcionário:', funcionario);
                              // Fechar menu primeiro
                              setFuncionarioMenuVisible(null);
                              // Pequeno delay para garantir que o menu feche
                              setTimeout(() => {
                                handleExcluirFuncionario(funcionario);
                              }, 100);
                            }}
                            title="Excluir"
                            leadingIcon="delete"
                            titleStyle={{ color: '#f44336' }}
                          />
                        </Menu>
                      )}
                    </View>
                  </View>
                  
                  {funcionario.gestorId ? (
                    <View style={styles.leaderInfo}>
                      <Paragraph style={styles.leaderLabel}>
                        Gestor: {gestores.find(l => l.id === funcionario.gestorId)?.nome || 'Não encontrado'}
                      </Paragraph>
                    </View>
                  ) : (
                    <View style={styles.leaderInfo}>
                      <Paragraph style={styles.leaderLabel}>
                        ⚠️ Sem gestor associado
                      </Paragraph>
                      {!isSelectionMode && (
                        <Button
                          mode="outlined"
                          onPress={() => handleAssociarGestor(funcionario)}
                          style={styles.assignButton}
                          compact
                        >
                          Associar a Gestor
                        </Button>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhum funcionário cadastrado</Title>
                <Paragraph style={styles.emptyDescription}>
                  Cadastre funcionários para sua equipe
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Modal de Confirmação de Exclusão */}
      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={cancelarExclusao}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>
              {t('leader.deleteLeader')}
            </Title>
            
            <Paragraph style={styles.modalMessage}>
              {t('leader.deleteConfirmation', { name: gestorToDelete?.nome || '' })}
            </Paragraph>
            
            {gestorToDelete && getFuncionariosDoGestor(gestorToDelete.id).length > 0 && (
              <Paragraph style={styles.modalWarning}>
                {t('leader.employeesWillBeDisassociated')}
              </Paragraph>
            )}
            
            <Paragraph style={styles.modalFinal}>
              {t('leader.deleteConfirmationFinal')}
            </Paragraph>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelarExclusao}
                style={styles.modalButton}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={confirmarExclusao}
                buttonColor="#f44336"
                textColor="white"
                style={styles.modalButton}
              >
                {t('common.delete')}
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Modal para Associar Funcionário a Gestor */}
      <Portal>
        <Modal
          visible={assignModalVisible}
          onDismiss={cancelarAssociacao}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>
              Associar Colaborador a Gestor
            </Title>
            
            <Paragraph style={styles.modalMessage}>
              Selecione um gestor para o colaborador {funcionarioToAssign?.nome}:
            </Paragraph>
            
            <ScrollView style={styles.leadersList}>
              {gestores.map((gestor) => (
                <Card key={gestor.id} style={styles.leaderCard}>
                  <Card.Content>
                    <View style={styles.leaderCardContent}>
                      <View style={styles.leaderInfo}>
                        <Title style={styles.leaderName}>
                          {gestor.avatar} {gestor.nome}
                        </Title>
                        <Paragraph style={styles.leaderDetails}>
                          {gestor.cargo} - {gestor.departamento}
                        </Paragraph>
                        <Paragraph style={styles.leaderTeam}>
                          Equipe: {getFuncionariosDoGestor(gestor.id).length} funcionário(s)
                        </Paragraph>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => confirmarAssociacao(gestor.id)}
                        style={styles.selectLeaderButton}
                      >
                        Selecionar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelarAssociacao}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Modal para Seleção Múltipla de Gestores */}
      <Portal>
        <Modal
          visible={bulkAssignModalVisible}
          onDismiss={cancelarBulkAssign}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>
              Associar {selectedFuncionarios.length} Colaborador(es) a um Gestor
            </Title>

            <Paragraph style={styles.modalMessage}>
              Selecione um gestor para associar os colaboradores selecionados:
            </Paragraph>

            <ScrollView style={styles.leadersList}>
              {gestores.map((gestor) => (
                <Card key={gestor.id} style={styles.leaderCard}>
                  <Card.Content>
                    <View style={styles.leaderCardContent}>
                      <View style={styles.leaderInfo}>
                        <Title style={styles.leaderName}>
                          {gestor.avatar} {gestor.nome}
                        </Title>
                        <Paragraph style={styles.leaderDetails}>
                          {gestor.cargo} - {gestor.departamento}
                        </Paragraph>
                        <Paragraph style={styles.leaderTeam}>
                          Equipe atual: {getFuncionariosDoGestor(gestor.id).length} funcionário(s)
                        </Paragraph>
                        <Paragraph style={styles.leaderTeam}>
                          Nova equipe: {getFuncionariosDoGestor(gestor.id).length + selectedFuncionarios.length} funcionário(s)
                        </Paragraph>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => confirmarBulkAssign(gestor.id)}
                        style={styles.selectLeaderButton}
                      >
                        Associar
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelarBulkAssign}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Modal de Confirmação de Exclusão de Funcionário */}
      <Portal>
        <Modal
          visible={deleteFuncionarioModalVisible}
          onDismiss={cancelarExclusaoFuncionario}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>
              Excluir Colaborador
            </Title>
            
            <Paragraph style={styles.modalMessage}>
              Tem certeza que deseja excluir o colaborador {funcionarioToDelete?.nome}?
            </Paragraph>
            
            <Paragraph style={styles.modalFinal}>
              Esta ação não pode ser desfeita.
            </Paragraph>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelarExclusaoFuncionario}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={confirmarExclusaoFuncionario}
                buttonColor="#f44336"
                textColor="white"
                style={styles.modalButton}
              >
                Excluir
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  description: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  actionsContainer: {
    padding: 16,
    gap: 16,
  },
  actionCard: {
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  actionDescription: {
    color: '#666',
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  teamContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  teamCard: {
    marginBottom: 16,
    elevation: 2,
  },
  teamMemberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamMemberDetails: {
    flex: 1,
  },
  teamMemberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    margin: 0,
  },
  teamMemberName: {
    fontSize: 16,
    marginBottom: 4,
  },
  teamMemberEmail: {
    color: '#666',
    marginBottom: 2,
  },
  teamMemberRole: {
    color: '#666',
    fontSize: 14,
  },
  perfilChip: {
    marginLeft: 12,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  teamSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  teamSectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#34495e',
  },
  subordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subordinateName: {
    flex: 1,
  },
  subordinateRole: {
    color: '#666',
    fontSize: 14,
  },
  noSubordinates: {
    color: '#999',
    fontStyle: 'italic',
  },
  leaderInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  leaderLabel: {
    color: '#666',
    fontSize: 14,
  },
  emptyCard: {
    elevation: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 0,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalWarning: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    color: '#e67e22',
    fontWeight: '600',
    backgroundColor: '#fef9e7',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  modalFinal: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  assignButton: {
    marginTop: 8,
    borderColor: '#3498db',
  },
  leadersList: {
    maxHeight: 300,
    marginVertical: 16,
  },
  leaderCard: {
    marginBottom: 8,
    elevation: 1,
  },
  leaderCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderName: {
    fontSize: 16,
    marginBottom: 4,
  },
  leaderDetails: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  leaderTeam: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectLeaderButton: {
    marginLeft: 12,
  },
  // Estilos para seleção múltipla
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bulkButton: {
    marginLeft: 8,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedCard: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#e3f2fd',
  },
  selectionIndicator: {
    marginRight: 8,
  },
});
