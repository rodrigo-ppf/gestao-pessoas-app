import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService, { Tarefa } from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Modal, Paragraph, Portal, Title } from 'react-native-paper';

export default function AtribuirTarefasLoteScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<string[]>([]);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');
  const [modalResponsavelVisible, setModalResponsavelVisible] = useState(false);

  const usuarios = MockDataService.getUsuariosByEmpresa(user?.empresaId || '');

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = () => {
    let tarefasCarregadas: Tarefa[] = [];
    
    if (user?.perfil === 'admin_sistema') {
      tarefasCarregadas = MockDataService.getTarefas();
    } else {
      tarefasCarregadas = MockDataService.getTarefasByEmpresa(user?.empresaId || '');
    }
    
    // Filtrar apenas tarefas não atribuídas ou com responsável diferente do selecionado
    const tarefasDisponiveis = tarefasCarregadas.filter(t => 
      !t.responsavelId || t.responsavelId !== responsavelSelecionado
    );
    
    setTarefas(tarefasDisponiveis);
  };

  const toggleTarefaSelecao = (tarefaId: string) => {
    setTarefasSelecionadas(prev => 
      prev.includes(tarefaId) 
        ? prev.filter(id => id !== tarefaId)
        : [...prev, tarefaId]
    );
  };

  const selecionarTodasTarefas = () => {
    if (tarefasSelecionadas.length === tarefas.length) {
      setTarefasSelecionadas([]);
    } else {
      setTarefasSelecionadas(tarefas.map(t => t.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return '#4caf50';
      case 'Em Andamento':
        return '#3498db';
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
        return '#f39c12';
      case 'Baixa':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getResponsavelNome = (responsavelId?: string) => {
    if (!responsavelId) return 'Não atribuído';
    const responsavel = MockDataService.getUsuarioById(responsavelId);
    return responsavel ? responsavel.nome : 'Usuário não encontrado';
  };

  const handleAtribuirTarefas = async () => {
    if (tarefasSelecionadas.length === 0) {
      Alert.alert('❌ Erro', 'Selecione pelo menos uma tarefa para atribuir.');
      return;
    }

    if (!responsavelSelecionado) {
      Alert.alert('❌ Erro', 'Selecione um responsável para as tarefas.');
      return;
    }

    setLoading(true);

    try {
      // Simular operação de atribuição
      await new Promise(resolve => setTimeout(resolve, 1500));

      const responsavel = MockDataService.getUsuarioById(responsavelSelecionado);
      const responsavelNome = responsavel?.nome || 'Usuário não encontrado';
      
      let tarefasAtribuidas = 0;

      for (const tarefaId of tarefasSelecionadas) {
        const tarefa = MockDataService.getTarefaById(tarefaId);
        if (tarefa) {
          await MockDataService.updateTarefa(tarefaId, {
            responsavelId: responsavelSelecionado
          }, user?.id);
          tarefasAtribuidas++;
        }
      }

      Alert.alert(
        '✅ Sucesso!',
        `${tarefasAtribuidas} tarefa(s) atribuída(s) com sucesso para ${responsavelNome}!`,
        [
          {
            text: 'Atribuir Mais',
            style: 'cancel',
            onPress: () => {
              setTarefasSelecionadas([]);
              carregarTarefas();
            }
          },
          {
            text: 'Ver Tarefas',
            onPress: navegarParaTarefas
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao atribuir tarefas:', error);
      Alert.alert('❌ Erro', 'Não foi possível atribuir as tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const navegarParaTarefas = () => {
    console.log('Tentando navegar para tarefas...');
    // Usar push que é mais confiável
    router.push('/tarefas');
    console.log('Navegação com push executada');
  };

  const handleVoltar = () => {
    console.log('handleVoltar chamado');
    console.log('Tarefas selecionadas:', tarefasSelecionadas.length);
    
    if (tarefasSelecionadas.length > 0) {
      console.log('Mostrando alert de confirmação');
      Alert.alert(
        '⚠️ Descartar Seleções',
        'Você tem tarefas selecionadas.\n\nDeseja descartar as seleções e voltar?',
        [
          {
            text: 'Continuar Selecionando',
            style: 'cancel',
            onPress: () => console.log('Usuário escolheu continuar selecionando')
          },
          {
            text: 'Descartar e Voltar',
            style: 'destructive',
            onPress: () => {
              console.log('Usuário escolheu descartar e voltar');
              navegarParaTarefas();
            }
          }
        ]
      );
    } else {
      console.log('Nenhuma tarefa selecionada, navegando diretamente');
      navegarParaTarefas();
    }
  };

  return (
    <MainLayout title="Atribuir Tarefas em Lote" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>Selecione as tarefas e atribua a um responsável</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            {/* Seleção de Responsável */}
            <View style={styles.responsavelSection}>
              <Title style={styles.sectionTitle}>Responsável</Title>
              <Button
                mode="outlined"
                onPress={() => setModalResponsavelVisible(true)}
                style={styles.responsavelButton}
                icon="account"
              >
                {responsavelSelecionado 
                  ? getResponsavelNome(responsavelSelecionado)
                  : 'Selecionar Responsável'
                }
              </Button>
            </View>

            {/* Controles de Seleção */}
            {tarefas.length > 0 && (
              <View style={styles.controlesSection}>
                <View style={styles.controlesHeader}>
                  <Title style={styles.sectionTitle}>
                    Tarefas Disponíveis ({tarefas.length})
                  </Title>
                  <Button
                    mode="text"
                    onPress={selecionarTodasTarefas}
                    compact
                  >
                    {tarefasSelecionadas.length === tarefas.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Button>
                </View>
                
                <Paragraph style={styles.selecionadasText}>
                  {tarefasSelecionadas.length} tarefa(s) selecionada(s)
                </Paragraph>
              </View>
            )}

            {/* Lista de Tarefas */}
            <View style={styles.tarefasSection}>
              {tarefas.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Paragraph style={styles.emptyText}>
                      {responsavelSelecionado 
                        ? 'Todas as tarefas já estão atribuídas para este responsável.'
                        : 'Selecione um responsável para ver as tarefas disponíveis.'
                      }
                    </Paragraph>
                  </Card.Content>
                </Card>
              ) : (
                tarefas.map((tarefa) => (
                  <Card 
                    key={tarefa.id} 
                    style={[
                      styles.tarefaCard,
                      tarefasSelecionadas.includes(tarefa.id) && styles.tarefaSelecionada
                    ]}
                  >
                    <Card.Content>
                      <View style={styles.tarefaHeader}>
                        <Title style={styles.tarefaTitulo}>{tarefa.titulo}</Title>
                        <Button
                          mode={tarefasSelecionadas.includes(tarefa.id) ? "contained" : "outlined"}
                          onPress={() => toggleTarefaSelecao(tarefa.id)}
                          compact
                        >
                          {tarefasSelecionadas.includes(tarefa.id) ? 'Selecionada' : 'Selecionar'}
                        </Button>
                      </View>
                      
                      <Paragraph style={styles.tarefaDescricao}>{tarefa.descricao}</Paragraph>
                      
                      <View style={styles.tarefaChips}>
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

                      <Paragraph style={styles.tarefaInfo}>
                        <Paragraph style={styles.label}>Responsável atual:</Paragraph> {getResponsavelNome(tarefa.responsavelId)}
                      </Paragraph>
                      
                      {tarefa.dataPrazo && (
                        <Paragraph style={styles.tarefaInfo}>
                          <Paragraph style={styles.label}>Prazo:</Paragraph> {tarefa.dataPrazo}
                        </Paragraph>
                      )}
                    </Card.Content>
                  </Card>
                ))
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Botão voltar pressionado diretamente');
                  router.push('/tarefas');
                }}
                style={styles.cancelButton}
                icon="arrow-left"
              >
                Voltar
              </Button>
              
              <Button
                mode="contained"
                onPress={handleAtribuirTarefas}
                loading={loading}
                disabled={loading || tarefasSelecionadas.length === 0 || !responsavelSelecionado}
                style={styles.saveButton}
                icon="account-plus"
              >
                {loading ? 'Atribuindo...' : `Atribuir ${tarefasSelecionadas.length} Tarefa(s)`}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Seleção de Responsável */}
      <Portal>
        <Modal
          visible={modalResponsavelVisible}
          onDismiss={() => setModalResponsavelVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Selecionar Responsável</Title>
            
            <ScrollView style={styles.modalScroll}>
              {usuarios.map((usuario) => (
                <Button
                  key={usuario.id}
                  mode={responsavelSelecionado === usuario.id ? 'contained' : 'outlined'}
                  onPress={() => {
                    setResponsavelSelecionado(usuario.id);
                    setModalResponsavelVisible(false);
                    carregarTarefas(); // Recarregar tarefas com novo filtro
                  }}
                  style={styles.usuarioButton}
                >
                  {usuario.nome} - {usuario.cargo}
                </Button>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalResponsavelVisible(false)}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  formCard: {
    margin: 16,
    elevation: 2,
  },
  responsavelSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  responsavelButton: {
    marginBottom: 8,
  },
  controlesSection: {
    marginBottom: 16,
  },
  controlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selecionadasText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  tarefasSection: {
    marginBottom: 16,
  },
  emptyCard: {
    marginBottom: 16,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  tarefaCard: {
    marginBottom: 12,
    elevation: 1,
  },
  tarefaSelecionada: {
    borderWidth: 2,
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  tarefaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  tarefaDescricao: {
    marginBottom: 12,
    color: '#666',
  },
  tarefaChips: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  tarefaInfo: {
    marginBottom: 4,
    fontSize: 14,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 5,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 5,
  },
  // Estilos do Modal
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalScroll: {
    width: '100%',
    maxHeight: 300,
  },
  usuarioButton: {
    marginBottom: 8,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
});
