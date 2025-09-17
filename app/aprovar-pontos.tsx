import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService from '@/src/services/MockDataService';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { Button, Card, Chip, Modal, Paragraph, Portal, SegmentedButtons, Text, TextInput, Title } from 'react-native-paper';

interface RegistroPontoAprovacao {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  data: string;
  tipo: 'entrada' | 'saida';
  horario: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
  };
  timestamp: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  aprovadoPor?: string;
  dataAprovacao?: string;
}

interface ResumoAprovacao {
  totalRegistros: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

export default function AprovarPontosScreen() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<RegistroPontoAprovacao[]>([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<RegistroPontoAprovacao[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroColaborador, setFiltroColaborador] = useState('');
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [resumo, setResumo] = useState<ResumoAprovacao>({
    totalRegistros: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0
  });
  const [modalAprovacao, setModalAprovacao] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroPontoAprovacao | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [agruparPorFuncionario, setAgruparPorFuncionario] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [registros, filtroStatus, filtroColaborador]);

  const carregarDados = async () => {
    try {
      const colaboradoresData = await MockDataService.getColaboradores();
      setColaboradores(colaboradoresData);
      
      // Gerar registros simulados para aprovação
      const registrosSimulados = gerarRegistrosSimulados(colaboradoresData);
      setRegistros(registrosSimulados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const gerarRegistrosSimulados = (colaboradores: any[]) => {
    const registros: RegistroPontoAprovacao[] = [];
    const hoje = new Date();
    
    // Filtrar apenas funcionários (não líderes, admins ou donos)
    const funcionarios = colaboradores.filter(colaborador => 
      colaborador.perfil === 'funcionario'
    );
    
    // Gerar registros dos últimos 15 dias
    for (let i = 0; i < 15; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      
      funcionarios.forEach(funcionario => {
        const diaSemana = data.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) { // Dias úteis
          // Simular entrada entre 7h e 9h
          const horaEntrada = 7 + Math.floor(Math.random() * 3);
          const minutoEntrada = Math.floor(Math.random() * 60);
          const timestampEntrada = new Date(data);
          timestampEntrada.setHours(horaEntrada, minutoEntrada, 0, 0);

          // Simular saída entre 17h e 19h
          const horaSaida = 17 + Math.floor(Math.random() * 3);
          const minutoSaida = Math.floor(Math.random() * 60);
          const timestampSaida = new Date(data);
          timestampSaida.setHours(horaSaida, minutoSaida, 0, 0);

          // 70% pendente, 20% aprovado, 10% rejeitado para demonstração
          const rand = Math.random();
          let statusEntrada: string;
          let statusSaida: string;
          
          if (rand < 0.7) {
            statusEntrada = 'pendente';
            statusSaida = 'pendente';
          } else if (rand < 0.9) {
            statusEntrada = 'aprovado';
            statusSaida = 'aprovado';
          } else {
            statusEntrada = 'rejeitado';
            statusSaida = 'rejeitado';
          }

          registros.push({
            id: `entrada_${funcionario.id}_${timestampEntrada.getTime()}`,
            colaboradorId: funcionario.id,
            colaboradorNome: funcionario.nome,
            colaboradorCargo: funcionario.cargo,
            data: data.toLocaleDateString('pt-BR'),
            tipo: 'entrada',
            horario: timestampEntrada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestampEntrada.getTime(),
            status: statusEntrada as 'pendente' | 'aprovado' | 'rejeitado',
            observacoes: statusEntrada === 'rejeitado' ? 'Horário irregular - entrada após 9h' : undefined,
            aprovadoPor: statusEntrada !== 'pendente' ? 'Líder Teste' : undefined,
            dataAprovacao: statusEntrada !== 'pendente' ? new Date().toLocaleDateString('pt-BR') : undefined
          });

          registros.push({
            id: `saida_${funcionario.id}_${timestampSaida.getTime()}`,
            colaboradorId: funcionario.id,
            colaboradorNome: funcionario.nome,
            colaboradorCargo: funcionario.cargo,
            data: data.toLocaleDateString('pt-BR'),
            tipo: 'saida',
            horario: timestampSaida.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestampSaida.getTime(),
            status: statusSaida as 'pendente' | 'aprovado' | 'rejeitado',
            observacoes: statusSaida === 'rejeitado' ? 'Saída antecipada - antes das 17h' : undefined,
            aprovadoPor: statusSaida !== 'pendente' ? 'Líder Teste' : undefined,
            dataAprovacao: statusSaida !== 'pendente' ? new Date().toLocaleDateString('pt-BR') : undefined
          });
        }
      });
    }

    return registros.sort((a, b) => b.timestamp - a.timestamp);
  };

  const aplicarFiltros = () => {
    let filtrados = [...registros];

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(registro => registro.status === filtroStatus);
    }

    // Filtro por colaborador
    if (filtroColaborador) {
      filtrados = filtrados.filter(registro => 
        registro.colaboradorNome.toLowerCase().includes(filtroColaborador.toLowerCase())
      );
    }

    setRegistrosFiltrados(filtrados);
    calcularResumo();
  };

  const calcularResumo = () => {
    const total = registros.length;
    const pendentes = registros.filter(r => r.status === 'pendente').length;
    const aprovados = registros.filter(r => r.status === 'aprovado').length;
    const rejeitados = registros.filter(r => r.status === 'rejeitado').length;

    setResumo({
      totalRegistros: total,
      pendentes,
      aprovados,
      rejeitados
    });
  };

  const agruparRegistrosPorFuncionario = () => {
    const agrupados = new Map<string, RegistroPontoAprovacao[]>();
    
    registrosFiltrados.forEach(registro => {
      if (!agrupados.has(registro.colaboradorId)) {
        agrupados.set(registro.colaboradorId, []);
      }
      agrupados.get(registro.colaboradorId)!.push(registro);
    });

    return Array.from(agrupados.entries()).map(([funcionarioId, registros]) => ({
      funcionarioId,
      funcionarioNome: registros[0].colaboradorNome,
      funcionarioCargo: registros[0].colaboradorCargo,
      registros: registros.sort((a, b) => a.timestamp - b.timestamp),
      totalPendentes: registros.filter(r => r.status === 'pendente').length,
      totalAprovados: registros.filter(r => r.status === 'aprovado').length,
      totalRejeitados: registros.filter(r => r.status === 'rejeitado').length
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return '#ff9800';
      case 'aprovado':
        return '#4caf50';
      case 'rejeitado':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'clock-alert';
      case 'aprovado':
        return 'check-circle';
      case 'rejeitado':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const abrirModalAprovacao = (registro: RegistroPontoAprovacao) => {
    setRegistroSelecionado(registro);
    setObservacoes(registro.observacoes || '');
    setModalAprovacao(true);
  };

  const fecharModalAprovacao = () => {
    setModalAprovacao(false);
    setRegistroSelecionado(null);
    setObservacoes('');
  };

  const aprovarRegistro = (aprovado: boolean) => {
    if (!registroSelecionado) return;

    setLoading(true);
    
    try {
      const novosRegistros = registros.map(registro => {
        if (registro.id === registroSelecionado.id) {
          return {
            ...registro,
            status: aprovado ? 'aprovado' : 'rejeitado',
            observacoes: observacoes || undefined,
            aprovadoPor: user?.nome || 'Usuário',
            dataAprovacao: new Date().toLocaleDateString('pt-BR')
          };
        }
        return registro;
      });

      setRegistros(novosRegistros);
      fecharModalAprovacao();
      
      Alert.alert(
        'Sucesso', 
        `Registro ${aprovado ? 'aprovado' : 'rejeitado'} com sucesso!`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a aprovação.');
    } finally {
      setLoading(false);
    }
  };

  const aprovarTodosPendentes = () => {
    Alert.alert(
      'Aprovar Todos',
      'Deseja aprovar todos os registros pendentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: () => {
            setLoading(true);
            
            try {
              const novosRegistros = registros.map(registro => {
                if (registro.status === 'pendente') {
                  return {
                    ...registro,
                    status: 'aprovado' as const,
                    aprovadoPor: user?.nome || 'Usuário',
                    dataAprovacao: new Date().toLocaleDateString('pt-BR')
                  };
                }
                return registro;
              });

              setRegistros(novosRegistros);
              
              Alert.alert('Sucesso', 'Todos os registros pendentes foram aprovados!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aprovar todos os registros.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <MainLayout title="Aprovar Pontos" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>Revise e aprove os registros de ponto dos colaboradores</Paragraph>
        </View>

        {/* Resumo */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Resumo de Aprovações</Title>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{resumo.totalRegistros}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#ff9800' }]}>{resumo.pendentes}</Text>
                <Text style={styles.summaryLabel}>Pendentes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#4caf50' }]}>{resumo.aprovados}</Text>
                <Text style={styles.summaryLabel}>Aprovados</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#f44336' }]}>{resumo.rejeitados}</Text>
                <Text style={styles.summaryLabel}>Rejeitados</Text>
              </View>
            </View>

            {resumo.pendentes > 0 && (
              <Button
                mode="contained"
                onPress={aprovarTodosPendentes}
                style={styles.approveAllButton}
                icon="check-all"
              >
                Aprovar Todos Pendentes
              </Button>
            )}
          </Card.Content>
        </Card>

         {/* Filtros */}
         <Card style={styles.filterCard}>
           <Card.Content>
             <Title style={styles.sectionTitle}>Filtros e Visualização</Title>
             
             <View style={styles.filtersContainer}>
               <View style={styles.filterRow}>
                 <Text style={styles.filterLabel}>Status:</Text>
                 <SegmentedButtons
                   value={filtroStatus}
                   onValueChange={setFiltroStatus}
                   buttons={[
                     { value: 'todos', label: 'Todos' },
                     { value: 'pendente', label: 'Pendentes' },
                     { value: 'aprovado', label: 'Aprovados' },
                     { value: 'rejeitado', label: 'Rejeitados' }
                   ]}
                   style={styles.segmentedButtons}
                 />
               </View>

               <View style={styles.filterRow}>
                 <Text style={styles.filterLabel}>Colaborador:</Text>
                 <TextInput
                   label="Buscar colaborador"
                   value={filtroColaborador}
                   onChangeText={setFiltroColaborador}
                   style={styles.searchInput}
                   mode="outlined"
                   right={<TextInput.Icon icon="magnify" />}
                 />
               </View>

               <View style={styles.filterRow}>
                 <Text style={styles.filterLabel}>Visualização:</Text>
                 <SegmentedButtons
                   value={agruparPorFuncionario ? 'agrupado' : 'lista'}
                   onValueChange={(value) => setAgruparPorFuncionario(value === 'agrupado')}
                   buttons={[
                     { value: 'agrupado', label: 'Por Funcionário', icon: 'account-group' },
                     { value: 'lista', label: 'Lista Completa', icon: 'format-list-bulleted' }
                   ]}
                   style={styles.segmentedButtons}
                 />
               </View>
             </View>
           </Card.Content>
         </Card>

        {/* Lista de Registros */}
        {agruparPorFuncionario ? (
          // Visualização agrupada por funcionário
          <View style={styles.groupedView}>
            {agruparRegistrosPorFuncionario().map((grupo) => (
              <Card key={grupo.funcionarioId} style={styles.funcionarioCard}>
                <Card.Content>
                  <View style={styles.funcionarioHeader}>
                    <View style={styles.funcionarioInfo}>
                      <RNText style={styles.funcionarioNome}>
                        {grupo.funcionarioNome}
                      </RNText>
                      <RNText style={styles.funcionarioCargo}>
                        {grupo.funcionarioCargo}
                      </RNText>
                    </View>
                    <View style={styles.funcionarioStats}>
                      <Chip 
                        style={[styles.statChip, { backgroundColor: '#ff980020' }]}
                        textStyle={[styles.chipText, { color: '#ff9800' }]}
                      >
                        {grupo.totalPendentes} Pendentes
                      </Chip>
                      <Chip 
                        style={[styles.statChip, { backgroundColor: '#4caf5020' }]}
                        textStyle={[styles.chipText, { color: '#4caf50' }]}
                      >
                        {grupo.totalAprovados} Aprovados
                      </Chip>
                      <Chip 
                        style={[styles.statChip, { backgroundColor: '#f4433620' }]}
                        textStyle={[styles.chipText, { color: '#f44336' }]}
                      >
                        {grupo.totalRejeitados} Rejeitados
                      </Chip>
                    </View>
                  </View>

                  {/* Lista de registros em cards */}
                  {grupo.registros.map((registro, index) => (
                    <View key={registro.id} style={styles.registroCard}>
                      <View style={styles.registroHeader}>
                        <View style={styles.registroInfo}>
                          <Text style={styles.registroData} numberOfLines={1}>{registro.data}</Text>
                          <Text style={styles.registroHora} numberOfLines={1}>{registro.horario}</Text>
                        </View>
                        
                        <Chip 
                          style={[
                            styles.tipoChip,
                            { backgroundColor: registro.tipo === 'entrada' ? '#e8f5e8' : '#ffebee' }
                          ]}
                          textStyle={[
                            styles.tipoChipText,
                            { color: registro.tipo === 'entrada' ? '#2e7d32' : '#c62828' }
                          ]}
                        >
                          {registro.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Saída'}
                        </Chip>
                      </View>
                      
                      <View style={styles.registroFooter}>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: getStatusColor(registro.status) + '20' }]}
                          textStyle={[styles.statusChipText, { color: getStatusColor(registro.status) }]}
                          icon={getStatusIcon(registro.status)}
                        >
                          {registro.status.charAt(0).toUpperCase() + registro.status.slice(1)}
                        </Chip>
                        
                        {registro.status === 'pendente' ? (
                          <Button
                            mode="outlined"
                            onPress={() => abrirModalAprovacao(registro)}
                            compact
                            icon="check"
                            style={styles.reviewButton}
                          >
                            Revisar
                          </Button>
                        ) : (
                          <View style={styles.approvedInfo}>
                            <Text style={styles.aprovadoPor}>
                              Por: {registro.aprovadoPor}
                            </Text>
                            <Text style={styles.dataAprovacao}>
                              {registro.dataAprovacao}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ))}

            {agruparRegistrosPorFuncionario().length === 0 && (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      Nenhum funcionário encontrado com os filtros aplicados.
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        ) : (
          // Visualização em lista completa
          <Card style={styles.recordsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                Registros de Ponto ({registrosFiltrados.length})
              </Title>

              {/* Lista de registros em cards */}
              {registrosFiltrados.map((registro, index) => (
                <View key={registro.id} style={styles.registroCard}>
                  <View style={styles.registroHeader}>
                    <View style={styles.colaboradorInfo}>
                      <RNText style={styles.colaboradorNome}>
                        {registro.colaboradorNome}
                      </RNText>
                      <RNText style={styles.colaboradorCargo}>
                        {registro.colaboradorCargo}
                      </RNText>
                    </View>
                    
                    <View style={styles.registroInfo}>
                      <Text style={styles.registroData}>{registro.data}</Text>
                      <Text style={styles.registroHora}>{registro.horario}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.registroMiddle}>
                    <Chip 
                      style={[
                        styles.tipoChip,
                        { backgroundColor: registro.tipo === 'entrada' ? '#e8f5e8' : '#ffebee' }
                      ]}
                      textStyle={[
                        styles.tipoChipText,
                        { color: registro.tipo === 'entrada' ? '#2e7d32' : '#c62828' }
                      ]}
                    >
                      {registro.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Saída'}
                    </Chip>
                  </View>
                  
                  <View style={styles.registroFooter}>
                    <Chip 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(registro.status) + '20' }]}
                      textStyle={[styles.statusChipText, { color: getStatusColor(registro.status) }]}
                      icon={getStatusIcon(registro.status)}
                    >
                      {registro.status.charAt(0).toUpperCase() + registro.status.slice(1)}
                    </Chip>
                    
                    {registro.status === 'pendente' ? (
                      <Button
                        mode="outlined"
                        onPress={() => abrirModalAprovacao(registro)}
                        compact
                        icon="check"
                        style={styles.reviewButton}
                      >
                        Revisar
                      </Button>
                    ) : (
                      <View style={styles.approvedInfo}>
                        <Text style={styles.aprovadoPor}>
                          Por: {registro.aprovadoPor}
                        </Text>
                        <Text style={styles.dataAprovacao}>
                          {registro.dataAprovacao}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {registrosFiltrados.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Nenhum registro encontrado com os filtros aplicados.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Modal de Aprovação */}
        <Portal>
          <Modal
            visible={modalAprovacao}
            onDismiss={fecharModalAprovacao}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Title style={styles.modalTitle}>Revisar Registro de Ponto</Title>
              
              {registroSelecionado && (
                <View style={styles.registroInfo}>
                  <Text style={styles.infoLabel}>Colaborador:</Text>
                  <Text style={styles.infoValue}>{registroSelecionado.colaboradorNome}</Text>
                  
                  <Text style={styles.infoLabel}>Data/Hora:</Text>
                  <Text style={styles.infoValue}>
                    {registroSelecionado.data} às {registroSelecionado.horario}
                  </Text>
                  
                  <Text style={styles.infoLabel}>Tipo:</Text>
                  <Text style={styles.infoValue}>
                    {registroSelecionado.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Text>
                  
                  {registroSelecionado.localizacao?.endereco && (
                    <>
                      <Text style={styles.infoLabel}>Local:</Text>
                      <Text style={styles.infoValue}>{registroSelecionado.localizacao.endereco}</Text>
                    </>
                  )}
                </View>
              )}

              <TextInput
                label="Observações (opcional)"
                value={observacoes}
                onChangeText={setObservacoes}
                style={styles.observacoesInput}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Adicione observações sobre este registro..."
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={fecharModalAprovacao}
                  style={styles.modalButton}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => aprovarRegistro(false)}
                  style={[styles.modalButton, styles.rejectButton]}
                  textColor="#f44336"
                  disabled={loading}
                  icon="close"
                >
                  Rejeitar
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => aprovarRegistro(true)}
                  style={styles.modalButton}
                  disabled={loading}
                  loading={loading}
                  icon="check"
                >
                  Aprovar
                </Button>
              </View>
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
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#1976d2',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  approveAllButton: {
    marginTop: 8,
  },
  filterCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  filtersContainer: {
    gap: 16,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  recordsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  colaboradorNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  colaboradorCargo: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Modal styles
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
    marginBottom: 20,
    textAlign: 'center',
  },
  registroInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  observacoesInput: {
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
    borderColor: '#f44336',
  },
  // Estilos para visualização agrupada
  groupedView: {
    padding: 16,
  },
  funcionarioCard: {
    marginBottom: 16,
    elevation: 2,
  },
  funcionarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  funcionarioInfo: {
    flex: 1,
  },
  funcionarioNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  funcionarioCargo: {
    fontSize: 14,
    color: '#666',
  },
  funcionarioStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    margin: 16,
    elevation: 1,
  },
  // Estilos para layout de cards
  registroCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  colaboradorInfo: {
    flex: 1,
  },
  registroInfo: {
    alignItems: 'flex-end',
  },
  registroMiddle: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  registroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colaboradorNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  colaboradorCargo: {
    fontSize: 12,
    color: '#666',
  },
  registroData: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  registroHora: {
    fontSize: 12,
    color: '#666',
  },
  tipoChip: {
    height: 28,
  },
  tipoChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reviewButton: {
    minWidth: 80,
  },
  approvedInfo: {
    alignItems: 'flex-end',
  },
  aprovadoPor: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  dataAprovacao: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});
