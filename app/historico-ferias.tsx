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

interface ResumoFerias {
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  totalSolicitado: number;
  totalAprovado: number;
  totalRejeitado: number;
  totalPendente: number;
  ultimaSolicitacao: string;
}

export default function HistoricoFeriasScreen() {
  const { user } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroColaborador, setFiltroColaborador] = useState('');
  const [historico, setHistorico] = useState<SolicitacaoFerias[]>([]);
  const [resumo, setResumo] = useState<ResumoFerias[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFim, setShowDatePickerFim] = useState(false);
  const [tempDateInicio, setTempDateInicio] = useState<Date | null>(null);
  const [tempDateFim, setTempDateFim] = useState<Date | null>(null);

  useEffect(() => {
    gerarHistorico();
  }, []);

  const gerarHistorico = async () => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Erro', 'Por favor, selecione o período para gerar o histórico.');
      return;
    }

    setLoading(true);
    
    try {
      // Simular dados de histórico de férias
      const historicoSimulado: SolicitacaoFerias[] = [
        {
          id: '1',
          colaboradorId: '1',
          colaboradorNome: 'João Silva',
          colaboradorCargo: 'Desenvolvedor',
          dataInicio: '15/01/2025',
          dataFim: '29/01/2025',
          diasSolicitados: 15,
          observacoes: 'Férias de verão',
          status: 'aprovado',
          dataSolicitacao: '10/12/2024',
          aprovadoPor: 'Maria Santos (Gestora)',
          dataAprovacao: '12/12/2024'
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
          status: 'rejeitado',
          dataSolicitacao: '20/12/2024',
          aprovadoPor: 'Carlos Lima (Gestor)',
          dataAprovacao: '22/12/2024',
          motivoRejeicao: 'Período de alta demanda'
        },
        {
          id: '4',
          colaboradorId: '1',
          colaboradorNome: 'João Silva',
          colaboradorCargo: 'Desenvolvedor',
          dataInicio: '20/07/2025',
          dataFim: '03/08/2025',
          diasSolicitados: 15,
          observacoes: 'Férias de inverno',
          status: 'aprovado',
          dataSolicitacao: '15/06/2025',
          aprovadoPor: 'Maria Santos (Gestora)',
          dataAprovacao: '18/06/2025'
        }
      ];

      // Filtrar por período
      const dataInicioObj = new Date(dataInicio.split('/').reverse().join('-'));
      const dataFimObj = new Date(dataFim.split('/').reverse().join('-'));
      
      let historicoFiltrado = historicoSimulado.filter(solicitacao => {
        const dataSolicitacaoObj = new Date(solicitacao.dataSolicitacao.split('/').reverse().join('-'));
        return dataSolicitacaoObj >= dataInicioObj && dataSolicitacaoObj <= dataFimObj;
      });

      // Filtrar por status
      if (filtroStatus !== 'todos') {
        historicoFiltrado = historicoFiltrado.filter(solicitacao => solicitacao.status === filtroStatus);
      }

      // Filtrar por colaborador
      if (filtroColaborador) {
        historicoFiltrado = historicoFiltrado.filter(solicitacao => 
          solicitacao.colaboradorNome.toLowerCase().includes(filtroColaborador.toLowerCase())
        );
      }

      // Se for colaborador, mostrar apenas suas solicitações
      if (user?.perfil === 'colaborador' || user?.perfil === 'funcionario') {
        historicoFiltrado = historicoFiltrado.filter(solicitacao => 
          solicitacao.colaboradorId === user.id || solicitacao.colaboradorNome === user.nome
        );
      }

      setHistorico(historicoFiltrado);

      // Gerar resumo
      const resumoMap = new Map<string, ResumoFerias>();
      
      historicoFiltrado.forEach(solicitacao => {
        const key = solicitacao.colaboradorId;
        if (!resumoMap.has(key)) {
          resumoMap.set(key, {
            colaboradorId: solicitacao.colaboradorId,
            colaboradorNome: solicitacao.colaboradorNome,
            colaboradorCargo: solicitacao.colaboradorCargo,
            totalSolicitado: 0,
            totalAprovado: 0,
            totalRejeitado: 0,
            totalPendente: 0,
            ultimaSolicitacao: solicitacao.dataSolicitacao
          });
        }
        
        const resumoItem = resumoMap.get(key)!;
        resumoItem.totalSolicitado += solicitacao.diasSolicitados;
        
        switch (solicitacao.status) {
          case 'aprovado':
            resumoItem.totalAprovado += solicitacao.diasSolicitados;
            break;
          case 'rejeitado':
            resumoItem.totalRejeitado += solicitacao.diasSolicitados;
            break;
          case 'pendente':
            resumoItem.totalPendente += solicitacao.diasSolicitados;
            break;
        }
        
        // Atualizar última solicitação
        const dataSolicitacao = new Date(solicitacao.dataSolicitacao.split('/').reverse().join('-'));
        const dataUltima = new Date(resumoItem.ultimaSolicitacao.split('/').reverse().join('-'));
        if (dataSolicitacao > dataUltima) {
          resumoItem.ultimaSolicitacao = solicitacao.dataSolicitacao;
        }
      });

      const resumoArray = Array.from(resumoMap.values());
      setResumo(resumoArray);

      const mensagem = (user?.perfil === 'colaborador' || user?.perfil === 'funcionario')
        ? `Seu histórico de férias gerado com ${historicoFiltrado.length} solicitações.`
        : `Histórico de férias gerado com ${historicoFiltrado.length} solicitações de ${resumoArray.length} colaboradores.`;

      Alert.alert('Sucesso', mensagem);
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o histórico de férias.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const openDatePicker = (tipo: 'inicio' | 'fim') => {
    if (tipo === 'inicio') {
      setTempDateInicio(new Date());
      setShowDatePickerInicio(true);
    } else {
      setTempDateFim(new Date());
      setShowDatePickerFim(true);
    }
  };

  const handleDateConfirm = (tipo: 'inicio' | 'fim') => {
    if (tipo === 'inicio' && tempDateInicio) {
      setDataInicio(formatarData(tempDateInicio));
      setShowDatePickerInicio(false);
    } else if (tipo === 'fim' && tempDateFim) {
      setDataFim(formatarData(tempDateFim));
      setShowDatePickerFim(false);
    }
  };

  const handleDateCancel = (tipo: 'inicio' | 'fim') => {
    if (tipo === 'inicio') {
      setShowDatePickerInicio(false);
    } else {
      setShowDatePickerFim(false);
    }
  };

  const changeMonth = (increment: number, tipo: 'inicio' | 'fim') => {
    const currentDate = tipo === 'inicio' ? tempDateInicio : tempDateFim;
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + increment);
      
      if (tipo === 'inicio') {
        setTempDateInicio(newDate);
      } else {
        setTempDateFim(newDate);
      }
    }
  };

  const changeYear = (increment: number, tipo: 'inicio' | 'fim') => {
    const currentDate = tipo === 'inicio' ? tempDateInicio : tempDateFim;
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setFullYear(newDate.getFullYear() + increment);
      
      if (tipo === 'inicio') {
        setTempDateInicio(newDate);
      } else {
        setTempDateFim(newDate);
      }
    }
  };

  const selectDay = (day: number, tipo: 'inicio' | 'fim') => {
    const currentDate = tipo === 'inicio' ? tempDateInicio : tempDateFim;
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setDate(day);
      
      if (tipo === 'inicio') {
        setTempDateInicio(newDate);
      } else {
        setTempDateFim(newDate);
      }
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[date.getMonth()];
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

  const renderCalendar = (tipo: 'inicio' | 'fim') => {
    const currentDate = tipo === 'inicio' ? tempDateInicio : tempDateFim;
    const isVisible = tipo === 'inicio' ? showDatePickerInicio : showDatePickerFim;
    
    if (!currentDate || !isVisible) return null;

    return (
      <View style={styles.calendarContainer}>
        {/* Header do Calendário */}
        <View style={styles.calendarHeader}>
          <Button
            mode="text"
            onPress={() => changeYear(-1, tipo)}
            icon="chevron-left"
          >
            {currentDate.getFullYear() - 1}
          </Button>
          <Button
            mode="text"
            onPress={() => changeMonth(-1, tipo)}
            icon="chevron-left"
          >
            {''}
          </Button>
          <View style={styles.monthYearContainer}>
            <Title style={styles.monthYearText}>
              {getMonthName(currentDate)} {currentDate.getFullYear()}
            </Title>
          </View>
          <Button
            mode="text"
            onPress={() => changeMonth(1, tipo)}
            icon="chevron-right"
          >
            {''}
          </Button>
          <Button
            mode="text"
            onPress={() => changeYear(1, tipo)}
            icon="chevron-right"
          >
            {currentDate.getFullYear() + 1}
          </Button>
        </View>

        {/* Dias da Semana */}
        <View style={styles.weekDaysContainer}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <Paragraph key={day} style={styles.weekDayText}>
              {day}
            </Paragraph>
          ))}
        </View>

        {/* Dias do Mês */}
        <View style={styles.daysContainer}>
          {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
            const day = i + 1;
            const isSelected = currentDate.getDate() === day;
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() && 
                           new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <View key={day} style={styles.dayCell}>
                <Button
                  mode={isSelected ? "contained" : "text"}
                  onPress={() => selectDay(day, tipo)}
                  style={[
                    styles.dayButton,
                    isSelected && styles.selectedDayButton,
                    isToday && !isSelected && styles.todayButton
                  ]}
                  labelStyle={[
                    isToday && !isSelected && { color: '#1976d2' }
                  ]}
                >
                  {day.toString()}
                </Button>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <MainLayout title="Histórico de Férias" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>
            {(user?.perfil === 'colaborador' || user?.perfil === 'funcionario')
              ? 'Consulte seu histórico de férias por período' 
              : 'Consulte o histórico de férias dos colaboradores por período'
            }
          </Paragraph>
        </View>

        {/* Filtros */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Filtros</Title>
            
            <View style={styles.dateInputsContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Data Início</Text>
                <TextInput
                  label="Data Início"
                  value={dataInicio}
                  onPressIn={() => openDatePicker('inicio')}
                  style={styles.dateInput}
                  mode="outlined"
                  placeholder="DD/MM/AAAA"
                  editable={false}
                  right={<TextInput.Icon icon={() => <UniversalIcon name="calendar" size={20} color="#666" />} onPress={() => openDatePicker('inicio')} />}
                />
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Data Fim</Text>
                <TextInput
                  label="Data Fim"
                  value={dataFim}
                  onPressIn={() => openDatePicker('fim')}
                  style={styles.dateInput}
                  mode="outlined"
                  placeholder="DD/MM/AAAA"
                  editable={false}
                  right={<TextInput.Icon icon={() => <UniversalIcon name="calendar" size={20} color="#666" />} onPress={() => openDatePicker('fim')} />}
                />
              </View>
            </View>

            {(user?.perfil !== 'colaborador' && user?.perfil !== 'funcionario') && (
              <>
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
              </>
            )}

            <Button
              mode="contained"
              onPress={gerarHistorico}
              loading={loading}
              disabled={loading || !dataInicio || !dataFim}
              style={styles.generateButton}
              icon="file-document-outline"
            >
              {loading ? 'Gerando...' : 'Gerar Histórico'}
            </Button>
          </Card.Content>
        </Card>

        {/* Resumo */}
        {resumo.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                {(user?.perfil === 'colaborador' || user?.perfil === 'funcionario') ? 'Seu Resumo' : 'Resumo por Colaborador'}
              </Title>
              
              <DataTable>
                <DataTable.Header>
                  {(user?.perfil !== 'colaborador' && user?.perfil !== 'funcionario') && <DataTable.Title>Colaborador</DataTable.Title>}
                  <DataTable.Title numeric>Solicitado</DataTable.Title>
                  <DataTable.Title numeric>Aprovado</DataTable.Title>
                  <DataTable.Title numeric>Rejeitado</DataTable.Title>
                  <DataTable.Title numeric>Pendente</DataTable.Title>
                  <DataTable.Title>Última Solicitação</DataTable.Title>
                </DataTable.Header>

                {resumo.map((item) => (
                  <DataTable.Row key={item.colaboradorId}>
                    {(user?.perfil !== 'colaborador' && user?.perfil !== 'funcionario') && (
                      <DataTable.Cell>
                        <View>
                          <Text style={styles.colaboradorNome}>{item.colaboradorNome}</Text>
                          <Text style={styles.colaboradorCargo}>{item.colaboradorCargo}</Text>
                        </View>
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell numeric>
                      <Chip style={styles.totalChip} textStyle={styles.chipText}>
                        {item.totalSolicitado}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Chip style={[styles.statusChip, { backgroundColor: '#4caf5020' }]} textStyle={[styles.chipText, { color: '#4caf50' }]}>
                        {item.totalAprovado}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Chip style={[styles.statusChip, { backgroundColor: '#f4433620' }]} textStyle={[styles.chipText, { color: '#f44336' }]}>
                        {item.totalRejeitado}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Chip style={[styles.statusChip, { backgroundColor: '#ff980020' }]} textStyle={[styles.chipText, { color: '#ff9800' }]}>
                        {item.totalPendente}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={styles.ultimaSolicitacao}>{item.ultimaSolicitacao}</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Histórico Detalhado */}
        {historico.length > 0 && (
          <Card style={styles.recordsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Histórico Detalhado</Title>
              
              <DataTable>
                <DataTable.Header>
                  {(user?.perfil !== 'colaborador' && user?.perfil !== 'funcionario') && <DataTable.Title>Colaborador</DataTable.Title>}
                  <DataTable.Title>Período</DataTable.Title>
                  <DataTable.Title numeric>Dias</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>Data Solicitação</DataTable.Title>
                </DataTable.Header>

                {historico.map((solicitacao) => (
                  <DataTable.Row key={solicitacao.id}>
                    {(user?.perfil !== 'colaborador' && user?.perfil !== 'funcionario') && (
                      <DataTable.Cell>
                        <View>
                          <Text style={styles.colaboradorNome}>{solicitacao.colaboradorNome}</Text>
                          <Text style={styles.colaboradorCargo}>{solicitacao.colaboradorCargo}</Text>
                        </View>
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell>
                      <View>
                        <Text style={styles.periodoText}>
                          {solicitacao.dataInicio} a {solicitacao.dataFim}
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
                      <Text style={styles.dataSolicitacao}>{solicitacao.dataSolicitacao}</Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* DatePicker Modals */}
        <Portal>
          <Modal
            visible={showDatePickerInicio}
            onDismiss={() => handleDateCancel('inicio')}
            contentContainerStyle={styles.datePickerModal}
          >
            <View style={styles.datePickerContent}>
              <Title style={styles.datePickerTitle}>Selecionar Data de Início</Title>
              {renderCalendar('inicio')}
              <View style={styles.datePickerButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleDateCancel('inicio')}
                  style={styles.datePickerButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleDateConfirm('inicio')}
                  style={styles.datePickerButton}
                >
                  Confirmar
                </Button>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showDatePickerFim}
            onDismiss={() => handleDateCancel('fim')}
            contentContainerStyle={styles.datePickerModal}
          >
            <View style={styles.datePickerContent}>
              <Title style={styles.datePickerTitle}>Selecionar Data de Fim</Title>
              {renderCalendar('fim')}
              <View style={styles.datePickerButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleDateCancel('fim')}
                  style={styles.datePickerButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleDateConfirm('fim')}
                  style={styles.datePickerButton}
                >
                  Confirmar
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
  filterCard: {
    margin: 16,
    elevation: 2,
  },
  summaryCard: {
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
  dateInputsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  dateInput: {
    backgroundColor: '#fff',
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
    marginBottom: 20,
  },
  generateButton: {
    marginTop: 8,
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
  totalChip: {
    backgroundColor: '#f3e5f5',
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
  ultimaSolicitacao: {
    fontSize: 12,
    color: '#666',
  },
  dataSolicitacao: {
    fontSize: 12,
    color: '#666',
  },
  // Estilos do calendário
  datePickerModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 0,
  },
  datePickerContent: {
    padding: 24,
  },
  datePickerTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    width: '100%',
    height: '100%',
    minHeight: 40,
  },
  selectedDayButton: {
    backgroundColor: '#1976d2',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
  },
});
