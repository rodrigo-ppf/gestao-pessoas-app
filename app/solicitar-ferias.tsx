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

interface SaldoFerias {
  diasDisponiveis: number;
  diasVendidos: number;
  diasGozados: number;
  proximoVencimento: string;
}

export default function SolicitarFeriasScreen() {
  const { user } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFim, setShowDatePickerFim] = useState(false);
  const [tempDateInicio, setTempDateInicio] = useState<Date | null>(null);
  const [tempDateFim, setTempDateFim] = useState<Date | null>(null);
  const [saldoFerias, setSaldoFerias] = useState<SaldoFerias | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoFerias[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarSaldoFerias();
    carregarSolicitacoes();
  }, []);

  const carregarSaldoFerias = async () => {
    try {
      // Simular dados de saldo de férias
      const saldoSimulado: SaldoFerias = {
        diasDisponiveis: 30,
        diasVendidos: 0,
        diasGozados: 5,
        proximoVencimento: '31/12/2025'
      };
      setSaldoFerias(saldoSimulado);
    } catch (error) {
      console.error('Erro ao carregar saldo de férias:', error);
    }
  };

  const carregarSolicitacoes = async () => {
    try {
      // Carregar solicitações do localStorage
      const solicitacoesSalvas = await MockDataService.getSolicitacoesFerias();
      
      // Filtrar apenas as solicitações do usuário atual
      const solicitacoesDoUsuario = solicitacoesSalvas.filter(solicitacao => 
        solicitacao.colaboradorId === user?.id || solicitacao.colaboradorNome === user?.nome
      );
      
      setSolicitacoes(solicitacoesDoUsuario);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setSolicitacoes([]);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const calcularDiasEntreDatas = (dataInicio: Date, dataFim: Date) => {
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const validarSolicitacao = () => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Erro', 'Por favor, selecione as datas de início e fim das férias.');
      return false;
    }

    const dataInicioObj = new Date(dataInicio.split('/').reverse().join('-'));
    const dataFimObj = new Date(dataFim.split('/').reverse().join('-'));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataInicioObj < hoje) {
      Alert.alert('Erro', 'A data de início das férias não pode ser anterior ao dia atual.');
      return false;
    }

    if (dataFimObj <= dataInicioObj) {
      Alert.alert('Erro', 'A data de fim deve ser posterior à data de início.');
      return false;
    }

    const diasSolicitados = calcularDiasEntreDatas(dataInicioObj, dataFimObj);
    
    if (diasSolicitados < 5) {
      Alert.alert('Erro', 'O período mínimo de férias é de 5 dias.');
      return false;
    }

    if (diasSolicitados > 30) {
      Alert.alert('Erro', 'O período máximo de férias é de 30 dias.');
      return false;
    }

    if (saldoFerias && diasSolicitados > saldoFerias.diasDisponiveis) {
      Alert.alert('Erro', `Você não possui saldo suficiente. Dias disponíveis: ${saldoFerias.diasDisponiveis}`);
      return false;
    }

    return true;
  };

  const handleSolicitarFerias = async () => {
    if (!validarSolicitacao()) return;

    setLoading(true);
    
    try {
      const dataInicioObj = new Date(dataInicio.split('/').reverse().join('-'));
      const dataFimObj = new Date(dataFim.split('/').reverse().join('-'));
      const diasSolicitados = calcularDiasEntreDatas(dataInicioObj, dataFimObj);

      const novaSolicitacao: SolicitacaoFerias = {
        id: Date.now().toString(),
        colaboradorId: user?.id || '',
        colaboradorNome: user?.nome || '',
        colaboradorCargo: user?.cargo || '',
        dataInicio,
        dataFim,
        diasSolicitados,
        observacoes,
        status: 'pendente',
        dataSolicitacao: formatarData(new Date()),
        empresaId: user?.empresaId || ''
      };

      // Salvar no localStorage
      await MockDataService.salvarSolicitacaoFerias(novaSolicitacao);
      
      // Atualizar estado local
      setSolicitacoes(prev => [novaSolicitacao, ...prev]);
      
      // Atualizar saldo
      if (saldoFerias) {
        setSaldoFerias(prev => prev ? {
          ...prev,
          diasDisponiveis: prev.diasDisponiveis - diasSolicitados
        } : null);
      }

      Alert.alert(
        'Sucesso', 
        `Solicitação de férias enviada com sucesso!\n\nPeríodo: ${dataInicio} a ${dataFim}\nDias: ${diasSolicitados}\n\nAguarde a aprovação do seu gestor.`
      );

      // Limpar formulário
      setDataInicio('');
      setDataFim('');
      setObservacoes('');
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação de férias.');
    } finally {
      setLoading(false);
    }
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
    <MainLayout title="Solicitar Férias" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>Solicite suas férias e acompanhe o status das solicitações</Paragraph>
        </View>

        {/* Saldo de Férias */}
        {saldoFerias && (
          <Card style={styles.saldoCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Seu Saldo de Férias</Title>
              
              <View style={styles.saldoGrid}>
                <View style={styles.saldoItem}>
                  <Text style={styles.saldoNumber}>{saldoFerias.diasDisponiveis}</Text>
                  <Text style={styles.saldoLabel}>Dias Disponíveis</Text>
                </View>
                <View style={styles.saldoItem}>
                  <Text style={styles.saldoNumber}>{saldoFerias.diasGozados}</Text>
                  <Text style={styles.saldoLabel}>Dias Gozados</Text>
                </View>
                <View style={styles.saldoItem}>
                  <Text style={styles.saldoNumber}>{saldoFerias.diasVendidos}</Text>
                  <Text style={styles.saldoLabel}>Dias Vendidos</Text>
                </View>
                <View style={styles.saldoItem}>
                  <Text style={styles.saldoNumber}>{saldoFerias.proximoVencimento}</Text>
                  <Text style={styles.saldoLabel}>Próximo Vencimento</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Formulário de Solicitação */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Nova Solicitação de Férias</Title>
            
            <View style={styles.dateInputsContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Data de Início</Text>
                <TextInput
                  label="Data de Início"
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
                <Text style={styles.dateLabel}>Data de Fim</Text>
                <TextInput
                  label="Data de Fim"
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

            <TextInput
              label="Observações (opcional)"
              value={observacoes}
              onChangeText={setObservacoes}
              style={styles.observacoesInput}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Informe o motivo das férias ou observações relevantes..."
            />

            <Button
              mode="contained"
              onPress={handleSolicitarFerias}
              loading={loading}
              disabled={loading || !dataInicio || !dataFim}
              style={styles.submitButton}
              icon="send"
            >
              {loading ? 'Enviando...' : 'Solicitar Férias'}
            </Button>
          </Card.Content>
        </Card>

        {/* Histórico de Solicitações */}
        {solicitacoes.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Suas Solicitações</Title>
              
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Período</DataTable.Title>
                  <DataTable.Title numeric>Dias</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>

                {solicitacoes.map((solicitacao) => (
                  <DataTable.Row key={solicitacao.id}>
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
  saldoCard: {
    margin: 16,
    elevation: 2,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#1976d2',
  },
  saldoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  saldoItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  saldoNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  saldoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  observacoesInput: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 8,
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
