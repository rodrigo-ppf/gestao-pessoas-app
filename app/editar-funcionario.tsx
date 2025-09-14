import MainLayout from '@/components/MainLayout';
import UniversalIcon from '@/components/UniversalIcon';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from '@/src/hooks/useTranslation';
import MockDataService from '@/src/services/MockDataService';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Divider,
    HelperText,
    Modal,
    Paragraph,
    Portal,
    RadioButton,
    Text,
    TextInput,
    Title
} from 'react-native-paper';

export default function EditarColaboradorScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { funcionarioId: colaboradorId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [colaborador, setColaborador] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  
  // Estados para o DatePicker de Data de Entrada
  const [showDateEntradaPicker, setShowDateEntradaPicker] = useState(false);
  const [selectedDateEntrada, setSelectedDateEntrada] = useState<Date | null>(null);
  const [tempDateEntrada, setTempDateEntrada] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    codigoUsuario: '',
    nomeUsuario: '',
    dataNascimento: '',
    endereco: '',
    telefone: '',
    email: '',
    sexo: '',
    dataEntrada: '',
    cargo: '',
    perfil: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string | null}>({});

  useEffect(() => {
    carregarDados();
  }, [colaboradorId]);

  const carregarDados = () => {
    if (colaboradorId && user?.empresaId) {
      const colaboradorEncontrado = MockDataService.getUsuarioById(colaboradorId as string) as any;
      if (colaboradorEncontrado) {
        setColaborador(colaboradorEncontrado);
        setFormData({
          codigoUsuario: colaboradorEncontrado.codigoUsuario || '',
          nomeUsuario: colaboradorEncontrado.nome || '',
          dataNascimento: colaboradorEncontrado.dataNascimento || '',
          endereco: colaboradorEncontrado.endereco || '',
          telefone: colaboradorEncontrado.telefone || '',
          email: colaboradorEncontrado.email || '',
          sexo: colaboradorEncontrado.sexo || '',
          dataEntrada: colaboradorEncontrado.dataEntrada || '',
          cargo: colaboradorEncontrado.cargo || '',
          perfil: colaboradorEncontrado.perfil || ''
        });

        // Converter data de nascimento para Date se existir
        if (colaboradorEncontrado.dataNascimento) {
          const dateParts = colaboradorEncontrado.dataNascimento.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
            const year = parseInt(dateParts[2]);
            setSelectedDate(new Date(year, month, day));
          }
        }

        // Converter data de entrada para Date se existir
        if (colaboradorEncontrado.dataEntrada) {
          const dateParts = colaboradorEncontrado.dataEntrada.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
            const year = parseInt(dateParts[2]);
            setSelectedDateEntrada(new Date(year, month, day));
          }
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeUsuario.trim()) {
      newErrors.nomeUsuario = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    if (!formData.dataEntrada.trim()) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória';
    }
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    if (!formData.perfil) {
      newErrors.perfil = 'Perfil é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular operação de salvamento (substituir pela implementação real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implementar atualização no banco de dados real
      // const colaboradorAtualizado = await ColaboradorService.updateColaborador(colaboradorId as string, formData);
      
      setHasChanges(false);
      
      Alert.alert(
        '✅ Sucesso!',
        `Colaborador ${formData.nomeUsuario} atualizado com sucesso!`,
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Voltar à Lista',
            onPress: () => router.push('/colaboradores')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      Alert.alert(
        '❌ Erro',
        'Não foi possível salvar as alterações. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Verificar se há alterações (ignorar codigoUsuario pois é readonly)
    if (field === 'codigoUsuario') return;
    
    const originalValue = colaborador?.[field] || '';
    if (value !== originalValue) {
      setHasChanges(true);
    } else {
      // Verificar se ainda há outras alterações (ignorar codigoUsuario)
      const hasOtherChanges = Object.keys(formData).some(key => {
        if (key === field || key === 'codigoUsuario') return false;
        return (formData as any)[key] !== (colaborador?.[key] || '');
      });
      setHasChanges(hasOtherChanges);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        '⚠️ Descartar Alterações',
        'Você tem alterações não salvas.\n\nDeseja realmente descartar e voltar?',
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Descartar e Voltar',
            style: 'destructive',
            onPress: () => router.push('/colaboradores')
          }
        ]
      );
    } else {
      router.push('/colaboradores');
    }
  };

  // Funções para o DatePicker customizado
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
      updateFormData('dataNascimento', formattedDate);
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

  // Funções para o DatePicker de Data de Entrada
  const openDateEntradaPicker = () => {
    const dateToUse = selectedDateEntrada || new Date();
    setTempDateEntrada(dateToUse);
    setShowDateEntradaPicker(true);
  };

  const handleDateEntradaConfirm = () => {
    if (tempDateEntrada) {
      setSelectedDateEntrada(tempDateEntrada);
      const formattedDate = formatDate(tempDateEntrada);
      updateFormData('dataEntrada', formattedDate);
    }
    setShowDateEntradaPicker(false);
  };

  const handleDateEntradaCancel = () => {
    setShowDateEntradaPicker(false);
  };

  const changeMonthEntrada = (increment: number) => {
    if (tempDateEntrada) {
      const newDate = new Date(tempDateEntrada);
      newDate.setMonth(newDate.getMonth() + increment);
      setTempDateEntrada(newDate);
    }
  };

  const changeYearEntrada = (increment: number) => {
    if (tempDateEntrada) {
      const newDate = new Date(tempDateEntrada);
      newDate.setFullYear(newDate.getFullYear() + increment);
      setTempDateEntrada(newDate);
    }
  };

  const selectDayEntrada = (day: number) => {
    if (tempDateEntrada) {
      const newDate = new Date(tempDateEntrada);
      newDate.setDate(day);
      setTempDateEntrada(newDate);
    }
  };

  if (!colaborador) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Title>Carregando...</Title>
        </View>
      </View>
    );
  }

  return (
    <MainLayout title="Editar Colaborador" showBackButton={true}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Paragraph>Edite as informações do colaborador</Paragraph>
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
              label="Código do Colaborador"
              value={formData.codigoUsuario}
              onChangeText={(value) => updateFormData('codigoUsuario', value)}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: COL001, FUNC123"
            />

            <TextInput
              label="Nome Completo *"
              value={formData.nomeUsuario}
              onChangeText={(value) => updateFormData('nomeUsuario', value)}
              style={styles.input}
              mode="outlined"
              error={!!errors.nomeUsuario}
            />
            <HelperText type="error" visible={!!errors.nomeUsuario}>
              {errors.nomeUsuario}
            </HelperText>

            <TextInput
              label="Data de Nascimento"
              value={formData.dataNascimento}
              style={styles.input}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              editable={false}
              right={<TextInput.Icon icon={() => <UniversalIcon name="calendar" size={20} color="#666" />} onPress={openDatePicker} />}
              onPressIn={openDatePicker}
            />

            <TextInput
              label="Endereço"
              value={formData.endereco}
              onChangeText={(value) => updateFormData('endereco', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />

            <TextInput
              label="Telefone *"
              value={formData.telefone}
              onChangeText={(value) => updateFormData('telefone', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.telefone}
            />
            <HelperText type="error" visible={!!errors.telefone}>
              {errors.telefone}
            </HelperText>

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              error={!!errors.email}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <Text style={styles.sectionTitle}>Sexo</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioOption}>
                <RadioButton
                  value="masculino"
                  status={formData.sexo === 'masculino' ? 'checked' : 'unchecked'}
                  onPress={() => updateFormData('sexo', 'masculino')}
                />
                <Text>Masculino</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                  value="feminino"
                  status={formData.sexo === 'feminino' ? 'checked' : 'unchecked'}
                  onPress={() => updateFormData('sexo', 'feminino')}
                />
                <Text>Feminino</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <TextInput
              label="Data de Entrada na Empresa *"
              value={formData.dataEntrada}
              onPressIn={openDateEntradaPicker}
              style={styles.input}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              editable={false}
              error={!!errors.dataEntrada}
              right={<TextInput.Icon icon={() => <UniversalIcon name="calendar" size={20} color="#666" />} onPress={openDateEntradaPicker} />}
            />
            <HelperText type="error" visible={!!errors.dataEntrada}>
              {errors.dataEntrada}
            </HelperText>

            <TextInput
              label="Cargo *"
              value={formData.cargo}
              onChangeText={(value) => updateFormData('cargo', value)}
              style={styles.input}
              mode="outlined"
              error={!!errors.cargo}
            />
            <HelperText type="error" visible={!!errors.cargo}>
              {errors.cargo}
            </HelperText>

            <Text style={styles.sectionTitle}>Perfil do Usuário</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioOption}>
                <RadioButton
                  value="funcionario"
                  status={formData.perfil === 'funcionario' ? 'checked' : 'unchecked'}
                  onPress={() => updateFormData('perfil', 'funcionario')}
                />
                <Text>Colaborador</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                  value="lider"
                  status={formData.perfil === 'lider' ? 'checked' : 'unchecked'}
                  onPress={() => updateFormData('perfil', 'lider')}
                />
                <Text>Líder</Text>
              </View>
            </View>
            <HelperText type="error" visible={!!errors.perfil}>
              {errors.perfil}
            </HelperText>

            <View style={styles.infoCard}>
              <Title style={styles.infoTitle}>ℹ️ Informações</Title>
              <Paragraph style={styles.infoText}>
                • Campos marcados com * são obrigatórios{'\n'}
                • As alterações serão aplicadas imediatamente{'\n'}
                • Você pode continuar editando após salvar
              </Paragraph>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                icon={() => <UniversalIcon name="arrow-left" size={20} color="#1976d2" />}
                disabled={loading}
              >
                Voltar
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
      </ScrollView>

      {/* DatePicker Modal Customizado */}
      <Portal>
        <Modal
          visible={showDatePicker}
          onDismiss={handleDateCancel}
          contentContainerStyle={styles.datePickerModal}
        >
          <View style={styles.datePickerContent}>
            <Title style={styles.datePickerTitle}>Selecionar Data de Nascimento</Title>
            
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
                    <Text style={styles.monthYearText}>
                      {getMonthName(tempDate)} {tempDate.getFullYear()}
                    </Text>
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
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>

                {/* Dias do Mês */}
                <View style={styles.daysContainer}>
                  {Array.from({ length: getFirstDayOfMonth(tempDate) }, (_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  ))}
                  {Array.from({ length: getDaysInMonth(tempDate) }, (_, i) => {
                    const day = i + 1;
                    const isSelected = tempDate.getDate() === day;
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() === tempDate.getMonth() && 
                                   new Date().getFullYear() === tempDate.getFullYear();
                    
                    return (
                      <Button
                        key={day}
                        mode={isSelected ? "contained" : "text"}
                        onPress={() => selectDay(day)}
                        style={[
                          styles.dayButton,
                          isSelected && styles.selectedDayButton,
                          isToday && !isSelected && styles.todayButton
                        ]}
                        labelStyle={[
                          styles.dayButtonText,
                          isSelected && styles.selectedDayButtonText,
                          isToday && !isSelected && styles.todayButtonText
                        ]}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Botões de Ação */}
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

      {/* DatePicker Modal para Data de Entrada */}
      <Portal>
        <Modal
          visible={showDateEntradaPicker}
          onDismiss={handleDateEntradaCancel}
          contentContainerStyle={styles.datePickerModal}
        >
          <View style={styles.datePickerContent}>
            <Title style={styles.datePickerTitle}>Selecionar Data de Entrada</Title>
            
            {tempDateEntrada && (
              <View style={styles.calendarContainer}>
                {/* Header do Calendário */}
                <View style={styles.calendarHeader}>
                  <Button
                    mode="text"
                    onPress={() => changeYearEntrada(-1)}
                    icon="chevron-left"
                  >
                    {tempDateEntrada.getFullYear() - 1}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => changeMonthEntrada(-1)}
                    icon="chevron-left"
                  >
                    {''}
                  </Button>
                  <View style={styles.monthYearContainer}>
                    <Text style={styles.monthYearText}>
                      {getMonthName(tempDateEntrada)} {tempDateEntrada.getFullYear()}
                    </Text>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => changeMonthEntrada(1)}
                    icon="chevron-right"
                  >
                    {''}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => changeYearEntrada(1)}
                    icon="chevron-right"
                  >
                    {tempDateEntrada.getFullYear() + 1}
                  </Button>
                </View>

                {/* Dias da Semana */}
                <View style={styles.weekDaysContainer}>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Dias do Mês */}
                <View style={styles.daysContainer}>
                  {Array.from({ length: getDaysInMonth(tempDateEntrada) }, (_, i) => i + 1).map((day) => {
                    const isSelected = tempDateEntrada.getDate() === day;
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() === tempDateEntrada.getMonth() && 
                                   new Date().getFullYear() === tempDateEntrada.getFullYear();
                    
                    return (
                      <View key={day} style={styles.dayCell}>
                        <Button
                          mode={isSelected ? "contained" : "text"}
                          onPress={() => selectDayEntrada(day)}
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
                onPress={handleDateEntradaCancel}
                style={styles.datePickerButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleDateEntradaConfirm}
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    color: '#666',
    lineHeight: 20,
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
  // Estilos do DatePicker customizado
  datePickerModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 0,
  },
  datePickerContent: {
    padding: 20,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1976d2',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    paddingVertical: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    minWidth: 0,
    margin: 0,
  },
  selectedDayButton: {
    backgroundColor: '#1976d2',
  },
  selectedDayButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayButton: {
    backgroundColor: '#e3f2fd',
  },
  todayButtonText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  dayButtonText: {
    fontSize: 14,
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
