import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Modal, Paragraph, Portal, SegmentedButtons, TextInput, Title } from 'react-native-paper';

export default function CriarTarefaScreen() {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [dataPrazo, setDataPrazo] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Estados para o DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const usuarios = MockDataService.getUsuariosByEmpresa(user?.empresaId || '');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');

  const handleCriarTarefa = async () => {
    if (!titulo.trim()) {
      Alert.alert('❌ Erro', 'Título é obrigatório');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('❌ Erro', 'Descrição é obrigatória');
      return;
    }

    setLoading(true);
    
    try {
      // Simular operação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const novaTarefa = await MockDataService.createTarefa({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade: prioridade as 'Baixa' | 'Média' | 'Alta',
        status: 'Pendente',
        empresaId: user?.empresaId || '',
        responsavelId: responsavelSelecionado || undefined,
        criadorId: user?.id || '',
        dataPrazo: dataPrazo || undefined
      });

      Alert.alert(
        '✅ Sucesso!', 
        `Tarefa "${novaTarefa.titulo}" criada com sucesso!`,
        [
          {
            text: 'Criar Outra',
            style: 'cancel',
            onPress: () => {
              // Limpar formulário
              setTitulo('');
              setDescricao('');
              setPrioridade('Média');
              setDataPrazo('');
              setResponsavelSelecionado('');
              setSelectedDate(null);
            }
          },
          {
            text: 'Ver Tarefas',
            onPress: () => router.push('/tarefas')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Alert.alert('❌ Erro', 'Não foi possível criar a tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // Verificar se há dados preenchidos
    const hasData = titulo.trim() || descricao.trim() || dataPrazo || responsavelSelecionado;
    
    if (hasData) {
      Alert.alert(
        '⚠️ Cancelar Criação',
        'Você tem dados preenchidos.\n\nDeseja realmente cancelar e perder as informações?',
        [
          {
            text: 'Continuar Criando',
            style: 'cancel'
          },
          {
            text: 'Cancelar e Voltar',
            style: 'destructive',
            onPress: () => router.push('/tarefas')
          }
        ]
      );
    } else {
      router.push('/tarefas');
    }
  };

  // Funções para o DatePicker
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openDatePicker = () => {
    setTempDate(selectedDate || new Date());
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
      setDataPrazo(formatDate(tempDate));
    }
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const changeMonth = (increment: number) => {
    if (tempDate) {
      const newDate = new Date(tempDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setTempDate(newDate);
    }
  };

  const changeYear = (increment: number) => {
    if (tempDate) {
      const newDate = new Date(tempDate);
      newDate.setFullYear(newDate.getFullYear() + increment);
      setTempDate(newDate);
    }
  };

  const selectDay = (day: number) => {
    if (tempDate) {
      const newDate = new Date(tempDate);
      newDate.setDate(day);
      setTempDate(newDate);
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

  return (
    <MainLayout title="Criar Tarefa">
      <ScrollView style={styles.content}>
        <View style={styles.description}>
          <Paragraph>Preencha os dados da nova tarefa</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            <TextInput
              label="Título da Tarefa"
              value={titulo}
              onChangeText={setTitulo}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <View style={styles.prioridadeSection}>
              <Paragraph style={styles.sectionTitle}>Prioridade</Paragraph>
              <SegmentedButtons
                value={prioridade}
                onValueChange={setPrioridade}
                buttons={[
                  { value: 'Baixa', label: 'Baixa' },
                  { value: 'Média', label: 'Média' },
                  { value: 'Alta', label: 'Alta' }
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <TextInput
              label="Data de Prazo (opcional)"
              value={dataPrazo}
              onPressIn={openDatePicker}
              style={styles.input}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              editable={false}
              right={<TextInput.Icon icon={() => <UniversalIcon name="calendar" size={20} color="#666" />} onPress={openDatePicker} />}
            />

            <View style={styles.responsavelSection}>
              <Paragraph style={styles.sectionTitle}>Responsável (opcional)</Paragraph>
              {usuarios.map((usuario) => (
                <Button
                  key={usuario.id}
                  mode={responsavelSelecionado === usuario.id ? 'contained' : 'outlined'}
                  onPress={() => setResponsavelSelecionado(
                    responsavelSelecionado === usuario.id ? '' : usuario.id
                  )}
                  style={styles.responsavelButton}
                >
                  {usuario.nome} - {usuario.cargo}
                </Button>
              ))}
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancelar}
                style={styles.cancelButton}
                icon={() => <UniversalIcon name="arrow-left" size={20} color="#1976d2" />}
              >
                Voltar
              </Button>
              
              <Button
                mode="contained"
                onPress={handleCriarTarefa}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                icon="check"
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* DatePicker Modal Customizado */}
      <Portal>
        <Modal
          visible={showDatePicker}
          onDismiss={handleDateCancel}
          contentContainerStyle={styles.datePickerModal}
        >
          <View style={styles.datePickerContent}>
            <Title style={styles.datePickerTitle}>Selecionar Data de Prazo</Title>
            
            {tempDate && (
              <View style={styles.calendarContainer}>
                {/* Header do Calendário */}
                <View style={styles.calendarHeader}>
                  <Button
                    mode="text"
                    onPress={() => changeYear(-1)}
                    icon="chevron-left"
                  >
                    {tempDate.getFullYear() - 1}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => changeMonth(-1)}
                    icon="chevron-left"
                  >
                    {''}
                  </Button>
                  <View style={styles.monthYearContainer}>
                    <Title style={styles.monthYearText}>
                      {getMonthName(tempDate)} {tempDate.getFullYear()}
                    </Title>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => changeMonth(1)}
                    icon="chevron-right"
                  >
                    {''}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => changeYear(1)}
                    icon="chevron-right"
                  >
                    {tempDate.getFullYear() + 1}
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
                  {Array.from({ length: getDaysInMonth(tempDate) }, (_, i) => i + 1).map((day) => {
                    const isSelected = tempDate.getDate() === day;
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() === tempDate.getMonth() && 
                                   new Date().getFullYear() === tempDate.getFullYear();
                    
                    return (
                      <View key={day} style={styles.dayCell}>
                        <Button
                          mode={isSelected ? "contained" : "text"}
                          onPress={() => selectDay(day)}
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
            )}

            {/* Botões */}
            <View style={styles.datePickerButtons}>
              <Button
                mode="outlined"
                onPress={handleDateCancel}
                style={styles.datePickerButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleDateConfirm}
                style={styles.datePickerButton}
              >
                Confirmar
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1976d2',
  },
  formCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  prioridadeSection: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  responsavelSection: {
    marginBottom: 16,
  },
  responsavelButton: {
    marginBottom: 8,
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
  // Estilos do DatePicker
  datePickerModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  datePickerContent: {
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  calendarContainer: {
    width: '100%',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    width: 32,
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
    minWidth: 0,
    borderRadius: 16,
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
    gap: 12,
    width: '100%',
  },
  datePickerButton: {
    flex: 1,
  },
});
