import FloatingMenu from '@/components/FloatingMenu';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService, { Tarefa } from '@/src/services/MockDataService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Menu, Modal, Paragraph, Portal, Title } from 'react-native-paper';

export default function TarefasScreen() {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState<Tarefa[]>([]);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [tarefaToDelete, setTarefaToDelete] = useState<Tarefa | null>(null);
  
  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('Todos');
  const [ordenacao, setOrdenacao] = useState<string>('Data de Criação');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadTarefas();
  }, []);

  // Recarregar dados sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadTarefas();
    }, [])
  );

  const loadTarefas = () => {
    let tarefasCarregadas: Tarefa[] = [];
    
    if (user?.perfil === 'admin_sistema') {
      tarefasCarregadas = MockDataService.getTarefas();
    } else {
      tarefasCarregadas = MockDataService.getTarefasByEmpresa(user?.empresaId || '');
    }
    
    setTarefas(tarefasCarregadas);
    aplicarFiltros(tarefasCarregadas);
  };

  const aplicarFiltros = (tarefasParaFiltrar: Tarefa[]) => {
    let tarefasFiltradas = [...tarefasParaFiltrar];

    // Filtro por status
    if (filtroStatus !== 'Todos') {
      tarefasFiltradas = tarefasFiltradas.filter(t => t.status === filtroStatus);
    }

    // Filtro por responsável
    if (filtroResponsavel === 'Não Atribuídas') {
      tarefasFiltradas = tarefasFiltradas.filter(t => !t.responsavelId);
    } else if (filtroResponsavel !== 'Todos') {
      tarefasFiltradas = tarefasFiltradas.filter(t => t.responsavelId === filtroResponsavel);
    }

    // Ordenação
    tarefasFiltradas.sort((a, b) => {
      switch (ordenacao) {
        case 'Data de Criação':
          return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
        case 'Data de Conclusão':
          if (!a.dataConclusao && !b.dataConclusao) return 0;
          if (!a.dataConclusao) return 1;
          if (!b.dataConclusao) return -1;
          return new Date(b.dataConclusao).getTime() - new Date(a.dataConclusao).getTime();
        case 'Prioridade':
          const prioridadeOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
          return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
        case 'Título':
          return a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

    setTarefasFiltradas(tarefasFiltradas);
  };

  const handleExecutarTarefa = async (tarefaId: string) => {
    try {
      const tarefaAtualizada = await MockDataService.updateTarefaStatus(tarefaId, 'Em Andamento', user?.id);
      if (tarefaAtualizada) {
        Alert.alert('✅ Sucesso', `Tarefa "${tarefaAtualizada.titulo}" iniciada com sucesso!`);
        loadTarefas();
      } else {
        Alert.alert('❌ Erro', 'Não foi possível iniciar a tarefa.');
      }
    } catch (error) {
      console.error('Erro ao executar tarefa:', error);
      Alert.alert('❌ Erro', 'Erro ao iniciar a tarefa.');
    }
  };

  const handleConcluirTarefa = async (tarefaId: string) => {
    try {
      const tarefaAtualizada = await MockDataService.updateTarefaStatus(tarefaId, 'Concluída', user?.id);
      if (tarefaAtualizada) {
        Alert.alert('✅ Sucesso', `Tarefa "${tarefaAtualizada.titulo}" concluída com sucesso!`);
        loadTarefas();
      } else {
        Alert.alert('❌ Erro', 'Não foi possível concluir a tarefa.');
      }
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      Alert.alert('❌ Erro', 'Erro ao concluir a tarefa.');
    }
  };

  const handleEditarTarefa = (tarefaId: string) => {
    setMenuVisible(null);
    router.push(`/editar-tarefa?tarefaId=${tarefaId}`);
  };

  const handleExcluirTarefa = (tarefa: Tarefa) => {
    setMenuVisible(null);
    setTarefaToDelete(tarefa);
    setDeleteModalVisible(true);
  };

  const confirmarExclusao = async () => {
    if (tarefaToDelete) {
      try {
        const sucesso = await MockDataService.deleteTarefa(tarefaToDelete.id);
        if (sucesso) {
          Alert.alert('✅ Sucesso', `Tarefa "${tarefaToDelete.titulo}" excluída com sucesso!`);
          loadTarefas();
        } else {
          Alert.alert('❌ Erro', 'Não foi possível excluir a tarefa.');
        }
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        Alert.alert('❌ Erro', 'Erro ao excluir a tarefa.');
      }
    }
    setDeleteModalVisible(false);
    setTarefaToDelete(null);
  };

  const cancelarExclusao = () => {
    setDeleteModalVisible(false);
    setTarefaToDelete(null);
  };

  const getResponsavelNome = (responsavelId?: string) => {
    if (!responsavelId) return 'Não atribuído';
    const responsavel = MockDataService.getUsuarioById(responsavelId);
    return responsavel ? responsavel.nome : 'Usuário não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return '#4caf50';
      case 'Em Andamento':
        return '#ff9800';
      case 'Pendente':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return '#f44336';
      case 'Média':
        return '#ff9800';
      case 'Baixa':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Tarefas</Title>
          <Paragraph>Gerencie as tarefas da equipe</Paragraph>
          {console.log('Perfil do usuário:', user?.perfil)}
          {(user?.perfil === 'lider' || user?.perfil === 'dono_empresa') && (
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={() => router.push('/criar-tarefa')}
                style={styles.createButton}
                icon="plus"
              >
                Nova Tarefa
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/atribuir-tarefas-lote')}
                style={styles.batchButton}
                icon="account-multiple-plus"
              >
                Atribuir em Lote
              </Button>
            </View>
          )}
        </View>

        <View style={styles.list}>
          {tarefas.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhuma tarefa encontrada</Title>
                <Paragraph style={styles.emptyText}>
                  {user?.perfil === 'colaborador' 
                    ? 'Você não possui tarefas atribuídas ainda.'
                    : 'Crie uma nova tarefa para começar.'
                  }
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            tarefas.map((tarefa) => (
              <Card key={tarefa.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.cardTitle}>{tarefa.titulo}</Title>
                    {(user?.perfil === 'lider' || user?.perfil === 'dono_empresa') && (
                      <Menu
                        visible={menuVisible === tarefa.id}
                        onDismiss={() => setMenuVisible(null)}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            onPress={() => setMenuVisible(tarefa.id)}
                          />
                        }
                      >
                        <Menu.Item
                          onPress={() => handleEditarTarefa(tarefa.id)}
                          title="Editar"
                          leadingIcon="pencil"
                        />
                        <Menu.Item
                          onPress={() => handleExcluirTarefa(tarefa)}
                          title="Excluir"
                          leadingIcon="delete"
                        />
                      </Menu>
                    )}
                  </View>
                  
                  <Paragraph style={styles.description}>{tarefa.descricao}</Paragraph>
                  
                  <View style={styles.chips}>
                    <Chip 
                      style={[styles.chip, { backgroundColor: getStatusColor(tarefa.status) }]}
                      textStyle={styles.chipText}
                    >
                      {tarefa.status}
                    </Chip>
                    <Chip 
                      style={[styles.chip, { backgroundColor: getPrioridadeColor(tarefa.prioridade) }]}
                      textStyle={styles.chipText}
                    >
                      {tarefa.prioridade}
                    </Chip>
                  </View>

                  <Paragraph style={styles.info}>
                    <Paragraph style={styles.label}>Responsável:</Paragraph> {getResponsavelNome(tarefa.responsavelId)}
                  </Paragraph>
                  {tarefa.dataPrazo && (
                    <Paragraph style={styles.info}>
                      <Paragraph style={styles.label}>Prazo:</Paragraph> {tarefa.dataPrazo}
                    </Paragraph>
                  )}
                  {tarefa.dataConclusao && (
                    <Paragraph style={styles.info}>
                      <Paragraph style={styles.label}>Concluída em:</Paragraph> {tarefa.dataConclusao}
                    </Paragraph>
                  )}
                </Card.Content>
                <Card.Actions>
                  {tarefa.status === 'Pendente' && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleExecutarTarefa(tarefa.id)}
                    >
                      Executar
                    </Button>
                  )}
                  {tarefa.status === 'Em Andamento' && tarefa.responsavelId === user?.id && (
                    <Button 
                      mode="contained" 
                      compact
                      onPress={() => handleConcluirTarefa(tarefa.id)}
                    >
                      Concluir
                    </Button>
                  )}
                </Card.Actions>
              </Card>
            ))
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
              Excluir Tarefa
            </Title>
            
            <Paragraph style={styles.modalMessage}>
              Tem certeza que deseja excluir a tarefa "{tarefaToDelete?.titulo}"?
            </Paragraph>
            
            <Paragraph style={styles.modalFinal}>
              Esta ação não pode ser desfeita.
            </Paragraph>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={cancelarExclusao}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={confirmarExclusao}
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

      <FloatingMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  createButton: {
    flex: 1,
  },
  batchButton: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f9f9f9',
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    color: '#666',
  },
  chips: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  info: {
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFinal: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
