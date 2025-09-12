import FloatingMenu from '@/components/FloatingMenu';
import TaskHistory from '@/components/TaskHistory';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService, { Tarefa } from '@/src/services/MockDataService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Modal, Paragraph, Portal, SegmentedButtons, TextInput, Title } from 'react-native-paper';

export default function EditarTarefaScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { tarefaId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'Média' as 'Baixa' | 'Média' | 'Alta',
    status: 'Pendente' as 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada',
    dataPrazo: '',
    responsavelId: ''
  });

  // Estados para o DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const usuarios = MockDataService.getUsuariosByEmpresa(user?.empresaId || '');

  useEffect(() => {
    carregarDados();
  }, [tarefaId]);

  const carregarDados = () => {
    if (tarefaId && user?.empresaId) {
      const tarefaEncontrada = MockDataService.getTarefaById(tarefaId as string);
      if (tarefaEncontrada) {
        setTarefa(tarefaEncontrada);
        setFormData({
          titulo: tarefaEncontrada.titulo,
          descricao: tarefaEncontrada.descricao,
          prioridade: tarefaEncontrada.prioridade,
          status: tarefaEncontrada.status,
          dataPrazo: tarefaEncontrada.dataPrazo || '',
          responsavelId: tarefaEncontrada.responsavelId || ''
        });

        // Converter data de prazo para Date se existir
        if (tarefaEncontrada.dataPrazo) {
          const dateParts = tarefaEncontrada.dataPrazo.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
            const year = parseInt(dateParts[2]);
            setSelectedDate(new Date(year, month, day));
          }
        }
      }
    }
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return false;
    }
    if (!formData.descricao.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular operação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar tarefa
      const tarefaAtualizada = await MockDataService.updateTarefa(tarefaId as string, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        dataPrazo: formData.dataPrazo || undefined,
        responsavelId: formData.responsavelId || undefined
      }, user?.id);

      if (tarefaAtualizada) {
        setHasChanges(false);
        
        Alert.alert(
          '✅ Sucesso!',
          `Tarefa "${formData.titulo}" atualizada com sucesso!`,
          [
            {
              text: 'Continuar Editando',
              style: 'cancel'
            },
            {
              text: 'Voltar à Lista',
              onPress: () => router.push('/tarefas')
            }
          ]
        );
      } else {
        Alert.alert('❌ Erro', 'Não foi possível atualizar a tarefa.');
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      Alert.alert('❌ Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Verificar se há alterações
    const originalValue = tarefa?.[field as keyof Tarefa] || '';
    if (value !== originalValue) {
      setHasChanges(true);
    } else {
      // Verificar se ainda há outras alterações
      const hasOtherChanges = Object.keys(formData).some(key => {
        if (key === field) return false;
        return (formData as any)[key] !== (tarefa?.[key as keyof Tarefa] || '');
      });
      setHasChanges(hasOtherChanges);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        '⚠️ Alterações não salvas',
        'Você tem alterações não salvas.\n\nDeseja realmente descartar e voltar?',
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Descartar e Voltar',
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
      const formattedDate = formatDate(tempDate);
      updateFormData('dataPrazo', formattedDate);
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

  const getMonthName = (date: Date) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[date.getMonth()];
  };

  if (!tarefa) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Title>Carregando...</Title>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Title>Editar Tarefa</Title>
          <Paragraph>Edite as informações da tarefa</Paragraph>
        </View>

        <Card style={styles.formCard}>
          <Card.Content>
            {hasChanges && (
              <View style={styles.changesIndicator}>
                <Paragraph style={styles.changesText}>
                  ⚠️ Você tem alterações não salvas
                </Paragraph>
              </View>
            )}

            <TextInput
              label="Título da Tarefa *"
              value={formData.titulo}
              onChangeText={(value) => updateFormData('titulo', value)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Descrição *"
              value={formData.descricao}
              onChangeText={(value) => updateFormData('descricao', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <View style={styles.prioridadeSection}>
              <Paragraph style={styles.sectionTitle}>Prioridade</Paragraph>
              <SegmentedButtons
                value={formData.prioridade}
                onValueChange={(value) => updateFormData('prioridade', value)}
                buttons={[
                  { value: 'Baixa', label: 'Baixa' },
                  { value: 'Média', label: 'Média' },
                  { value: 'Alta', label: 'Alta' }
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <View style={styles.statusSection}>
              <Paragraph style={styles.sectionTitle}>Status</Paragraph>
              <SegmentedButtons
                value={formData.status}
                onValueChange={(value) => updateFormData('status', value)}
                buttons={[
                  { value: 'Pendente', label: 'Pendente' },
                  { value: 'Em Andamento', label: 'Em Andamento' },
                  { value: 'Concluída', label: 'Concluída' },
                  { value: 'Cancelada', label: 'Cancelada' }
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <TextInput
              label="Data de Prazo (opcional)"
              value={formData.dataPrazo}
              onPressIn={openDatePicker}
              style={styles.input}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              editable={false}
              right={<TextInput.Icon icon="calendar" onPress={openDatePicker} />}
            />

            <View style={styles.responsavelSection}>
              <Paragraph style={styles.sectionTitle}>Responsável (opcional)</Paragraph>
              {usuarios.map((usuario) => (
                <Button
                  key={usuario.id}
                  mode={formData.responsavelId === usuario.id ? 'contained' : 'outlined'}
                  onPress={() => updateFormData('responsavelId', 
                    formData.responsavelId === usuario.id ? '' : usuario.id
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
                onPress={handleCancel}
                style={styles.cancelButton}
                icon="arrow-left"
              >
                Cancelar
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                icon="check"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Histórico de Alterações */}
        <Card style={styles.historyCard}>
          <Card.Content>
            <TaskHistory tarefaId={tarefaId as string} />
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

      <FloatingMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  changesIndicator: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  changesText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
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
  statusSection: {
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
  historyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
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
