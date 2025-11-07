import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import MockDataService from '@/src/services/MockDataService';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, DataTable, Modal, Paragraph, Portal, Text, TextInput, Title } from 'react-native-paper';

interface SolicitacaoFerias {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  colaboradorCargo?: string;
  dataInicio: string;
  dataFim: string;
  diasSolicitados: number;
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataSolicitacao: string;
  aprovadoPor?: string;
  dataAprovacao?: string;
  motivoRejeicao?: string;
  empresaId: string;
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
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        console.log('Inicializando dados de férias...');
        
        await carregarSaldoFerias();
        await carregarSolicitacoes();
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
      }
    };
    
    inicializarDados();
  }, []);

  const carregarSaldoFerias = async () => {
    try {
      // Carregar saldo real baseado nas solicitações aprovadas
      const solicitacoesSalvas = await MockDataService.getSolicitacoesFerias();
      const solicitacoesDoUsuario = solicitacoesSalvas.filter(solicitacao => 
        solicitacao.colaboradorId === user?.id || solicitacao.colaboradorNome === user?.nome
      );
      
      const diasGozados = solicitacoesDoUsuario
        .filter(s => s.status === 'aprovado')
        .reduce((total, s) => total + s.diasSolicitados, 0);
      
      const diasPendentes = solicitacoesDoUsuario
        .filter(s => s.status === 'pendente')
        .reduce((total, s) => total + s.diasSolicitados, 0);
      
      const saldoReal: SaldoFerias = {
        diasDisponiveis: 30 - diasGozados - diasPendentes,
        diasVendidos: 0,
        diasGozados: diasGozados,
        proximoVencimento: '31/12/2025'
      };
      setSaldoFerias(saldoReal);
    } catch (error) {
      console.error('Erro ao carregar saldo de férias:', error);
      // Fallback para dados simulados
      const saldoSimulado: SaldoFerias = {
        diasDisponiveis: 30,
        diasVendidos: 0,
        diasGozados: 0,
        proximoVencimento: '31/12/2025'
      };
      setSaldoFerias(saldoSimulado);
    }
  };

  const carregarSolicitacoes = async () => {
    try {
      console.log('Carregando solicitações de férias...');
      console.log('Usuário atual:', user?.id, user?.nome);
      
      // Carregar solicitações do localStorage
      const solicitacoesSalvas = await MockDataService.getSolicitacoesFerias();
      console.log('Solicitações salvas:', solicitacoesSalvas);
      
      // Filtrar apenas as solicitações do usuário atual
      const solicitacoesDoUsuario = solicitacoesSalvas.filter(solicitacao => 
        solicitacao.colaboradorId === user?.id || solicitacao.colaboradorNome === user?.nome
      );
      
      console.log('Solicitações do usuário:', solicitacoesDoUsuario);
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

    // Verificar se há conflitos com períodos já solicitados
    const conflito = solicitacoes.find(solicitacao => {
      if (solicitacao.status === 'rejeitado') return false; // Ignorar solicitações rejeitadas
      
      const inicioExistente = new Date(solicitacao.dataInicio.split('/').reverse().join('-'));
      const fimExistente = new Date(solicitacao.dataFim.split('/').reverse().join('-'));
      
      // Verificar sobreposição de períodos
      return (dataInicioObj <= fimExistente && dataFimObj >= inicioExistente);
    });

    if (conflito) {
      Alert.alert(
        'Conflito de Períodos', 
        `Este período conflita com uma solicitação já existente:\n\n📅 ${conflito.dataInicio} a ${conflito.dataFim}\n📋 Status: ${getStatusText(conflito.status)}\n\nPor favor, escolha um período diferente.`
      );
      return false;
    }

    return true;
  };

  const handleSolicitarFerias = async () => {
    if (!validarSolicitacao()) return;

    setLoading(true);
    setProcessando(true);
    
    try {
      // Simular delay para mostrar feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      console.log('Salvando nova solicitação:', novaSolicitacao);
      await MockDataService.salvarSolicitacaoFerias(novaSolicitacao);
      console.log('Solicitação salva com sucesso');
      
      // Recarregar dados para garantir consistência
      console.log('Recarregando dados após salvar...');
      await carregarSolicitacoes();
      await carregarSaldoFerias();
      console.log('Dados recarregados com sucesso');

      // Feedback de sucesso mais detalhado
      Alert.alert(
        '✅ Solicitação Enviada!', 
        `Sua solicitação de férias foi enviada com sucesso!\n\n📅 Período: ${dataInicio} a ${dataFim}\n📊 Dias solicitados: ${diasSolicitados}\n📋 Status: Pendente de aprovação\n\n⏳ Aguarde a análise do seu gestor. Você receberá uma notificação quando houver uma resposta.`,
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );

      // Limpar formulário
      setDataInicio('');
      setDataFim('');
      setObservacoes('');
      
      console.log('Formulário limpo, pronto para nova solicitação');
      
    } catch (error) {
      console.error('Erro ao solicitar férias:', error);
      Alert.alert(
        '❌ Erro ao Enviar', 
        'Não foi possível enviar sua solicitação de férias. Verifique sua conexão e tente novamente.',
        [
          {
            text: 'Tentar Novamente',
            onPress: () => handleSolicitarFerias()
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
      setProcessando(false);
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
          <Paragraph>Solicite suas férias e acompanhe o status das solicitações. Você pode fazer múltiplas solicitações para diferentes períodos.</Paragraph>
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

            {processando && (
              <View style={styles.processingContainer}>
                <Text style={styles.processingText}>
                  ⏳ Processando sua solicitação...
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSolicitarFerias}
                loading={loading}
                disabled={loading || !dataInicio || !dataFim}
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonLoading
                ]}
                icon={loading ? undefined : "send"}
                contentStyle={styles.submitButtonContent}
              >
                {loading ? 'Enviando Solicitação...' : 'Solicitar Férias'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => {
                  setDataInicio('');
                  setDataFim('');
                  setObservacoes('');
                  console.log('Formulário limpo manualmente');
                }}
                disabled={loading}
                style={styles.clearButton}
                icon="refresh"
              >
                Limpar
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Histórico de Solicitações */}
        <Card style={styles.historyCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Suas Solicitações</Title>
            
            {/* Debug info */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Debug: {solicitacoes.length} solicitações encontradas
              </Text>
              <View style={styles.debugButtons}>
                <Button
                  mode="outlined"
                  onPress={carregarSolicitacoes}
                  style={styles.debugButton}
                  compact
                >
                  Recarregar
                </Button>
                <Button
                  mode="outlined"
                  onPress={async () => {
                    console.log('Testando localStorage...');
                    const testData = await MockDataService.getSolicitacoesFerias();
                    console.log('Dados do localStorage:', testData);
                    Alert.alert('Debug', `Encontradas ${testData.length} solicitações no localStorage`);
                  }}
                  style={styles.debugButton}
                  compact
                >
                  Testar
                </Button>
              </View>
            </View>
              
            {solicitacoes.length > 0 ? (
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
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma solicitação de férias encontrada
                </Text>
                <Text style={styles.emptySubtext}>
                  Suas solicitações aparecerão aqui após serem enviadas
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

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
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
  },
  processingContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  processingText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    flex: 1,
  },
  debugButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  debugButton: {
    minWidth: 80,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
