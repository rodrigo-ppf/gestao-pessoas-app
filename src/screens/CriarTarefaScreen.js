import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    HelperText,
    TextInput,
    Title
} from 'react-native-paper';

export default function CriarTarefaScreen({ navigation }) {
  const [formData, setFormData] = useState({
    codigoTarefa: '',
    descricao: '',
    dataTarefa: '',
    horaInicio: '',
    horaFim: '',
    prioridade: 'media',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});

  const prioridades = [
    { id: 'baixa', label: 'Baixa', color: '#4caf50' },
    { id: 'media', label: 'Média', color: '#ff9800' },
    { id: 'alta', label: 'Alta', color: '#f44336' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.codigoTarefa.trim()) {
      newErrors.codigoTarefa = 'Código da tarefa é obrigatório';
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    if (!formData.dataTarefa.trim()) {
      newErrors.dataTarefa = 'Data da tarefa é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // TODO: Implementar salvamento no banco
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Criar Nova Tarefa</Title>

          <TextInput
            label="Código da Tarefa"
            value={formData.codigoTarefa}
            onChangeText={(value) => updateFormData('codigoTarefa', value)}
            style={styles.input}
            mode="outlined"
            error={!!errors.codigoTarefa}
          />
          <HelperText type="error" visible={!!errors.codigoTarefa}>
            {errors.codigoTarefa}
          </HelperText>

          <TextInput
            label="Descrição da Tarefa"
            value={formData.descricao}
            onChangeText={(value) => updateFormData('descricao', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            error={!!errors.descricao}
          />
          <HelperText type="error" visible={!!errors.descricao}>
            {errors.descricao}
          </HelperText>

          <TextInput
            label="Data da Tarefa"
            value={formData.dataTarefa}
            onChangeText={(value) => updateFormData('dataTarefa', value)}
            style={styles.input}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            error={!!errors.dataTarefa}
          />
          <HelperText type="error" visible={!!errors.dataTarefa}>
            {errors.dataTarefa}
          </HelperText>

          <View style={styles.timeContainer}>
            <TextInput
              label="Hora de Início"
              value={formData.horaInicio}
              onChangeText={(value) => updateFormData('horaInicio', value)}
              style={[styles.input, styles.timeInput]}
              mode="outlined"
              placeholder="HH:MM"
            />
            
            <TextInput
              label="Hora de Fim"
              value={formData.horaFim}
              onChangeText={(value) => updateFormData('horaFim', value)}
              style={[styles.input, styles.timeInput]}
              mode="outlined"
              placeholder="HH:MM"
            />
          </View>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Prioridade</Title>
          <View style={styles.prioridadeContainer}>
            {prioridades.map((prioridade) => (
              <Chip
                key={prioridade.id}
                selected={formData.prioridade === prioridade.id}
                onPress={() => updateFormData('prioridade', prioridade.id)}
                style={[
                  styles.prioridadeChip,
                  { backgroundColor: formData.prioridade === prioridade.id ? prioridade.color : '#e0e0e0' }
                ]}
                textStyle={styles.prioridadeChipText}
              >
                {prioridade.label}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Observações (Opcional)"
            value={formData.observacoes}
            onChangeText={(value) => updateFormData('observacoes', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
            >
              Criar Tarefa
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1976d2',
  },
  input: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  prioridadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  prioridadeChip: {
    marginHorizontal: 4,
  },
  prioridadeChipText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
