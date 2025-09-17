import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, DataTable, Modal, Paragraph, Portal, Text, TextInput, Title } from 'react-native-paper';

interface SolicitacaoFerias {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  dataInicio: string;
  dataFim: string;
  diasSolicitados: number;
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataSolicitacao: string;
  aprovadoPor?: string;
  dataAprovacao?: string;
  motivoRejeicao?: string;
}

export default function AprovarFeriasScreen() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoFerias | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroColaborador, setFiltroColaborador] = useState('');

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      // Simular dados de solicitações de férias
      const solicitacoesSimuladas: SolicitacaoFerias[] = [
        {
          id: '1',
          colaboradorId: '1',
          colaboradorNome: 'João Silva',
          colaboradorCargo: 'Desenvolvedor',
          dataInicio: '15/01/2025',
          dataFim: '29/01/2025',
          diasSolicitados: 15,
          observacoes: 'Férias de verão',
          status: 'pendente',
          dataSolicitacao: '10/12/2024'
        },
        {
          id: '2',
          colaboradorId: '2',
          colaboradorNome: 'Ana Costa',
          colaboradorCargo: 'Analista',
          dataInicio: '10/03/2025',
          dataFim: '24/03/2025',
          diasSolicitados: 15,
          observacoes: 'Viagem familiar',
          status: 'pendente',
          dataSolicitacao: '05/01/2025'
        },
        {
          id: '3',
          colaboradorId: '3',
          colaboradorNome: 'Pedro Oliveira',
          colaboradorCargo: 'Designer',
          dataInicio: '05/02/2025',
          dataFim: '19/02/2025',
          diasSolicitados: 15,
          observacoes: 'Carnaval',
          status: 'pendente',
          dataSolicitacao: '20/12/2024'
        },
        {
          id: '4',
          colaboradorId: '4',
          colaboradorNome: 'Maria Santos',
          colaboradorCargo: 'Gestora',
          dataInicio: '20/07/2025',
          dataFim: '03/08/2025',
          diasSolicitados: 15,
          observacoes: 'Férias de inverno',
          status: 'aprovado',
          dataSolicitacao: '15/06/2025',
          aprovadoPor: 'Carlos Lima (Gestor)',
          dataAprovacao: '18/06/2025'
        },
        {
          id: '5',
          colaboradorId: '5',
          colaboradorNome: 'Carlos Lima',
          colaboradorCargo: 'Coordenador',
          dataInicio: '10/12/2024',
          dataFim: '24/12/2024',
          diasSolicitados: 15,
          observacoes: 'Férias de fim de ano',
          status: 'rejeitado',
          dataSolicitacao: '01/11/2024',
          aprovadoPor: 'Ana Costa (Gestora)',
          dataAprovacao: '05/11/2024',
          motivoRejeicao: 'Período de alta demanda'
        }
      ];
      setSolicitacoes(solicitacoesSimuladas);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return '#4caf50';
      case 'rejeitado': return '#f44336';
      case 'pendente': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'rejeitado': return 'Rejeitado';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const abrirModal = (solicitacao: SolicitacaoFerias) => {
    setSolicitacaoSelecionada(solicitacao);
    setMotivoRejeicao('');
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setSolicitacaoSelecionada(null);
    setMotivoRejeicao('');
  };

  const aprovarSolicitacao = async (solicitacao: SolicitacaoFerias) => {
    setLoading(true);
    
    try {
      const solicitacaoAtualizada: SolicitacaoFerias = {
        ...solicitacao,
        status: 'aprovado' as const,
        aprovadoPor: `${user?.nome} (${user?.perfil})`,
        dataAprovacao: formatarData(new Date())
      };

      setSolicitacoes(prev => 
        prev.map(s => s.id === solicitacao.id ? solicitacaoAtualizada : s)
      );

      Alert.alert('Sucesso', 'Solicitação de férias aprovada com sucesso!');
      fecharModal();
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aprovar a solicitação de férias.');
    } finally {
      setLoading(false);
    }
  };

  const rejeitarSolicitacao = async (solicitacao: SolicitacaoFerias) => {
    if (!motivoRejeicao.trim()) {
      Alert.alert('Erro', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    setLoading(true);
    
    try {
      const solicitacaoAtualizada: SolicitacaoFerias = {
        ...solicitacao,
        status: 'rejeitado' as const,
        aprovadoPor: `${user?.nome} (${user?.perfil})`,
        dataAprovacao: formatarData(new Date()),
        motivoRejeicao: motivoRejeicao.trim()
      };

      setSolicitacoes(prev => 
        prev.map(s => s.id === solicitacao.id ? solicitacaoAtualizada : s)
      );

      Alert.alert('Sucesso', 'Solicitação de férias rejeitada com sucesso!');
      fecharModal();
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível rejeitar a solicitação de férias.');
    } finally {
      setLoading(false);
    }
  };

  const aprovarTodasPendentes = async () => {
    Alert.alert(
      'Confirmar Aprovação',
      'Deseja aprovar todas as solicitações pendentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aprovar Todas', 
          onPress: async () => {
            setLoading(true);
            
            try {
              const solicitacoesAtualizadas = solicitacoes.map(solicitacao => {
                if (solicitacao.status === 'pendente') {
                  return {
                    ...solicitacao,
                    status: 'aprovado' as const,
                    aprovadoPor: `${user?.nome} (${user?.perfil})`,
                    dataAprovacao: formatarData(new Date())
                  };
                }
                return solicitacao;
              });

              setSolicitacoes(solicitacoesAtualizadas);
              
              const totalAprovadas = solicitacoesAtualizadas.filter(s => s.status === 'aprovado' && s.aprovadoPor?.includes(user?.nome || '')).length;
              Alert.alert('Sucesso', `${totalAprovadas} solicitações de férias aprovadas com sucesso!`);
              
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aprovar as solicitações de férias.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const matchStatus = filtroStatus === 'todos' || solicitacao.status === filtroStatus;
    const matchColaborador = !filtroColaborador || 
      solicitacao.colaboradorNome.toLowerCase().includes(filtroColaborador.toLowerCase());
    
    return matchStatus && matchColaborador;
  });

  const totalPendentes = solicitacoes.filter(s => s.status === 'pendente').length;
  const totalAprovadas = solicitacoes.filter(s => s.status === 'aprovado').length;
  const totalRejeitadas = solicitacoes.filter(s => s.status === 'rejeitado').length;

  return (
    <MainLayout title="Aprovar Férias" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>Gerencie as solicitações de férias dos colaboradores</Paragraph>
        </View>

        {/* Resumo */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Resumo</Title>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalPendentes}</Text>
                <Text style={styles.summaryLabel}>Pendentes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalAprovadas}</Text>
                <Text style={styles.summaryLabel}>Aprovadas</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalRejeitadas}</Text>
                <Text style={styles.summaryLabel}>Rejeitadas</Text>
              </View>
            </View>

            {totalPendentes > 0 && (
              <Button
                mode="contained"
                onPress={aprovarTodasPendentes}
                loading={loading}
                disabled={loading}
                style={styles.approveAllButton}
                icon="check-all"
              >
                Aprovar Todas Pendentes
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Filtros */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Filtros</Title>
            
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.segmentedButtons}>
                <Button
                  mode={filtroStatus === 'todos' ? 'contained' : 'outlined'}
                  onPress={() => setFiltroStatus('todos')}
                  style={styles.filterButton}
                >
                  Todos
                </Button>
                <Button
                  mode={filtroStatus === 'pendente' ? 'contained' : 'outlined'}
                  onPress={() => setFiltroStatus('pendente')}
                  style={styles.filterButton}
                >
                  Pendente
                </Button>
                <Button
                  mode={filtroStatus === 'aprovado' ? 'contained' : 'outlined'}
                  onPress={() => setFiltroStatus('aprovado')}
                  style={styles.filterButton}
                >
                  Aprovado
                </Button>
                <Button
                  mode={filtroStatus === 'rejeitado' ? 'contained' : 'outlined'}
                  onPress={() => setFiltroStatus('rejeitado')}
                  style={styles.filterButton}
                >
                  Rejeitado
                </Button>
              </View>
            </View>

            <TextInput
              label="Filtrar por colaborador"
              value={filtroColaborador}
              onChangeText={setFiltroColaborador}
              style={styles.searchInput}
              mode="outlined"
              placeholder="Digite o nome do colaborador..."
              right={<TextInput.Icon icon={() => <UniversalIcon name="search" size={20} color="#666" />} />}
            />
          </Card.Content>
        </Card>

        {/* Lista de Solicitações */}
        <Card style={styles.recordsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Solicitações de Férias</Title>
            
            {solicitacoesFiltradas.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma solicitação encontrada</Text>
              </View>
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Colaborador</DataTable.Title>
                  <DataTable.Title>Período</DataTable.Title>
                  <DataTable.Title numeric>Dias</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Ações</DataTable.Title>
                </DataTable.Header>

                {solicitacoesFiltradas.map((solicitacao) => (
                  <DataTable.Row key={solicitacao.id}>
                    <DataTable.Cell>
                      <View>
                        <Text style={styles.colaboradorNome}>{solicitacao.colaboradorNome}</Text>
                        <Text style={styles.colaboradorCargo}>{solicitacao.colaboradorCargo}</Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View>
                        <Text style={styles.periodoText}>
                          {solicitacao.dataInicio} a {solicitacao.dataFim}
                        </Text>
                        <Text style={styles.dataSolicitacao}>
                          Solicitado em: {solicitacao.dataSolicitacao}
                        </Text>
                        {solicitacao.observacoes && (
                          <Text style={styles.observacoesText}>
                            {solicitacao.observacoes}
                          </Text>
                        )}
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Chip style={styles.daysChip} textStyle={styles.chipText}>
                        {solicitacao.diasSolicitados}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <View>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: getStatusColor(solicitacao.status) + '20' }]}
                          textStyle={[styles.chipText, { color: getStatusColor(solicitacao.status) }]}
                        >
                          {getStatusText(solicitacao.status)}
                        </Chip>
                        {solicitacao.aprovadoPor && (
                          <Text style={styles.aprovadoPor}>
                            Por: {solicitacao.aprovadoPor}
                          </Text>
                        )}
                        {solicitacao.motivoRejeicao && (
                          <Text style={styles.motivoRejeicao}>
                            Motivo: {solicitacao.motivoRejeicao}
                          </Text>
                        )}
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {solicitacao.status === 'pendente' ? (
                        <View style={styles.actionButtons}>
                          <Button
                            mode="contained"
                            onPress={() => abrirModal(solicitacao)}
                            style={styles.reviewButton}
                            icon="eye"
                          >
                            Revisar
                          </Button>
                        </View>
                      ) : (
                        <Text style={styles.processedText}>
                          {solicitacao.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                        </Text>
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            )}
          </Card.Content>
        </Card>

        {/* Modal de Revisão */}
        <Portal>
          <Modal
            visible={showModal}
            onDismiss={fecharModal}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Title style={styles.modalTitle}>Revisar Solicitação de Férias</Title>
              
              {solicitacaoSelecionada && (
                <>
                  <View style={styles.modalRegistroInfo}>
                    <Text style={styles.infoLabel}>Colaborador:</Text>
                    <Text style={styles.infoValue}>
                      {solicitacaoSelecionada.colaboradorNome} - {solicitacaoSelecionada.colaboradorCargo}
                    </Text>
                    
                    <Text style={styles.infoLabel}>Período:</Text>
                    <Text style={styles.infoValue}>
                      {solicitacaoSelecionada.dataInicio} a {solicitacaoSelecionada.dataFim}
                    </Text>
                    
                    <Text style={styles.infoLabel}>Dias Solicitados:</Text>
                    <Text style={styles.infoValue}>{solicitacaoSelecionada.diasSolicitados} dias</Text>
                    
                    <Text style={styles.infoLabel}>Data da Solicitação:</Text>
                    <Text style={styles.infoValue}>{solicitacaoSelecionada.dataSolicitacao}</Text>
                    
                    {solicitacaoSelecionada.observacoes && (
                      <>
                        <Text style={styles.infoLabel}>Observações:</Text>
                        <Text style={styles.infoValue}>{solicitacaoSelecionada.observacoes}</Text>
                      </>
                    )}
                  </View>

                  <TextInput
                    label="Motivo da rejeição (obrigatório para rejeitar)"
                    value={motivoRejeicao}
                    onChangeText={setMotivoRejeicao}
                    style={styles.motivoInput}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    placeholder="Informe o motivo da rejeição..."
                  />

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={fecharModal}
                      style={styles.modalButton}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => rejeitarSolicitacao(solicitacaoSelecionada)}
                      loading={loading}
                      disabled={loading}
                      style={[styles.modalButton, styles.rejectButton]}
                      icon="close"
                    >
                      Rejeitar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => aprovarSolicitacao(solicitacaoSelecionada)}
                      loading={loading}
                      disabled={loading}
                      style={styles.modalButton}
                      icon="check"
                    >
                      Aprovar
                    </Button>
                  </View>
                </>
              )}
            </View>
          </Modal>
        </Portal>
      </ScrollView>
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
  summaryCard: {
    margin: 16,
    elevation: 2,
  },
  filterCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  recordsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#1976d2',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 80,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  approveAllButton: {
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
  },
  segmentedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    minWidth: 80,
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  colaboradorNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  colaboradorCargo: {
    fontSize: 12,
    color: '#666',
  },
  periodoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dataSolicitacao: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  observacoesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  daysChip: {
    backgroundColor: '#e3f2fd',
    height: 28,
  },
  statusChip: {
    height: 28,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aprovadoPor: {
    fontSize: 10,
    color: '#666',
  },
  motivoRejeicao: {
    fontSize: 10,
    color: '#f44336',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    minWidth: 80,
  },
  processedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalRegistroInfo: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    marginBottom: 4,
  },
  motivoInput: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
});
