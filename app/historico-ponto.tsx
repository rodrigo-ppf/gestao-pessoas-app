import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService from '@/src/services/MockDataService';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, DataTable, Modal, Paragraph, Portal, Text, TextInput, Title } from 'react-native-paper';

interface RegistroPontoHistorico {
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
}

interface ResumoColaborador {
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  totalDias: number;
  totalHoras: number;
  registros: RegistroPontoHistorico[];
}

export default function HistoricoPontoScreen() {
  const { user } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFim, setShowDatePickerFim] = useState(false);
  const [tempDateInicio, setTempDateInicio] = useState<Date | null>(null);
  const [tempDateFim, setTempDateFim] = useState<Date | null>(null);
  const [historico, setHistorico] = useState<RegistroPontoHistorico[]>([]);
  const [resumoColaboradores, setResumoColaboradores] = useState<ResumoColaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState<any[]>([]);

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const carregarColaboradores = async () => {
    try {
      const colaboradoresData = await MockDataService.getColaboradores();
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const formatarHora = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularHorasTrabalhadas = (registros: RegistroPontoHistorico[]) => {
    let totalMinutos = 0;
    let entradaAtual: RegistroPontoHistorico | null = null;

    // Ordenar registros por timestamp
    const registrosOrdenados = [...registros].sort((a, b) => a.timestamp - b.timestamp);

    for (const registro of registrosOrdenados) {
      if (registro.tipo === 'entrada') {
        entradaAtual = registro;
      } else if (registro.tipo === 'saida' && entradaAtual) {
        const minutosTrabalhados = (registro.timestamp - entradaAtual.timestamp) / (1000 * 60);
        totalMinutos += minutosTrabalhados;
        entradaAtual = null;
      }
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutos = Math.floor(totalMinutos % 60);
    return `${horas}h ${minutos.toString().padStart(2, '0')}min`;
  };

  const gerarHistoricoSimulado = () => {
    const historicoSimulado: RegistroPontoHistorico[] = [];
    const dataInicioObj = new Date(dataInicio.split('/').reverse().join('-'));
    const dataFimObj = new Date(dataFim.split('/').reverse().join('-'));

    // Se o usuário logado for colaborador, mostrar apenas seus registros
    const colaboradoresParaProcessar = user?.perfil === 'colaborador' 
      ? colaboradores.filter(col => col.id === user.id)
      : colaboradores;

    colaboradoresParaProcessar.forEach(colaborador => {
      const dataAtual = new Date(dataInicioObj);
      
      while (dataAtual <= dataFimObj) {
        // Simular registros apenas em dias úteis (segunda a sexta)
        const diaSemana = dataAtual.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) {
          // Simular entrada entre 7h e 9h
          const horaEntrada = 7 + Math.floor(Math.random() * 3);
          const minutoEntrada = Math.floor(Math.random() * 60);
          const timestampEntrada = new Date(dataAtual);
          timestampEntrada.setHours(horaEntrada, minutoEntrada, 0, 0);

          // Simular saída entre 17h e 19h
          const horaSaida = 17 + Math.floor(Math.random() * 3);
          const minutoSaida = Math.floor(Math.random() * 60);
          const timestampSaida = new Date(dataAtual);
          timestampSaida.setHours(horaSaida, minutoSaida, 0, 0);

          historicoSimulado.push({
            id: `entrada_${colaborador.id}_${timestampEntrada.getTime()}`,
            colaboradorId: colaborador.id,
            colaboradorNome: colaborador.nome,
            colaboradorCargo: colaborador.cargo,
            data: formatarData(dataAtual),
            tipo: 'entrada',
            horario: formatarHora(timestampEntrada.getTime()),
            timestamp: timestampEntrada.getTime()
          });

          historicoSimulado.push({
            id: `saida_${colaborador.id}_${timestampSaida.getTime()}`,
            colaboradorId: colaborador.id,
            colaboradorNome: colaborador.nome,
            colaboradorCargo: colaborador.cargo,
            data: formatarData(dataAtual),
            tipo: 'saida',
            horario: formatarHora(timestampSaida.getTime()),
            timestamp: timestampSaida.getTime()
          });
        }
        
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    });

    return historicoSimulado.sort((a, b) => a.timestamp - b.timestamp);
  };

  const processarResumo = (historico: RegistroPontoHistorico[]) => {
    const resumoMap = new Map<string, ResumoColaborador>();

    historico.forEach(registro => {
      if (!resumoMap.has(registro.colaboradorId)) {
        resumoMap.set(registro.colaboradorId, {
          colaboradorId: registro.colaboradorId,
          colaboradorNome: registro.colaboradorNome,
          colaboradorCargo: registro.colaboradorCargo,
          totalDias: 0,
          totalHoras: 0,
          registros: []
        });
      }

      const resumo = resumoMap.get(registro.colaboradorId)!;
      resumo.registros.push(registro);
    });

    // Calcular totais
    resumoMap.forEach(resumo => {
      const diasUnicos = new Set(resumo.registros.map(r => r.data));
      resumo.totalDias = diasUnicos.size;
      resumo.totalHoras = calcularHorasTrabalhadas(resumo.registros);
    });

    return Array.from(resumoMap.values());
  };

  const handleBuscarHistorico = () => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Erro', 'Por favor, selecione o período de início e fim.');
      return;
    }

    setLoading(true);
    
    try {
      const historicoSimulado = gerarHistoricoSimulado();
      const resumo = processarResumo(historicoSimulado);
      
      setHistorico(historicoSimulado);
      setResumoColaboradores(resumo);
      
      const mensagem = user?.perfil === 'colaborador' 
        ? `Seu histórico gerado com ${historicoSimulado.length} registros.`
        : `Histórico gerado com ${historicoSimulado.length} registros de ${resumo.length} colaboradores.`;
      
      Alert.alert('Sucesso', mensagem);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o histórico.');
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
    <MainLayout title="Histórico de Ponto" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>
            {user?.perfil === 'colaborador' 
              ? 'Consulte seu histórico de ponto por período' 
              : 'Consulte o histórico de ponto dos colaboradores por período'
            }
          </Paragraph>
        </View>

        {/* Filtros de Data */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Período de Consulta</Title>
            
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

            <Button
              mode="contained"
              onPress={handleBuscarHistorico}
              loading={loading}
              disabled={loading || !dataInicio || !dataFim}
              style={styles.searchButton}
              icon="magnify"
            >
              {loading ? 'Gerando Histórico...' : 'Buscar Histórico'}
            </Button>
          </Card.Content>
        </Card>

        {/* Resumo por Colaborador */}
        {resumoColaboradores.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                {user?.perfil === 'colaborador' ? 'Seu Resumo' : 'Resumo por Colaborador'}
              </Title>
              
              <DataTable>
                <DataTable.Header>
                  {user?.perfil !== 'colaborador' && <DataTable.Title>Colaborador</DataTable.Title>}
                  <DataTable.Title numeric>Dias</DataTable.Title>
                  <DataTable.Title numeric>Total Horas</DataTable.Title>
                </DataTable.Header>

                {resumoColaboradores.map((resumo) => (
                  <DataTable.Row key={resumo.colaboradorId}>
                    {user?.perfil !== 'colaborador' && (
                      <DataTable.Cell>
                        <View>
                          <Text style={styles.colaboradorNome}>{resumo.colaboradorNome}</Text>
                          <Text style={styles.colaboradorCargo}>{resumo.colaboradorCargo}</Text>
                        </View>
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell numeric>
                      <Chip style={styles.daysChip} textStyle={styles.chipText}>
                        {resumo.totalDias}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Chip style={styles.hoursChip} textStyle={styles.chipText}>
                        {resumo.totalHoras}
                      </Chip>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Histórico Detalhado */}
        {historico.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Histórico Detalhado</Title>
              <Paragraph style={styles.historyInfo}>
                {historico.length} registros encontrados
              </Paragraph>

              <DataTable>
                <DataTable.Header>
                  {user?.perfil !== 'colaborador' && <DataTable.Title>Colaborador</DataTable.Title>}
                  <DataTable.Title>Data</DataTable.Title>
                  <DataTable.Title>Horário</DataTable.Title>
                  <DataTable.Title>Tipo</DataTable.Title>
                </DataTable.Header>

                {historico.map((registro) => (
                  <DataTable.Row key={registro.id}>
                    {user?.perfil !== 'colaborador' && (
                      <DataTable.Cell>
                        <View>
                          <Text style={styles.colaboradorNome}>{registro.colaboradorNome}</Text>
                          <Text style={styles.colaboradorCargo}>{registro.colaboradorCargo}</Text>
                        </View>
                      </DataTable.Cell>
                    )}
                    <DataTable.Cell>{registro.data}</DataTable.Cell>
                    <DataTable.Cell>{registro.horario}</DataTable.Cell>
                    <DataTable.Cell>
                      <Chip 
                        style={[
                          styles.typeChip,
                          { backgroundColor: registro.tipo === 'entrada' ? '#e8f5e8' : '#ffebee' }
                        ]}
                        textStyle={[
                          styles.chipText,
                          { color: registro.tipo === 'entrada' ? '#2e7d32' : '#c62828' }
                        ]}
                      >
                        {registro.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Saída'}
                      </Chip>
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
  searchButton: {
    marginTop: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  historyInfo: {
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  colaboradorNome: {
    fontSize: 14,
    fontWeight: '600',
  },
  colaboradorCargo: {
    fontSize: 12,
    color: '#666',
  },
  daysChip: {
    backgroundColor: '#e3f2fd',
    height: 28,
  },
  hoursChip: {
    backgroundColor: '#e8f5e8',
    height: 28,
  },
  typeChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
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
